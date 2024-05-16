const express = require('express');
const router = express.Router();
const { create, login, fetch, update, deleteUser } = require('../controller/controller')

router.post('/users', create)
router.post('/users/login', login)
router.get('/users', fetch)
router.patch('/users/:id', update)
router.delete('/users/:id', deleteUser)

router.get('',(req,res)=>{
    res.send('hello world')
})

module.exports = router;