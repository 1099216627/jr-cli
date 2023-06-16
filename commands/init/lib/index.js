'use strict';


const Command = require("@jr-cli/command");
const log = require("@jr-cli/log")
const fs = require("fs");
const fse = require("fs-extra");
const inquirer = require("inquirer")
const userHome = require("user-home");
const Pkg = require("@jr-cli/package");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";
const getProjectTemplateApi = require("./getProjectTemplate")
const path = require("path");


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
            this.projectInfo = await this.prepare();
            if (this.projectInfo) {
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
        if (!template || template.length === 0) {
            throw new Error("项目模板不存在")
        }
        this.template = template;
        console.log(this.template)
        const localPath = process.cwd();
        const hasFile = this.isNotEmptyDir(localPath)
        let removeFile = false;
        if (hasFile) {
            removeFile = await this.doClear()
        }
        if (removeFile || this.force) {
            removeFile = await this.confirmClear()
        }
        if (removeFile) {
            // 清空目录
            fse.removeSync(localPath);
        }
        if (hasFile && !removeFile) {
            return
        }
        // 3.选择创建项目或组件
        // 4.获取项目基本信息
        return this.getProjectInfo()
    }


    async doClear() {
        const clear = await inquirer.prompt({
            type: "confirm",
            message: "当前文件夹不为空，是否继续创建项目？",
            name: "isClear",
            default: false
        });
        return clear.isClear
    }

    async confirmClear() {
        const confirm = await inquirer.prompt({
            type: "confirm",
            message: "是否确认清空当前目录？此操作将有一定风险！",
            name: "isClear",
            default: false
        });
        return confirm.isClear
    }

    generateTemplateChoice() {
        return this.template.map(t => {
            return {
                value: t.npm_name,
                name: t.name
            }
        })
    }

    async downloadTemplate() {
        console.log(this.template, this.projectInfo)
        const {projectTemplate} = this.projectInfo;
        const templateInfo = this.template.find(t => t.npm_name === projectTemplate)
        const targetPath = path.resolve(userHome,".jr-cli","template")
        const storeDir = path.resolve(userHome,".jr-cli","template","node_modules")
        const {npm_name,version} = templateInfo;
        const templateNpm = new Pkg({
            targetPath,
            storeDir,
            pkgName:npm_name,
            pkgVersion:version
        })
        if(!await templateNpm.exists()){
            await templateNpm.install()
        }else {
            await templateNpm.update()
        }
    }

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
                            if (!/^[a-zA-Z0-9-_]+$/.test(v)) {
                                done("请输入合法项目名称")
                                return
                            }
                            done(null, true)
                        }, 0)
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
                            if (!/^\d+\.\d+\.\d+(-\S*)?$/.test(v)) {
                                done("请输入合法版本号")
                                return
                            }
                            done(null, true)
                        }, 0)
                    },
                },
                {
                    type: "list",
                    message: "请选择项目模板",
                    name: "projectTemplate",
                    choices: this.generateTemplateChoice()
                }
            ])
            projectInfo = {
                type,
                ...project
            }
        } else if (type === TYPE_COMPONENT) {

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
