let db = {
    pk: {
        authPk: 1,
        userPk: 1,
        loginHistoryPk: 1,
        termsPk: 1,
        optionalTermsPk: 1,
        versionPk: 1,
        extinctUserPk: 1,
        authTokenPk: 1
    },
    schema: {
        authToken: {},
        auth: {},
        user: {},
        loginHistory: {},
        terms: {},
        optionalTerms: {},
        version: {},
        extinctUser: {}
    }
}

module.exports = db
