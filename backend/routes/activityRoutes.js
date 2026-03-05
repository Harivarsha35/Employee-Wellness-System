const express = require('express');
const router = express.Router();
const { getActivities, setActivity, getAllActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getActivities).post(protect, setActivity);
router.get('/all', protect, getAllActivities);
// router.route('/:id').delete(protect, deleteGoal).put(protect, updateGoal)

module.exports = router;
