const express = require('express');
const router = express.Router();
const rdvController = require('../controllers/rdv');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

router.post('/', auth, rdvController.createRdv);
router.get('/:id', auth, rdvController.getRdvById);
router.get('/', auth, rdvController.getAllRdvs);
router.put('/:id', auth, rdvController.updateRdvById);
router.delete('/:id', auth, rdvController.deleteRdvById);

module.exports = router;
