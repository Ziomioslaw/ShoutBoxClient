(function(context) {
    var Translation = {
        defaultTextBoxValue: '[wpisz wiadomość]',
        loadingText: 'Proszę czekać, pobieram dane ...',
        deletedShoutText: ' <strong>[Wiadomość usunięto]</strong>',
        editedShoutText: '[EDITED] '
    };

    context.HTMLView = function(api) {
        var privates = {
            visibleShouts: null,
            $shoutbox: $('#shoutbox'),
            $shoutBoxForm: $('#shoutBoxForm'),
            $shoutBoxTextBox: $('#shoutBoxTextBox')[0]
        };

        privates.$shoutBoxForm.submit(function(e) {
            var text = privates.$shoutBoxTextBox.value;
            var event = api.sendMessage(text);

            privates.$shoutBoxTextBox.value = event.message;

            if (event.stop) {
                e.preventDefault();
            }

            return !event.stop;
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
                var textBox = privates.$shoutBoxTextBox;
                if (textBox.value === Translation.defaultTextBoxValue) {
                    textBox.value = '';
                }

                textBox.focus();
                textBox.value += text;
            },
            getShoutBoxMainObject: function() {
                return privates.$shoutbox;
            },
            getShoutBoxEditorObject: function() {
                return privates.$shoutBoxTextBox;
            },
            markAllShoutsAsRead: function() {
                markAllShoutsAsRead();
            },
            clearText: function() {
                privates.$shoutBoxTextBox.value = Translation.defaultTextBoxValue;
            }
        };

        function triggerEventsAfterParsedShouts() {
            var newShouts = privates.$shoutbox.find('.newShout');

            privates.$shoutbox.trigger('shoutbox:view:refresh');
            privates.$shoutbox.trigger({
                type: 'shoutbox:view:notify',
                newShouts: newShouts.length,
                newShoutsForUser: newShouts.filter('.shoutForYou').length
            });
        }

        function markAllShoutsAsRead() {
            privates.$shoutbox.find('.newShout').removeClass('newShout');
            privates.$shoutbox.trigger('shoutbox:view:reset');
        }

        function addNewShouts(newCollection) {
            var htmlCode;

            privates.$shoutbox.find('#loading').remove();

            newCollection.forEach(additionTransformations);
            htmlCode = newCollection
                .map(transformIntoHTMLCode)
                .reduce(function(a, b) { return a + b; }, '');

            privates.$shoutbox.find('#new_shout').replaceWith(htmlCode + '<span id="new_shout"></span>');
        }

        function transformIntoHTMLCode(metadata) {
            var deleteButton = metadata.canDelete ? '<a href="' + api.buildDeleteLink(metadata.id) + '" class="shoutDeleteButton">X</a>' : '';
            var timeStamp = '<span class="shoutTimeMarker">' + metadata.time + '</span>';
            var header = '<span class="shoutNick"><a href="' + api.buildProfileLink(metadata.memberId) + '">' + metadata.memberName + '</a>:</span>';
            var message = '<span class="shoutMessage">' + metadata.message + '</span>';

            return '<div id="' + metadata.id + '" class="' + metadata.classes.join(' ') + '">' + [
                    deleteButton,
                    timeStamp,
                    header,
                    message
                ].join(' ') + '</div>';
        }

        function additionTransformations(metadata) {
            metadata.classes = ['newShout'];

            if ((metadata.message.indexOf('@' + api.getUser().Name + ':') !== -1)
                || (metadata.message.indexOf('@all:') !== -1)) {
                metadata.classes.push('shoutForYou');
            }

            if (metadata.memberId == api.getUser().Id) {
                metadata.classes.push('shoutItsYou');
            }

            if (metadata.message.match(/^&nbsp;\/me .*/)) {
                metadata.classes.push('shoutMeMessage');
                metadata.message = metadata.message.replace(/&nbsp;\/me/, '');
            }

            context.AdditionalParser.parse(metadata);
        }

        function markDeletedShouts(idsOfDeleted, actualCollection) {
            idsOfDeleted.forEach(function(id) {
                getShoutHTML(id).html(' ' + Translation.deletedShoutText);
            });
        }

        function markEditedShouts(idsOfEdited, actualCollection) {
            idsOfEdited.forEach(function(id) {
                var shout = actualCollection.find(function(shout) {
                    return shout.id === id;
                });

                getShoutHTML(id).html(Translation.editedShoutText + shout.message);
            });
        }

        function getShoutHTML(shoutId) {
            return privates.$shoutbox.find('#shout_' + shoutId + ' span.shoutMessage');
        }
    };
})(ShoutBox);
