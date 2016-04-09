'use strict';
var ShoutBox = ShoutBox || {};

/**
 * Core ShoutBox object
 */
(function(context) {
    context.AdditionalFeatureManager = (function() {
        var register = [];

        return {
            register: function(name, feature, defaultOn) {
                feature.featureName = name;
                feature.defaultOn = defaultOn;
                register.push(feature);
            },
            run: function(shoutboxApi, view) {
                register.forEach(function(feature) {
                    var on = shoutboxApi.getOptionValue(feature.featureName);
                    if (on === null) {
                        on = feature.defaultOn;
                    }

                    if (on) {
                        feature(shoutboxApi, view);
                    }
                });
            }
        };
    })();

    context.BeforeSubmitManager = (function() {
        var registred = [];

        return {
            register: function(f) {
                registred.push(f);
            },
            call: function(event) {
                var origin = event.origin;
                for (var i = 0, max = registred.length; i < max; i++) {
                    event.origin = origin;
                    event.message = registred[i](event.message, event);
                    event.wasChanged = event.origin !== event.message;

                    if (event.stop) {
                        return;
                    }
                }
            }
        }
    })();

    context.AdditionalParser = (function() {
        var registred = [];

        return {
            register: function(f) {
                registred.push(f);
            },
            parse: function(metadata) {
                var parse = registred.find(function(parse) {
                    return parse.condition(metadata);
                });

                if (parse) {
                    parse.action(metadata);
                }
            }
        };
    })();

    context.ShoutBox = function ShoutBox(scripturl, userName, userId, sessionId, paramaters) {
        var privates = {
            version: '2.0.0',
            shoutBoxReference: this,
            actualShoutsCollections: null,
            lastShoutId: null,
            storage: null,
            view: null,
            user: { Id: userId, Name: userName }
        };
        var configuration = buildConfiguration(privates, paramaters);
        var api = {
            getVersion: function() {
                return privates.version;
            },
            getOptionValue: function(name) {
                return privates.storage.getValue(name);
            },
            setOptionValue: function(name, value) {
                privates.storage.setValue(name, value);
            },
            sendCommandToView: function() {
                var parameters = Array.slice(arguments);
                var command = parameters.shift();

                if (typeof privates.view[command] !== 'function') {
                    throw "Command '" + command + "' not exist in view";
                }

                return privates.view[command].apply(privates.view, parameters);
            },
            sendMessage: function(message) {
                var event = {
                    wasChanged: false,
                    origin: message,
                    message: message,
                    stop: false,
                    api: api
                };

                context.BeforeSubmitManager.call(event);

                if (!event.stop) {
                    $.post(scripturl + '?action=shout', {
                        qstr: scripturl + '?#shoutbox',
                        email: '',
                        displayname: userName,
                        memberID: userId,
                        message: event.message
                    });
                }

                return event;
            },
            buildDeleteLink: function(shoutId) {
                return scripturl + '?action=delete_shout;sesc=' + sessionId + ';sid=' + shoutId + '#shoutbox';
            },
            buildProfileLink: function(memberId) {
                return scripturl + '?action=profile;u=' + memberId;
            },
            getUser: function() {
                return privates.user;
            }
        };

        return (function() {
            privates.view = new context[configuration.viewName](api);
            privates.storage = new context[configuration.storage]();
            doAutoReload(api);

            context.AdditionalFeatureManager.run(api, privates.view);

            if (configuration.publicAPI) {
                context.API = api;
            }

            return api;
        })();

        function buildConfiguration(privates, paramaters) {
            var configuration = {
                shoutsLimit: 20,
                timeForRefresh: 10000,
                viewName: 'HTMLView',
                storage: 'PreferenceByLocalStorageManager',
                publicAPI: false
            };

            if (paramaters) {
                addOptionIfExist('shoutsLimit', toInt);
                addOptionIfExist('publicAPI', toBoolean);
            }

            return configuration;

            function addOptionIfExist(name, convert) {
                if (paramaters.hasOwnProperty('name')) {
                    configuration[name] = convert(paramaters[name]);
                }
            }

            function toBoolean(value) {
                return !!value;
            }

            function toInt(value) {
                return parseInt(value, 10);
            }
        }

        function doAutoReload() {
            if (!window.XMLHttpRequest) {
                throw "Can't work -> window.XMLHttpRequest not exist";
            }

            getXMLDocument(scripturl + '?action=shout_xml&limit=' + configuration.shoutsLimit + ';xml', function(XMLDoc) {
                parseAndSendShoutsToView(repackShouts(XMLDoc));
            });

            setRefresh();
        }

        function setRefresh(api) {
            setTimeout(function() {
                doAutoReload();
            }, configuration.timeForRefresh);
        }

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

        function parseAndSendShoutsToView(shouts) {
            var additional = [], deleted = [], editied = [];

            if (privates.actualShoutsCollections === null) {
                privates.actualShoutsCollections = shouts;
            } else {
                compearCollection(privates.actualShoutsCollections,
                        shouts,
                        function (shout) { additional.push(shout); },
                        function (shout) { editied.push(shout.id); },
                        function (shout) { deleted.push(shout.id); }
                    );
            }

            if (shouts.length > 0) {
                privates.lastShoutId = shouts[shouts.length -1].id;
            }

            privates.view.shouts(
                    privates.actualShoutsCollections,
                    additional,
                    deleted,
                    editied
                );

            privates.actualShoutsCollections = shouts;

            function compearCollection(olds, news, fadd, fedit, fdelete) {
                var indexOfOld = 0;
                var maxOlds = olds.length;
                var ignore = true;

                news.forEach(compearItem);

                function compearItem(newShout) {
                    var oldShout;
                    if (indexOfOld >= maxOlds) {
                        fadd(newShout);
                        return;
                    }

                    oldShout = olds[indexOfOld];
                    if (oldShout.id == newShout.id) {
                        if (oldShout.message != newShout.message) {
                            fedit(newShout);
                        }

                        indexOfOld++;
                    } else if (oldShout.id < newShout.id) {
                        if (!ignore) {
                            fdelete(oldShout);
                        }
                        indexOfOld++;
                        compearItem(newShout);
                        return;
                    }

                    ignore = false;
                    return;
                }
            }
        }
    };

    context.PreferenceByCookieManager = function() {
        var cookieName = 'ShoutBox';
        var preference = null;

        return {
            getValue: function(name) {
                if (!preference) {
                    load();
                }

                return preference[name];
            },
            setValue: function(name, value) {
                preference[name] = value;
                save();
            }
        };

        function load() {
            var cookieValue = $.cookie(cookieName), tmp;

            if (typeof cookieValue != 'undefined') {
                tmp = JSON.parse(cookieValue);
                if (!!tmp) {
                    preference = tmp;
                    return;
                }
            }

            preference = {
                title: true,
                sound: false,
                favicon: false
            };
        }

        function save() {
            var json = JSON.stringify(preference);
            $.cookie(cookieName, json);
        }
    }

    context.PreferenceByLocalStorageManager = function() {
        var prefix = 'shoutbox:';

        return {
            getValue: function(name) {
                var value = window.localStorage.getItem(prefix + name);
                if (value === null) {
                    return null;
                }

                if (isFinite(value)) {
                    return parseInt(value, 10);
                }

                return value;
            },
            setValue: function(name, value) {
                if (typeof value === "boolean") {
                    value = value ? 1 : 0;
                }

                window.localStorage.setItem(prefix + name, value);
            }
        };
    }
})(ShoutBox);

