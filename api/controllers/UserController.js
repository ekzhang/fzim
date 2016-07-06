/**
 * UserController
 *
 * @description :: Server-side logic for managing users (i.e. some monkeypatching)
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  me: function(req, res) {
    if (!req.session.passport) {
      return res.json(null);
    }
    User.findOne({ id: req.session.passport.user }).exec(function(err, u) {
      if (err) {
        return res.json(null);
      }
      if (!u) {
        return res.json(null);
      }

      return res.json(u);
    });
  },

  register: function(req, res) {
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);
      return res.view('register', { user: user });
    });
  },

  login: function(req, res) {
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);
      if (user) {
        return res.redirect('/');
      }
      return res.view('login');
    });
  }
};
