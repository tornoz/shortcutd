/**
 * Pressed keys handler
 */

const exec = require('child_process').exec;

var logger;

/**
 * Set logger
 */
exports.logger = function (obj) {
    logger = obj;
}

/**
 * Mapping between key combinations and commands
 */
var shortcuts = {};

/**
 * List of blocked key codes that prevent already spawned blocking commands to 
 * be spawned again.
 */
var blockedkeyCodes = [];

/**
 * Set shortcuts
 */
exports.shortcuts = function (obj) {
    shortcuts = obj;
}

/**
 * Find for given pressed keys on shortcut list and spawn attached command
 */
exports.handle = function (pressedKeys) {

    var pointer = shortcuts;
    
    var keyCodes = '';

    for (var i in pressedKeys) {
        if (typeof pointer[i] === 'undefined') {
            return;
        }
        if(pointer[i].value === pressedKeys[i]) {
            pointer = pointer[i];
            keyCodes += i;
        }
    }
    
    if (typeof pointer.command !== 'undefined') {

        // Check if command is blocking and blocked
        
        if (typeof pointer.blocking !== 'undefined' && pointer.blocking) {
            if (blockedkeyCodes.indexOf(keyCodes) == -1) { 
                blockedkeyCodes.push(keyCodes);
            } else {
                logger.log('Process blocking and already spawned, ignore');
                return;
            }
        }

        logger.log(`Spawn command: ${pointer.command}`);
        var child = exec(pointer.command, (error, stdout, stderr) => {
            logger.log(`Command finished: ${pointer.command}`);
            logger.log('Command output:');
            logger.log(stdout);

            // Release command blocking

            var index = blockedkeyCodes.indexOf(keyCodes);
            if (index !== -1) {
                delete blockedkeyCodes[index];                
            }
        });

    } 

}
