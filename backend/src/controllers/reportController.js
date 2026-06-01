const Report = require('../models/Report');

// @desc    Get all reports
// @route   GET /api/v1/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    const { nearby, limit } = req.query;
    let query = Report.find();
    
    if (nearby === 'true') {
      // In a real app this would use geospatial $near
      // For now we just return the most recent
      query = query.sort({ createdAt: -1 });
    }
    
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    
    const reports = await query;
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single report
// @route   GET /api/v1/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new report
// @route   POST /api/v1/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const reportData = { ...req.body };
    reportData.reporter = req.user.id;
    
    if (req.files && req.files.length > 0) {
      reportData.photos = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const report = await Report.create(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update report
// @route   PUT /api/v1/reports/:id
// @access  Public
exports.updateReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete report
// @route   DELETE /api/v1/reports/:id
// @access  Public
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
