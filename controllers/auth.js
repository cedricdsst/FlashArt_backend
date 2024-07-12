const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup
exports.signup = (req, res, next) => {
    if (!req.body.password) {
        return res.status(400).json({ error: 'Password is required' });
    }
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                username: req.body.username,
                password: hash,
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                role: req.body.role
            });
            user.save()
                .then(() => res.status(201).json({ message: 'User created successfully!' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error: error }));
};

// Login
exports.login = (req, res, next) => {
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Incorrect username/password' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Incorrect username/password' });
                    } else {
                        const token = jwt.sign(
                            {
                                userId: user._id,
                                role: user.role
                            },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        );

                        const stayLoggedIn = req.body.stayLoggedIn === true;

                        const cookieOptions = {
                            httpOnly: true,
                            secure: false,
                            sameSite: 'strict'
                        };

                        if (stayLoggedIn) {
                            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
                        }

                        res.cookie('auth_token', token, cookieOptions);

                        res.status(200).json({
                            message: "User successfully logged in!",
                            data: {
                                userId: user._id,
                                username: user.username,
                                email: user.email,
                                lastname: user.lastname,
                                firstname: user.firstname,
                                role: user.role
                            }
                        });
                    }
                })
                .catch(error => {
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Verify Token
exports.verifyToken = (req, res) => {
    const userId = req.auth.userId;

    User.findById(userId).select('username email lastname firstname role -_id')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                message: "Token is valid",
                data: {
                    userId: userId,
                    username: user.username,
                    email: user.email,
                    lastname: user.lastname,
                    firstname: user.firstname,
                    role: user.role
                }
            });
        })
        .catch(error => {
            res.status(500).json({ error: error.message || 'An error occurred during the operation.' });
        });
};

// Logout
exports.logout = (req, res) => {
    res.cookie('auth_token', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        expires: new Date(0)
    }).status(200).json({ message: 'User successfully logged out' });
};
