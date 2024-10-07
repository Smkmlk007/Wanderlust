if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}
// console.log(process.env); 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//setting up ejs

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); //for serving static files
app.use(express.json());

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connected");
})
.catch((err)=>{ console.log(err)});

async function main(){
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    await mongoose.connect(dbUrl);
}


//routes

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60,
})

store.on("error",()=>{
    console.log("Error in Mongo session Store",err)
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge :  7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}



app.use(session(sessionOptions));
app.use(flash());

//for passport

app.use(passport.initialize()); // initiliazes passport
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("Success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    next();
})


//routes
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter );


// middleware

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found"));
// })
// app.use((err,req,res,next)=>{
//     let{statusCode =500,message="Something Went"} = err;
//     // res.status(statusCode).send(message);
//     res.status(statusCode).render("listings/error.ejs",{message});
// })
app.listen(8080,()=>{
    console.log("Listening to 8080");
})