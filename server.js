const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

app.get("/", async (req, res) => {
    const uid = req.query.uid || "unknown";

    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        const logEntry = {
            uid,
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            org: data.org,
            time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        };

        // Read existing logs
        let logs = [];
        const logFile = path.join(__dirname, "logs.json");

        if (fs.existsSync(logFile)) {
            logs = JSON.parse(fs.readFileSync(logFile, "utf8"));
        }

        logs.push(logEntry);

        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

        res.json({ success: true, message: "Data logged successfully", logEntry });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while fetching IP info" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Rudra Tracker running at http://localhost:${port}`);
});
