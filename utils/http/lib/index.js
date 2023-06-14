'use strict';

const axios = require("axios");
const guard = require("./guard");

class Service {
    constructor() {
        this.instance = this.init();
        this.createGuard(this.instance);
    }

    getInstance(){
        return this.instance;
    }

    init(){
        return axios.create({
            baseURL:"",
            headers:{
                "Content-Type":"application/json"
            },
            timeout:10000
        })
    }

    createGuard(instance){
        guard(instance)
    }
}

module.exports = new Service();

