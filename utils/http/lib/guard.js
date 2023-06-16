function createGuard(Axios) {
    Axios.interceptors.request.use(config => {
        // todo something
        return config;
    }, error => {
        return Promise.reject(error)
    })

    Axios.interceptors.response.use(response => {
        const {data,status} = response;
        if(status === 200){
            return data;
        }else{
            return Promise.reject(data)
        }
    },error => {
        return Promise.reject(error)
    })
}


module.exports = createGuard;