/**
 * HTML View
 */
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

/**
 * Parse additions: Dice
 */
(function(context) {
    context.AdditionalParser.register((function(){
        var matched;

        return {
            condition: function(metadata) {
                matched = metadata.message.match(/^&nbsp;\/k([0-9]+);=([0-9]+)/);
                return matched !== null;
            },
            action: function(metadata) {
                metadata.classes.push('shoutMeMessage');

                var dice = matched[1];
                var result = matched[2];

                if (dice == 2) {
                    metadata.message = ' rzuca moneta ... wypada: ' + (result == 1 ? ' orzel' : 'reszka');
                } else {
                    metadata.message = ' rzuca kostka k' + dice + ' ... wypadlo: ' + result;
                }
            }
        };
    })());
})(ShoutBox);

/**
 * Buttons handlers
 */
(function(context) {
    context.AdditionalFeatureManager.register('emoticonPanel', shoutBoxEmoticonBox, true);
    context.AdditionalFeatureManager.register('readAllButton', shoutBoxAllShoutReadButton, true);
    context.AdditionalFeatureManager.register('deleteButton', addBeforeDeleteMessage, true);
    context.AdditionalFeatureManager.register('nicksButton', shoutAuthorsNicksToButton, true);

    function shoutBoxEmoticonBox(shoutboxAPI, view) {
        var labelEmoticonPanelOn = 'Pokaż emotikony';
        var labelEmoticonPanelOff = 'Schowaj emotikony';
        var emoticonPanelBox = $('#shoutbox-emoticons-box')
        var emoticonPanelButton = $('#shoutEmoticonsPanel');
        var optionName = 'emoticons';
        var emoticonPanelOn = shoutboxAPI.getOptionValue(optionName);

        emoticonBox(emoticonPanelOn);

        emoticonPanelBox.find('img').on('click', function(event) {
            var code = $(event.target).data('code');

            view.addTextValue(code);
            event.preventDefault();
            return;
        });

        emoticonPanelButton.click(function() {
            emoticonPanelOn = !emoticonPanelOn;
            emoticonBox(emoticonPanelOn);
            shoutboxAPI.setOptionValue(optionName, emoticonPanelOn);
        });

        function emoticonBox(show) {
            if (show) {
                emoticonPanelBox.show();
                emoticonPanelButton.html(labelEmoticonPanelOff);
            } else {
                emoticonPanelBox.hide();
                emoticonPanelButton.html(labelEmoticonPanelOn);
            }
        }
    }

    function shoutBoxAllShoutReadButton(shoutboxAPI) {
        $('#shoutboxButtonSetAllShoutsRead').click(function() {
            shoutboxAPI.sendCommandToView('markAllShoutsAsRead');
        });
    }

    function addBeforeDeleteMessage(shoutboxAPI, view) {
        view.getShoutBoxMainObject().on('click', 'a.shoutDeleteButton', function(event) {
            if (confirm('Na pewno chcesz usunąć ten shout?')) {
                // Allow to default action
                return;
            }

            event.preventDefault();
            return false;
        });
    }

    function shoutAuthorsNicksToButton(shoutboxAPI, view) {
        var shoutbox = view.getShoutBoxMainObject();

        shoutbox.on('click', '.shoutNick > a', function(event) {
            view.addTextValue('@' + event.target.innerHTML + ': ');

            event.preventDefault();
            return false;
        });
    }

    /*
    // Edit feature (not finished)
    /*/
    function editFunctionality(shoutboxAPI, view) {
        privates.$shoutBoxTextBox.keypress(function(event) {
            if (event.keyCode !== 38) {
                    return;
            }

            var text = $.trim($('div#shout_' + privates.lastUserMessage + ' span.shoutMessage').text());
        });
    }
})(ShoutBox);

