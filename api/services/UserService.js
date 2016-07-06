module.exports = {

  getUser: function(req, cb) {
    if (!req.session.passport) {
      return cb(null, null);
    }
    User.findOne({ id: req.session.passport.user }).exec(function(err, user) {
      if (err) return cb(err);
      return cb(null, user);
    });
  }

};
