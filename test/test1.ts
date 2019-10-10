import * as logtube from "../index";

logtube.setup({
    console: {
        topics: ["*"],
    },
    env: "test",
    file: {
        dir: "logs",
        subdirs: {
            important: ["err", "info", "warn"],
        },
        topics: ["err", "info", "warn"],
    },
    project: "test",
});

logtube.err("hello,world", "hello this beautiful world, error");
logtube.info("hello,world", "hello this beautiful world");

setTimeout(() => {
    /**/
}, 1000);
