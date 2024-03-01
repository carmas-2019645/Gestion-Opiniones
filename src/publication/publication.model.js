import mongoose from "mongoose"

const publicSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, 
{ 
    versionKey: false
 }); 

export default mongoose.model('public', publicSchema)
