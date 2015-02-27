
(function() {
    google.load('feeds', '1');
})();

var foodHelper = (function() {
  
  return {

    loadLandingFeeds: function() {
        
        bbcContainer = document.getElementById("bbc-feed")
        moreContainer = document.getElementById("more-feed")
        
        var landingNewsFeeds = ["http://feeds.reuters.com/news/economy", "http://www.accountancyage.com/feeds/rss/type/news", "http://feeds.reuters.com/reuters/globalmarketsNews", "http://feeds.bbci.co.uk/news/business/rss.xml?maxitems=-1"]
        
        for (var i = 0; i < landingNewsFeeds.length; i++) {
           var feed = new google.feeds.Feed(landingNewsFeeds[i]);
           feed.setNumEntries(10)
           loadAndAppend(feed);
        };

        function loadAndAppend(feed) {

            feed.load(function(result) {
              //console.log(result.feed.entries)
               for (var i = 0; i < result.feed.entries.length; i++) {
                   var entry = result.feed.entries[i];
                   if (entry.link.indexOf('bbc.co.uk') > -1) {
                         appendFeed(bbcContainer, entry)
                    } else {
                         appendFeed(moreContainer, entry)
                    }
                };
            });

        };

        function appendFeed(container, entry) {

              var storyLink = document.createElement("a");
              storyLink.appendChild(document.createTextNode(entry.title));
              storyLink.href = entry.link
              storyLink.setAttribute('target', '_blank')

              var snippet = document.createElement("p");

              txtNode = document.createTextNode(entry.contentSnippet || 'No-snippet')
              snippet.appendChild(txtNode)

              container.appendChild(storyLink);
              container.appendChild(snippet);

        };

    },

  };

//   function loadFeed(element, index, array) {
            
//       var feed = new google.feeds.Feed(element);
//       feed.setNumEntries(10)

//       feed.load(function(result) {
//           if (!result.error) {
//               for (var i = 0; i < result.feed.entries.length; i++) {
//                 var entry = result.feed.entries[i];

//                 if (entry.link.indexOf('bbc.co.uk') > -1) {
//                      var container = document.getElementById("bbc-feed");
//                      appendFeed(bbcContainer, entry)
//                 } else {
//                      var container = document.getElementById("more-feed");
//                      appendFeed(otherContainer, entry)
//                 }
                
//               };
//           }
        
//       });
// };


// function appendFeed(container, entry) {

//       var storyLink = document.createElement("a");
//       storyLink.appendChild(document.createTextNode(entry.title));
//       storyLink.href = entry.link
//       storyLink.setAttribute('target', '_blank')

//       var snippet = document.createElement("p");

//       txtNode = document.createTextNode(entry.contentSnippet || 'No-snippet')
//       snippet.appendChild(txtNode)

//       container.appendChild(storyLink);
//       container.appendChild(snippet);

// };

})();


