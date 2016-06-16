context.Features.register(function(shoutboxAPI, view) {
    view
        .getShoutBoxMainObject()
        .on('dblclick', 'span.shoutMessage', function(e) {
            var selection = window.getSelection()
                || document.getSelection()
                || document.selection.createRange();

            var word = $.trim(selection.toString());
            if (word !== '') {
                view.replaceTextValue('/s/' + word + '/');
            }

            selection.collapse(selection.anchorNode, selection.anchorOffset);
            e.stopPropagation();
        });
});
