require('dotenv').config();
const bcrypt = require('bcrypt');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;

module.exports = function(app, myDataBase) {

    /* Index */
    app.route('/').get((req, res) => {
        // Change the response to render the Pug template
        res.render('pug', {
            title: 'Connected to Database',
            message: 'Please login',
            showLogin: true,
            showRegistration: true
        });
    });

    /* Register */
    app.route('/register').post((req, res, next) => {

            const hash = bcrypt.hashSync(req.body.password, 12);

            myDataBase.findOne({ username: req.body.username }, function(err, user) {
                if (err) {
                    next(err);
                } else if (user) {
                    res.redirect('/');
                } else {
                    myDataBase.insertOne({
                            username: req.body.username,
                            password: hash
                        },
                        (err, doc) => {
                            if (err) {
                                res.redirect('/');
                            } else {
                                // The inserted document is held within
                                // the ops property of the doc
                                next(null, doc.ops[0]);
                            }
                        }
                    )
                }
            })
        },
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
            res.redirect('/profile');
        }
    );

    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile');
    });
    // app.route('/')
    //     .get(req, res) => {

    //     };
    app.route('/auth/github').get(passport.authenticate('github'));

    app.route('/auth/github/callback')
        .get(passport.authenticate('github', { failureRedirect: '/' }),
            (req, res) => {
                req.session.user_id = req.user.id;
                res.redirect('/chat');
            }
        );

    app.route('/profile').get(ensureAuthenticated, (req, res) => {
        res.render('pug/profile', {
            username: req.user.username
        });
    });

    app.route('/chat').get(ensureAuthenticated, (req, res) => {
        res.render('pug/chat', {
            user: req.user
        });
    });

    app.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.use((req, res, next) => {
        res.status(404)
            .type('text')
            .send('Not Found');
    });

    /* Helpers */
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };
}