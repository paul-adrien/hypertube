const db = require("../models");
const Comment = db.comment;
const dateFormat = require('dateformat');

exports.getComments = (req, res) => {
    const imdb_id = req.params.imdb_id;
    
    Comment.find({$query: { imdb_id: imdb_id }})
    .exec((err, comments) => {
        if (err) {
            return res.json({
                status: false,
                message: err
            });
        }

        if (!comments) {
            return res.json({
                status: true,
                comments: null,
                message: 'no comment'
            });
        } else {
            return res.json({
                status: true,
                comments: comments.reverse(),
                message: 'success'
            })
        }
    })
}

exports.addComments = (req, res) => {
    var now = new Date();
    
    const comment = new Comment({
        comment: req.body.comment,
        imdb_id: req.body.imdb_id,
        username: req.body.username,
        date: dateFormat(now, "dd-mm-yyyy à H:MM:ss")
    });

    comment.save((err, comment) => {
        if (err) {
            return res.json({
                status: false,
                message: err
            });
        }
        res.send({ message: "Comment was registered successfully!" });
    })
}