/**
 * Shoutbox Anchor
 */
(function(context) {
    context.AdditionalFeatureManager.register('anchor', shoutBoxAnchorManager, true);

    function shoutBoxAnchorManager(shoutboxAPI, view) {
        var anchorText = 'Zahacz Shoutboksa';
        var unanchorText = 'Odhacz Shoutboksa';
        var $button = $('#shoutboxAnchorUnanchorButton');
        var $shoutbox = view.getShoutBoxMainObject();
        var textEdit = view.getShoutBoxEditorObject();

        setButtonLabel();
        $button.click(buttonClick);
        $shoutbox.on('shoutbox:view:refresh', viewRefresh);

        function checkShoutBoxAnchored() {
            return window.location.hash === '#shoutbox';
        }

        function buttonClick() {
            if (checkShoutBoxAnchored()) {
                 window.history.pushState('', document.title, window.location.pathname);
            } else {
                 window.location.hash = '#shoutbox';
            }

            setButtonLabel();
            return false;
        }

        function setButtonLabel() {
            $button.html(checkShoutBoxAnchored() ? unanchorText : anchorText);
        }

        function viewRefresh(e) {
            if (checkShoutBoxAnchored()) {
                textEdit.focus();
            }
        }
    }
})(ShoutBox);

/**
 * Text modifiers
 */
