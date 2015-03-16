
(function() {
    google.load('feeds', '1');
})();

var foodHelper = (function() {
 
  return {

    loadLandingFeeds: function() {
        
        container = document.getElementById("news-feeds-append-container")
        var landingNewsFeeds = ["http://feeds.reuters.com/news/economy", "http://www.accountancyage.com/feeds/rss/type/news", "http://feeds.reuters.com/reuters/globalmarketsNews", "http://feeds.bbci.co.uk/news/business/rss.xml?maxitems=-1"]
        feedCount = 0;

        for (var i = 0; i < landingNewsFeeds.length; i++) {
           var feed = new google.feeds.Feed(landingNewsFeeds[i]);
           feed.setNumEntries(3)
           loadThe(feed);
        };
        //PrivateMETHODS
        function loadThe(feed) {
            feed.load(function(result) {
               feedCount++;
               for (var i = 0; i < result.feed.entries.length; i++) {
                    var entry = result.feed.entries[i];
                     buildHtmlFrom(entry)
               };

               if (feedCount == 4) {
                  var newsEntries = $('#news-feeds-append-container').children()
                  newsEntries.each(function(index, newsEntry) {
                    $('#news-flash-container').append(newsEntry);
                  })
               };

            });//end of feed.Load
        };//END of PRIVATE METHOD
        function buildHtmlFrom(entry) {
              var storyLink = document.createElement("a");
              storyLink.appendChild(document.createTextNode(entry.title));
              storyLink.href = entry.link
              storyLink.setAttribute('target', '_blank')
              //var snippet = document.createElement("p");
              //txtNode = document.createTextNode(entry.contentSnippet || 'No-snippet')
              //snippet.appendChild(txtNode)
              //console.log(snippet)
              $(container).append(storyLink);

        };//END of PRIVATE METHOD

    },//END OF LOADLANDING METHOD

  };//END of return


})();


