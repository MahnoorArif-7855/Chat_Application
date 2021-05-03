// put required dependencies
const express = require('express');
const socketio = require('socket.io');
// build in node module
const http = require('http');

const { addUser, removeUser, getUser, getUserInRoom } = require('./users');
// setup each socket io
const PORT = process.env.PORT || 5000;

const router = require('./router');
// const { Socket } = require('net');

const app = express();
const server = http.createServer(app);
const io =require('socket.io')(server, { serveClient: false });

// real-time conecction and disconnections
// register for client joining
io.on('connection', (socket) => {
    console.log("we have a new connection !!!!");


    socket.on('join', ({ name, room }, callback) => {
        // if error occur throught user id name or room
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        // socket.emit show message when user join room
        socket.emit('message', { user: 'admin', text: `${user.name}, Weclome to the room ${user.room}` });
        // use broadcast that send message to every one beside specific user
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` });
        // when user join
        socket.join(user.room);
        io.to(user.room).emit('roomData', { room: user.room, user: getUserInRoom(user.room)})
        // callback call in front every time
        callback()
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        // io.to is used here to specify room name and id and then emit the event
        io.to(user.room).emit('message', { user: user.name, text: message });
        

        callback();

    });

    //  and its for client leaving
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', {user: "admin", text: `${user.name} has left,`})
            io.to(user.room).emit('roomData', { user: user.room, user: getUserInRoom(user.room)});
        }
    })
});
// middle ware
app.use(router);
server.listen(PORT, () => console.log(`Server has Started on port ${PORT}`));

