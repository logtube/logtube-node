import {Request} from "express";
import {IOptions} from "./IOptions";
import {Logger} from "./Logger";

const NONAME = "noname";

let globalOptions: IOptions = {
    console: {
        topics: ["*"],
    },
    env: NONAME,
    file: {
        dir: "logs",
        topics: ["*"],
    },
    project: NONAME,
};

/**
 * 初始化日志系统
 * @param options
 */
function setup(options: IOptions) {
    globalOptions = options;
}

/**
 * 创建一个 Logger
 */
function logger(): Logger {
    return new Logger(globalOptions);
}

/**
 * 从 Express Request 创建一个 Logger，自动获取 crid
 * @param req
 */
function express(req: Request): Logger {
    const log = new Logger(globalOptions);
    log.setCrid(req.params._crid || req.header("X-Correlation-ID"));
    return log;
}

export default {
    express,
    logger,
    setup,
};
