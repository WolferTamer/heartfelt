import * as mongoose from 'mongoose'

const connectionSchema = new mongoose.Schema({
    connectionid: {type: String, require:true},
    mood: {type:String,require:false,default:"happy"},
    note: {type:String,require:false,default:"You made me happy today"}
})

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true},
    connections: {type:[connectionSchema]}
    });

const UserModel = mongoose.model('profile', baseSchema);

const requestSchema = new mongoose.Schema({
    sender: {type: String,require:true},
    recipient: {type:String,require:true}
})

const RequestModel = mongoose.model('request',requestSchema)

export {UserModel,RequestModel}