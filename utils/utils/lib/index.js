'use strict';

const cliSpinner = require("cli-spinner").Spinner;

function isObject (obj) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}

function spinner () {
    const sp = new cliSpinner();
    sp.setSpinnerString("|/-\\")
    sp.setSpinnerTitle("download")
    sp.start();
    return sp;
}

module.exports = {
    isObject,
    spinner
}
