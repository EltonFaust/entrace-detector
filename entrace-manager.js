require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

const WebSocket = require('ws');

console.log('Initializing manager sockets');
const wssUsers = new WebSocket.Server({ port: 3000 });
const wsIdentifier = new WebSocket(process.env.PERSON_IDENTIFIER_MANAGER_WS);

let users = {};

wssUsers.on('connection', (ws) => {
	console.log('User connected');

	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (typeof users[data.user_id] == 'undefined') {
			console.log('User set for id %s', data.user_id);

			users[data.user_id] = {
				client: ws
			};
		}
	});
});

wsIdentifier.on('open', () => {
	console.log('Manager connected to identifier');
});

wsIdentifier.on('message', (data) => {
	data = JSON.parse(data);
});

