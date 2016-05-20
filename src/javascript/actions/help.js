context.BeforeSubmitManager.register(function(shout, event) {
    var matched = shout.match(/\/help(\s+(.+))?/);

    if (matched !== null) {
        if (!matched[1]) {
            event.api.addInfoShout('[Pomoc ShoutBox]<br />Wersja: <strong>/v</strong><br />Poprawki ostatniego posta: <strong>/s/błond/błąd</strong>');
        }

        shout = event.message = '';
        event.stop = true;
        event.cancel = true;
    }
});