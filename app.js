if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
} 

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utilities/expressError');
const ejsmate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy =  require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

//routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/camps');
const reviewRoutes = require('./routes/reviews');
// const MongoDBStore = require("connect-mongo")(session);
// const session = require('express-session');
const MongoStore = require('connect-mongo');
const req = require('express/lib/request');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/travel-bee';

// 'mongodb://localhost:27017/travel-bee'
mongoose.connect( dbUrl ,{
    useNewUrlParser : true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected!');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsmate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store =  MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60
});

store.on("error", function (e){
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/dummyUser', async (req,res) => {
//     const user = new User({ email: 'xyz@gmail.com', username: 'ishuuu'});
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

app.use('/', userRoutes);
app.use('/camps', campgroundRoutes);
app.use('/camps/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*' , (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', {err});
    // res.send('Something went wrong!');
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening at port ${port}!`);
})