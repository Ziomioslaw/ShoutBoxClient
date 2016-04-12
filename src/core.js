'use strict';
var ShoutBox = ShoutBox || {};

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

                    if (event.stop || event.cancel) {
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
            refreshManager: null,
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
                var event = prepearMessage(message);
                if (event.cancel) {
                    return event;
                }

                privates.refreshManager.cancel();

                return $.post(scripturl + '?action=shout', {
                    qstr: scripturl + '?#shoutbox',
                    displayname: userName,
                    memberID: userId,
                    message: event.message,
                    sc: sessionId,
                }).then(function() {
                    privates.refreshManager.start();
                });
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
            privates.refreshManager = new IntervalCallback(intervalCallback, configuration.timeForRefresh);
            privates.refreshManager.start();

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

        function intervalCallback() {
            if (!window.XMLHttpRequest) {
                throw "Can't work -> window.XMLHttpRequest not exist";
            }

            getXMLDocument(scripturl + '?action=shout_xml&limit=' + configuration.shoutsLimit + ';xml', function(XMLDoc) {
                parseAndSendShoutsToView(repackShouts(XMLDoc));
            });
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

        function prepearMessage(message) {
            var event = {
                wasChanged: false,
                origin: message,
                message: message,
                stop: false,
                cancel: false,
                api: api
            };

            context.BeforeSubmitManager.call(event);

            return event;
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

    function IntervalCallback(callback, delay) {
        var idInterval = null;

        return {
            start: function() {
                callback();
                idInterval = setInterval(callback, delay);
            },
            cancel: function() {
                clearInterval(idInterval);
                idInterval = null;
            }
        };
    }

})(ShoutBox);
