#! /usr/bin/env node
const importLocal = require("import-local");
if(importLocal(__filename)){
    console.log("本地启动")
}else{
    require("../lib")(process.argv.slice(2))
}
