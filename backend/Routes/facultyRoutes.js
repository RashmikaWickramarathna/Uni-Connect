const express = require('express');
const router = express.Router();
const { getFaculties } = require('../controllers/facultyController');

// GET /api/faculties - List all faculties
router.get('/', getFaculties);

module.exports = router;

