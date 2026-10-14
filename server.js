const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ইন-মেমোরি ডাটাবেস
let appSettings = {
    bkashNumber: "01700000000",
    whatsappNumber: "01800000000",
    topNotice: "Welcome to NightHawks E-Sports! Join matches and win prizes."
};

let users = {
    "guest_user": { name: "NHK-SH1HAB", balance: 150, role: "user" }
};

let tournaments = [
    {
        id: 1,
        title: "NightHawk Grand Clash #1",
        type: "SOLO",
        map: "BERMUDA",
        prizePool: 500,
        perKill: 10,
        entryFee: 30,
        time: "Tonight 09:00 PM",
        roomPass: "Not Published Yet",
        joinedPlayers: []
    }
];

// API Routes
app.get('/api/settings', (req, res) => {
    res.json({ success: true, settings: appSettings });
});

app.post('/api/settings/update', (req, res) => {
    const { bkashNumber, whatsappNumber, topNotice } = req.body;
    if (bkashNumber) appSettings.bkashNumber = bkashNumber;
    if (whatsappNumber) appSettings.whatsappNumber = whatsappNumber;
    if (topNotice) appSettings.topNotice = topNotice;
    res.json({ success: true, message: "Settings updated successfully!" });
});

app.get('/api/tournaments', (req, res) => {
    res.json({ success: true, tournaments });
});

app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!users[userId]) {
        users[userId] = { name: "NHK-SH1HAB", balance: 150, role: "user" };
    }
    res.json({ success: true, user: users[userId] });
});

app.post('/api/tournament/join', (req, res) => {
    const { tournamentId, userId, mode, gameName, gameUid } = req.body;
    const user = users[userId] || { balance: 150 };
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
        return res.json({ success: false, message: "Tournament not found!" });
    }

    let fee = tournament.entryFee;
    if (user.balance < fee) {
        return res.json({ success: false, message: "Insufficient balance! Please top up your wallet." });
    }

    user.balance -= fee;
    users[userId] = user;

    tournament.joinedPlayers.push({ userId, mode, gameName, gameUid, joinedAt: new Date() });

    res.json({ 
        success: true, 
        message: `Successfully joined ${tournament.title} (${mode})! Tk ${fee} deducted.`,
        newBalance: user.balance,
        roomPass: tournament.roomPass
    });
});

app.post('/api/admin/roompass', (req, res) => {
    const { tournamentId, roomPass } = req.body;
    const tournament = tournaments.find(t => t.id == tournamentId);
    if (tournament) {
        tournament.roomPass = roomPass;
        res.json({ success: true, message: "Room ID & Password updated successfully!" });
    } else {
        res.json({ success: false, message: "Tournament not found." });
    }
});

app.post('/api/admin/refund', (req, res) => {
    const { tournamentId } = req.body;
    const tournament = tournaments.find(t => t.id == tournamentId);
    if (tournament) {
        tournament.joinedPlayers.forEach(p => {
            if (users[p.userId]) {
                users[p.userId].balance += tournament.entryFee;
            }
        });
        tournament.joinedPlayers = [];
        res.json({ success: true, message: "All entry fees refunded to players successfully!" });
    } else {
        res.json({ success: false, message: "Tournament not found." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});