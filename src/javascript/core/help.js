context.HelpManager = (function() {
    var help = [];

    return {
        register: function(command, explain) {
            help.push({
                command: command,
                explain: explain
            });
        },
        getRegistredHelps: function() {
            return help;
        }
    };
})();
