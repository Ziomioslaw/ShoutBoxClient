var enginesFunction;
var context = {
    BeforeSubmitManager: {
        register: function(f) {
            enginesFunction = f;
        }
    }
};

context.BeforeSubmitManager.register((function(){
    var engines = [
        { nick: 'google', link: 'https://www.google.com/search?q=' },
        { nick: 'wiki', link: 'https://pl.wikipedia.org/w/index.php?search=' },
        { nick: 'duck', link: 'https://duckduckgo.com/?q=' },
        { nick: 'gimage', link: 'https://www.google.pl/search?tbm=isch&q=' },
        { nick: 'dimage', link: 'https://duckduckgo.com/?iax=1&ia=images&q=' }
    ];

    engines.forEach(function(engine) {
        engine.regex = new RegExp('\\[' + engine.nick + ':([^\\]]+)\\]');
    });

    return function(shout, event) {
        var match;
        engines.forEach(function(engine) {
            if (match = shout.match(engine.regex)) {
                event.stop = true;
                shout = shout.replace(
                    '[' + engine.nick + ':' + match[1] + ']',
                    '[url=' + engine.link + encodeURIComponent(match[1]) + ']' + match[1] + '[/url]');
            }
        });

        return shout;
    };
})());

function test(message, expected) {
    var result = enginesFunction(message, { stop: false });

    if (result !== expected) {
        console.log("Expected: " + expected);
        console.log("Was:      " + result);

        throw "Wrong result";
    }

    console.log('Test passed for ("' + message + '")');
}

test(
    'Ut tempor tortor ac sapien luctus, id posuere nisi laoreet.',
    'Ut tempor tortor ac sapien luctus, id posuere nisi laoreet.'
);

test(
    'Ut tempor tortor ac sapien [google:luctus], id posuere nisi laoreet.',
    'Ut tempor tortor ac sapien [url=https://www.google.com/search?q=luctus]luctus[/url], id posuere nisi laoreet.'
);

test(
    'Ut tempor tortor ac [google:sapien luctus], id posuere nisi laoreet.',
    'Ut tempor tortor ac [url=https://www.google.com/search?q=sapien%20luctus]sapien luctus[/url], id posuere nisi laoreet.'
);

test(
    'Ut tempor tortor ac [wiki:sap2ien luctus], id posuere nisi laoreet.',
    'Ut tempor tortor ac [url=https://pl.wikipedia.org/w/index.php?search=sap2ien%20luctus]sap2ien luctus[/url], id posuere nisi laoreet.'
);

test(
    'Ut tempor tortor ac [wiki:sap2ien luctus], id posuere [google:nisi] laoreet.',
    'Ut tempor tortor ac [url=https://pl.wikipedia.org/w/index.php?search=sap2ien%20luctus]sap2ien luctus[/url], id posuere [url=https://www.google.com/search?q=nisi]nisi[/url] laoreet.'
);
