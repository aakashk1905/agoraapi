const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
app.get("/", (req, res) => {
  res.json({ Success: true });
});
app.get("/token", (req, res) => {
  const { channel, uid, account, role = "publisher", expiration = 3600 } = req.query;

  // Validate required parameter
  if (!channel) {
    return res.status(400).json({ error: "Channel name is required" });
  }

  // Validate that either uid or account is provided
  if (!uid && !account) {
    return res.status(400).json({ error: "Either uid or account must be provided" });
  }

  // Determine the role
  let agoraRole;
  if (role.toLowerCase() === "publisher") {
    agoraRole = RtcRole.PUBLISHER;
  } else if (role.toLowerCase() === "subscriber") {
    agoraRole = RtcRole.SUBSCRIBER;
  } else {
    return res.status(400).json({ error: "Invalid role. Must be 'publisher' or 'subscriber'" });
  }

  // Calculate token expiration
  const tokenExpirationInSeconds = parseInt(expiration, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTime + tokenExpirationInSeconds;

  try {
    let token;

    if (uid) {
      const numericUid = parseInt(uid, 10);
      if (isNaN(numericUid)) {
        return res.status(400).json({ error: "UID must be a number" });
      }

      // Check if account is also provided
      if (account) {
        // Generate token with UID and privilege
        token = RtcTokenBuilder.buildTokenWithUidAndPrivilege(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          channel,
          numericUid,
          agoraRole,
          privilegeExpiredTs
        );
      } else {
        // Generate token with UID
        token = RtcTokenBuilder.buildTokenWithUid(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          channel,
          numericUid,
          agoraRole,
          privilegeExpiredTs
        );
      }
    } else if (account) {
      // Generate token with User Account
      token = RtcTokenBuilder.buildTokenWithUserAccount(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel,
        account,
        agoraRole,
        privilegeExpiredTs
      );
    }

    res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
