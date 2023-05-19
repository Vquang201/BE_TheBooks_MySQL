const router = require('express').Router()
const BookController = require('../controllers/BookController')
const Book = require('../models')


router.get('/insert-data', BookController.insertData)

module.exports = router