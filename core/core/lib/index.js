'use strict';

module.exports = core;

const log = require("@jr-cli/log");
const semver = require("semver");
const colors = require("colors")
const pkg = require("../package.json");
const constant = require("./const");

function core(args) {
    try{
        checkPkgVersion();
        checkNodeVersion();
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

