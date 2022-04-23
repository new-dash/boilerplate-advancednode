'use strict';
require('dotenv').config();

const fccTesting = require('./freeCodeCamp/fcctesting.js');

const express = require('express');
const session = require('express-session');
const myDB = require('./connection');
const ObjectID = require('mongodb').ObjectID;
const passport = require('passport');
const LocalStrategy = require('passport-local');

const bcrypt = require('bcrypt');


const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

//const dburi = process.env.MONGO_URI;
//mongoose.connect(dburi, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log('MongoDB connected!')).catch(err => console.log('Error:- ' + err));

myDB(async(client) => {

    const myDataBase = await client.db('database').collection('users');

    let currentUsers = 0;

    io.on('connection', socket => {
        ++currentUsers;
        io.emit('user count', currentUsers);
        console.log('A user has connected to the socket');
    });

    routes(app, myDataBase);
    auth(app, myDataBase);

}).catch((e) => {
    app.route('/').get((req, res) => {
        res.render('pug', { title: e, message: 'Unable to login' });
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + process.env.PORT);
});