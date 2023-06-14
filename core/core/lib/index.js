'use strict';

module.exports = core;

const log = require("@jr-cli/log");
const npm = require("@jr-cli/npm");
const semver = require("semver");
const path = require("path");
const colors = require("colors")
const root = require("root-check")
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const minimist = require("minimist");
const env = require("dotenv");
const commander = require("commander")
const program = new commander.Command();
const constant = require("./const");
const pkg = require("../package.json");
const init = require("@jr-cli/init");


async function core(args) {
    try {
        checkPkgVersion();
        checkNodeVersion();
        rootDegradation();
        checkUserHome();
        checkEnv();
        await checkGlobalUpdate();
        registerCommand();
    } catch (e) {
        log.error(e.message)
    }
}

// 检查脚手架版本
function checkPkgVersion() {
    log.info("version", `当前版本号为${pkg.version}`)
}

// 检查node版本
function checkNodeVersion() {
    const curNodeVersion = process.version;
    const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
    if (semver.lt(curNodeVersion, lowestNodeVersion)) {
        throw new Error(colors.red(`Node版本过低，请升级 ${lowestNodeVersion} 以上的版本`))
    }
}

// root权限降级
function rootDegradation() {
    // 当root权限开启时自动降级
    root();
}

// 检查用户主目录
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red("当前用户主目录不存在"))
    }
}

// 检查环境变量
function checkEnv() {
    const envPath = path.resolve(userHome, '.env');
    if (pathExists(envPath)) {
        env.config({
            path: envPath
        })
    }
    createDefaultConfig()
}

// 创建默认配置项
function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 脚手架全局更新提示
async function checkGlobalUpdate() {
    const pkgName = pkg.name;
    const pkgVersion = pkg.version;
    const lastVersion = await npm.getPkgInfoByNpm(pkgName, pkgVersion)
    if (lastVersion && semver.gt(lastVersion, pkgVersion)) {
        log.warn("更新提示", colors.yellow(`
        请手动更新 ${pkgName}，当前版本 ${lastVersion}，最新版本${lastVersion}
        脚手架版本更新命令：npm install -g ${pkgName}
        `))
    }
}

// 脚手架注册
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage("<command> [options]")
        .option("-d,--debug", "开启调试模式", false)
        .version(pkg.version);
    // 命令注册
    program
        .command("init [projectName]")
        .option("-f,--force", "当前目录存在文件，是否强制初始化？")
        .action(init)
    // 监听debug命令
    program.on("option:debug", function () {
        if (program.debug) {
            process.env.LOG_LEVEL = "verbose";
        } else {
            process.env.LOG_LEVEL = "info";
        }
        log.level = process.env.LOG_LEVEL;
    })
    program.on("command:*", function (obj) {
        log.error(colors.red(`无效的命令：${obj[0]}`))
    })
    program.parse(process.argv)

    if (program.args && program.args.length < 1) {
        program.outputHelp()
    }
}