(function(context) {
    context.BeforeSubmitManager.register(versionPrint);
    context.BeforeSubmitManager.register(toLongLinkShorter);

    function versionPrint(shout, event) {
        var versionText = 'Wersja Shoutboksa';

        if (shout === '/v') {
            shout = '<div><span>' + versionText + ': ' + event.api.getVersion() + '</span></div>';

            event.stop = true;
        }

        return shout;
    }

    function toLongLinkShorter(shout, event) {
        var maxAllowedLinkLength = 80;
        var links = shout.match(/(\[url=)?https?:\/\/[^ ]+/ig);

        if (links !== null && links.length > 0) {
            links.forEach(function(link) {
                if (link.substring(0,5) !== '[url=' && link.length > maxAllowedLinkLength) {
                    shout = shout.replace(link, '[url=' + link + ']' + link.substring(0, maxAllowedLinkLength) + '(...)[/url]');
                }
            });
        }

        return shout;
    }
})(ShoutBox);

/**
 * Sound Notificator
 */
(function(context) {
    var lastNewShoutNumber = 0;

    context.AdditionalFeatureManager.register('soundButton', function(shoutboxAPI, view) {
        var button = $('#shoutSoundNotifier');
        var soundOn = shoutboxAPI.getOptionValue('sound');
        var $shoutBox = view.getShoutBoxMainObject();

        button.click(function() {
            soundOn = !soundOn;
            if (soundOn) {
                playSomeSounds('sounds/gets-in-the-way.wav');
            }

            turnOffOn(soundOn);
            shoutboxAPI.setOptionValue('sound', soundOn);
        });

        turnOffOn(soundOn);

        function turnOffOn(isOn) {
            if (isOn) {
                $shoutBox.on('shoutbox:view:notify', notifyHandler);
                $shoutBox.on('shoutbox:view:reset', resetHandler);
                button.html('Wyłącz powiadomienia dźwiękowe');
            } else {
                $shoutBox.off('shoutbox:view:notify', notifyHandler);
                $shoutBox.off('shoutbox:view:reset', resetHandler);
                button.html('Włącz powiadomienia dźwiękowe');
            }
        }
    }, true);

    function resetHandler(event) {
        lastNewShoutNumber = 0;
    }

    function notifyHandler(event) {
        var newShouts = event.newShouts;
        var newShoutsForUser = event.newShoutsForUser;

        if (newShouts > 0 && lastNewShoutNumber < newShouts) {
            if (newShoutsForUser > 0) {
                playSomeSounds('sounds/job-done.wav');
            } else {
                playSomeSounds('sounds/gets-in-the-way.wav');
            }

            lastNewShoutNumber = newShouts;
        }
    };

    function playSomeSounds(soundPath) {
        var trident = !!navigator.userAgent.match(/Trident\/7.0/);
        var net = !!navigator.userAgent.match(/.NET4.0E/);
        var IE11 = trident && net;
        var IEold = !!navigator.userAgent.match(/MSIE/i);
        if (IE11 || IEold) {
            document.all.sound.src = soundPath;
        } else {
            // buffers automatically when created
            var snd = new Audio(soundPath);
            snd.play();
        }
    }
})(ShoutBox);

/**
 * Document Title Notificator
 */
(function(context) {
    context.AdditionalFeatureManager.register('documentNotification', documentNotification, true);

    function documentNotification(shoutBoxAPI, view) {
        var oryginalPageTitle = document.title;
        var $shoutBox = view.getShoutBoxMainObject();

        $shoutBox.on('shoutbox:view:notify', function(event) {
            var newShouts = event.newShouts;
            var newShoutsForUser = event.newShoutsForUser;
            var result = oryginalPageTitle;

            if (newShouts > 0) {
                result = '(' + newShouts + ') ' + result;
            }

            if (newShoutsForUser > 0) {
                result = '(' + newShoutsForUser + '!) ' + result;
            }

            document.title = result;
        });

        $shoutBox.on('shoutbox:view:reset', function() {
            document.title = oryginalPageTitle;
        });
    }
})(ShoutBox);

/**
 * Notifiers
 */
(function(context) {
    context.AdditionalFeatureManager.register('faviconNotifier', faviconPainterNotifier, false);

    function faviconPainterNotifier(shoutBoxAPI, view) {
        var $shoutBox = view.getShoutBoxMainObject();

        $shoutBox.on('shoutbox:view:notify', function(event) {
            var newShouts = event.newShouts;
            var newShoutsForUser = event.newShoutsForUser;

            if (newShouts > 0) {
                $.faviconNotify('/favicon.ico', newShouts, newShoutsForUser, 'br', '#123456', '#FFD700');
            }
        });

        $shoutBox.on('shoutbox:view:reset', function() {
            $.faviconNotify('/favicon.ico');
        });
    }
})(ShoutBox);
