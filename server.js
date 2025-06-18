const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ws = require("ws");
const mainDB = require("./databases/controller/dbController");
const {
  router: authRouter,
  ensureRegisteredAppUser,
} = require("./routes/auth");
const appRouter = require("./routes/app");

const ConnectedClients = {};

const wss = new ws.Server({ server: server });

wss.on("connection", function connection(ws) {
  ws.on("message", async function message(data) {
    var dataJSON = JSON.parse(data);
    if (dataJSON.type === "newMessage") {
      var targetWS = getWebSocketById(dataJSON.receiverID);
      if (targetWS) {
        await mainDB
          .prepare(
            `INSERT INTO CHATS (senderID, receiverID, message, status) VALUES
          (?, ?, ?, ?)`
          )
          .run(
            dataJSON["senderID"],
            dataJSON["receiverID"],
            dataJSON["message"],
            "D"
          );
        dataJSON["msgTime"] = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        targetWS.send(JSON.stringify(dataJSON));
      } else {
        mainDB
          .prepare(
            `INSERT INTO CHATS (senderID, receiverID, message, status) VALUES
          (?, ?, ?, ?)`
          )
          .run(
            dataJSON["senderID"],
            dataJSON["receiverID"],
            dataJSON["message"],
            "UD"
          );
      }
    }
    if (dataJSON.type === "setID") {  
      ws.id = dataJSON.id;
      var chats = await mainDB
        .prepare("SELECT * FROM chats WHERE receiverID = ? OR receiverID IS NULL AND status = 'UD';")
        .all(dataJSON.id);
      chats.forEach((chat) => {
        chat["type"] == "newMessage"
        ws.send(JSON.stringify(chat));
      });
    }
    if (dataJSON.type === "ping") {
      ws.send("PONG");
    }
  });
});

function getWebSocketById(id) {
  for (const client of wss.clients) {
    // Ensure the client is open and check the ID
    if (client.readyState === ws.OPEN && client.id === id) {
      return client;
    }
  }
  return null; // If not found
}

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use("/auth", authRouter);
app.use("/app", ensureRegisteredAppUser, appRouter);

server.listen(10000, () => {
  console.log("Server is running on port 10000");
});
