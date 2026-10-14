const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ইন-মেমোরি টুর্নামেন্ট ডাটাবেজ
let tournaments = [
    {
        id: 1,
        title: "NightHawk Grand Clash #1",
        type: "SOLO",
        map: "BERMUDA",
        prizePool: 500,
        perKill: 10,
        entryFee: 30,
        time: "Tonight 09:00 PM"
    }
];

// টুর্নামেন্ট গেট এপিআই
app.get('/api/tournaments', (req, res) => {
    res.json(tournaments);
});

// টুর্নামেন্ট এড এপিআই
app.post('/api/tournaments/add', (req, res) => {
    const data = req.body;
    tournaments.push({
        id: Date.now(),
        title: "NightHawk Special Match",
        ...data
    });
    res.json({ success: true, message: "টুর্নামেন্ট সফলভাবে যোগ করা হয়েছে!" });
});

// মূল পেজ রাউট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// অ্যাডমিন পেজ রাউট
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`NightHawks Server Running on Port ${PORT}`);
});