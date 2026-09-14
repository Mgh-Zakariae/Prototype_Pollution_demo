const express      = require('express');
const path         = require('path');
const crypto       = require('crypto');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const store = new Map();

const defaultSettings = () => ({
	pet_name: "Luna",
	pet_breed: "corgi",
	auto_feed: "true",
	mood: "happy",
	playtime: "30",
	theme: "ocean",
	sounds: "true",
	skin: "default",
	diet: "balanced",
	walk_minutes: "45"
});

app.disable('etag');
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
	if (!req.cookies.session) {
		const session = crypto.randomBytes(8).toString('hex');
		store.set(session, defaultSettings());
		res.cookie('session', session);
	}
	res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api/settings', (req, res) => {
	const session = req.cookies.session;
	res.json(store.get(session) || defaultSettings());
});

app.post('/api/settings', (req, res) => {
	const session = req.cookies.session;
	store.set(session, req.body); 
	res.json({ message: 'Settings saved successfully!' });
});

app.get('/api/pet/activity', (req, res) => {
	const activities = [
		"Luna ate breakfast and is feeling energized!",
		"Luna played fetch in the park for 20 minutes.",
		"Luna took a nap under the cherry blossom tree.",
		"Luna learned a new trick: roll over!"
	];
	const count = Math.floor(Math.random() * 4) + 1;
	const feed = [];
	for (let i = 0; i < count; i++) {
		feed.push({
			id: i + 1,
			message: activities[Math.floor(Math.random() * activities.length)],
			time: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString()
		});
	}
	res.json({ activity_feed: feed, pet_happiness: Math.floor(Math.random() * 40) + 60 });
});

app.all('*', (req, res) => res.status(404).json({ message: '404 page not found' }));

app.listen(8080, '0.0.0.0', () => console.log('LunaPet (simple) running on http://localhost:8080'));
