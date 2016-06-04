context.ShoutBox = function ShoutBox(scripturl, userName, userId, sessionId, paramaters) {
    var privates = {
        version: '2.0.0',
        shoutBoxReference: this,
        actualShoutsCollections: null,
        lastShoutId: null,
        lastUserShoutId: null,
        storage: null,
        view: null,
        refreshManager: null,
        user: { Id: userId, Name: userName },
        timeServer: null,
        serverAPI: new DeveloperServerAPI(scripturl, sessionId)
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
        getConfigValue: function(name) {
            return configuration[name];
        },
        sendCommandToView: function() {
            var parameters = Array.prototype.slice.call(arguments);
            var command = parameters.shift();

            if (typeof privates.view[command] !== 'function') {
                throw new Error("Command '" + command + "' not exist in view");
            }

            return privates.view[command].apply(privates.view, parameters);
        },
        sendMessage: function(message) {
            var event = {
                wasChanged: false,
                origin: message,
                message: message,
                stop: false,
                cancel: false,
                api: api
            };

            try
            {
                context.BeforeSubmitManager.run(event);

                if (event.cancel) {
                    return event;
                }

                privates.refreshManager.cancel();

                event.promise = privates.serverAPI.addShout({
                        displayname: userName,
                        memberID: userId,
                        message: event.message,
                        sc: sessionId,
                    }).always(function() {
                        privates.refreshManager.start();
                    }).fail(function(e) {
                        displayException(e);
                    });

                return event;
            } catch(e) {
                displayException(e);
                return event;
            }
        },
        addInfoShout: function(text) {
            privates.view.addInfoShout(privates.timeServer.getNowTime(), text);
        },
        buildDeleteLink: function(shoutId) {
            return privates.serverAPI.buildDeleteLink(sessionId, shoutId);
        },
        buildProfileLink: function(memberId) {
            return privates.serverAPI.buildProfileLink(memberId);
        },
        buildLink: function(action) {
            return privates.serverAPI.buildActionLink(action);
        },
        deleteShout: function(shoutId) {
            try {
                privates.refreshManager.cancel();

                return privates.serverAPI
                    .deleteShout(shoutId)
                    .then(function() {
                        privates.refreshManager.start();
                    });
            } catch(e) {
                displayException(e);
            }
        },
        editLastUserMessage: function(find, replace) {
            try {
                if (privates.lastUserShoutId !== null) {
                    new Error('No last message to edit');
                }

                return privates.serverAPI
                    .editShout(privates.lastUserShoutId, find, replace)
                    .then(function() {
                        privates.refreshManager.start();
                    });
            } catch(e) {
                displayException(e);
            }
        },
        getUser: function() {
            return privates.user;
        },
        getShoutBoxInfoShoutNick: function() {
            return 'ShoutBox';
        }
    };

    return (function() {
        privates.view = new context[configuration.viewName](api);
        privates.storage = new context[configuration.storage]();
        privates.refreshManager = new IntervalCallback(intervalCallback, configuration.timeForRefresh);
        privates.timeServer = new context.TimeServer();
        privates.refreshManager.start();

        context.Features.run(api, privates.view);

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
            publicAPI: false,
            showNoviceWarning: true
        };

        if (paramaters) {
            addOptionIfExist('shoutsLimit', toInt);
            addOptionIfExist('publicAPI', toBoolean);
            addOptionIfExist('showNoviceWarning', toBoolean);
        }

        return configuration;

        function addOptionIfExist(name, convert) {
            if (paramaters.hasOwnProperty(name)) {
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
        try
        {
            if (!window.XMLHttpRequest) {
                throw new Error("Can't work -> window.XMLHttpRequest not exist");
            }

            return privates
                .serverAPI
                .getShouts(configuration.shoutsLimit)
                .then(function(shouts) {
                    parseAndSendShoutsToView(shouts);
                });
        } catch(e) {
            displayException(e);
        }
    }

    function parseAndSendShoutsToView(shouts) {
        var additional = [], deleted = [], editied = [];

        if (privates.actualShoutsCollections === null) {
            privates.actualShoutsCollections = shouts;
            shouts.forEach(saveYourLastMessageId);
        } else {
            compareCollection(privates.actualShoutsCollections,
                    shouts,
                    function (shout) { additional.push(shout); },
                    function (shout, oldShout) {
                        oldShout.new_message = shout.message;
                        editied.push(shout.id);
                    },
                    function (shout) { deleted.push(shout.id); }
                );
        }

        if (shouts.length > 0) {
            privates.lastShoutId = shouts[shouts.length -1].id;
        }

        privates.view.shouts(
                privates.actualShoutsCollections,
                additional,
                editied,
                deleted
            );

        privates.actualShoutsCollections = shouts;

        function compareCollection(olds, news, fadd, fedit, fdelete) {
            var indexOfOld = 0;
            var maxOlds = olds.length;
            var ignore = true;

            news.forEach(compareItem);
            olds.slice(indexOfOld).forEach(fdelete);

            function compareItem(newShout) {
                var oldShout;
                if (indexOfOld >= maxOlds) {
                    fadd(newShout);
                    return;
                }

                oldShout = olds[indexOfOld];
                if (oldShout.id === newShout.id) {
                    if (oldShout.edited === 0) {
                        if (oldShout.edited > 0) {
                            fedit(newShout, oldShout);
                        }
                    } else {
                        if (newShout.edited > oldShout.edited) {
                            fedit(newShout, oldShout);
                        }
                    }

                    indexOfOld++;
                } else if (oldShout.id < newShout.id) {
                    if (!ignore) {
                        fdelete(oldShout);
                    }

                    indexOfOld++;
                    compareItem(newShout);
                    return;
                }

                ignore = false;
                return;
            }
        }

        function saveYourLastMessageId(shout) {
            if (shout.memberId === userId) {
                privates.lastUserShoutId = shout.id;
            }
        }
    }

    function displayException(e) {
        var message;

        console.log("Exception", e);

        if (!e.stack) {
            console.log(e.stack);
        }

        if (typeof e === 'string') {
            message = e;
        } else {
            message = e.message;
        }

        privates.view.addErrorShout(privates.timeServer.getNowTime(), message);
    }
};
