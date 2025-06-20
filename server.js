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
      "https://ipinfo.io/json?token=demo" // Replace 'demo' with your real token if you have one
    ];

    for (const url of sources) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;

        const data = await resp.json();

        // Normalize different API responses
        return {
          ip: data.ip || "N/A",
          city: data.city || (data.location?.city ?? "N/A"),
          region: data.region || (data.region_name ?? "N/A"),
          country: data.country || data.country_name || "N/A",
          org: data.org || data.connection?.isp || data.org || "Unknown"
        };
      } catch (e) {
        continue;
      }
    }

    throw new Error("All IP APIs failed.");
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
    res.json({ success: true, logEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch IP info from all sources." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Rudra Tracker server started on port ${port}`);
});
