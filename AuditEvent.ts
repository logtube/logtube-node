import {Event} from "./Event"

export class AuditEvent {
    event: Event

    constructor(event: Event) {
        this.event = event;
    }

    /**
     * 记录 IP
     * @param ip
     */
    public ip(ip: string): AuditEvent {
        this.event.x("ip", ip);
        return this;
    }

    /**
     * 记录用户代号
     * @param userCode
     */
    public userCode(userCode: string): AuditEvent {
        this.event.x("user_code", userCode);
        return this;
    }

    /**
     * 记录用户姓名
     * @param userName
     */
    public userName(userName: string): AuditEvent {
        this.event.x("user_name", userName);
        return this;
    }

    /**
     * 记录用户操作
     * @param action
     */
    public action(action: String): AuditEvent {
        this.event.x("action", action)
        return this;
    }

    /**
     * 记录用户操作详情
     * @param actionDetail
     */
    public actionDetail(actionDetail: string): AuditEvent {
        this.event.x("action_detail", actionDetail);
        return this;
    }

    /**
     * 记录 url
     * @param url
     */
    public url(url: string): AuditEvent {
        this.event.x("url", url);
        return this;
    }

    /**
     * 提交记录
     */
    public commit() {
        this.event.commit();
    }

}