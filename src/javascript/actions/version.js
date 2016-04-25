(function(context) {
   context.BeforeSubmitManager.register(versionPrint);

   function versionPrint(shout, event) {
       var versionText = 'Wersja Shoutboksa';

       if (shout === '/v') {
           event.api.addInfoShout(versionText + ': ' + event.api.getVersion());

           event.stop = true;
           event.cancel = true;
       }

       return shout;
   }
})(ShoutBox);
