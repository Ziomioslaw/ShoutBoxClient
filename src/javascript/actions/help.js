context.BeforeSubmitManager.register(function(shout, event) {
    var matched = shout.match(/\/help(\s+(.+))?/);
    if (matched !== null) {
        if (!matched[1]) {
            event.api.addInfoShout(
                context.HelpManager
                .getRegistredHelps()
                .reduce(function(result, element) {
                        return result + buildHelpRow(element);
                    }, '[Pomoc ShoutBox]<br />'));
        }

        shout = event.message = '';
        event.stop = true;
        event.cancel = true;
    }

    return shout;

    function buildHelpRow(element) {
        return element.explain + ': ' + '<strong>' + element.command + '</strong><br />';
    }
});
