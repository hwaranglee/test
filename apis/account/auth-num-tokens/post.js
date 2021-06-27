const utils = require('../../../utils')
const std = require('../../../standards')

module.exports = {
    validation: () => {
        return (req, res, next) => {
            let body = req.body

            if (body.type === undefined || body.key === undefined || body.authNum === undefined) {
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

            let regex = new RegExp("^[a-zA-Z0-9]{" + std.authNum.length + "}$")
            let isAuthNumValidKey = regex.test(body.authNum)

            if (!isAuthNumValidKey) {
                res.status = 400
                return res.json({
                    code: "400_5"
                })
            }

            next()
        }
    },

    encryption: () => {
        return (req, res, next) => {
            req.encryptionNum = utils.encryption(req.body.authNum)
            next()
        }
    },

    validationAutNum: (db) => {
        return (req, res, next) => {
            let body = req.body
            let auth = db.schema.auth
            let isSearched = false
            let searchedPk = -1

            for (let pk in auth) {
                let searchedAuth = auth[pk]

                if (searchedAuth.key === body.key && searchedAuth.type === body.type) {
                    let now = Date.now()
                    const cal = searchedAuth.createdAt + std.authNum.expiredMinute * 60000

                    // 유효시간 체크
                    if (now > cal) {
                        res.status = 400
                        return res.json({
                            code: '400_6'
                        })
                    }
                    searchedPk = pk
                    isSearched = true
                    break
                }
            }

            // 인증 존재 체크
            if (!isSearched) {
                res.status = 404
                return res.json({
                    code: '404_1'
                })
            }

            // 인증 번호 체크
            const authNum = req.body.authNum
            const encryptedAuthNum = utils.encryption(authNum)
            const searchedAuthNum = auth[searchedPk].authNum
            req.searchedPk = searchedPk

            if (encryptedAuthNum !== searchedAuthNum) {
                res.status = 401
                return res.json({
                    code: '401_1'
                })
            }

            next()
        }
    },

    tokenGenerator: () => {
        return (req, res, next) => {
            req.token = utils.createRandomString(std.authNum.tokenLength)
            next()
        }
    },

    syncDB: (db) => {
        return (req, res, next) => {
            const body = req.body
            const encryptedToken = utils.encryption(req.token)

            // 추후 중복되지 않는 토큰값으로 대체 필요.
            // 물론 디비를 활용하면 다음 문제는 없음.
            db.schema.authToken[encryptedToken] = {
                key: body.key,
                type: body.type,
                createdAt: Date.now()
            }

            next()
        }
    },

    responder: () => {
        return (req, res) => {
            res.json({
                token: req.token
            })
        }
    }
}
