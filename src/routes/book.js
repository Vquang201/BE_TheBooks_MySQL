const router = require('express').Router()
const BookController = require('../controllers/BookController')
const uploadCloudinary = require('../middlewares/uploaderMiddleware')
const Book = require('../models')


router.get('/insert-data', BookController.insertData)
router.post('/create', uploadCloudinary.single('image'), BookController.createBook)
router.get('/', BookController.getBooksAndQueries)


module.exports = router