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
