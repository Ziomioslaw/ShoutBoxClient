context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
    var $shoutBox = view.getShoutBoxMainObject();
    var lastNewShoutNumber = 0;

    view.registerOption('sound', false)
        .setOnLabel('icon-volume-high', 'Włącz powiadomienia dźwiękowe')
        .setOffLabel('icon-volume-mute2', 'Wyłącz powiadomienia dźwiękowe')
        .setOnClickCallback(function(clickCount) {
            if (clickCount > 0) {
                playSomeSounds('sounds/gets-in-the-way.wav');
            }

            $shoutBox.on('shoutbox:view:notify', notifyHandler);
            $shoutBox.on('shoutbox:view:reset', resetHandler);
        })
        .setOffClickCallback(function() {
            $shoutBox.off('shoutbox:view:notify', notifyHandler);
            $shoutBox.off('shoutbox:view:reset', resetHandler);
        })
        .run();

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
    }

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
});
