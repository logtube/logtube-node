# logtube-node

Logtube Node.js SDK

## 设计

每一条日志都包含如下几个要素

1. 时间
2. 项目名
3. 环境名
4. 主题，传统主题为 info, debug, warn, err，也可以按需要自定义主题
5. CRID，一个随机字符串，微服务互相调用的时候，会通过 X-Correlation-ID 头传递这个字符串，并在日志中输出，用来追踪整个调用链
6. 关键字，为了节约日志系统资源，只有关键字字段内的文本会被索引，并可以查询
7. 日志内容，纯文本内容
8. 额外字段，可以将多个JSON字段附加到这条日志上，用来进行更精确的索引

## 使用方法

1. 安装 `npm install --save logtube`
2. 尽早执行 `setup` 方法

    ```typescript
    import * as logtube from "logtube"

    logtube.setup({
      project: "demoproject",   // 设置项目名，只允许数字，- 和 _
      env: "test",              // 设置项目环境名，一般为 dev, test, uat/staging, prod
      console: {                // 命令行输出
        topics: ["*", "-debug"],// 设置要通过命令行输出的主题，"*" 代表全部主题，-debug 代表除了 debug 主题
      },
      file: {                    // 日志文件输出
        topics: ["*", "-debug"], // 设置要通过日志文件输出的主题, "*" 代表全部主题，-debug 代表了除了 debug 主题
        dir: "logs",             // 设置日志输出的跟目录
        subdirs: {
            xlog: ["*", "-debug"] // 非调试日志输出到 `xlog` 子目录内，便于收集
        }
      }
    })
    ```
   
3. 使用常规输出

    **第一个参数为关键字，逗号或空格分割**
    
    **只有**关键字可以在日志系统检索，第二个参数为日志内容

    ```typescript
    logtube.info("USER12345678", "order created with id 12345678")
    logtube.warn("USER12345678", "order created with id 12345678")
    logtube.err("USER12345678", "order created with id 12345678")
    logtube.debug("USER12345678", "order created with id 12345678")
    ```
   
4. 使用 Express 中间件

    Express 中间件会捕获 CRID，并创建请求专用的 Logger

    ```typescript
    const app = express()
   
    // 添加 express 中间件，自动为 ctx.locals 添加 log 和 crid
    app.use(logtube.express());
  
    // 添加 expressAccess 中间件，自动输出符合标准的 x-access 日志
    app.use(logtube.expressAccess())
    
    app.use("/", function(req, res) {
      res.locals.log //  此变量为当前 request 专用的 Logger
      res.locals.log.info("hello,world", "this is a hello world message")
      res.locals.crid // 此变量保存了 CRID 字符串，用于跨多个服务追踪请求，进行下一级服务调用，需要将此值设置到 Header X-Correlation-ID
      res.send("hello world")
    })
    ```
   
5. 使用 Koa 中间件

    Koa 中间件会捕获 CRID，并创建请求专用的 Logger
    
    ```typescript
    const app = Koa();
   
    // 添加 koa 中间件，自动为 ctx.state 添加 log 和 crid
    app.use(logtube.koa());
   
    // 添加 koaAccess 中间件，自动输出符合标准的 x-access 日志
    app.use(logtube.koaAccess())
   
    app.use((ctx) => {
       ctx.state.log //  此变量为当前 request 专用的 Logger
       ctx.state.log.info("hello world", "hello, world info");
       ctx.state.crid // 此变量保存了 CRID 字符串，用于跨多个服务追踪请求，进行下一级服务调用，需要将此值设置到 Header X-Correlation-ID
       ctx.body = 'hello word';
    });
    ```

6. 为 Logger 设置默认的 `extras` 值

    ```typescript
    // express
    app.use("/", function(req, res) {
      // 这一行会让所有该 Logger 生成的日志事件追加 x_module = "my_module" 字段
      res.locals.log.extras.module = "my_module";
    })

    // koa
    app.use((ctx) => {
      // 这一行会让所有该 Logger 生成的日志事件追加 x_module = "my_module" 字段
      ctx.state.log.extras.module = "my_module";
    })
    ```

7. 传导 CRID 和 CRSRC 到下一级项目（以 requests 包为例）

    ```typescript
    // express
    app.use("/", function(req, res) {
      requests("https://httpbin.org/get", {
        headers: res.locals.logtubeHeaders
      }).then((res) => {
      })
    })
    // koa
    app.use((ctx)=>{
      await requests("https://httpbin.org/get", {
        headers: ctx.state.logtubeHeaders
      })
    })
    ```
   
6. 性能日志

```javascript
let perf = logger.perf()
.className("MyClass")
.methodName("MyMethod")
.action("some_action")
.actionDetail("hello world");

setTimeout(function() {
    // 可以记录一条任意整数
    // 提交时，会进行计时，报告 x_duration = 2000
    perf.valueInteger(999).commit(); 
}, 2000)
```

7. 审计日志

```javascript
logger.audit()
.userCode("10086")
.userName("郭麒麟")
.action("some_action")
.actionDetail("详细信息")
// ...设置其他值
.commit();
```
   
 ## Credits
 
 Guo Y.K., MIT License
