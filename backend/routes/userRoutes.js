const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { registerUser, loginUser, getMe, updateUserProfile, getAllUsers, uploadProfilePhoto } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        console.log("--- MULTER FILE FILTER ---");
        console.log("FILE:", file);
        const filetypes = /jpe?g|png|webp/;
        const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/jpg/;

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        console.log("EXTNAME_MATCH:", extname);
        console.log("MIMETYPE_MATCH:", mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            console.log("FILTER_ERROR: Images only!");
            cb(new Error('Images only! (jpeg, jpg, png, webp)'));
        }
    },
});

router.post('/', registerUser);
router.get('/', protect, getAllUsers);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.put('/profile-photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);

module.exports = router;
