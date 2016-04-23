(function(context, $) {
    context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
        var emoticonPanelBox = $('<div id="shoutbox-emoticons-box"></div>');

        emoticonPanelBox
            .insertAfter(view.getShoutFormObject())
            .html(buildEmoticonsButtons([
                    { label: 'Uśmiech', file: 'smiley.gif', code: ':)' },
                    { label: 'Mrugnięcie', file: 'wink.gif', code: ';)' },
                    { label: 'Chichot', file: 'grin.gif', code: ':D' },
                    { label: 'Duży uśmiech', file: 'cheesy.gif', code: ';D' },
                    { label: 'Zły', file: 'angry.gif', code: '>:(' },
                    { label: 'Smutny', file: 'sad.gif', code: ':(' },
                    { label: 'Cool', file: 'cool.gif', code: '8-)' },
                    { label: 'Co?', file: 'huh.gif', code: '???' },
                    { label: 'Język', file: 'tongue.gif', code: ':P' },
                    { label: 'Zawstydzony', file: 'embarrassed.gif', code: ':-[' },
                    { label: 'Buzia na kłódkę', file: 'lipsrsealed.gif', code: ':-X' },
                    { label: 'Niezdecydowany', file: 'undecided.gif', code: ':-\\' },
                    { label: 'Skwaszony', file: 'sour.gif', code: ';/' },
                    { label: 'Płacz', file: 'cry.gif', code: ':\'(' },
                    { label: 'Zły', file: 'evil.gif', code: '>:D' },
                    { label: 'Uśmiech 2', file: 'anz.gif', code: '^^' },
                    { label: 'Lime Point', file: 'limegreen-1.png', code: '[lp]' },
                    { label: 'Orange Point', file: 'orange-1.png', code: '[op]' },
                    { label: 'Serce', file: 'heart.gif', code: ':heart:' },
                    { label: 'Śmiech', file: 'laugh.gif', code: ':laugh:' },
                    { label: 'Ninja', file: 'ninja.gif', code: ':ninja:' },
                    { label: 'Anioł', file: 'angel.gif', code: ':angel:' },
                    { label: 'Wilber', file: 'wilber.png', code: '<wilber>' },
                    { label: 'wilber2', file: 'wilber2.png', code: ':wilber2:' },
                    { label: 'Zdziwienie', file: 'zdziwko.gif', code: ':zdziwko:' },
                    { label: 'Twój pomysł jest słaby', file: 'facepalm.gif', code: '<facepalm>' },
                    { label: 'Powtórz proszę', file: 'what.gif', code: '<what?>' },
                    { label: 'Wampir', file: 'vamp.gif', code: '<vamp>' }
                ]))
            .find('img')
                .on('click', function(event) {
                    var code = $(event.target).data('code');

                    view.addTextValue(code);
                    event.preventDefault();
                    return;
                });

        view.registerOption('emoticons', true)
            .setOnLabel('Pokaż emotikony')
            .setOffLabel('Schowaj emotikony')
            .setOnClickCallback(function() {
                emoticonPanelBox.show();
            })
            .setOffClickCallback(function() {
                emoticonPanelBox.hide();
            })
            .run();

        function buildEmoticonsButtons(emoticons) {
            return emoticons.reduce(function(prev, actual) {
                return prev + '<img alt="' + actual.label + '" src="http://www.gimpuj.info/Smileys/sc_kwart/' + actual.file + '" data-code="' + actual.code + '">\n';
            }, '');
        }
    });
})(ShoutBox, jQuery);
