const cp = require('child_process');

class NativeMethods {
    static execute(command) {
        cp.exec(command, (error, stdout, stderr) => {
            console.error(error);
            console.log(stdout);
            console.error(stderr);
        });
    }
}

module.exports = NativeMethods;