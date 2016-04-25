(function(context) {
    var maxAllowedLinkLength = 80;

    context.BeforeSubmitManager.register(toLongLinkShorter);

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
})(ShoutBox);
