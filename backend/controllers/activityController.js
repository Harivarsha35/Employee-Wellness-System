const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(activities);
};

// @desc    Set activity
// @route   POST /api/activities
// @access  Private
const setActivity = async (req, res) => {
    console.log('Received Activity Data:', req.body); // Debug Log
    if (!req.body.exerciseTime && !req.body.waterIntake && !req.body.sleepHours) {
        // Just a basic check, can be more specific
        // return res.status(400).json({ message: 'Please add activity details' });
    }

    const activity = await Activity.create({
        user: req.user.id,
        exerciseType: req.body.exerciseType,
        exerciseDuration: req.body.exerciseDuration,
        waterIntake: req.body.waterIntake,
        sleepHours: req.body.sleepHours,
        stressLevel: req.body.stressLevel,
        dietPlan: req.body.dietPlan,
        workLocation: req.body.workLocation,
        employmentType: req.body.employmentType,
        isLeave: req.body.isLeave || false,
        notes: req.body.notes
    });

    res.status(200).json(activity);
};

// @desc    Get all activities (HR/Admin only)
// @route   GET /api/activities/all
// @access  Private (Admin/HR)
const getAllActivities = async (req, res) => {
    const activities = await Activity.find().populate('user', 'name email department').sort({ createdAt: -1 });
    const validActivities = activities.filter(activity => activity.user !== null);
    res.status(200).json(validActivities);
};

module.exports = {
    getActivities,
    setActivity,
    getAllActivities
};
