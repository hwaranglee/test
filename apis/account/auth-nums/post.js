const utils = require('../../../utils')
const std = require('../../../standards')

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (body.type === undefined || body.key === undefined) {
                res.status = 400
                return res.json({
                    code: "400_2"
                })
            }

            if (body.type !== "email" && body.type !== "phone") {
                res.status = 400
                return res.json({
                    code: "400_1"
                })
            }

            if (body.type === "email") {
                let emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                let isEmailValidKey = emailRegExp.exec(body.key)

                if (!isEmailValidKey) {
                    res.status = 400
                    return res.json({
                        code: "400_3"
                    })
                }

            } else if (body.type === "phone") {
                let phoneRegExp = /^\d{3}-\d{3,4}-\d{4}$/;
                let isPhoneValidKey = phoneRegExp.exec(body.key)

                if (!isPhoneValidKey) {
                    res.status = 400
                    return res.json({
                        code: "400_4"
                    })
                }
            } else {
                console.log("type error!")
            }

            next()
        }
    },

    authNumGenerator: () => {
        return (req, res, next) => {
            req.authNum = utils.createRandomString(std.authNum.length)
            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            req.encryptionNum = utils.encryption(req.authNum)
            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            let body = req.body
            let idx = db.pk.authPk

            for (let pk in db.schema.auth) {
                let data = db.schema.auth[pk]
                if (data.key === body.key && data.type === body.type) {
                    idx = pk
                    break
                }
            }

            if (idx === db.pk.authPk) {
                db.pk.authPk++
            }

            db.schema.auth[idx] = {
                authNum: req.encryptionNum,
                key: body.key,
                type: body.type,
                createdAt: Date.now()
            }

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({authNum: req.authNum})
        }
    }
}

