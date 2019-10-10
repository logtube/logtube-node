import crypto from "crypto";
import {ConsoleOutput} from "./ConsoleOutput";
import {Event} from "./Event";
import {FileOutput} from "./FileOutput";
import {IOptions} from "./IOptions";
import {IOutput} from "./IOutput";

export class Logger implements IOutput {

    private readonly project: string;

    private readonly env: string;

    private crid: string;

    private outputs: IOutput[] = [];

    constructor(opts: IOptions) {
        this.project = opts.project;
        this.env = opts.env;
        this.crid = "-";
        this.outputs.push(new ConsoleOutput(opts.console));
        this.outputs.push(new FileOutput(opts.file));
    }

    /**
     * 设置 CRID，如果为 null 则自动生成
     * @param crid
     */
    public setCrid(crid?: string) {
        if (crid) {
            this.crid = crid;
        } else {
            this.crid = crypto.randomBytes(8).toString("hex");
        }
    }

    /**
     * 获取 CRID
     */
    public getCrid(): string {
        return this.crid;
    }

    /**
     * 创建日志事件，任何日志事件必须制定主题
     * @param topic
     */
    public event(topic: string): Event {
        const event = new Event();
        event.crid = this.crid;
        event.project = this.project;
        event.env = this.env;
        event.topic = topic;
        event.output = this;
        return event;
    }

    public appendEvent(event: Event): void {
        for (const output of this.outputs) {
            output.appendEvent(event);
        }
    }

    /**
     * 快速输出一条纯文本日志
     * @param topic
     * @param keyword
     * @param message
     */
    public log(topic: string, keyword: string, message: string) {
        this.event(topic).k(keyword).msg(message);
    }

    /**
     * 快速输出一条纯文本日志到 debug 主题
     * @param keyword
     * @param message
     */
    public debug(keyword: string, message: string) {
        this.log("debug", keyword, message);
    }

    /**
     * 快速输出一条纯文本日志到 info 主题
     * @param keyword
     * @param message
     */
    public info(keyword: string, message: string) {
        this.log("info", keyword, message);
    }

    /**
     * 快速输出一条纯文本日志到 warn 主题
     * @param keyword
     * @param message
     */
    public warn(keyword: string, message: string) {
        this.log("warn", keyword, message);
    }

    /**
     * 快速输出一条纯文本日志到 err 主题
     * @param keyword
     * @param message
     */
    public err(keyword: string, message: string) {
        this.log("err", keyword, message);
    }

}
