/**
 * UserController
 *
 * @description :: Server-side logic for managing users (i.e. some monkeypatching)
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	me: function(req, res) {
    if (!req.session.passport) {
      return res.notFound('No user session.');
    }
    User.findOne({ id: req.session.passport.user }).exec(function(err, u) {
      if (err) {
        return res.negotiate(err);
      }
      if (!u) {
        return res.notFound('Could not find the user with that id.');
      }

      return res.json(u);
    });
  }
};

