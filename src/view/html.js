(function(context, $) {
    var Translation = {
        loadingText: 'Proszę czekać, pobieram dane ...',
        deletedShoutText: ' <strong>[Wiadomość usunięto]</strong>',
        editedShoutText: '[EDITED] ',
        textChangedWasText: 'Było: '
    };

    context.HTMLView = function(api) {
        var privates = (function() {
            var $shoutbox = $('#shoutbox');

            return {
                visibleShouts: null,
                $shoutBox: $shoutbox,
                $shoutBoxShouts: $shoutbox.find('#shoutbox-shouts'),
                $shoutBoxForm: $shoutbox.find('#shoutBoxForm'),
                $shoutBoxTextBox: $shoutbox.find('#shoutBoxTextBox')[0],
                $shoutBoxOptions: $shoutbox.find('#shoutbox-options'),
                lastMessage: null
            };
        })();

        privates.$shoutBoxForm.submit(function(e) {
            var event, text = privates.$shoutBoxTextBox.value;

            markAllShoutsAsRead();
            event = api.sendMessage(text);
            if (event.stop) {
                privates.$shoutBoxTextBox.value = event.message;
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
                insertAtCursor(privates.$shoutBoxTextBox, text);
                privates.$shoutBoxTextBox.focus();

                function insertAtCursor(field, value) {
                    var var1, var2;
                    if (document.selection) { //IE support
                        field.focus();
                        var1 = document.selection.createRange();
                        var1.text = value;
                    } else if (field.selectionStart || field.selectionStart == '0') { //MOZILLA and others
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
            getShoutBoxMainObject: function() {
                return privates.$shoutBox;
            },
            getShoutBoxEditorObject: function() {
                return privates.$shoutBoxTextBox;
            },
            registerOption: function(name, defaultValue) {
                return new OptionButton(name, defaultValue, api, privates.$shoutBoxOptions);
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

            privates.$shoutBoxShouts.find('#loading').remove();

            newCollection.forEach(additionTransformations);
            htmlCode = newCollection
                .map(transformIntoHTMLCode)
                .reduce(function(a, b) { return a + b; }, '');

            privates.$shoutBoxShouts.find('#new_shout').replaceWith(htmlCode + '<span id="new_shout"></span>');
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

            if (metadata.memberId == api.getUser().Id) {
                metadata.classes.push('shoutItsYou');
            } else {
                metadata.classes.push('newShout');
            }

            if (metadata.message.match(/^&nbsp;\/me .*/)) {
                metadata.me = true;
                metadata.classes.push('shoutMeMessage');
                metadata.message = metadata.message.replace(/&nbsp;\/me/, '');
            }

            context.AdditionalParser.parse(metadata);
            privates.visibleShouts.push(metadata);
        }

        function markDeletedShouts(idsOfDeleted, actualCollection) {
            idsOfDeleted.forEach(function(id) {
                var shout = getShoutHTML(id);

                shout.attr('title', Translation.textChangedWasText + shout.html());
                shout.html(Translation.deletedShoutText);
            });
        }

        function markEditedShouts(idsOfEdited, actualCollection) {
            idsOfEdited.forEach(function(id) {
                var shout = getShoutHTML(id);
                var message = shout.html();

                shout.attr('title', Translation.textChangedWasText + message);
                shout.html(Translation.editedShoutText + message);
            });
        }

        function reduceShoutsNumber() {
            var oldLenght = privates.visibleShouts.length - api.getShoutsLimit();

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
            privates.$shoutBoxTextBox.value = '';
        }

        function OptionButton(optionName, defaultValue, api, $shoutBoxOptions) {
            var onClickCallback = null, offClickCallback = null, afterApplyCallback = null;
            var offLabel = null, onLabel = null, value = null, clickCount = 0;
            var id = 'shoutbox-option-' + optionName;
            var $button = $shoutBoxOptions
                .append('<div id="' + id + '" class="option"></div>')
                .find('#' + id)
                .click(function(event) {
                    value = !value;

                    clickCallback();

                    clickCount++;
                    api.setOptionValue(optionName, value);

                    if (afterApplyCallback !== null) {
                        afterApplyCallback(event);
                    }
                });

            return {
                setOffLabel: function(label) {
                    offLabel = label;
                    return this;
                },
                setOnLabel: function(label) {
                    onLabel = label;
                    return this;
                },
                setOnClickCallback: function(click) {
                    onClickCallback = click;
                    return this;
                },
                setOffClickCallback: function(click) {
                    offClickCallback = click;
                    return this;
                },
                setAfterApplyCallback: function(callback) {
                    afterApplyCallback = callback;
                    return this;
                },
                run: function() {
                    value = context.ifNullTakeDefault(api.getOptionValue(optionName), defaultValue);
                    clickCallback();
                    return this;
                }
            };

            function clickCallback() {
                if (value) {
                    onClickCallback(clickCount);
                } else {
                    offClickCallback(clickCount);
                }

                buildTile();
            }

            function buildTile() {
                var label = value ? offLabel : onLabel;

                $button.html('<a>' + label + '</a>');
            }
        }
    };
})(ShoutBox, jQuery);
