'use strict';

module.exports = core;

const log = require("@jr-cli/log");
const pkg = require("../package.json");
function core(args) {
    checkPkgVersion();
}

function checkPkgVersion () {
    log.info("version",`当前版本号为${pkg.version}`)
}
