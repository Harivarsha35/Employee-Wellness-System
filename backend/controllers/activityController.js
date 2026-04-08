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
    console.log('Received Activity Data:', req.body);

    // Check if employee already logged activity today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingToday = await Activity.findOne({
        user: req.user.id,
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (existingToday) {
        return res.status(400).json({
            message: 'You have already logged your activity for today. Come back tomorrow!'
        });
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
    const activities = await Activity.find().populate('user', 'name email department role').sort({ createdAt: -1 });
    const validActivities = activities.filter(activity => activity.user !== null);
    res.status(200).json(validActivities);
};

module.exports = {
    getActivities,
    setActivity,
    getAllActivities
};
