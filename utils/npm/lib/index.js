'use strict';

const urlJoin = require("url-join");
const semver = require("semver");
const axiosInstance = require("@jr-cli/http").getInstance();

async function getNpmVersions (pkgName,registry) {
    if (!pkgName) {
        return null;
    }
    registry = registry || getDefaultRegistry();
    const finallyUrl = urlJoin(registry, pkgName);
    const result = await axiosInstance.get(finallyUrl);
    return getPackageVersions(result);
}

async function getPkgInfoByNpm(pkgName,curVersion, registry) {
    const versions = await getNpmVersions(pkgName,registry)
    const newVersions = getOutdatedPkgVersions(versions,curVersion);
    if(newVersions && newVersions.length > 0){
        return newVersions[0]
    }
    return null;
}

// 获取线上源地址，默认官方
function getDefaultRegistry(isOrigin = false) {
    return isOrigin ? "https://registry.npmjs.org" : "https://registry.npmmirror.com/";
}

// 获取指定包所有版本号
function getPackageVersions(data) {
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}
// 获取高版本包版本号
function getOutdatedPkgVersions (versions,curVersion) {
    return versions.filter(v => semver.satisfies(v,`^${curVersion}`)).sort((a,b) => semver.gt(b,a))
}

async function getPkgLatestVersion (pkgName,registry) {
    const versions = await getNpmVersions(pkgName,registry)
    if(versions && versions.length > 0){
        return semver.sort(versions)[versions.length - 1]
    }
    return null;
}

module.exports = {
    getPkgInfoByNpm,
    getDefaultRegistry,
    getPkgLatestVersion
};
