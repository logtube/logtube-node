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

    public setCrid(crid?: string) {
        if (crid) {
            this.crid = crid;
        } else {
            this.crid = crypto.randomBytes(8).toString("hex");
        }
    }

    public getCrid(): string {
        return this.crid;
    }

    public event(topic: string): Event {
        const event = new Event();
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

    public log(topic: string, keyword: string, message: string) {
        this.event(topic).k(keyword).msg(message);
    }

    public debug(keyword: string, message: string) {
        this.log("debug", keyword, message);
    }

    public info(keyword: string, message: string) {
        this.log("info", keyword, message);
    }

    public warn(keyword: string, message: string) {
        this.log("warn", keyword, message);
    }

    public err(keyword: string, message: string) {
        this.log("err", keyword, message);
    }

}
