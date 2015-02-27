var foodHelper = (function() {
  
  return {

    loadLandingFeeds: function() {
          
        var landingNewsFeeds = ["http://feeds.reuters.com/news/economy", "http://www.accountancyage.com/feeds/rss/type/news", "http://feeds.reuters.com/reuters/globalmarketsNews", "http://feeds.bbci.co.uk/news/business/rss.xml?maxitems=-1"]
        landingNewsFeeds.forEach(loadFeed);

    },

  };

})();

function loadFeed(element, index, array) {
      
            
      var feed = new google.feeds.Feed(element);
      feed.setNumEntries(10)

      feed.load(function(result) {
          if (!result.error) {
              for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
                console.log(entry)

                if (entry.link.indexOf('bbc.co.uk') > -1) {
                     var container = document.getElementById("bbc-feed");
                     appendFeed(container, entry)
                } else {
                     var container = document.getElementById("more-feed");
                     appendFeed(container, entry)
                }
                
              };
          }
        
      });
};


function appendFeed(container, entry) {

      var storyLink = document.createElement("a");
      storyLink.appendChild(document.createTextNode(entry.title));
      storyLink.href = entry.link
      storyLink.setAttribute('target', '_blank')

      var snippet = document.createElement("p");
      if (entry.link.indexOf('account') > -1) {
           snippet.appendChild(document.createTextNode("No-snippet"))
      } else {
           snippet.appendChild(document.createTextNode(entry.contentSnippet))
      }

      container.appendChild(storyLink);
      container.appendChild(snippet);

};



