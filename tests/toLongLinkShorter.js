var maxAllowedLinkLength = 80;

// actions/urlShortings.js
function toLongLinkShorter(shout, event) {
    var links = shout.match(/(\[(url=|img\]))?https?:\/\/[^ ]+/ig);

    if (links !== null && links.length > 0) {
        links.forEach(function(link) {
            var tagLocation = link.substring(0,5);
            if (tagLocation !== '[url=' && tagLocation !== '[img]' && link.length > maxAllowedLinkLength) {
                shout = shout.replace(link, '[url=' + link + ']' + link.substring(0, maxAllowedLinkLength) + '(...)[/url]');
            }
        });
    }

    return shout;
}

function test(message, expected) {
    var result = toLongLinkShorter(message, null);
    
    if (result !== expected) {
        console.log("Expected: " + expected);
        console.log("Was:      " + result);
        
        throw "Wrong result";
    }
    
    console.log('Test passed for ("' + message + '")');
}

test(
    'Ut tempor tortor ac sapien luctus, id posuere nisi laoreet. Suspendisse at bibendum leo. Suspendisse a venenatis est. Cras ante eros, lobortis at ultrices at, sagittis ac est. Vestibulum ante ipsum primis in faucibus orci',
    'Ut tempor tortor ac sapien luctus, id posuere nisi laoreet. Suspendisse at bibendum leo. Suspendisse a venenatis est. Cras ante eros, lobortis at ultrices at, sagittis ac est. Vestibulum ante ipsum primis in faucibus orci'
);

test(
    'http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20',
    '[url=http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=(...)[/url]'
);

test(
    '[url=http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20]shorter[/url]',
    '[url=http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20]shorter[/url]'
);

test(
    '[img]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20[/img]',
    '[img]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20[/img]'
);

test(
    'Suspendisse at bibendum http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20 lobortis at ultrices at [img]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20[/img]',
    'Suspendisse at bibendum [url=http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=(...)[/url] lobortis at ultrices at [img]http://subdomain.dominan/somthing/verylong_something/somethig?param1=3df&param2=%20[/img]'
);
