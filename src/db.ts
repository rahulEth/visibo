import mongoose from 'mongoose'
// const DB_URL = 'mongodb://127.0.0.1:27017/myapp'

import {MONGO_DB_URL} from './config/env'

const conntectDB = ()=>{

    mongoose.connect(MONGO_DB_URL, {
    
    })
    .then(()=> console.log('mongodb connected!'))
    .catch(err =>{
        console.error("mongodb connection error: ", err)
        process.exit(1) // exit if db connection fails
    }) 
}

export = conntectDB