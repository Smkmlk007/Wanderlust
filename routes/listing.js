const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js"); 

const multer  = require('multer')
const {storage} = require("../cloudconfig.js");

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });

//index route
router.get("/",wrapAsync(listingController.index));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//show route
router.get("/:id",wrapAsync(listingController.showListing));

//create route
router.post(
     "/",
     isLoggedIn,
     upload.single('listing[image]'),
     validateListing,
     wrapAsync(listingController.createListing));

//edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));

// update route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing));
//delete
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing));

module.exports = router;