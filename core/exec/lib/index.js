'use strict';


const Package = require("@jr-cli/package")
const log = require("@jr-cli/log")
const path = require("path");
const cp = require("child_process")

const SETTINGS = {
    init: "@imooc-cli/init"
}
const CACHE_DIR = "dependencies"

async function exec() {
    // const pkg = new Package();
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = "";
    let pkg = null;
    const cmdObj = arguments[arguments.length - 1];
    const name = cmdObj.name()
    const pkgName = SETTINGS[name];
    const pkgVersion = "latest"
    if (!targetPath) {
        // 生成缓存路径
        targetPath = path.resolve(homePath, CACHE_DIR);//生成缓存路径
        storeDir = path.resolve(targetPath, "node_modules")
        pkg = new Package({
            targetPath,
            pkgName,
            pkgVersion,
            storeDir
        })
        if (await pkg.exists()) {
            console.log('update')
            // 更新pkg
            await pkg.update();
        } else {
            console.log('install')
            // 安装pkg
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            pkgName,
            pkgVersion,
        })
    }
    const rootFile = pkg.getRootFilePath();
    if (rootFile) {
        try {
            // 在node子进程中调用
            let args = Array.from(arguments);
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith("_") && key !== "parent") {
                    o[key] = cmd[key]
                }
            })
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
            const child = spawn("node", ["-e", code], {
                cwd: process.cwd(),
                stdio: "inherit"
            })
            child.on("error", e => {
                console.log(e.message)
                process.exit(1)
            })
            child.on("exit", e => {
                log.verbose("命令执行成功：" + e)
                process.exit(e)
            })
        } catch (e) {
            console.log(e.message)
        }
    }
}

// 兼容window系统
function spawn(command, args, options) {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command,args) : args;
    return cp.spawn(cmd,cmdArgs,options || {})
}

module.exports = exec;
