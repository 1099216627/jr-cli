'use strict';

const pkgDir = require("pkg-dir").sync;
const {isObject} = require("@jr-cli/utils")
const path = require("path");
const formatPath = require("@jr-cli/path");
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;
const fse = require("fs-extra");
const {getDefaultRegistry,getPkgLatestVersion} = require("@jr-cli/npm")

class Package {
    constructor(options) {
        if (!options) {
            throw new Error("Package类的options参数不能为空")
        }
        if (!isObject(options)) {
            throw new Error("Package类的options参数有误")
        }
        // pkg的目标路径
        this.targetPath = options.targetPath;
        // pkg的缓存路径
        this.storeDir = options.storeDir;
        // pkg的name
        this.pkgName = options.pkgName;
        // pkg的版本
        this.pkgVersion = options.pkgVersion;
        // pkg缓存目录前缀
        this.cacheFilePathPrefix = this.pkgName.replace("/","+")
    }

    async prepare () {
        if(this.storeDir && !pathExists(this.storeDir)){
            fse.mkdirpSync(this.storeDir)
        }
        if(this.pkgVersion === "latest"){
            this.pkgVersion = await getPkgLatestVersion(this.pkgName)
        }
    }

    get cacheFilePath () {
        return path.resolve(this.storeDir,this.pkgName)
    }

    getSpecificCacheFilePath(version){
        return path.resolve(this.storeDir,`${this.cacheFilePathPrefix}@${version}`)
    }

    // 判断当前pkg是否存在
    async exists() {
        if(this.storeDir){
            await this.prepare()
            return pathExists(this.cacheFilePath)
        }else{
            return pathExists(this.storeDir)
        }
    }

    // 安装pkg
    async install() {
        await npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                {name: this.pkgName, version: this.pkgVersion}
            ]
        })
    }

    // 更新pkg
    async update() {
        await this.prepare()
        // 1.获取最新的npm模块版本号
        const latestPkgVersion = await getPkgLatestVersion(this.pkgName)
        // 2.查询最新版本号的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPkgVersion)
        // 3.不存在则安装
        if(!pathExists(latestFilePath)){
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [
                    {name: this.pkgName, version: latestPkgVersion}
                ]
            })
            this.pkgVersion = latestPkgVersion;
        }
    }

    // 获取入口文件路径
    getRootFilePath() {
        function _getRootFile (targetPath) {
            // 1.获取package.json所在的目录
            const dir = pkgDir(targetPath);
            // 2.读取package.json
            if (dir) {
                // 3.main/lib输出成路径
                const pkgFile = require(path.resolve(dir, 'package.json'))
                if (pkgFile && pkgFile.main) {
                    // 4.路径兼容
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
            return null;
        }
        if(this.storeDir){
            return _getRootFile(this.cacheFilePath)
        }else{
            return _getRootFile(this.targetPath)
        }
    }
}

module.exports = Package;
