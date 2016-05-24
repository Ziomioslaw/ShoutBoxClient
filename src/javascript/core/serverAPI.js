function ServerAPI(scripturl, sessionId) {
    this.buildDeleteLink = function(shoutId) {
        return scripturl + '?action=delete_shout;sesc=' + sessionId + ';sid=' + shoutId + '#shoutbox';
    };

    this.buildProfileLink = function(memberId) {
        return scripturl + '?action=profile;u=' + memberId;
    };

    this.buildActionLink = function(action) {
        return 'http://www.gimpuj.info/index.php?action=' + action;
    };

    this.buildLink = function(action) {
        return 'http://www.gimpuj.info/index.php?action=' + action;
    };

    this.addShout = function(data) {
        return $.post(scripturl + '?action=shout', data)
            .promise();
    };

    this.getShouts = function(limit) {
        var deferred;

        if (!window.XMLHttpRequest) {
            throw new Error("Can't work -> window.XMLHttpRequest not exist");
        }

        deferred = $.Deferred();

        getXMLDocument(buildGetShoutsLink(limit), function(XMLDoc) {
                deferred.resolve(repackShouts(XMLDoc));
            });

        return deferred.promise();
    };

    this.deleteShout = function(shoutId) {
        return $.get(this.buildDeleteLink(shoutId));
    };

    function repackShouts(XMLDoc) {
        var shouts = XMLDoc.getElementsByTagName('shout'), result = [];
        for (var shout = null, i = 0, max = shouts.length; i < max; i++) {
            shout = shouts[i];
            result.push({
                id: shout.getAttribute("id"),
                memberName: shout.getAttribute("member_name"),
                memberId: parseInt(shout.getAttribute("member_id"), 10),
                canDelete: shout.getAttribute("can_delete"),
                time: shout.getAttribute("time"),
                message: shout.getAttribute("message")
            });
        }

        return result;
    }

    function buildGetShoutsLink(limit) {
        return scripturl + '?action=shout_xml&limit=' + limit + ';xml';
    }
}

function DeveloperServerAPI(scripturl, sessionId) {
    this.buildProfileLink = function(memberId) {
        return scripturl + '?action=profile;u=' + memberId;
    };

    this.buildActionLink = function(action) {
        return 'http://www.gimpuj.info/index.php?action=' + action;
    };

    this.buildLink = function(action) {
        return 'http://www.gimpuj.info/index.php?action=' + action;
    };

    this.getShouts = function(limit) {
        return $.get('http://www.gimpuj.info/ziomioslaw/shoutbox/shouts')
            .then(function(shouts) {
                return shouts.map(function(shout) {
                    return {
                        id: shout.id,
                        memberName: shout.member_name,
                        memberId: parseInt(shout.member_id, 10),
                        canDelete: shout.can_delete,
                        time: shout.time,
                        message: shout.message
                    };
                });
            });
    };

    this.addShout = function(data) {
        return $.post('http://www.gimpuj.info/ziomioslaw/shoutbox/shout', data)
            .promise();
    };

    this.deleteShout = function(shoutId) {
        return $.post('http://www.gimpuj.info/ziomioslaw/shoutbox/shout/delete', {
                shoutId: shoutId
            })
                .promise();
    };
}
