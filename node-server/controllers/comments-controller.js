const db = require("../models");
const Comment = db.comment;

exports.getComments = (req, res) => {
  const imdb_id = req.params.imdb_id;

  Comment.find({ $query: { imdb_id: imdb_id } })
    .sort({ date: 1 })
    .exec((err, comments) => {
      if (err) {
        return res.json({
          status: false,
          message: err,
        });
      }

      if (!comments) {
        return res.json({
          status: true,
          comments: null,
          message: "no comment",
        });
      } else {
        return res.json({
          status: true,
          comments: comments,
          message: "success",
        });
      }
    });
};

exports.addComments = (req, res) => {
  var now = new Date();

  const comment = new Comment({
    comment: req.body.comment,
    imdb_id: req.body.imdb_id,
    userId: req.body.userId,
    date: now.valueOf(),
  });

  comment.save((err, comment) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    }
    res.send({ message: "Comment was registered successfully!" });
  });
};
