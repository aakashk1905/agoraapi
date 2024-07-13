const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

app.get("/token", (req, res) => {
  const channelName = req.query.channel;
  const uid = req.query.uid || 0;
  const role = RtcRole.PUBLISHER;

  if (!channelName) {
    return res.status(400).json({ error: "Channel name is required" });
  }

  // Token expires in 24 hours
  const expirationTimeInSeconds = 24 * 60 * 60;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTime + expirationTimeInSeconds;

  // Build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.json({ token });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
