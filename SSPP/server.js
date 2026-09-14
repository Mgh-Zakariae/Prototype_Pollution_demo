const express = require('express');
const app = express();
app.use(express.json());

// A normal user object in the database memory
let userSession = {
    username: "alice",
    address: "123 Main St"
    // Notice: there is NO "isAdmin" property here!
};

// Insecure helper function that merges user input into the user object
function unsafeMerge(target, source) {
    for (let key in source) {
        if (typeof target[key] === 'object' && typeof source[key] === 'object') {
            unsafeMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// 1. The Vulnerable Route: Users update their address
app.post('/api/update-profile', (req, res) => {
    unsafeMerge(userSession, req.body); 
    res.json({ status: "Profile updated!" });
});

// 2. The Admin Check Route (The Gadget)
app.get('/api/admin-panel', (req, res) => {
    // A regular user shouldn't have userSession.isAdmin.
    // If it is undefined, it skips the block.
    if (userSession.isAdmin) { 
        res.send("Welcome to the secret Admin Dashboard!");
    } else {
        res.status(403).send("Access Denied: Not an admin.");
    }
});

app.listen(3000, '0.0.0.0', () => console.log('Listening on port 1337'));
