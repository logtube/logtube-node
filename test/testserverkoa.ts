import Koa from "koa";
import * as logtube from "../index";

const app = new Koa();

logtube.setup({
    project: "demo-express",
    env: "test",
    console: {
        topics: ["*"],
    },
    file: {
        topics: ["*"],
        dir: "logs",
        subdirs: {
            xlog: ["*", "-debug"],
        },
    },
});

app.use(logtube.koa());
app.use(logtube.koaAccess());

app.use((ctx) => {
    const perf = ctx.state.log.perf()
        .className("MyClass")
        .methodName("MyMethod")
        .action("some_action")
        .actionDetail("hello world");

    setTimeout(function() {
        perf.valueInteger(999).commit();
    }, 2000);

    ctx.state.log.audit().userName("guoyk").userCode("10086").commit();
    ctx.state.log.info("hello world", "hello, world info");
    ctx.state.log.debug("hello world", "hello, world debug");
    ctx.state.log.err("hello world", "hello, world err");
    ctx.state.log.warn("hello world", "hello, world warn");
    ctx.body = "hello word";
});

app.listen(8080);
