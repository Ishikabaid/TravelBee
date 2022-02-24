const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
})

module.exports = mongooose.model('Review', reviewSchema);