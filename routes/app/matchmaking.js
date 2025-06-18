const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const mainDB = require("../../databases/controller/dbController");

router.get("getProfilesForUser", (req,res) => {
    var users = mainDB.prepare("SELECT * FROM USERS WHERE uuid != ? LIMIT 10", req.headers["x-app-uuid"]).all()
    res.json(users);
})
