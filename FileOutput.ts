import async from "async";
import fs from "fs";
import moment from "moment";
import path from "path";
import { Event } from "./Event";
import { evaluateTopics, formatEventStructure, formatEventTimestamp, IOutput } from "./IOutput";

/**
 * 缓存的文件句柄，防止重复打开关闭文件
 */
let sharedFiles: { [key: string]: number } = {};

export interface IFileOutputOptions {
    /**
     * 使用 FileOutput 输出的主题
     */
    topics: string[];
    /**
     * 日志目录文件
     */
    dir: string;
    /**
     * 额外指定某些主题输出的子目录，key 为子目录，value 为主题数组
     */
    subdirs?: {
        [key: string]: string[];
    };
}

export class FileOutput implements IOutput {

    /**
     * 初始化日志目录
     */
    public static ensureDirectories(opts: IFileOutputOptions) {
        fs.mkdirSync(opts.dir, { recursive: true });
        if (opts.subdirs) {
            for (const subdir of Object.keys(opts.subdirs)) {
                fs.mkdirSync(path.join(opts.dir, subdir), { recursive: true });
            }
        }
    }

    /**
     * 格式化文件日期部分
     * @param date
     */
    private static formatFilenameDate(date: Date): string {
        return moment(date).format("YYYY-MM-DD");
    }

    /**
     * 序列化日志事件
     * @param event
     */
    private static serialize(event: Event): string {
        return `[${formatEventTimestamp(event.timestamp)}] [${formatEventStructure(event)}] ${event.message}`;
    }

    private opts: IFileOutputOptions;

    /**
     * 执行队列，是的，Nodejs 也需要执行队列，不然文件操作可能互相冲突
     */
    private appendQueue: async.AsyncQueue<{ filename: string, line: string }>;

    constructor(opts: IFileOutputOptions) {
        this.opts = opts;
        this.appendQueue = async.queue(async (task) => {
            await this.appendLine(task.filename, task.line);
        });
        this.appendQueue.error((err, task) => {
            process.stderr.write(`logtube: FileOutput failed to append line to file: ${task.filename}\n`);
        });
    }

    public appendEvent(event: Event): void {
        if (evaluateTopics(event.topic, this.opts.topics)) {
            this.appendQueue.push({ filename: this.calculateFilename(event), line: FileOutput.serialize(event) });
        }
    }

    /**
     * 为某条日志计算输出文件
     * @param event
     */
    private calculateFilename(event: Event): string {
        let dir = this.opts.dir;
        if (this.opts.subdirs) {
            for (const [key, val] of Object.entries(this.opts.subdirs)) {
                if (evaluateTopics(event.topic, val)) {
                    dir = path.join(dir, key);
                }
            }
        }
        return path.join(dir, `${event.env}.${event.topic}.${event.project}.${FileOutput.formatFilenameDate(event.timestamp)}.log`);
    }

    /**
     * 确保某个日志文件已经打开，并返回其句柄，如果同时打开的文件过多，进行垃圾清理
     * @param filename
     */
    private async ensureFile(filename: string): Promise<number> {
        if (Object.keys(sharedFiles).length > 150) {
            for (const [_, fd] of Object.entries(sharedFiles)) {
                fs.close(fd, (err) => {
                    /* 我关了，关闭失败了，有什么好说的 */
                });
            }
            sharedFiles = {};
        }
        if (!sharedFiles[filename]) {
            sharedFiles[filename] = await new Promise<number>((resolve, reject) => {
                fs.open(filename, "a", (err, fd) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(fd);
                    }
                });
            });
        }
        return sharedFiles[filename];
    }

    /**
     * 将某一行日志，输出到某一个日志文件上
     * @param filename
     * @param line
     */
    private async appendLine(filename: string, line: string): Promise<void> {
        const fd = await this.ensureFile(filename);
        await new Promise(((resolve, reject) => {
            fs.write(fd, line + "\n", (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }));
    }
}
