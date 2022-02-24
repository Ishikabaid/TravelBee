const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./campdata');
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/travel-bee', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex : true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected!');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const mockDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const random10 = Math.floor(Math.random() * 10);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            location: `${cities[random10].city}, ${cities[random10].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quod nobis accusamus velit. Quis eaque explicabo, repudiandaeipsum culpa id in deleniti illo a libero dolorum deserunt totam doloremque, beatae animi.',
            price: price
        })
        await camp.save();
    }
}

mockDB();