const express = require('express');
const router = express.Router();
const regController = require('../controllers/authAccount');

router.post('/login', regController.login);
router.post('/register', regController.register);
router.get('/updateform/:email', regController.update_form)
router.post('/update_user', regController.update_user)
router.get('/delete/:email', regController.delete_user)

module.exports = router