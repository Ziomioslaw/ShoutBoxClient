context.AdditionalFeatureManager.register(function(shoutboxAPI, view) {
    if (!shoutboxAPI.getConfigValue('showNoviceWarning')) {
        return;
    }

    $('<p>Pytania dotyczące GIMP-a, tutoriali i programów graficznych prosimy zadawać w odpowiednich działach forum. Shoutbox z założenia służy do rozmów towarzyskich, jednak w razie potrzeby możesz zapytać o sprawy związane z odnalezieniem się na forum, jak np. wybranie właściwego działu dla swojego problemu itp.</p>')
        .insertAfter(view.getShoutFormObject());
});
