context.BeforeSubmitManager.register(function(shout, event) {
    if (!shout.startsWith('/')) {
        return shout;
    }

    switch(true) {
        case (shout.startsWith('/g ')):
            return toUrl(shout.substring(3), 'https://www.google.com/search?q=');
        case (shout.startsWith('/gi ')):
            return toUrl(shout.substring(4), 'https://www.google.pl/search?tbm=isch&q=');
        case (shout.startsWith('/ddg ')):
            return toUrl(shout.substring(5), 'https://duckduckgo.com/?q=');
        case (shout.startsWith('/ddgi ')):
            return toUrl(shout.substring(6), 'https://duckduckgo.com/?iax=1&ia=images&q=');
        case (shout.startsWith('/w ')):
            return toUrl(shout.substring(3), 'https://pl.wikipedia.org/w/index.php?search=');
        default:
            return shout;
    }

    function toUrl(question, url) {
        event.stop = true;
        return url + encodeURIComponent(question);
    }
});
