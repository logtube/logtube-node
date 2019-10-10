import {Event} from "./Event";
import {evaluateTopics, formatEventStructure, formatEventTimestamp, IOutput} from "./IOutput";

export interface IConsoleOutputOptions {
    /**
     * 使用 ConsoleOutput 输出的主题
     */
    topics: string[];
}

export class ConsoleOutput implements IOutput {

    private static serialize(event: Event): string {
        return `[${formatEventTimestamp(event.timestamp)}] [${event.topic}] [${formatEventStructure(event)}] ${event.message}`;
    }

    private opts: IConsoleOutputOptions;

    constructor(opts: IConsoleOutputOptions) {
        this.opts = opts;
    }

    public appendEvent(event: Event): void {
        if (evaluateTopics(event.topic, this.opts.topics)) {
            process.stdout.write(ConsoleOutput.serialize(event) + "\n");
        }
    }
}
