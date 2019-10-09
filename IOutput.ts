import moment from "moment";
import {Event} from "./Event";

/**
 * 日志输出器，有 ConsoleOutput 和 FileOutput
 */
export interface IOutput {
    /**
     * 异步输出一条日志
     * @param event
     */
    appendEvent(event: Event): void;
}

/**
 * 验证一个主题是否在一个数组中
 *
 * @param topic
 * @param topics
 */
export function evaluateTopics(topic: string, topics: [string]): boolean {
    for (const o of topics) {
        if (o === "*" || o === topic) {
            return true;
        }
    }
    return false;
}

/**
 * 格式化日志时间
 *
 * @param date
 */
export function formatEventTimestamp(date: Date): string {
    return moment(date).format("YYYY-MM-DD HH:mm:ss.SSS Z");
}

/**
 * 将日志的结构化部分进行序列化，形成 JSON Object
 *
 * @param event
 */
export function formatEventStructure(event: Event): string {
    const out: { [key: string]: any } = {};
    out.c = event.crid;
    if (event.keyword) {
        out.k = event.keyword;
    }
    if (event.extra) {
        out.x = event.extra;
    }
    return JSON.stringify(out);
}
