const { getDashboardOverview } = require('../services/dashboard.service');

async function getOverview(req, res, next) {
  try {
    const overview = await getDashboardOverview(req.user);
    return res.status(200).json(overview);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getOverview,
};
