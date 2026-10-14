const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// মিডলওয়্যার
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ডামি বা প্রাথমিক ম্যাচ ডেটা (মেমোরি ডেটাবেস)
let tournaments = [
    {
        id: 1,
        title: "FREE FIRE DAILY BR MATCH #01",
        type: "SOLO",
        map: "Bermuda",
        entryFee: 20,
        perKill: 10,
        prizePool: 300,
        time: "Today, 09:00 PM",
        totalSeats: 48,
        joinedSeats: 12,
        roomId: "",
        roomPass: ""
    }
];

// ১. সব টুর্নামেন্ট লিস্ট দেখার API (ইউজারদের জন্য)
app.get('/api/tournaments', (req, res) => {
    res.json(tournaments);
});

// ২. নতুন ম্যাচ পাবলিশ করার API (অ্যাডমিনদের জন্য)
app.post('/api/tournaments/add', (req, res) => {
    const { title, type, map, entryFee, perKill, prizePool, time, totalSeats } = req.body;
    const newMatch = {
        id: tournaments.length + 1,
        title,
        type,
        map,
        entryFee: Number(entryFee),
        perKill: Number(perKill),
        prizePool: Number(prizePool),
        time,
        totalSeats: Number(totalSeats),
        joinedSeats: 0,
        roomId: "",
        roomPass: ""
    };
    tournaments.push(newMatch);
    res.json({ success: true, message: "নতুন টুর্নামেন্ট সফলভাবে পাবলিশ হয়েছে!", match: newMatch });
});

// ৩. রুম আইডি ও পাসওয়ার্ড আপডেট করার API (অ্যাডমিনদের জন্য)
app.post('/api/tournaments/update-room', (req, res) => {
    const { matchId, roomId, roomPass } = req.body;
    const match = tournaments.find(m => m.id === Number(matchId));
    if (match) {
        match.roomId = roomId;
        match.roomPass = roomPass;
        res.json({ success: true, message: "রুম আইডি ও পাসওয়ার্ড আপডেট হয়েছে!" });
    } else {
        res.status(404).json({ success: false, message: "ম্যাচ পাওয়া যায়নি!" });
    }
});

// মূল পেজ রাউটস
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// সার্ভার লিসেন
app.listen(PORT, () => {
    console.log(`NightHawk eSports Server is running live on port ${PORT}`);
});