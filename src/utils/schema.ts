import * as mongoose from 'mongoose'

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true}
    });

const UserModel = mongoose.model('profile', baseSchema);

export default UserModel