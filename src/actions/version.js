(function(context) {
   context.BeforeSubmitManager.register(versionPrint);

   function versionPrint(shout, event) {
       var versionText = 'Wersja Shoutboksa';

       if (shout === '/v') {
           shout = '<div><span>' + versionText + ': ' + event.api.getVersion() + '</span></div>';

           event.stop = true;
       }

       return shout;
   }
})(ShoutBox);
