const express = require('express');
const router = express.Router();

// get a request
router.get('/', (req,res) => {
    res.send('Server is up and running');
});

module.exports = router