import {RequestHandler} from "express";
import {Event} from "./Event";
import {FileOutput} from "./FileOutput";
import {IOptions} from "./IOptions";
import {Logger} from "./Logger";

const NONAME = "noname";

let globalOptions: IOptions = {
    console: {
        topics: ["*"],
    },
    env: NONAME,
    file: {
        dir: ".",
        topics: ["*"],
    },
    project: NONAME,
};

let globalLogger: Logger = new Logger(globalOptions);

/**
 * 初始化日志系统
 * @param options
 */
export function setup(options: IOptions) {
    globalOptions = options;
    FileOutput.ensureDirectories(options.file);
    globalLogger = new Logger(options);
}

/**
 * 创建日志事件，任何日志事件必须制定主题
 * @param topic
 */
export function event(topic: string): Event {
    return globalLogger.event(topic);
}

/**
 * 快速输出一条纯文本日志
 * @param topic
 * @param keyword
 * @param message
 */
export function log(topic: string, keyword: string, message: string) {
    event(topic).k(keyword).msg(message);
}

/**
 * 快速输出一条纯文本日志到 debug 主题
 * @param keyword
 * @param message
 */
export function debug(keyword: string, message: string) {
    log("debug", keyword, message);
}

/**
 * 快速输出一条纯文本日志到 warn 主题
 * @param keyword
 * @param message
 */
export function warn(keyword: string, message: string) {
    log("warn", keyword, message);
}

/**
 * 快速输出一条纯文本日志到 info 主题
 * @param keyword
 * @param message
 */
export function info(keyword: string, message: string) {
    log("info", keyword, message);
}

/**
 * 快速输出一条纯文本日志到 err 主题
 * @param keyword
 * @param message
 */
export function err(keyword: string, message: string) {
    log("err", keyword, message);
}

/**
 * 创建 Express 中间件，添加 res.locals.log，用于日志
 * @param req
 */
export function express(): RequestHandler {
    return (req, res, next) => {
        const l = new Logger(globalOptions);
        let crid = req.header("X-Correlation-ID");
        if (req.query && typeof req.query._crid === "string") {
            crid = req.query._crid;
        }
        if (req.body && typeof req.body._crid === "string") {
            crid = req.body._crid;
        }
        l.setCrid(crid);
        res.locals.crid = l.getCrid();
        res.locals.log = l;
        next();
    };
}
