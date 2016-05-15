var Translation = {
    loadingText: 'Proszę czekać, pobieram dane ...',
    deletedShoutText: ' <strong>[Wiadomość usunięto]</strong>',
    editedShoutText: 'EDITED',
    textChangedWasText: 'Było: '
};

context.HTMLView = function(api) {
    var privates = (function() {
        var $form, $shoutbox = $('#shoutbox');

        $shoutbox.html(buildShoutbox());
        $form = $shoutbox.find('#shoutbox-form');

        return {
            visibleShouts: null,
            $shoutBox: $shoutbox,
            $shoutBoxShouts: $shoutbox.find('#shoutbox-shouts'),
            $shoutBoxForm: $form.find('form'),
            $shoutBoxHorizontalButtons: $form.find('.shoutbox-buttons'),
            shoutBoxTextBox: $form.find('#shoutBoxTextBox')[0],
            lastMessage: null,
            optionsManager: new context.OptionsManager(api, $shoutbox.find('#shoutbox-options'))
        };

        function buildShoutbox() {
            return '<div id="shoutbox-options"></div>'
                + '<div id="shoutbox-shouts"></div>'
                + '<div id="shoutbox-form">'
                    + '<div class="shoutbox-buttons"><a href="' + api.buildLink('shout_archive') + '">Zobacz wszystkie</a></div>'
                    + '<form method="post" action="' + api.buildLink('shout') + '" >'
                        + '<input type="text" name="message" autocomplete="off" maxlength="500" size="100" placeholder="[wpisz wiadomość]" id="shoutBoxTextBox" />'
                        + '<input type="submit" value="Wyślij" name="submit" />'
                    + '</form>'
                + '</div>';
        }
    })();

    privates.$shoutBoxForm.submit(function(e) {
        var event, text = privates.shoutBoxTextBox.value;

        markAllShoutsAsRead();
        event = api.sendMessage(text);
        if (event.stop) {
            privates.shoutBoxTextBox.value = event.message;
        } else {
            reduceShoutsNumber();
            clearText();
        }

        e.preventDefault();
        return false;
    });

    return {
        shouts: function(actualCollection, newCollection, idsOfEdited, idsOfDeleted) {
            if (privates.visibleShouts === null) {
                privates.visibleShouts = [];
                addNewShouts(actualCollection);
                markAllShoutsAsRead();
            }

            addNewShouts(newCollection);
            markDeletedShouts(idsOfDeleted, actualCollection);
            markEditedShouts(idsOfEdited, actualCollection);

            triggerEventsAfterParsedShouts();
        },
        addTextValue: function(text) {
            insertAtCursor(privates.shoutBoxTextBox, text);
            privates.shoutBoxTextBox.focus();

            function insertAtCursor(field, value) {
                var var1, var2;
                if (document.selection) { //IE support
                    field.focus();
                    var1 = document.selection.createRange();
                    var1.text = value;
                } else if (field.selectionStart || field.selectionStart === '0') { //MOZILLA and others
                    var1 = field.selectionStart;
                    var2 = field.selectionEnd;
                    field.value = field.value.substring(0, var1)
                        + value
                        + field.value.substring(var2, field.value.length);
                } else {
                    field.value += value;
                }
            }
        },
        addInfoShout: function(time, text) {
            privates.$shoutBoxShouts.append('<div><span class="shoutTimeMarker"><b>Dzisiaj</b> o ' + time + '</span> <span class="shoutNick"><a href="#" >' + api.getShoutBoxInfoShoutNick() + '</a>:</span> <span class="shoutMessage"><span class="infobox">INFO</span>' + text + '</span></div>');
        },
        addErrorShout: function(time, text) {
            privates.$shoutBoxShouts.append('<div class="errorShout"><span class="shoutTimeMarker"><b>Dzisiaj</b> o ' + time + '</span> <span class="shoutNick"><a href="#" >' + api.getShoutBoxInfoShoutNick() + '</a>:</span> <span class="shoutMessage"><span class="infobox">ERROR</span>' + text + '</span></div>');
        },
        getShoutBoxMainObject: function() {
            return privates.$shoutBox;
        },
        getShoutBoxEditorObject: function() {
            return privates.shoutBoxTextBox;
        },
        getShoutFormObject: function() {
            return privates.$shoutBoxForm;
        },
        registerOption: function(name, defaultValue) {
            return privates.optionsManager.registerOption(name, defaultValue);
        },
        registerButton: function(label, callback) {
            privates
                .$shoutBoxHorizontalButtons
                .append(' | <a href="#">' + label +'</a>')
                .find('a')
                .last()
                .click(callback);
        },
        markAllShoutsAsRead: markAllShoutsAsRead,
        clearText: clearText
    };

    function triggerEventsAfterParsedShouts() {
        var newShouts = privates.$shoutBoxShouts.find('.newShout');

        privates.$shoutBox.trigger('shoutbox:view:refresh');
        privates.$shoutBox.trigger({
            type: 'shoutbox:view:notify',
            newShouts: newShouts.length,
            newShoutsForUser: newShouts.filter('.shoutForYou').length
        });
    }

    function markAllShoutsAsRead() {
        privates.$shoutBoxShouts.find('.newShout').removeClass('newShout');
        privates.$shoutBox.trigger('shoutbox:view:reset');
    }

    function addNewShouts(newCollection) {
        var htmlCode;

        newCollection.forEach(additionTransformations);
        htmlCode = newCollection
            .map(transformIntoHTMLCode)
            .reduce(function(a, b) { return a + b; }, '');

        privates.$shoutBoxShouts.append(htmlCode);
    }

    function transformIntoHTMLCode(metadata) {
        var deleteButton = metadata.canDelete ? '<a href="' + api.buildDeleteLink(metadata.id) + '" class="shoutDeleteButton">X</a>' : '';
        var timeStamp = '<span class="shoutTimeMarker">' + metadata.time + '</span>';
        var header = '<span class="shoutNick"><a href="' + api.buildProfileLink(metadata.memberId) + '">' + metadata.memberName + '</a>' + (!metadata.me ? ':' : '') + '</span>';
        var message = '<span class="shoutMessage">' + metadata.message + '</span>';

        return '<div id="shout_' + metadata.id + '" class="' + metadata.classes.join(' ') + '">' + [
                deleteButton,
                timeStamp,
                header,
                message
            ].join(' ') + '</div>';
    }

    function additionTransformations(metadata) {
        metadata.classes = [];

        if ((metadata.message.indexOf('@' + api.getUser().Name + ':') !== -1)
            || (metadata.message.indexOf('@all:') !== -1)) {
            metadata.classes.push('shoutForYou');
        }

        if (metadata.memberId === api.getUser().Id) {
            metadata.classes.push('shoutItsYou');
        } else {
            metadata.classes.push('newShout');
        }

        if (metadata.message.match(/^&nbsp;\/me .*/)) {
            metadata.me = true;
            metadata.classes.push('shoutMeMessage');
            metadata.message = metadata.message.replace(/&nbsp;\/me/, '');
        }

        context.Parsers.parse(metadata);
        privates.visibleShouts.push(metadata);
    }

    function markDeletedShouts(idsOfDeleted, actualCollection) {
        idsOfDeleted.forEach(function(id) {
            var shout = getShoutHTML(id);

            shout.attr('title', Translation.textChangedWasText + shout.html());
            shout.html('<span class="infobox">DELETED</span>');
        });
    }

    function markEditedShouts(idsOfEdited, actualCollection) {
        idsOfEdited.forEach(function(id) {
            var shout = getShoutHTML(id);
            var message = shout.html();

            shout.attr('title', Translation.textChangedWasText + message);
            shout.html(buildInfoBox(Translation.editedShoutText) + message);
        });
    }

    function buildInfoBox(text) {
        return '<span class="infobox">' + text + '</span>';
    }

    function reduceShoutsNumber() {
        var oldLenght = privates.visibleShouts.length - api.getConfigValue('shoutsLimit');

        privates.visibleShouts
            .splice(0, oldLenght)
            .forEach(function(shout) {
                privates.$shoutBoxShouts.find('#shout_' + shout.id).remove();
            });
    }

    function getShoutHTML(shoutId) {
        return privates.$shoutBoxShouts.find('#shout_' + shoutId + ' span.shoutMessage');
    }

    function clearText() {
        privates.shoutBoxTextBox.value = '';
    }
};
