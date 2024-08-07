const express = require('express');
const router = express.Router();
const rdvController = require('../controllers/rdv');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

router.get('/artist', auth, rdvController.getAllRdvs);
router.get('/client', auth, rdvController.getAllRdvsForClient);
router.post('/book', auth, rdvController.bookRdv);
router.post('/', auth, rdvController.createRdv);

router.get('/:id', auth, rdvController.getRdvById);


router.patch('/:id', auth, rdvController.updateRdvById);
router.delete('/:id', auth, rdvController.deleteRdvById);

module.exports = router;
