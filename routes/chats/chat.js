const express = require("express");
const router = express.Router();
const mainDB = require("../../databases/controller/dbController");

router.get("/getChats", async (req, res) => {
  var id = req.headers["x-app-uuid"];
  
  var chats = await mainDB
    .prepare(`WITH LatestMessages AS (
    SELECT 
        senderID, 
        receiverID, 
        MAX(msgTime) AS latestMsgTime
    FROM 
        chats
    WHERE 
        senderID = ? OR receiverID = ? OR receiverID IS NULL
    GROUP BY 
        CASE 
            WHEN receiverID IS NULL THEN senderID
            WHEN senderID < receiverID THEN senderID || receiverID
            ELSE receiverID || senderID
        END
)
SELECT 
    CASE 
        WHEN receiverID IS NULL THEN 'commitly'
        WHEN senderID = ? THEN receiverID 
        ELSE senderID 
    END AS otherPersonID,
    CASE 
        WHEN receiverID IS NULL THEN 'Commitly'
        ELSE users.nickname
    END AS nickname,
    LatestMessages.latestMsgTime AS msgTime
FROM 
    LatestMessages
LEFT JOIN 
    users 
ON 
    users.uuid = CASE 
                    WHEN receiverID IS NULL THEN NULL
                    WHEN senderID = ? THEN receiverID 
                    ELSE senderID 
                END
ORDER BY 
    msgTime DESC;
`)
    .all(id, id, id, id);
  res.send(chats);
});
router.post("/getMessages", async (req, res) => {
  var id = req.headers["x-app-uuid"];
  var chats = await mainDB
    .prepare(
      `SELECT * FROM chats WHERE ( senderID = ? AND receiverID = ? ) 
      OR (senderID = ? AND receiverID = ?) OR ( senderID = ? AND receiverID IS NULL) ORDER BY msgTime`
    )
    .all(id, req.body.otherUUID, req.body.otherUUID, id, req.body.otherUUID);
  res.send(chats);
});

module.exports = router;
