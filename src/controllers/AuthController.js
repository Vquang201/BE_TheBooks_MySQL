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
                const accessToken = jwt.sign({
                    id: user[0].id,
                    email: user[0].email,
                    role_code: user[0].role
                },
                    process.env.JWT_SCRET,
                    { expiresIn: '30s' }
                )

                return res.status(200).json({
                    message: 'REGISTER IS SUCCESSFULY !',
                    access_token: accessToken ? `Bearer ${accessToken}` : null
                })
            } else {
                return res.status(400).json('EMAIL IS USED')
            }
        } catch (error) {
            return internalSeverError(req, res)
        }
    }


    // LOGIN 
    async login(req, res) {
        try {
            // CHECK AND VALIDATE FORM
            const { value, error } = schemaValidate.validate({ email: req.body.email, password: req.body.password })
            if (error) {
                return badRequest(error.details[0]?.message, res)
            }

            const user = await database.User.findOne({ where: { email: req.body.email } })
            const password = await bcrypt.compare(req.body.password, user.password)

            //CHECK EMAIL TỒN TẠI HAY CHƯA
            if (user && password) {
                // ACCESS TOKEN
                const accessToken = jwt.sign({
                    id: user.id,
                    email: user.email,
                    role_code: user.role
                },
                    process.env.JWT_SCRET,
                    { expiresIn: '30s' }
                )

                // REFRESH TOKEN
                const refreshToken = jwt.sign({
                    id: user.id
                },
                    process.env.JWT_SCRET_REFRESH_TOKEN,
                    { expiresIn: '15d' }
                )

                // UPDATE REFRESH TOKEN INTO DATABASE
                if (refreshToken) {
                    await database.User.update({ refresh_token: refreshToken }, { where: { id: user.id } })
                }


                return res.status(200).json({
                    message: 'LOGIN IS SUCCESSFULY !',
                    access_token: accessToken ? `Bearer ${accessToken}` : null,
                    refresh_token: refreshToken ? `Bearer ${refreshToken}` : null
                })
            } else {
                return res.status(400).json('EMAIL OR PASSWORD IS WRONG!!!')
            }
        } catch (error) {
            return internalSeverError(req, res)
        }

    }

    //Refresh token (khi access token hết hạn thì sẽ gọi lại api này => nó sẽ cấp 1 access token mới)
    async refreshToken(req, res) {
        try {
            // Find user contain refreshToken
            const user = await database.User.findOne({ where: { refresh_token: req.body.refresh_token } })
            console.log(this._generalAccessToken(user.id))
            if (user) {
                jwt.verify(req.body.refresh_token, process.env.JWT_SCRET_REFRESH_TOKEN, (err, decode) => {
                    if (err) {
                        res.status(401).json({ mess: 'require login' })
                    } else {
                        // tạo 1 access token mới
                        const accessToken = this._generalAccessToken(user.id, user.email, user.role_code)

                        return res.status(200).json({
                            message: 'refresh token successfully !',
                            access_token: accessToken ? `Bearer ${accessToken}` : null,
                            refresh_token: req.body.refresh_token ? `Bearer ${req.body.refresh_token}` : null
                        })

                    }
                })
            }
        } catch (error) {
            return internalSeverError(req, res)
        }
    }


}

module.exports = new AuthController