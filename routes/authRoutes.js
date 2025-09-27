const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// @route POST /api/auth/register
// @desc Register a user
// @access Public
router.post("/register", authController.register);

// @route POST /api/auth/login
// @desc Login user
// @access Public
router.post("/login", authController.login);

// @route POST /api/auth/logout
// @desc Logout user
// @access Private
router.post("/logout", authController.logout);

module.exports = router;
