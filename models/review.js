const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongooose.model('Review', reviewSchema);