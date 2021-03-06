/**
 * Input device listener
 */

const fs = require('fs');

var logger;

/**
 * Set logger
 */
exports.logger = function (obj) {
    logger = obj;
}

/**
 * Holds pressedKeys
 */
var pressedKeys = {};

/**
 * Listen the given keyboard device file then execute callback on keys press
 */
exports.listen = function (device, callback) {

    // Open a descriptor instead of give the filename directly to
    // `createReadStream` because of
    // <https://github.com/nodejs/node/issues/19240>

    var fileDesc = fs.openSync(device, 'r');
    var stream 
        = fs.createReadStream(undefined, {fd: fileDesc, autoClose: true});
    stream.on('error', (error) => {
        if (error.code !== 'ENODEV') {
            throw error;
        }
    });
    stream.on('data', (chunk) => {

        for (var i = 0; i < chunk.length; i = i+24) {

            var sec = chunk.readInt32LE(i),
                microsec = chunk.readInt32LE(i+8),
                type = chunk.readUInt16LE(i+16),
                code = chunk.readUInt16LE(i+18),
                value = chunk.readInt32LE(i+20);

            if ((type === 1 || type === 3)) { // EV_KEY events only

                // Event type key pressed

                if ((value === 1 || value === -1) && pressedKeys[code] === undefined) {
                    pressedKeys[code] = value;

                    // Keys are handled only when pressed

                    callback(pressedKeys);
                }

                // Event type key released 

                if (value === 0) {
                    delete pressedKeys[code];
                }
                
                // Print keys to stdout 

                logger.logPressedKeys(pressedKeys);

            }

        }

    });

}
