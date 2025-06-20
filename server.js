const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 10000;

// === Handle UID trace request ===
app.get("/", async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "UID missing" });

    try {
        const ipInfo = await fetch("https://ipapi.co/json/");
        const data = await ipInfo.json();

        res.json({
            uid,
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            org: data.org
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch IP info" });
    }
});

app.listen(port, () => console.log(`🚀 Server started on port ${port}`));
