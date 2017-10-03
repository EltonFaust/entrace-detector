
require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

const WebSocket = require('ws');

const wssUsers = new WebSocket.Server({ port: 3000 });
const wssRecog = new WebSocket.Server({ port: 3001 });

let entraces = {};
let users = {};

let entraceNames = process.env.ENTRACE_NAMES.split(',');

process.env.ENTRACE_IDS.split(',').forEach((entrace_id, i) => {
	entraces[entrace_id] = {
		name: entraceNames[i],
		isReceiving: true,
		isOpen: false,
		users: [],
		client: null,
	};
});
 
wssRecog.on('connection', (ws) => {
	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (!entraces[data.entrace_id]) {
			console.log('Entrace with identifier "%s" not configured!', data.entrace_id);
			return;
		}

		if (!entraces[entrace_id].client) {
			entraces[entrace_id].client = ws;
		}

	});

	// ws.send('something');
});
 
wssUsers.on('connection', (ws) => {
	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (!users[data.user_id]) {
			users[data.user_id] = {
				client: ws
			};
		}


	});

	ws.send('something');
});
