const utils = require('../../../utils')
const std = require('../../../standards')
const authNumStd = std.authNum

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            // 필수값 체크
            if (body.type === undefined || body.key === undefined) {
                res.status = 400
                return res.json({
                    code: "400_2"
                })
            }

            if (body.type !== authNumStd.authNumTypeEmail && body.type !== authNumStd.authNumTypePhone) {
                res.status = 400
                return res.json({
                    code: "400_1"
                })
            }

            let regExp = null
            let code = null
            if (body.type === authNumStd.authNumTypeEmail) {
                regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
                code = "400_3"
            } else if (body.type === authNumStd.authNumTypePhone) {
                regExp = /^\d{3}-\d{3,4}-\d{4}$/;
                code = "400_4"
            } else {
                console.error("type error!")
            }

            if (regExp !== null) {
                const isValidKey = regExp.exec(body.key)

                if (!isValidKey) {
                    res.status = 400
                    return res.json({
                        code: code
                    })
                }
            } else {
                console.error("type error!")
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

