'use strict';


const Command = require("@jr-cli/command");
const log = require("@jr-cli/log")
const fs = require("fs");
const fse = require("fs-extra");
const inquirer = require("inquirer")

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const getProjectTemplateApi = require("./getProjectTemplate")

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }

    init() {
        this.projectName = this._argv[0] || "";
        this.force = this._argv[1]?.force || false;
        log.verbose("name", "项目名称：" + this.projectName)
        log.verbose("force", "是否强制更新：" + this.force)
    }

    async exec() {
        try {
            // 1.准备阶段
            const projectInfo = await this.prepare();
            if (projectInfo) {
                console.log(projectInfo)
                // 2.下载模板
                this.downloadTemplate()
                // 3.安装模板
            }

        } catch (e) {
            log.error(e.message)
        }
    }

    async prepare() {
        // 0.判断项目模板是否存在
        const template = await getProjectTemplateApi()
        console.log(template)
        const localPath = process.cwd();
        // 1.判断当前目录是否为空
        if (this.isNotEmptyDir(localPath)) {
            let isContinue = false;
            if (!this.force) {
                // 1.1.询问是否继续创建
                isContinue = await inquirer.prompt({
                    type: "confirm",
                    message: "当前文件夹不为空，是否继续创建项目？",
                    name: "isContinue",
                    default: false
                }).isContinue;
            }
            if (isContinue || this.force) {
                // 二次确认是否清空
                const {confirm} = await inquirer.prompt({
                    type: "confirm",
                    name: "confirm",
                    default: false,
                    message: "是否确认清空当前目录？"

                })
                // 2.是否强制更新
                if (confirm) {
                    fse.removeSync(localPath);
                }
            }
        }
        // 3.选择创建项目或组件
        // 4.获取项目基本信息
        return this.getProjectInfo()
    }

    downloadTemplate(){}

    async getProjectInfo() {
        let projectInfo = {};
        const {type} = await inquirer.prompt({
            type: "list",
            message: "请选择初始化类型",
            name: "type",
            default: TYPE_PROJECT,
            choices: [
                {name: "项目", value: TYPE_PROJECT},
                {name: "组件", value: TYPE_COMPONENT},
            ]
        })
        if (type === TYPE_PROJECT) {
            // 获取项目信息
            const project = await inquirer.prompt([
                {
                    type: "input",
                    message: "请输入项目名称",
                    name: "projectName",
                    default: this.projectName,
                    validate: function (v) {
                        const done = this.async();
                        setTimeout(() => {
                            if(!/^[a-zA-Z0-9-_]+$/.test(v)){
                                done("请输入合法项目名称")
                                return
                            }
                            done(null,true)
                        },0)
                    },
                },
                {
                    type: "input",
                    message: "请输入项目版本号",
                    name: "projectVersion",
                    default: "1.0.0",
                    validate: function (v) {
                        const done = this.async();
                        setTimeout(() => {
                            if(!/^\d+\.\d+\.\d+(-\S*)?$/.test(v)){
                                done("请输入合法版本号")
                                return
                            }
                            done(null,true)
                        },0)
                    },
                },
            ])
            projectInfo = {
                type,
                ...project
            }
        }else if(type === TYPE_COMPONENT){

        }

        return projectInfo;
    }

    isNotEmptyDir(localPath) {
        let fileList = fs.readdirSync(localPath)
        fileList = fileList.filter(file =>
            // 文件过滤逻辑
            (!file.startsWith(".") && ['node_modules'].indexOf(file))
        )
        return fileList && fileList.length > 0;
    }
}


function init(argv) {
    return new InitCommand(argv)
}

module.exports = init;
module.exports.InitCommand = InitCommand;
