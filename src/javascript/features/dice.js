context.Parsers.register((function(){
    var matched;

    return {
        condition: function(metadata) {
            matched = metadata.message.match(/^&nbsp;\/k([0-9]+);=([0-9]+)/);

            return matched !== null;
        },
        action: function(metadata) {
            metadata.classes.push('shoutMeMessage');

            var dice = parseInt(matched[1], 10);
            var result = matched[2];

            if (dice === 2) {
                metadata.message = ' rzuca moneta ... wypada: ' + (result === '1' ? ' orzel' : 'reszka');
            } else {
                metadata.message = ' rzuca kostka k' + dice + ' ... wypadlo: ' + result;
            }

            metadata.message += '<span class="infobox">DICE ROLL</span>';
        }
    };
})());

context.HelpManager.register('/k&gt;ile&gt;', 'Rzuć kostką');
