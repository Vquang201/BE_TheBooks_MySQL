const router = require('express').Router()
const BookController = require('../controllers/BookController')
const Book = require('../models')


router.get('/insert-data', BookController.insertData)
router.get('/', BookController.bookPagination)


module.exports = router