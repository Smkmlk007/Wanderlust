const User = require("../models/user.js");

module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signup = async(req,res)=>{
    try{
        let{username,email,password} = req.body;
    
        const newUser = new User({ email,username});
        const registeredUser = await User.register(newUser, password);

        //to login user automatically after sign up!!
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("Success","Welcome to WanderLust");
            res.redirect("/listings");
        })

       
       
    }catch(e){
        req.flash("error",e.message);
        res.redirect('/signup');
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async(req,res)=>{
    req.flash("Success","Welcome Back to WanderLust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl); 
}

module.exports.logout = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
           return next(err);
        }
        req.flash("Success","You are Logged Out now!!");
        res.redirect("/listings");
    })
}