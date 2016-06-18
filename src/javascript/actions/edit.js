context.BeforeSubmitManager.register((function(){
    var regex = /^\/s\/(.*?)\/(.*?)\/?$/;

    return function(shout, event) {
        var result = shout.match(regex);
        if (result) {
            event.stop = true;
            event.cancel = true;

            event.api.editLastUserMessage(result[1], result[2]);
            shout = event.message = '';
        }

        return shout;
    };
})());

context.HelpManager.register('/s/błond/błąd', 'Poprawki ostatniego posta');
