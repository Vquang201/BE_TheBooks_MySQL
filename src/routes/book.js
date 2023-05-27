const router = require('express').Router()
const BookController = require('../controllers/BookController')
const uploadCloudinary = require('../middlewares/uploaderMiddleware')
const Book = require('../models')


router.get('/', BookController.getBooksAndQueries)


router.post('/create', uploadCloudinary.single('image'), BookController.createBook)
router.patch('/update/:id', uploadCloudinary.single('image'), BookController.updateBook)
router.delete('/delete/:id', BookController.deleteBook)

router.get('/insert-data', BookController.insertData)

module.exports = router