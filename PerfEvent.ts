import {Event} from './Event'

export class PerfEvent {
    event: Event

    startTime: number

    constructor(event: Event) {
        this.event = event;
        this.startTime = Date.now();
    }

    /**
     * 设置类名
     * @param className
     */
    public className(className: string): PerfEvent {
        this.event.x("class_name", className);
        return this;
    }

    /**
     * 设置方法名
     * @param methodName
     */
    public methodName(methodName: string): PerfEvent {
        this.event.x("method_name", methodName);
        return this;
    }

    /**
     * 设置操作名，用以区分要进行性能分析的代码块
     * @param action
     */
    public action(action: string): PerfEvent {
        this.event.x("action", action)
        return this;
    }

    /**
     * 操作参数，用以记录本次性能分析的操作参数，便于分析
     * @param actionDetail
     */
    public actionDetail(actionDetail: string): PerfEvent {
        this.event.x("action_detail", actionDetail)
        return this;
    }

    /**
     * 整数值，记录一个整数返回值，便于分析
     * @param value
     */
    public valueInteger(value: number): PerfEvent {
        this.event.x("value_integer", value)
        return this;
    }

    /**
     * 提交日志，同时记录耗时
     */
    public commit() {
        this.event.x("duration", Date.now() - this.startTime);
        this.event.commit();
    }

    public submit() {
        this.commit();
    }

}