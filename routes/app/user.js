const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const mainDB = require("../../databases/controller/dbController");

cloudinary.config({
  cloud_name: "commitly",
  api_key: "377471679477777",
  api_secret: "dj_hONVP-Hy1vpL6GA2_-jt-1Lk", // Click 'View API Keys' above to copy your API secret
});


router.post("/firstDataEntry", async (req, res) => {
  var userID = req.headers["x-app-uuid"];
  console.log("Fgfg")
  try {
    await Promise.all([
      cloudinary.uploader
        .upload(`data:${req.body.img1mime};base64,` + req.body.img1, {
          resource_type: "image",
          public_id: userID + "_1",
          overwrite: true,
        })
        .catch((err) => console.log(err)),
      cloudinary.uploader
        .upload(`data:${req.body.img2mime};base64,` + req.body.img2, {
          resource_type: "image",
          public_id: userID + "_2",
          overwrite: true,
        })
        .catch((err) => console.log(err)),
      mainDB
        .prepare(
          `
              UPDATE users SET nickname = ?, gender = ?, dob = ?, about = ?, interests = ?, skills = ? WHERE uuid = ?
          `
        )
        .run(
          req.body.nickName,
          req.body.gender,
          req.body.dob,
          req.body.about,
          req.body.interests,
          req.body.skills,
          userID
        ),
    ]);
    res.json({ message: "Data entered successfully" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
router.get("/getProfile", async (req, res) => {
  var id = req.headers["x-app-uuid"];
  
  var profile = await mainDB
    .prepare("SELECT * FROM users WHERE uuid = ?")
    .get(id);
  res.json(profile);
});
router.post("/getOtherPersonProfile", async (req, res) => {
  var id = req.headers["x-app-uuid"];
  
  var profile = await mainDB
    .prepare("SELECT * FROM users WHERE uuid = ?")
    .get(req.body.otherUUID);
  res.json(profile);
});

router.post("/setNickname", async (req, res) => {
  var id = req.headers["x-app-uuid"];
  await mainDB
    .prepare("UPDATE users SET nickname = ? WHERE uuid = ?")
    .run(req.body.nickname, id);
  res.sendStatus(200);
});

module.exports = router;
