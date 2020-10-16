import { RequestHandler } from "express";
import { Middleware } from "koa";
import onFinished from "on-finished";
import { AuditEvent } from "./AuditEvent";
import { Event } from "./Event";
import { FileOutput } from "./FileOutput";
import { IOptions } from "./IOptions";
import { Logger } from "./Logger";
import { PerfEvent } from "./PerfEvent";

const NONAME = "noname";
export const HEADER_CRID = "X-Correlation-ID";
export const HEADER_CRSRC = "X-Correlation-Src";

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

export function topic(topic: string): Event {
    return event(topic);
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
 * 快速输出一条纯文本日志到 fatal 主题
 * @param keyword
 * @param message
 */
export function fatal(keyword: string, message: string) {
    log("fatal", keyword, message);
}

/**
 * 准备一条性能日志，记得调用 commit()
 */
export function perf(): PerfEvent {
    return new PerfEvent(topic("x-perf"));
}

/**
 * 准备一条审计日志，记得调用 commit()
 */
export function audit(): AuditEvent {
    return new AuditEvent(topic("x-audit"));
}

/**
 * 创建 Express 中间件，添加 res.locals.log，用于日志
 */
export function express(): RequestHandler {
    return (req, res, next) => {
        const l = new Logger(globalOptions);
        let crid = req.header(HEADER_CRID);
        if (req.query && typeof req.query._crid === "string") {
            crid = req.query._crid;
        }
        if (req.body && typeof req.body._crid === "string") {
            crid = req.body._crid;
        }
        l.setCrid(crid);
        res.set(HEADER_CRID, l.getCrid());
        res.locals.log = l;
        res.locals.crid = l.getCrid();
        res.locals.logtubeHeaders = {};
        res.locals.logtubeHeaders[HEADER_CRID] = l.getCrid();
        res.locals.logtubeHeaders[HEADER_CRSRC] = l.getProject();
        next();
    };
}

/**
 * 创建 Express Access 日志中间件，自动输出符合标准的 x-access 日志文件
 */
export function expressAccess(): RequestHandler {
    return ((req, res, next) => {
        const e = res.locals.log.topic("x-access");
        e.x("header_app_info", req.header("App-Info"));
        e.x("header_user_token", req.header("User-Token"));
        e.x("host", req.header("Host"));
        e.x("method", req.method);
        e.x("path", req.path);
        const i = req.originalUrl.indexOf("?");
        if (i >= 0) {
            const query = req.originalUrl.substr(i + 1);
            e.x("query", query);
        }
        const startTime = Date.now();
        onFinished(res, function(err, res) {
            e.x("status", res.statusCode);
            e.x("duration", Date.now() - startTime);
            e.commit();
        });
        next();
    });
}

/**
 * 创建 Koa 中间件，获取 Crid，并添加 ctx.state.log 用于日志
 */
export function koa(): Middleware {
    return async function(ctx, next) {
        const { request, response } = ctx;
        const l = new Logger(globalOptions);
        let crid = request.get(HEADER_CRID);
        if (request.query && typeof request.query._crid === "string") {
            crid = request.query._crid;
        }
        const body = (request as any).body;
        if (body && typeof body._crid === "string") {
            crid = body._crid;
        }
        l.setCrid(crid);
        ctx.set(HEADER_CRID, l.getCrid());
        ctx.state.log = l;
        ctx.state.crid = l.getCrid();
        ctx.state.logtubeHeaders = {};
        ctx.state.logtubeHeaders[HEADER_CRID] = l.getCrid();
        ctx.state.logtubeHeaders[HEADER_CRSRC] = l.getProject();
        await next();
    };
}

/**
 * 创建 Koa Access 日志中间件，自动输出符合标准的 x-access 日志文件
 */
export function koaAccess(): Middleware {
    return async function(ctx, next) {
        const e = ctx.state.log.topic("x-access");
        e.x("header_app_info", ctx.req.headers["app-info"]);
        e.x("header_user_token", ctx.req.headers["user-token"]);
        e.x("host", ctx.req.headers.host);
        e.x("method", ctx.req.method);
        e.x("path", ctx.path);
        e.x("query", ctx.querystring);
        const startTime = Date.now();
        await next();
        e.x("status", ctx.res.statusCode);
        e.x("duration", Date.now() - startTime);
        e.submit();
    };
}
