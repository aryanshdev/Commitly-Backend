const express = require("express");
const router = express.Router();
const userRouter = require("./app/user");
const chatRouter = require("./chats/chat")


router.use("/user",userRouter );
router.use("/chats", chatRouter);

module.exports = router;
