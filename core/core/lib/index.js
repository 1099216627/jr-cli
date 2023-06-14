'use strict';

module.exports = core;

const log = require("@jr-cli/log");
const semver = require("semver");
const path = require("path");
const colors = require("colors")
const root = require("root-check")
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const minimist = require("minimist");
const env = require("dotenv");

const constant = require("./const");
const pkg = require("../package.json");


function core(args) {
    try{
        checkPkgVersion();
        checkNodeVersion();
        rootDegradation();
        checkUserHome();
        checkInputArgs(args);
        checkEnv();
    }catch (e) {
        log.error(e.message)
    }
}

// 检查脚手架版本
function checkPkgVersion () {
    log.info("version",`当前版本号为${pkg.version}`)
}

// 检查node版本
function checkNodeVersion () {
    const curNodeVersion = process.version;
    const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
    if(semver.lt(curNodeVersion,lowestNodeVersion)){
        throw new Error(colors.red(`Node版本过低，请升级 ${lowestNodeVersion} 以上的版本`))
    }
}
// root权限降级
function rootDegradation(){
    // 当root权限开启时自动降级
    root();
}
// 检查用户主目录
function checkUserHome () {
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red("当前用户主目录不存在"))
    }
}
// 检查命令行参数
function checkInputArgs (args) {
    args = minimist(args);
    checkArgs(args)
}
function checkArgs(args){
    if(args.debug){
        process.env.LOG_LEVEL = "debug";
    }else{
        process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
}

// 检查环境变量
function checkEnv(){
    const envPath = path.resolve(userHome,'.env');
    if(pathExists(envPath)){
        env.config({
            path:envPath
        })
    }
    createDefaultConfig()
}
// 创建默认配置项
function createDefaultConfig(){
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
