/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  create: function(req, res) {
    var message = req.param('message');
    var channel = req.param('channel');
    if (!message || !channel) {
      return res.badRequest('create needs `message` and `channel` params');
    }
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);
      var sender = user ? user.username : 'Anonymous';
      Message.create({
        sender: sender,
        message: message,
        channel: channel
      }).exec(function(err, newInstance) {
        if (err) return res.negotiate(err);

        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the created item
        if (req._sails.hooks.pubsub) {
          if (req.isSocket) {
            Message.subscribe(req, newInstance);
            Message.introduce(newInstance);
          }
          // Make sure data is JSON-serializable before publishing
          var publishData = _.isArray(newInstance) ?
                    _.map(newInstance, function(instance) {return instance.toJSON();}) :
                    newInstance.toJSON();
          Message.publishCreate(publishData, !req.options.mirror && req);
        }

        // Send JSONP-friendly response if it's supported
        res.created(newInstance);
      });
    });
  },

  toLobby: function(req, res) {
    return res.redirect('/_channel/lobby');
  },
  joinChannel: function(req, res) {
    var channel_id = req.param('channel_id');
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);

      return res.view('chat', {
        channel_id: channel_id,
        title: 'fz-im Chat Room: ' + channel_id,
        user: user
      });
    });
  }
};
