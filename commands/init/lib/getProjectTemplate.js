const Request = require("@jr-cli/http")

const requestInstance = new Request({
    baseURL:"http://book.jr.xyz:7001"
}).getInstance()


module.exports = function () {
    return requestInstance.get("/project/template")
}
