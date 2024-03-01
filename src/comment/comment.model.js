import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
    publicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    text: {
        type: String,
        required: true
    }
},{
    versionKey: false
});

export default mongoose.model('Comment', commentSchema);