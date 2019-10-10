import logtube from "../index";

logtube.setup({
    console: {
        topics: ["*"],
    },
    env: "test",
    file: {
        dir: "logs",
        subdirs: {
            err: "important",
            warn: "important",
        },
        topics: ["err", "info", "warn"],
    },
    project: "test",
});

logtube.logger().info("hello,world", "hello this beautiful world");
