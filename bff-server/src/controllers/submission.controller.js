const path = require('path');
const submissionService = require('../services/submission.service');
const { UPLOAD_DIR } = require('../middleware/upload');

// Upload file 
async function upload(req, res, next) {
  try {
    const submissions = await submissionService.uploadSubmissions(
      req.params.id,
      req.files,
      req.user
    );
    return res.status(201).json({ submissions });
  } catch (err) {
    // Jika upload gagal, hapus file 
    if (req.files?.length) {
      const fs = require('fs');
      for (const file of req.files) {
        const fp = path.join(UPLOAD_DIR, file.filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    }

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// List submissions
async function list(req, res, next) {
  try {
    const submissions = await submissionService.getSubmissions(req.params.id, req.user);
    return res.status(200).json({ submissions });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Download file
async function download(req, res, next) {
  try {
    const sub = await submissionService.getSubmissionById(req.params.subId);
    const filePath = path.join(UPLOAD_DIR, sub.filename);

    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File tidak ditemukan di server.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${sub.originalName}"`);
    res.setHeader('Content-Type', sub.mimetype);
    return res.sendFile(filePath);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

// Hapus submission
async function remove(req, res, next) {
  try {
    const result = await submissionService.deleteSubmission(req.params.subId, req.user);
    return res.status(200).json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return next(err);
  }
}

module.exports = { upload, list, download, remove };