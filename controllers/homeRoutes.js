const router = require("express").Router();
const { Listing, User } = require("../models");
const sequelize = require('../config/connection');
const withAuth = require("../utils/auth");

// Existing route for the homepage
router.get("/", async (req, res) => {
    try {
        const listingData = await Listing.findAll({
            include: [
                {
                    model: User,
                    attributes: ["username"],
                },
            ],
        });

        const listings = listingData.map((listing) => listing.get({ plain: true }));

        res.render("./layouts/main", {
            listings,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Existing route for listing details
router.get("/listing/:id", async (req, res) => {
    try {
        const listingData = await Listing.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ["username"],
                },
            ],
        });

        const listing = listingData.get({ plain: true });

        res.render("listing", {
            ...listing,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Existing route for user profile
router.get("/profile", withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ["password"] },
            include: [{ model: Listing }],
        });

        const user = userData.get({ plain: true });

        res.render("profile", {
            ...user,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Existing route for login page
router.get("/login", (req, res) => {
    if (req.session.logged_in) {
        res.redirect("/profile");
        return;
    }

    res.render("login");
});

// New route for the /buy page
router.get("/buy", (req, res) => {
    // Handle logic for the /buy page here
    res.render("buy");
});

// New route for the /sell page; protected with `withAuth` middleware
router.get("/sell", withAuth, async (req, res) => {
    try {
        // Fetch data required for the /sell page, e.g., listings for the user
        const user = req.session.user_id; // Assuming you have the user's ID in the session
        const userListingData = await Listing.findAll({
            where: {
                user_id: user
            }
        });

        const userListings = userListingData.map((listing) => listing.get({ plain: true }));

        res.render("sell", {
            userListings,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;