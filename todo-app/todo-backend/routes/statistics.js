const express = require('express');
const { getAsync } = require('../redis');
const router = express.Router();


router.get('/', async (_, res) => {
    let createdTodosCount = await getAsync('added_todos');
    if (!createdTodosCount) {
        createdTodosCount = 0;
    }
    res.send({"added_todos": createdTodosCount });
});


module.exports = router;