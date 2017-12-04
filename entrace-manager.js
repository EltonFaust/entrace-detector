require('https').globalAgent.options.rejectUnauthorized = false;
require('dotenv').config();

console.log('Entrace Manager | Waiting 10 secs')
require("child_process").execSync('sleep 10');
console.log('Entrace Manager | passed 10 secs')

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

console.log('Entrace Manager | Initializing manager sockets');
const wssUsers = new WebSocket.Server({ server });
const wsIdentifier = new WebSocket(process.env.PERSON_IDENTIFIER_MANAGER_WS);

let users = {};
let entraces = {};
let occurrences = [];

console.log('Entrace Manager | Pre setting available entraces');

let entraceNames = process.env.ENTRACE_MANAGER_ENTRACES_NAMES.split(',');
let entraceUrlImage = process.env.ENTRACE_MANAGER_ENTRACES_URL_IMAGE.split(',');

process.env.ENTRACE_MANAGER_ENTRACES_IDS.split(',').forEach((entrace_id, i) => {
    console.log('Entrace Manager | Set entrace %s with identifier %s', entraceNames[i], entrace_id);

    entraces[entrace_id] = {
        name: entraceNames[i],
        urlImage: entraceUrlImage[i],
        isBlocked: true,
        isReceiving: false,
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
    let data = {entrace: {id: entraceId, name: entraces[entraceId].name, isBlocked: entraces[entraceId].isBlocked, isReceiving: entraces[entraceId].isReceiving}};
    notifyEntraceUsers(entraceId, 'entrace_update', data);
}

const notifyEntraceUsers = (entraceId, type, data) => {
    console.log('Entrace Manager | Notifying "%s" to entrace users "%s"', type, JSON.stringify(entraces[entraceId].users));
    
    for (let userIdx of entraces[entraceId].users) {
        sendToWS(users[userIdx].client, type, data);
    }
}

const notifyAllUsers = (type, data) => {
    console.log('Entrace Manager | Notifying "%s" to all users', type);
    
    for (let idx in users) {
        sendToWS(users[idx].client, type, data);
    }
}

wssUsers.on('connection', (ws) => {
    console.log('Entrace Manager | User connected');

    ws.on('message', (data) => {
        data = JSON.parse(data);

        if (data.type == 'try_login') {
            if (typeof usersData[data.user_id] != 'undefined') {
                console.log('Entrace Manager | User set for id %s', data.user_id);

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

        if (typeof users[data.user_id] == 'undefined') {
            console.log('Entrace Manager | User not initialized with id %s', data.user_id);
            return;
        }

        switch(data.type) {
            case 'list_entraces':
                let availEntraces = [];

                for (let i in entraces) {
                    availEntraces.push({id: i, name: entraces[i].name, isBlocked: entraces[i].isBlocked, isReceiving: entraces[i].isReceiving});
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
            case 'open_entrace':
                entraces[data.entrace_id].isBlocked = false;
                notifyChangeEntrace(data.entrace_id);
                break;
            case 'close_entrace':
                entraces[data.entrace_id].isBlocked = true;
                notifyChangeEntrace(data.entrace_id);
                break;
            case 'start_receive':
                entraces[data.entrace_id].isReceiving = true;
                sendToIdentifierWS(data.entrace_id, 'start_identifier');
                notifyChangeEntrace(data.entrace_id);
                break;
            case 'stop_receive':
                entraces[data.entrace_id].isBlocked = true;
                notifyChangeEntrace(data.entrace_id);
                break;
            case 'list_occurrences':
                sendToWS(ws, 'list_of_occurrences', {list: occurrences});
                break;
            case 'set_occurence_status':
                console.log('Entrace Manager | set_occurence_status %s', JSON.stringify(data));

                for (let idx in occurrences) {
                    if (occurrences[idx].id == data.occurrence_id) {
                        occurrences[idx].status = data.status;
                        occurrences[idx].status_message = data.status_message;

                        notifyAllUsers('occurrence_update', {occurrence: occurrences[idx]});
                        break;
                    }
                }
                break;
        }
    });

    ws.on('error', (e) => {
        console.log('Entrace Manager | %s on wssUsers', e.message)
    })
});

wssUsers.on('error', (e) => {
    console.log('Entrace Manager | %s on wsIdentifier', e.message)
})

wsIdentifier.on('open', () => {
    console.log('Entrace Manager | Manager connected to identifier, initializing identifier for entraces');

    for (let entraceId in entraces) {
        sendToIdentifierWS(entraceId, 'initialize', {url_image: entraces[entraceId].urlImage})
    }
});

wsIdentifier.on('message', (data) => {
    console.log('Entrace Manager | Message "%s" received from person identifier', data);
    data = JSON.parse(data);

    switch (data.type) {
        case 'initialized':
            setTimeout(() => {
                entraces[data.entrace_id].isBlocked = false;
                entraces[data.entrace_id].isReceiving = true;

                notifyChangeEntrace(data.entrace_id);
                sendToIdentifierWS(data.entrace_id, 'start_identifier');
            }, 15000);
            break;
        case 'identified':
            if (entraces[data.entrace_id].isReceiving) {
                entraces[data.entrace_id].isBlocked = true;
                entraces[data.entrace_id].isReceiving = false;
                occurrences.unshift(data.occurrence);

                notifyChangeEntrace(data.entrace_id);
                notifyEntraceUsers(data.entrace_id, 'new_occurrence', {occurrence: data.occurrence});
            }
            break;
        case 'not_identified':
            if (entraces[data.entrace_id].isReceiving) {
                setTimeout(() => {
                    sendToIdentifierWS(data.entrace_id, 'start_identifier');
                }, 5000);
            }
            break;
    }
});

wsIdentifier.on('error', (e) => {
    console.log('Entrace Manager | %s on wsIdentifier', e.message)
})

server.listen(3000, () => {
  console.log('Entrace Manager | Listening on %d', server.address().port);
});
