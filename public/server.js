const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ডাইনামিক সেটিংস ও ডাটাবেজ
let settings = {
    bkashNumber: "01952804839",
    whatsappNumber: "017222946180",
    topNotice: "ম্যাচ খেলার পর উইনিং ব্যালেন্স ১৫ মিনিটের মধ্যে ওয়ালেটে যোগ হয়ে যাবে। নাইটহক্স ই-স্পোর্টসে আপনাকে স্বাগতম।"
};

let users = [];
let tournaments = [
    {
        id: 1,
        title: "NightHawk Grand Clash #1",
        category: "Clash Squad",
        subCategory: "4v4",
        map: "BERMUDA",
        prizePool: "500",
        perKill: "10",
        entryFee: "30",
        time: "Tonight 09:00 PM",
        joinedCount: 2,
        totalSlots: 8,
        roomId: "",
        roomPass: "",
        cancelNotice: "",
        joinedPlayers: [
            { username: "demo1", inGameName: "NSK_Fighter", uid: "91232169" },
            { username: "demo2", inGameName: "NHK_Shihab", uid: "9123216999" }
        ]
    }
];

// API Endpoints
app.get('/api/settings', (req, res) => res.json(settings));
app.post('/api/settings/update', (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ success: true, message: "সেটিংস আপডেট হয়েছে!" });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: "ইউজারনেমটি আগেই ব্যবহার করা হয়েছে!" });
    }
    const newUser = {
        username,
        password,
        balance: 0,
        supportPin: Math.floor(100000 + Math.random() * 900000).toString(),
        banned: false,
        notifications: []
    };
    users.push(newUser);
    res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: "ভুল ইউজারনেম বা পাসওয়ার্ড!" });
    if (user.banned) return res.status(403).json({ success: false, message: "আপনাকে ব্যান করা হয়েছে!" });
    res.json({ success: true, user });
});

app.get('/api/tournaments', (req, res) => res.json(tournaments));

app.post('/api/tournaments/add', (req, res) => {
    const newTournament = {
        id: Date.now(),
        ...req.body,
        joinedCount: 0,
        joinedPlayers: [],
        roomId: "",
        roomPass: "",
        cancelNotice: ""
    };
    tournaments.push(newTournament);
    res.json({ success: true, message: "নতুন ম্যাচ সফলভাবে পাবলিশ হয়েছে!" });
});

app.post('/api/tournaments/delete', (req, res) => {
    const { id } = req.body;
    tournaments = tournaments.filter(t => t.id !== Number(id));
    res.json({ success: true, message: "ম্যাচটি ডিলিট করা হয়েছে!" });
});

app.post('/api/tournaments/join', (req, res) => {
    const { tournamentId, username, inGameName, uid } = req.body;
    const match = tournaments.find(t => t.id === Number(tournamentId));
    if (match) {
        match.joinedPlayers.push({ username, inGameName, uid });
        match.joinedCount += 1;
        return res.json({ success: true, message: "সফলভাবে ম্যাচে জয়েন করেছেন!" });
    }
    res.status(400).json({ success: false, message: "ম্যাচ পাওয়া যায়নি!" });
});

app.post('/api/tournaments/update-room', (req, res) => {
    const { tournamentId, roomId, roomPass, cancelNotice } = req.body;
    const match = tournaments.find(t => t.id === Number(tournamentId));
    if (match) {
        match.roomId = roomId || "";
        match.roomPass = roomPass || "";
        match.cancelNotice = cancelNotice || "";
        return res.json({ success: true, message: "রুম আইডি ও নোটিশ সেভ হয়েছে!" });
    }
    res.status(400).json({ success: false, message: "ম্যাচ পাওয়া যায়নি!" });
});

app.post('/api/admin/refund', (req, res) => {
    const { username, amount, message } = req.body;
    const user = users.find(u => u.username === username);
    if (user) {
        user.balance += Number(amount);
        user.notifications.