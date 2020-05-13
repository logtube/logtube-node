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

app.use((ctx) => {
    ctx.state.log.info("hello world", "hello, world info");
    ctx.state.log.debug("hello world", "hello, world debug");
    ctx.state.log.err("hello world", "hello, world err");
    ctx.state.log.warn("hello world", "hello, world warn");
    ctx.body = 'hello word';
});

app.listen(8080);
