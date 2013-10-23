var express = require('express'),
    app = express(),
    chatServer = require('http').createServer(app),
    io = require('socket.io').listen(chatServer);

chatServer.listen(8000);

var guestList = [];

app.configure(function(){
	app.use(express.static(__dirname+'/'),{redirect:true});
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
	
	socket.on('newUser',function(username){
		socket.username = username;
		guestList.push(username);
		// Send Message to only this particular socket/user
		socket.emit('msgReceived','SERVER','Welcome to the chat room '+username+'.');
		// Tell Everyone this user has joined the room except for the new user
		socket.broadcast.emit('msgReceived','SERVER',username+' has joined the room.');
		// Broadcast to everyone including this socket/user the guestlist
		io.sockets.emit('chatGuest',guestList);
	});
	
	socket.on('sendChat',function(message){
		io.sockets.emit('msgReceived',socket.username,message);
	});

  socket.on('geomReceived',function(geom){
    socket.broadcast.emit('newGeom',geom);
  });
	
	socket.on('disconnect',function(){
		io.sockets.emit('msgReceived','SERVER',socket.username+' has left the room.');
		guestList.splice(guestList.indexOf(socket.username),1);
		io.sockets.emit('chatGuest',guestList);
	});
	
});

/*

  Socket.io Notes for ways to deliver messages

 // send to current request socket client
 socket.emit('message', "this is a test");

 // sending to all clients, include sender
 io.sockets.emit('message', "this is a test");

 // sending to all clients except sender
 socket.broadcast.emit('message', "this is a test");

 // For channels, call socket.broadcast.to(channelName), create channel by listening for connection
 // and calling socket.join like so
 io.sockets.on('connection', function (socket) {
    socket.join('myNewChannel');
  });

 // sending to all clients in 'game' room(channel) except sender
 socket.broadcast.to('game').emit('message', 'nice game');

 // sending to all clients in 'game' room(channel), include sender
 io.sockets.in('game').emit('message', 'cool game');

 // sending to individual socketid
 io.sockets.socket(socketid).emit('message', 'for your eyes only');
 */