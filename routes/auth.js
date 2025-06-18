const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const mainDB = require("../databases/controller/dbController");
const ShortUniqueId = require("short-unique-id");
const idGen = new ShortUniqueId({ length: 12 });
const client = new OAuth2Client(
  "202800168171-lcbs084mh80u20b5l91e232aj3ea4ou3.apps.googleusercontent.com"
);

async function findUserByEmail(email) {
  try {
    const result = mainDB
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
   
    return result;
  } catch (error) {
    return null;
  }
}

function createUser(payload) {
  var uuid = idGen.rnd();
  mainDB
    .prepare("INSERT INTO users (uuid , name, email) VALUES (?, ?, ?)")
    .run(uuid, payload.name, payload.email);
  return uuid;
}

router.post("/verify-google-token", async (req, res) => {
  const { idToken } = req.body;
  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience:
        "202800168171-lcbs084mh80u20b5l91e232aj3ea4ou3.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const userEmail = payload["email"];
    let user = await findUserByEmail(userEmail);
    if (!user) {
      if (user === undefined) {
        user = await createUser(payload);
        res
          .status(201)
          .send({ uuid: user, name: payload.name, email: userEmail });
      }
      if (user === null) {
        res.status(500).send("USER DB ERROR");
      }
    } else {
      if (user.nickname) {
        res
          .status(202)
          .send({ uuid: user.uuid, name: payload.name, email: userEmail, nickname: user.nickname });
      } else {
        res
          .status(201)
          .send({ uuid: user.uuid, name: payload.name, email: userEmail });
      }
    }
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).send("Invalid token");
  }
});

function ensureRegisteredAppUser(req, res, next) {
  if (req.headers["x-app-uuid"]) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

module.exports = { router, ensureRegisteredAppUser };
