const commentService = require('../services/comment.service');

// List komentar
async function list(req, res, next) {
  try {
    const comments = await commentService.getComments(req.params.id, req.user);
    return res.status(200).json({ comments });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Tambah komentar 
async function create(req, res, next) {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.body.content,
      req.user
    );
    return res.status(201).json({ comment });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Hapus komentar 
async function remove(req, res, next) {
  try {
    const result = await commentService.deleteComment(req.params.commentId, req.user);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = { list, create, remove };