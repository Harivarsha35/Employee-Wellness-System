const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    exerciseType: {
        type: String,
        required: true,
        enum: ['Running', 'Cycling', 'Gym', 'Yoga', 'Meditation', 'Sports', 'Other'],
        default: 'Other'
    },
    exerciseDuration: {
        type: Number, // in minutes
        required: true,
        default: 0
    },
    waterIntake: {
        type: Number, // in liters
        required: true,
        default: 0
    },
    sleepHours: {
        type: Number, // in hours
        required: true,
        default: 0
    },
    stressLevel: {
        type: Number, // 0-5
        required: true,
        min: 0,
        max: 5,
        default: 0
    },
    dietPlan: {
        type: String, // e.g., "Balanced", "Keto", etc.
        default: "Balanced"
    },
    notes: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    workLocation: {
        type: String,
        enum: ['Onsite', 'Remote', 'Home'],
        default: 'Onsite'
    },
    employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Intern'],
        default: 'Full Time'
    },
    isLeave: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
