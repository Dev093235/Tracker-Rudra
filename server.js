const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// HTML file serve
app.get('/', async (req, res) => {
  const uid = req.query.uid || "unknown";
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
    const log = {
      uid,
      ip,
      isp: data.isp,
      city: data.city,
      region: data.regionName,
      country: data.country,
      time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    };

    const logsPath = path.join(__dirname, "logs.json");
    const logs = fs.existsSync(logsPath) ? JSON.parse(fs.readFileSync(logsPath)) : [];
    logs.push(log);
    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));

    res.sendFile(path.join(__dirname, "tracker.html"));
  } catch (e) {
    console.error(e);
    res.send(`<h1>🔍 UID Tracked</h1><p>But location info fetch failed.</p>`);
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Tracker running at http://localhost:${port}`);
});
