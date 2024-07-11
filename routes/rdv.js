const express = require('express');
const router = express.Router();
const rdvController = require('../controllers/rdv');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

router.post('/', auth, rdvController.createRdv);
router.post('/book', auth, rdvController.bookRdv);
router.get('/:id', auth, rdvController.getRdvById);
router.get('/artist', auth, rdvController.getAllRdvs);
router.get('/client', auth, rdvController.getAllRdvsForClient);
router.patch('/:id', auth, rdvController.updateRdvById);
router.delete('/:id', auth, rdvController.deleteRdvById);

module.exports = router;
