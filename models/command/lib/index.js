'use strict';
const semver = require("semver");
const colors = require("colors");
const constant = require("./const");
const log = require("@jr-cli/log");
class Command {
    constructor(argv) {
        if(!argv){
            throw new Error(colors.red("参数不能为空"))
        }
        if(!Array.isArray(argv)){
            throw new Error(colors.red("参数格式有误，必须为数组"))
        }
        if(argv.length < 1){
            throw new Error(colors.red("参数列表为空"))
        }
        this._argv = argv;
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkNodeVersion());
            chain = chain.then(() => this.initArgs());
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            chain.catch((e) => {
                log.error(e.message)
            })
        })
    }

    initArgs () {
        this._argv =this._argv.slice(0,this._argv.length - 1)
    }

    // 检查node版本
    checkNodeVersion() {
        const curNodeVersion = process.version;
        const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
        if (semver.lt(curNodeVersion, lowestNodeVersion)) {
            throw new Error(colors.red(`Node版本过低，请升级 ${lowestNodeVersion} 以上的版本`))
        }
    }

    init () {
        throw new Error("init必须实现")
    }

    exec () {
        throw new Error("exec必须实现")
    }
}


module.exports = Command;
