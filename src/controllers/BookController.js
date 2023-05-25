const database = require('../models')
const data = require('../../data/data.json')
const cloudinary = require('cloudinary').v2;
const { badRequest, notFound } = require('../middlewares/handleError')
const generateCode = require('../helper/func')
const { Op, where } = require("sequelize")
const { v4 } = require('uuid')
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
        const limit = Number(req.query.limit)
        const offset = Number(req.query.page)
        const order = req.query.order
        const title = req.query.title
        const available = req.query.available
        const skip = (offset * limit) - limit

        if (offset && limit && !title && !available) {
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
                    image: req.file?.path
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
            if (req.file.path) {
                cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }
            return res.status(500).json({ mess: error })
        }
    }

}

module.exports = new BookController