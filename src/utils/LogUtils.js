const fs = require('fs');

function log(data) {
    const date = new Date();
    const logFileName = `./log/log_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.txt`;
    fs.appendFileSync(logFileName, data + '\n');
}

module.exports = {
    log
}