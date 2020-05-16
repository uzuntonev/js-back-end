const { userModel, tokenBlackListModel } = require('../models');
const utils = require('../utils/jwt');
const config = require('../config/config');

function login(req, res) {
  res.render('login');
}

function loginPost(req, res) {
  const { username, password } = req.body;
  userModel
    .findOne({ username })
    .then((user) => {
      return Promise.all([user, user.passwordMatch(password)]);
    })
    .then(([user, match]) => {
      if (!match) {
        res.redirect('login', {
          errors: { message: 'Password or username don`t match' },
        });
        return;
      }
      const token = utils.createToke({ id: user._id });
      res.cookie(config.cookieName, token).redirect('/');
    });
}

function register(req, res) {
  res.render('register');
}

function registerPost(req, res, next) {
  const { username, password, repeatPassword } = req.body;
  if (password !== repeatPassword) {
    res.render('register', { errors: { message: 'Passwords don`t match!' } });
    return;
  }
  userModel
    .create({ username, password })
    .then(() => {
      res.redirect('login');
    })
    .catch((err) => {
      if ((err.name = 'MongoError' && err.code === 11000)) {
        res.redirect('register', {
          errors: { message: 'User already taken!' },
        });
        return;
      }
      next(err);
    });
}

function logout(req, res) {
  const token = req.cookies[config.cookieName];
  tokenBlackListModel.create({ token }).then(() => {
    res.clearCookie(config.cookieName).redirect('/');
  });
}

module.exports = {
  login,
  loginPost,
  register,
  registerPost,
  logout,
};