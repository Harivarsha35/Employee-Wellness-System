const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Calculate Leave Balance Helper
const getLeaveBalance = async (userId, totalLeaves) => {
    const Activity = require('../models/Activity');
    const leaveCount = await Activity.countDocuments({ user: userId, isLeave: true });
    return (totalLeaves || 20) - leaveCount;
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, age, gender, department, role, maritalStatus, shift, location, salaryPackage, smokingHabit, alcoholConsumption } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please add name, email, password and role' });
    }

    const finalDepartment = role === 'Admin' && !department ? 'Administration' : department || 'General';

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone,
        age,
        gender,
        department: finalDepartment,
        role,
        maritalStatus,
        shift,
        location,
        salaryPackage,
        smokingHabit,
        alcoholConsumption
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            department: user.department,
            role: user.role,
            maritalStatus: user.maritalStatus,
            shift: user.shift,
            location: user.location,
            bmi: user.bmi,
            bmiCategory: user.bmiCategory,
            bloodGroup: user.bloodGroup,
            joiningDate: user.joiningDate,
            salaryPackage: user.salaryPackage,
            smokingHabit: user.smokingHabit,
            alcoholConsumption: user.alcoholConsumption,
            totalLeaves: user.totalLeaves || 20,
            leaveBalance: await getLeaveBalance(user._id, user.totalLeaves),
            profilePhoto: user.profilePhoto || '',
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (role && user.role !== role) {
            return res.status(401).json({ message: 'Role does not match' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            department: user.department,
            role: user.role,
            maritalStatus: user.maritalStatus,
            shift: user.shift,
            location: user.location,
            bmi: user.bmi,
            bmiCategory: user.bmiCategory,
            bloodGroup: user.bloodGroup,
            joiningDate: user.joiningDate,
            salaryPackage: user.salaryPackage,
            smokingHabit: user.smokingHabit,
            alcoholConsumption: user.alcoholConsumption,
            totalLeaves: user.totalLeaves || 20,
            leaveBalance: await getLeaveBalance(user._id, user.totalLeaves),
            profilePhoto: user.profilePhoto || '',
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    console.log("--- START PROFILE UPDATE ---");
    console.log("REQUEST_BODY:", JSON.stringify(req.body, null, 2));

    const user = await User.findById(req.user._id);

    if (!user) {
        console.log("USER_NOT_FOUND:", req.user._id);
        res.status(404);
        throw new Error('User not found');
    }

    // Defensive update: Only update if the value is provided, not null, AND not an empty string
    const updateField = (fieldName, newValue) => {
        if (newValue !== undefined && newValue !== null) {
            // Trim if it's a string, otherwise use as is (for numbers)
            const processedValue = typeof newValue === 'string' ? newValue.trim() : newValue;

            // Only update if the value is not an empty string
            if (processedValue !== "") {
                console.log(`Updating ${fieldName}: "${user[fieldName]}" -> "${processedValue}"`);
                user[fieldName] = processedValue;
            } else {
                console.log(`Skipping ${fieldName} (empty value provided)`);
            }
        } else {
            console.log(`Skipping ${fieldName} (is undefined or null)`);
        }
    };

    updateField('name', req.body.name);
    updateField('email', req.body.email);
    updateField('phone', req.body.phone);
    updateField('age', req.body.age);
    updateField('gender', req.body.gender);
    updateField('department', req.body.department);
    updateField('maritalStatus', req.body.maritalStatus);
    updateField('shift', req.body.shift);
    updateField('location', req.body.location);
    updateField('bmi', req.body.bmi);
    updateField('bmiCategory', req.body.bmiCategory);
    updateField('bloodGroup', req.body.bloodGroup);
    updateField('joiningDate', req.body.joiningDate);
    updateField('salaryPackage', req.body.salaryPackage);
    updateField('smokingHabit', req.body.smokingHabit);
    updateField('alcoholConsumption', req.body.alcoholConsumption);
    updateField('profilePhoto', req.body.profilePhoto);

    if (req.body.totalLeaves !== undefined) {
        user.totalLeaves = req.body.totalLeaves;
    }

    if (req.body.password && req.body.password.trim() !== "") {
        console.log("Updating password");
        user.password = req.body.password;
    }

    try {
        const updatedUser = await user.save();
        console.log("SAVE_SUCCESSFUL. Updated name:", updatedUser.name);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            age: updatedUser.age,
            gender: updatedUser.gender,
            department: updatedUser.department,
            role: updatedUser.role,
            maritalStatus: updatedUser.maritalStatus,
            shift: updatedUser.shift,
            location: updatedUser.location,
            bmi: updatedUser.bmi,
            bmiCategory: updatedUser.bmiCategory,
            bloodGroup: updatedUser.bloodGroup,
            joiningDate: updatedUser.joiningDate,
            salaryPackage: updatedUser.salaryPackage,
            smokingHabit: updatedUser.smokingHabit,
            alcoholConsumption: updatedUser.alcoholConsumption,
            totalLeaves: updatedUser.totalLeaves,
            leaveBalance: await getLeaveBalance(updatedUser._id, updatedUser.totalLeaves),
            profilePhoto: updatedUser.profilePhoto || '',
            token: generateToken(updatedUser._id),
        });
    } catch (saveErr) {
        console.error("SAVE_FAILED:", saveErr.message);
        res.status(400).json({ message: saveErr.message });
    }
    console.log("--- END PROFILE UPDATE ---");
};

// @desc    Get all users (HR/Admin only)
// @route   GET /api/users
// @access  Private (Admin/HR)
const getAllUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

// @desc    Upload profile photo
// @route   PUT /api/users/profile-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
    console.log("--- UPLOAD PROFILE PHOTO ---");
    console.log("FILE:", req.file);
    if (!req.file) {
        console.log("UPLOAD_ERROR: No file provided");
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
            const updatedUser = await user.save();
            console.log("UPLOAD_SUCCESSFUL:", updatedUser.profilePhoto);

            res.json({
                _id: updatedUser._id,
                profilePhoto: updatedUser.profilePhoto,
                message: 'Photo uploaded successfully'
            });
        } else {
            console.log("UPLOAD_ERROR: User not found");
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error("UPLOAD_SAVE_FAILED:", err.message);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    getAllUsers,
    uploadProfilePhoto
};
