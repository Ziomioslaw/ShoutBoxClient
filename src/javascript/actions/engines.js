context.BeforeSubmitManager.register((function(){
    var engines = [
        { nick: 'google', link: 'https://www.google.com/search?q=' },
        { nick: 'wiki', link: 'https://pl.wikipedia.org/w/index.php?search=' },
        { nick: 'duck', link: 'https://duckduckgo.com/?q=' },
        { nick: 'gimage', link: 'https://www.google.pl/search?tbm=isch&q=' },
        { nick: 'dimage', link: 'https://duckduckgo.com/?iax=1&ia=images&q=' }
    ];

    engines.forEach(function(engine) {
        var tmp = engine.link.substr(8);
        var link = tmp.substr(0, tmp.indexOf('/'));

        engine.regex = new RegExp('\\[' + engine.nick + ':([^\\]]+)\\]');
        context.HelpManager.register('[' + engine.nick + ':&lt;fraza&gt;]', 'Szukaj frazy w ' + link);
    });

    return function(shout, event) {
        var match;
        engines.forEach(function(engine) {
            match = shout.match(engine.regex);
            if (match) {
                event.stop = true;
                shout = shout.replace(
                    '[' + engine.nick + ':' + match[1] + ']',
                    '[url=' + engine.link + encodeURIComponent(match[1]) + ']' + match[1] + '[/url]');
            }
        });

        return shout;
    };
})());
