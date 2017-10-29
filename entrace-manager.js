require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

const server = require('http').Server(app);

const WebSocket = require('ws');

console.log('Initializing manager sockets');
const wssUsers = new WebSocket.Server({ server });
const wsIdentifier = new WebSocket(process.env.PERSON_IDENTIFIER_MANAGER_WS);

let users = {};
let entraces = {};

console.log('Pre setting available entraces');

let entraceNames = process.env.ENTRACE_MANAGER_ENTRACES_NAMES.split(',');
process.env.ENTRACE_MANAGER_ENTRACES_IDS.split(',').forEach((entrace_id, i) => {
	console.log('Set entrace %s with identifier %s', entraceNames[i], entrace_id);

	entraces[entrace_id] = {
		name: entraceNames[i],
		isBlocked: true,
		users: [],
	};
});

const sendToWS = (ws, type, data) => {
	data = data || {};
	data.type = type;

	ws.send(JSON.stringify(data));
}

wssUsers.on('connection', (ws) => {
	console.log('User connected');

	ws.on('message', (data) => {
		data = JSON.parse(data);

		if (typeof users[data.user_id] == 'undefined') {
			console.log('User set for id %s', data.user_id);

			users[data.user_id] = {
				client: ws,
				name: ''
			};
		}

		switch(data.type) {
			case 'identify_as':
				users[data.user_id].name = data.name.
				break;
			case 'list_entraces':
				let availEntraces = [];

				for (let i in entraces) {
					availEntraces.push({id: i, name: emtraces[i].name});
				}

				sendToWS(ws, 'list_of_entraces', {list: availEntraces});
				break;
			case 'join_entrace':
				if (entraces[data.entrace_id].users.indexOf(data.user_id) == -1) {
					entraces[data.entrace_id].users.push(data.user_id);
				}

				sendToWS(ws, 'joined_entrace', {id: data.entrace_id});
				break;
			case 'leave_entrace':
				let idx = entraces[data.entrace_id].users.indexOf(data.user_id);

				if (idx != -1) {
					entraces[data.entrace_id].users.splice(idx);
				}

				sendToWS(ws, 'leaved_entrace', {id: data.entrace_id});
				break;
		}
	});

	ws.on('error', (e) => {
		console.log('%s on wssUsers', e.message)
	})
});

wssUsers.on('error', (e) => {
	console.log('%s on wsIdentifier', e.message)
})

wsIdentifier.on('open', () => {
	console.log('Manager connected to identifier');
});

wsIdentifier.on('message', (data) => {
	data = JSON.parse(data);
});

wsIdentifier.on('error', (e) => {
	console.log('%s on wsIdentifier', e.message)
})

server.listen(3000, () => {
  console.log('Listening on %d', server.address().port);
});
