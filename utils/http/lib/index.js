'use strict';

const axios = require("axios");
const guard = require("./guard");

class Service {
    constructor(config) {
        this.instance = this.init(config);
        this.createGuard(this.instance);
    }

    getInstance(){
        return this.instance;
    }

    init(config){
        const newConfig = {
            baseURL:"",
            headers:{
                "Content-Type":"application/json"
            },
            timeout:10000,
            ...config,
        }
        return axios.create(config)
    }

    createGuard(instance){
        guard(instance)
    }
}

module.exports = Service;

