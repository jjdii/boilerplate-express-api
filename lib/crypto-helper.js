const crypto = require('crypto');

module.exports = {
    genRandomNumber: (length) => {
        var num = "";
        var pool = "0123456789";
        for(var i = 0; i < length; i++) {
            num += pool.charAt(Math.floor(Math.random() * pool.length));
        }
        return num;
    },
    genRandomString: (length) => {
        return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
    },
    sha512: (password, salt) => {
        var hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        var value = hash.digest('hex');
        return {
            pwSalt: salt,
            pwHash: value
        };
    }
}
