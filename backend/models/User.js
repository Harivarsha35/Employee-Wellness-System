const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        // required: true
    },
    age: {
        type: Number,
        // required: true
    },
    gender: {
        type: String,
        // required: true,
        enum: ['Male', 'Female', 'Other']
    },
    department: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'HR', 'Employee'],
        default: 'Employee'
    },
    maritalStatus: {
        type: String,
        // enum: ['Married', 'Unmarried']
    },
    shift: {
        type: String,
        // enum: ['Day Shift', 'Night Shift']
    },
    location: {
        type: String,
        // required: true // Removed to support existing users without migration
    },
    bmi: {
        type: Number
    },
    bmiCategory: {
        type: String
    },
    bloodGroup: {
        type: String,
        // enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    joiningDate: {
        type: Date
    },
    salaryPackage: {
        type: String
    },
    smokingHabit: {
        type: String,
        enum: ['Yes', 'No']
    },
    alcoholConsumption: {
        type: String,
        enum: ['Yes', 'No']
    },
    totalLeaves: {
        type: Number,
        default: 20
    },
    profilePhoto: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
