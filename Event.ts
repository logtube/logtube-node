/**
 * 每一条日志即为一条事件，可以包含纯文本日志 "message" 和 结构化日志内容 "extra"
 */
import {IOutput} from "./IOutput";

const NONAME = "noname";

export class Event {
    /**
     * 日志发生的时间
     */
    public timestamp: Date = new Date();
    /**
     * 日志所属项目
     */
    public project: string = NONAME;
    /**
     * 当前的环境名，如 "dev", "test", "staging", "prod"
     */
    public env: string = NONAME;
    /**
     * 日志主题，如 "info", "debug", "err", "warn"
     */
    public topic: string = NONAME;
    /**
     * crid，日志追踪 ID，用于跨多个项目追踪调用链
     */
    public crid: string = "-";
    /**
     * 关键字，逗号分隔，没有关键字的日志在 Kibana 中将无法被搜索到
     */
    public keyword?: string;
    /**
     * 日志内容
     */
    public message?: string;
    /**
     * 结构化日志字段，使用前向 DevOps 组联络
     */
    public extra?: { [key: string]: any };
    /**
     * 日志输出
     */
    public output?: IOutput;

    /**
     * 提交日志到输出
     */
    public submit() {
        if (this.output) {
            this.output.appendEvent(this);
        }
    }

    /**
     * 添加关键字，自动使用逗号分隔
     * @param keyword
     */
    public addKeyword(keyword: string) {
        if (this.keyword) {
            this.keyword = this.keyword + "," + keyword;
        } else {
            this.keyword = keyword;
        }
    }

    /**
     * 添加额外的结构化字段
     * @param k
     * @param v
     */
    public addExtra(k: string, v: any) {
        if (!this.extra) {
            this.extra = {};
        }
        this.extra[k] = v;
    }

    /**
     * 糖果方法，添加多个关键字，并返回 Event 本身
     * @param keywords
     */
    public k(...keywords: [string]): Event {
        for (const keyword of keywords) {
            this.addKeyword(keyword);
        }
        return this;
    }

    /**
     * 糖果方法，添加结构化日志字段，并返回 Event 本身
     * @param key
     * @param val
     */
    public x(key: string, val: any): Event {
        this.addExtra(key, val);
        return this;
    }

    /**
     * 糖果方法，设置纯文本日志内容，并提交日志
     * @param message
     */
    public msg(message: string) {
        this.message = message;
        this.submit();
    }

}
