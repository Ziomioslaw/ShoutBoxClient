(function(context) {
   context.BeforeSubmitManager.register(toLongLinkShorter);

   function toLongLinkShorter(shout, event) {
       var maxAllowedLinkLength = 80;
       var links = shout.match(/(\[url=)?https?:\/\/[^ ]+/ig);

       if (links !== null && links.length > 0) {
           links.forEach(function(link) {
               if (link.substring(0,5) !== '[url=' && link.length > maxAllowedLinkLength) {
                   shout = shout.replace(link, '[url=' + link + ']' + link.substring(0, maxAllowedLinkLength) + '(...)[/url]');
               }
           });
       }

       return shout;
   }
})(ShoutBox);
