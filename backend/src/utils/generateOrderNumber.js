const moment = require('moment');

const generateOrderNumber = () => {
    const now = moment();
    const date = now.format('YYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${date}-${random}`;
};

module.exports = generateOrderNumber;