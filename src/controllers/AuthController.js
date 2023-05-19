const database = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { internalSeverError, badRequest } = require('../middlewares/handleError');
const schemaValidate = require('../middlewares/validateMiddleware');


class AuthController {

    //  REGISTER 
    async register(req, res) {
        //check email và pass có tồn tại hay chưa 
        // if (!req.body.email || !req.body.password) {
        //     return res.status(400).json('Missing payloads')
        // }

        // CHECK AND VALIDATE FORM
        const { value, error } = schemaValidate.validate({ email: req.body.email, password: req.body.password })
        if (error) {
            return badRequest(error.details[0]?.message, res)
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt)
            // ADD INTO DB
            const user = await database.User.findOrCreate({
                where: { email: req.body.email },
                defaults: {
                    email: req.body.email,
                    password: hashPassword
                }
            })
            // user trả về mảng 2 phần tử [user , created]

            // CHECK XEM TÀI KHOẢN ĐÓ TỒN TẠI HAY CHƯA
            // user[1] là created => nó là boolean , user[0] là user
            if (user[1]) {
                // Trả access token khi user tồn tại

                // mã hóa thông tin 
                const token = jwt.sign({
                    id: user[0].id,
                    email: user[0].email,
                    role_code: user[0].role_code
                },
                    process.env.JWT_SCRET,
                    { expiresIn: '2d' }
                )

                return res.status(200).json({
                    message: 'REGISTER IS SUCCESSFULY !',
                    access_token: token ? `Bearer ${token}` : null
                })
            } else {
                return res.status(400).json('EMAIL IS USED')
            }
        } catch (error) {
            // return res.status(500).json('ERROR SERVER IN REGISTER')
            return internalSeverError(req, res)
        }
    }


    // LOGIN 
    async login(req, res) {
        //check email và pass có tồn tại hay chưa 
        // if (!req.body.email || !req.body.password) {
        //     return res.status(400).json('Missing payloads')
        // }

        // CHECK AND VALIDATE FORM
        const { value, error } = schemaValidate.validate({ email: req.body.email, password: req.body.password })
        if (error) {
            return badRequest(error.details[0]?.message, res)
        }

        const user = await database.User.findOne({ where: { email: req.body.email } })
        const password = await bcrypt.compare(req.body.password, user.password)

        //CHECK EMAIL TỒN TẠI HAY CHƯA
        if (user && password) {
            const token = jwt.sign({
                id: user.id,
                email: user.email,
                role_code: user.role_code
            },
                process.env.JWT_SCRET,
                { expiresIn: '2d' }
            )

            return res.status(200).json({
                message: 'LOGIN IS SUCCESSFULY !',
                access_token: token ? `Bearer ${token}` : null
            })
        } else {
            return res.status(400).json('EMAIL OR PASSWORD IS WRONG!!!')
        }
    }

}

module.exports = new AuthController