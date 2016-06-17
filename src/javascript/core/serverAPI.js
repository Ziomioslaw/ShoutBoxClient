function ServerAPI(scripturl, sessionId, baselink) {
    this.buildActionLink = function(action) {
        return scripturl + '?action=' + action;
    };

    this.buildProfileLink = function(memberId) {
        return this.buildActionLink('profile') + ';u=' + memberId;
    };

    this.getShouts = function(limit) {
        return $.get(baselink + 'shouts')
                .then(function(shouts) {
                    return shouts.map(function(shout) {
                        return {
                            id: shout.id,
                            memberName: shout.member_name,
                            memberId: parseInt(shout.member_id, 10),
                            canDelete: shout.can_delete,
                            time: shout.time,
                            message: shout.message,
                            edited: parseInt(shout.edited, 10) || 0
                        };
                    });
                });
    };

    this.editShout = function(shoutId, find, replace) {
        return $.post(baselink + 'shout/' + shoutId + '/edit', {
                search: find,
                replace: replace
            })
                .promise();
    };

    this.addShout = function(data) {
        return $.post(baselink + 'shout', data)
                .promise();
    };

    this.deleteShout = function(shoutId) {
        return $.post(baselink + 'shout/' + shoutId + '/delete')
                .promise();
    };
}
