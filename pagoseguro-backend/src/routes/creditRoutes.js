const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');

// Obtener todos los créditos
router.get('/all', creditController.getAllCredits);

// Obtener todos los pagos
router.get('/payments', creditController.getAllPayments);

module.exports = router;