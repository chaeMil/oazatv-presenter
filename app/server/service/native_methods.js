const exec = require('child_process').exec;

class NativeMethods {
    static execute(command, callback) {
        exec(command, (error, stdout, stderr) => {
            callback(stdout);
        });
    }
}

module.exports = NativeMethods;