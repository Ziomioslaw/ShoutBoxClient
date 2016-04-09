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
