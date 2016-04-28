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
