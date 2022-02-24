const mongooose = require('mongoose');
const Review = require('./review');
const Schema = mongooose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    description: String,
    price: Number,
    location: String, 
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
})


//query middleware
CampgroundSchema.post('findOneAndDelete', async function (data) {
    // console.log("goneee!!")
    if(data){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongooose.model('Campground', CampgroundSchema);