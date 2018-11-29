const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, printf } = format;
let ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger(module) {

    let path = module.filename.split('\\').slice(-2).join('\\');
    const myFormat = printf(info => {
        return `${info.level}: [${info.timestamp}] [${info.label}] ${info.message}`;
    });

    return createLogger({
        level: (ENV === 'development') ? 'debug' : 'error',
        format: combine(
            colorize(),
            label({ label: path }),
            timestamp(),
            myFormat
        ),
        transports: [new transports.Console()]
    });
}

module.exports = getLogger;