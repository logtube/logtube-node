import async from "async";
import fs from "fs-extra";
import moment from "moment";
import path from "path";
import {Event} from "./Event";
import {evaluateTopics, formatEventStructure, formatEventTimestamp, IOutput} from "./IOutput";

export interface IFileOutputOptions {
    /**
     * 使用 FileOutput 输出的主题
     */
    topics: string[];
    /**
     * 文件输出的根目录
     */
    dir: string;
    /**
     * 不同主题对应的子目录，用来便于让 FileBeat 区分需要收集和不需要收集的日志内容
     */
    subdirs?: { [key: string]: string };
}

export class FileOutput implements IOutput {

    private static formatFilenameDate(date: Date): string {
        return moment(date).format("YYYY-MM-DD");
    }

    private static serialize(event: Event): string {
        return `[${formatEventTimestamp(event.timestamp)}] [${formatEventStructure(event)}] ${event.message}`;
    }

    private opts: IFileOutputOptions;

    /**
     * 缓存的文件句柄，防止重复打开关闭文件
     */
    private fds: { [key: string]: number } = {};

    /**
     * 执行队列，是的，Nodejs 也需要执行队列，不然文件操作可能互相冲突
     */
    private appendQueue: async.AsyncQueue<{ filename: string, line: string }>;

    constructor(opts: IFileOutputOptions) {
        this.opts = opts;
        this.ensureDirectories();
        this.appendQueue = async.queue(async (task) => {
            await this.appendLine(task.filename, task.line);
        });
        this.appendQueue.error((err, task) => {
            process.stderr.write(`logtube: FileOutput failed to append line to file: ${task.filename}\n`);
        });
    }

    public appendEvent(event: Event): void {
        if (evaluateTopics(event.topic, this.opts.topics)) {
            this.appendQueue.push({filename: this.calculateFilename(event), line: FileOutput.serialize(event)});
        }
    }

    /**
     * 在初始化的时候，确保所有日志文件目录都创建好了
     */
    private ensureDirectories() {
        fs.mkdirpSync(this.opts.dir);
        const allSubdirs: { [key: string]: boolean } = {};
        if (this.opts.subdirs) {
            for (const [_, val] of Object.entries(this.opts.subdirs)) {
                allSubdirs[val] = true;
            }
        }
        for (const [subdir, _] of Object.entries(allSubdirs)) {
            fs.mkdirpSync(path.join(this.opts.dir, subdir));
        }
    }

    /**
     * 为某条日志计算输出文件
     * @param event
     */
    private calculateFilename(event: Event): string {
        let filename = this.opts.dir;
        if (this.opts.subdirs) {
            if (this.opts.subdirs[event.topic]) {
                filename = path.join(filename, this.opts.subdirs[event.topic]);
            }
        }
        return path.join(filename, `${event.env}.${event.topic}.${event.project}.${FileOutput.formatFilenameDate(event.timestamp)}.log`);
    }

    /**
     * 确保某个日志文件已经打开，并返回其句柄，如果同时打开的文件过多，进行垃圾清理
     * @param filename
     */
    private async ensureFile(filename: string): Promise<number> {
        if (Object.keys(this.fds).length > 150) {
            for (const [_, fd] of Object.entries(this.fds)) {
                try {
                    await fs.close(fd);
                } catch (e) {
                    /* 我关了，关闭失败了，有什么好说的 */
                }
            }
            this.fds = {};
        }
        if (!this.fds[filename]) {
            this.fds[filename] = await fs.open(filename, "a");
        }
        return this.fds[filename];
    }

    /**
     * 将某一行日志，输出到某一个日志文件上
     * @param filename
     * @param line
     */
    private async appendLine(filename: string, line: string): Promise<void> {
        const fd = await this.ensureFile(filename);
        await fs.writeFile(fd, line + "\n");
    }
}
