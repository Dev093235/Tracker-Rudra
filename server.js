const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

app.get("/", async (req, res) => {
  const uid = req.query.uid || "unknown";

  const logFile = path.join(__dirname, "logs.json");

  async function fetchIPInfo() {
    const sources = [
      "https://ipwho.is/",
      "https://ipapi.co/json/",
      "https://ipinfo.io/json?token=demo"
    ];

    for (const url of sources) {
      try {
        console.log(`🔄 Trying: ${url}`);
        const resp = await fetch(url);
        if (!resp.ok) {
          console.log(`❌ Failed: ${url}`);
          continue;
        }

        const data = await resp.json();
        console.log(`✅ Success from: ${url}`);
        return {
          ip: data.ip || "N/A",
          city: data.city || data.location?.city || "N/A",
          region: data.region || data.region_name || "N/A",
          country: data.country || data.country_name || "N/A",
          org: data.org || data.connection?.isp || "Unknown"
        };
      } catch (e) {
        console.log(`⚠️ Error from: ${url} → ${e.message}`);
        continue;
      }
    }

    throw new Error("All IP sources failed.");
  }

  try {
    const info = await fetchIPInfo();

    const logEntry = {
      uid,
      ...info,
      time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };

    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, "utf8"));
    }

    logs.push(logEntry);

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log("📁 Log saved:", logEntry);

    res.json({ success: true, logEntry });
  } catch (err) {
    console.log("❌ Final Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Rudra Tracker LIVE on port ${port}`);
});
