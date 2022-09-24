const mongooose = require('mongoose');
const Review = require('./review');
const Schema = mongooose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true }};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    price: Number,
    location: String, 
    author: {
       type: Schema.Types.ObjectId,
       ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/camps/${this._id}" >${this.title}</a></strong>
            <p>${this.description.substring(0, 50)}...</p>`
});


//query middleware
CampgroundSchema.post('findOneAndDelete', async function (data) {
    if(data){
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
})

module.exports = mongooose.model('Campground', CampgroundSchema);