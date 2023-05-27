const database = require('../models')
const data = require('../../data/data.json')
const cloudinary = require('cloudinary').v2;
const { badRequest, notFound, internalSeverError } = require('../middlewares/handleError')
const generateCode = require('../helper/func')
const { Op, where } = require("sequelize")
const { v4 } = require('uuid')
require('dotenv').config()

class BookController {
    //[GET] /
    async insertData(req, res) {
        try {
            const categories = Object.keys(data)
            categories.forEach(async (element) => {
                await database.Category.create({
                    code: generateCode(element),
                    value: element
                })
            })

            // [key  , [1, 2, 3]]
            const dataArray = Object.entries(data)
            dataArray.forEach((element) => {
                element[1]?.map(async (book) => {
                    await database.Book.create({
                        id: book.upc,
                        title: book.bookTitle,
                        price: book.bookPrice,
                        available: book.available,
                        image: book.imageUrl,
                        description: book.bookDescription,
                        category_code: generateCode(element[0])
                    })
                })
            })

            res.status(200).json(categories)
        } catch (error) {
            return badRequest(error, res)
        }
    }

    // [GET]/books?page=1&limit=10&name=man&&order=ASC
    async getBooksAndQueries(req, res) {
        const limit = Number(process.env.LIMIT_PAGE)
        const offset = Number(req.query.page)
        const order = req.query.order
        const title = req.query.title
        const available = req.query.available
        const skip = (offset * limit) - limit


        if (offset && !title && !available) {
            const { count, rows } = await database.Book.findAndCountAll({
                where: {
                },
                offset: skip,
                limit: limit,
                order: order ? [['title', order]] : undefined
            })
            return res.status(200).json({ rows, count })
        }

        else if (title && available) {
            const { count, rows } = await database.Book.findAndCountAll({
                where: {
                    title: {
                        [Op.substring]: title,
                    },
                    available: {
                        [Op.lte]: available
                    }
                },
                offset: skip,
                limit: limit,
                order: order ? [['title', order]] : undefined

            })
            return res.status(200).json({ rows, count })
        }
        else if (!title && !available && !order && !offset) {
            try {
                const books = await database.Book.findAll({})
                res.status(200).json(books)
            } catch (error) {
                res.status(500).json('mess : NOT GET ALL BOOKS')
            }
        }
        else {
            return notFound(req, res)
        }

    }

    //CREATE BOOK
    async createBook(req, res) {
        try {
            if (!req.body.title || !req.body.price || !req.body.available || !req.body.description || !req.body.category_code) {
                return res.status(400).json('missing field')
            }

            const [books, created] = await database.Book.findOrCreate({
                where: {
                    title: req.body.title
                },
                defaults: {
                    id: v4(),
                    title: req.body.title,
                    price: req.body.price,
                    available: req.body.available,
                    description: req.body.description,
                    category_code: req.body.category_code,
                    image: req.file?.path,
                    file_name: req.file?.filename
                }
            })

            if (created) {
                return res.status(200).json(books)
            } else {

                // delete image from cloudinary
                if (req.file.path) {
                    cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                        if (err) {
                            console.log({ err: err })
                        }
                    })
                }

                return res.status(500).json('title already exists')

            }

        } catch (error) {
            // delete image from cloudinary
            if (req.file?.path) {
                cloudinary.uploader.destroy(req.file?.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }
            return internalSeverError(req, res)
        }
    }

    async updateBook(req, res) {
        try {
            let getFileName

            if (req.file) {
                // GET FILENAME trong db 
                getFileName = await database.Book.findOne({ where: { id: req.params.id } })
                req.body.image = req.file?.path
                //filename đc cập nhật
                req.body.file_name = req.file.filename
            }

            if (Object.keys(req.body).length === 0) {
                cloudinary.uploader.destroy(req.file?.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
                return res.status(400).json({ mess: 'Need To Update At Least 1 field ' })
            }

            // DELETE filename cũ trong cloud để update filename mới
            if (getFileName.file_name) {
                cloudinary.uploader.destroy(getFileName.file_name, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }

            await database.Book.update(req.body, {
                where: { id: req.params.id }
            })

            return res.status(200).json({ mess: 'UPDATE SUCCESSFULLY !' })


        } catch (error) {
            if (req.file) {
                cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }
            return internalSeverError(req, res)
        }

    }

    // [DELETE] /books/delete/:id
    async deleteBook(req, res, next) {
        try {
            // GET FILE NAME TRONG ĐỂ XÓA
            let getFileName = await database.Book.findOne({ where: { id: req.params.id } })
            // NOTE : Xóa file image ở trong cloudinary
            if (getFileName.file_name) {
                cloudinary.uploader.destroy(getFileName.file_name, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }

            // Xóa trong database
            await database.Book.destroy({
                where: { id: req.params.id }
            })

            return res.status(200).json({ mess: 'DELETE SUCCESSFULLY !' })

        } catch (error) {
            return internalSeverError(req, res)
        }
    }

}

module.exports = new BookController