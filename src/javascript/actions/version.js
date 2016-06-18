context.BeforeSubmitManager.register(function(shout, event) {
    var versionText = 'Wersja Shoutboksa';

    if (shout === '/v') {
        event.api.addInfoShout(versionText + ': ' + event.api.getVersion());

        shout = event.message = '';
        event.stop = true;
        event.cancel = true;
    }

    return shout;
});

context.HelpManager.register('/v', 'Wersja');
