const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.render('admins/index'))

module.exports = router