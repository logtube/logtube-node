import express from "express";
import * as logtube from "../index";

const app = express();

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
            important: ["warn", "err", "info"],
        },
    },
});

app.use(logtube.express());

app.use("/", (req, res) => {
    res.locals.log.info("hello world", "hello, world info");
    res.locals.log.debug("hello world", "hello, world debug");
    res.locals.log.err("hello world", "hello, world err");
    res.locals.log.warn("hello world", "hello, world warn");
    process.stderr.write("CRID: " + res.locals.crid);
    res.send("hello world");
});

app.listen(8080);
