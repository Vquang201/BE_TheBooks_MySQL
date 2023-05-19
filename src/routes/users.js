const router = require('express').Router()
const User = require('../controllers/UserController')
const { verifyToken } = require('../middlewares/authMiddleware')


// router.get('/:id', User.getAnUser)

// add middleware (Xác thực token)
// router.use(verifyToken)
router.get('/user-logined', verifyToken, User.getAnUser)
router.get('/', User.getAllUser)


module.exports = router