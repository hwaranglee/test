const crypto = require('crypto')

module.exports = {
    createRandomString: (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    },
    encryption: (str) => {
        return crypto.createHash('sha512').update(str).digest('base64');
    }
}
