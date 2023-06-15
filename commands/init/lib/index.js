'use strict';


const Command = require("@jr-cli/command");
const log = require("@jr-cli/log")

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }

    init () {
        this.projectName = this._argv[0] || "";
        this.force = !!this._cmd._optionValues?.force;
        log.info("name",this.projectName)
        log.info("force",this.force)
    }

    exec () {}
}


function init (argv) {
    return new InitCommand(argv)
}

module.exports = init;
module.exports.InitCommand = InitCommand;
