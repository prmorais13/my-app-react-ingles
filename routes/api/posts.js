const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Post Model
const Post = require("../../models/Post");
// Load Profile Model
const Profile = require("../../models/Profile");

const validatePostInput = require("../../validation/post-validation");

// @route  GET api/posts/test
// @desc   Tests posts route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "Posts Working" }));

// @route  GET api/posts
// @desc   GET posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No Posts found." }));
});

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.json(post);
      }
      return res
        .status(404)
        .json({ nopostfound: "No Post found with that ID." });
    })
    .catch(err =>
      res.status(404).json({ nopostfound: "No Post found with that ID." })
    );
});

// @route  POST api/posts
// @desc   Create posts
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validations
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route  DELETE api/posts/:id
// @desc   Delete post by id
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ noauthorized: "User no authorized." });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          json.status(404).json({ postnotfound: "No Posts found." })
        );
    });
  }
);

// @route  POST api/posts/like/:id
// @desc   Like post
// @access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post." });
          }

          // Add user ID to like array
          post.likes.unshift({ user: req.user.id });

          // Save post
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: "No Posts found." })
        );
    });
  }
);

// @route  POST api/posts/unlike/:id
// @desc   Unlike post
// @access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post." });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          if (removeIndex < 0) {
            return res.status(404).json({ likenotfound: "No like found." });
          }

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save post
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: "No Posts found." })
        );
    });
  }
);

// @route  POST api/posts/comment/:id
// @desc   Add Comment to post
// @access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validations
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No Posts found." }));
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Remove comment from post
// @access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist." });
        }

        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        /* if (removeIndex < 0) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exist2." });
        } */
        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        // Save post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No Posts found." }));
  }
);
module.exports = router;
