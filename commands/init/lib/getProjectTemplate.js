const request = require("@jr-cli/http")


request.init("http://book.jr.xyz:7001");

module.exports = function () {
    return request.getInstance().get("/project/template")
}
