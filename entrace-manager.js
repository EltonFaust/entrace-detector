require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

// console.log('Waiting 20 secs')
// require("child_process").execSync('sleep 10');
// console.log('passed 20 secs')

let usersData = {
    elton_faust: {
        name: 'Elton H Faust',
        email: 'elton.h.faust@gmail.com',
    },
    andre_nass: {
        name: 'Andre Nass',
        email: 'andrenass11@gmail.com',
    },
};


const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.get('/person/:person.jpg', (req, res, next) => {
    res.sendFile(
        'data/dataset/' + req.params.person.replace(/[^\d]/g, '') + '.jpg',
        {root: __dirname + '/', dotfiles: 'deny',},
        (err) => {
            if (err) {
                  res.sendStatus(404);
            }
        }
    );
});

app.get('/occurrences/:id.jpg', (req, res, next) => {
    res.sendFile(
        'data/occurrences/' + req.params.id.replace(/[^\d]/g, '') + '.jpg',
        {root: __dirname + '/', dotfiles: 'deny',},
        (err) => {
            if (err) {
                  res.sendStatus(404);
            }
        }
    );
});

const server = require('http').Server(app);

const WebSocket = require('ws');

console.log('Initializing manager sockets');
const wssUsers = new WebSocket.Server({ server });
const wsIdentifier = new WebSocket(process.env.PERSON_IDENTIFIER_MANAGER_WS);

let users = {};
let entraces = {};
let occurrences = [];

console.log('Pre setting available entraces');

let entraceNames = process.env.ENTRACE_MANAGER_ENTRACES_NAMES.split(',');
let entraceUrlImage = process.env.ENTRACE_MANAGER_ENTRACES_URL_IMAGE.split(',');

process.env.ENTRACE_MANAGER_ENTRACES_IDS.split(',').forEach((entrace_id, i) => {
    console.log('Set entrace %s with identifier %s', entraceNames[i], entrace_id);

    entraces[entrace_id] = {
        name: entraceNames[i],
        urlImage: entraceUrlImage[i],
        isBlocked: true,
        // isReceiving: false,
        users: [],
    };
});

const sendToWS = (ws, type, data) => {
    data = data || {};
    data.type = type;

    ws.send(JSON.stringify(data));
}

const sendToIdentifierWS = (entraceId, type, data) => {
    data = data || {};
    data.manager_id = process.env.ENTRACE_MANAGER_ID;
    data.entrace_id = entraceId;
    data.type = type;

    wsIdentifier.send(JSON.stringify(data));
}

const notifyChangeEntrace = (entraceId) => {
    let data = {entrace: {id: i, name: entraces[entraceId].name, isBlocked: entraces[entraceId].isBlocked}};
    notifyEntraceUsers(entraceId, 'entrace_update', data);
}

const notifyEntraceUsers = (entraceId, type, data) => {
    for (let user of entraces[entraceId].users) {
        sendToWS(user.client, type, data);
    }
}

wssUsers.on('connection', (ws) => {
    console.log('User connected');

    ws.on('message', (data) => {
        data = JSON.parse(data);

        if (typeof users[data.user_id] == 'undefined') {
            if (data.type == 'try_login') {
                if (typeof usersData[data.user_id] != 'undefined') {
                    console.log('User set for id %s', data.user_id);

                    users[data.user_id] = {
                        client: ws,
                        data: usersData[data.user_id],
                    };

                    users[data.user_id].data.id = data.user_id

                    sendToWS(ws, 'login_response', {success: true, userData: users[data.user_id].data});
                } else {
                    sendToWS(ws, 'login_response', {success: false, userData: null});
                }
            }
        }

        if (typeof users[data.user_id] == 'undefined') {
            console.log('User not initialized with id %s', data.user_id);
            return;
        }

        switch(data.type) {
            case 'list_entraces':
                let availEntraces = [];

                for (let i in entraces) {
                    availEntraces.push({id: i, name: entraces[i].name, isBlocked: entraces[i].isBlocked});
                }

                sendToWS(ws, 'list_of_entraces', {list: availEntraces});
                break;
            case 'list_occurrences':
                sendToWS(ws, 'list_of_occurrences', {list: occurrences});
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
            case 'open_entrace':
                entraces[data.entrace_id].isBlocked = false;
                notifyChangeEntrace(data.entrace_id);
                break;
            case 'close_entrace':
                entraces[data.entrace_id].isBlocked = true;
                notifyChangeEntrace(data.entrace_id);
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
    console.log('Manager connected to identifier, initializing identifier for entraces');

    for (let entraceId in entraces) {
        sendToIdentifierWS(entraceId, 'initialize', {url_image: entraces[entraceId].urlImage})
    }
});

wsIdentifier.on('message', (data) => {
    console.log('Message "%s" received from person identifier', data);
    data = JSON.parse(data);

    switch (data.type) {
        case 'initialized':
            setTimeout(() => {
                entraces[data.entrace_id].isBlocked = false;
                // entraces[data.entrace_id].isReceiving = true;

                notifyChangeEntrace(data.entrace_id);
                sendToIdentifierWS(data.entrace_id, 'start_identifier');
            }, 2000);
            break;
        case 'identified':
            entraces[data.entrace_id].isBlocked = true;
            occurrences.push(data.occurrence);

            notifyChangeEntrace(data.entrace_id);
            notifyEntraceUsers(data.entrace_id, 'new_occurrence', data.occurrence);
            break;
        case 'not_identified':
            setTimeout(() => {
                sendToIdentifierWS(data.entrace_id, 'start_identifier');
            }, 5000);
            break;
    }
});

wsIdentifier.on('error', (e) => {
    console.log('%s on wsIdentifier', e.message)
})

server.listen(3000, () => {
  console.log('Listening on %d', server.address().port);
});
