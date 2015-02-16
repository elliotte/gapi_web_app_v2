$(document).ready(function() {

  $('#disconnect').click(helper.disconnectServer);
  
});

function onSignInCallback(authResult) {

   var route = window.location.href 
   if (route.indexOf("circle") > -1) {
      teamHelper.onSignInCallback(authResult);
   } else {
      helper.onSignInCallback(authResult);
   };
};


(function() {
  var po = document.createElement('script');
  po.type = 'text/javascript'; po.async = true;
  po.src = 'https://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
})();

var helper = (function() {
  var authResult = undefined;
  var user_google_id = "";
  var taskListsCount = 0;
  var taskCompletedCount = 0;
  var taskPendingCount = 0;

  return {
    /**
    * Hides the sign-in button and connects the server-side app after
    * the user successfully signs in.
    */
    onSignInCallback: function(authResult) {
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        helper.connectServer();
        // After loading the Google+ API, render the profile data from Google+.
        gapi.client.load('plus','v1', this.renderProfile);
        helper.loadBBCFeed();
        helper.loadGoogleSourcedFeeds();

      } else if (authResult['error']) {
        // The user is not signed in.
        console.log('There was an error: ' + authResult['error']);
        $('#authOps').hide('slow');
        $('#gConnect').show();
        $('#share-button').hide();
      }
      console.log('authResult', authResult);
    },
    /**
     * Retrieves and renders the authenticated user's Google+ profile.
     */
    renderProfile: function() {
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
        $('#circle_user_id').val(profile.id);
        user_google_id = profile.id;
        email = profile.emails[0].value
        $.ajax({
          type: 'POST',
          url: '/signin/save_user',
          data: {id: profile.id, email: email },
          success: function(result) {
            helper.calendar();
            helper.files();
            //loads tasks after tasklist
            helper.task_lists();
            //loads memberCircles after circles
            helper.circles();
          }
        });

        $('#profile').empty();
        if (profile.error) {
          $('#profile').append(profile.error);
          return;
        }
        if (profile.gender == "male") {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-male"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                    '<p><img src="' + profile.cover.coverPhoto.url + '"></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-male"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        } else {
          if (profile.cover && profile.cover.coverPhoto) {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-female"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                    '<p><img src="' + profile.cover.coverPhoto.url + '"></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          } else {
            $('#profile').append(
              '<div class="col-md-12">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-female"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<h3><a href="' + profile.url + '" target="_blank">' + profile.displayName + '</a></h3>'+
                    '<p><a href="' + profile.url + '" target="_blank"><img src="' + profile.image.url + '"></a></p>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
          }
        }
      });
      $('#authOps').show('slow');
      $('#gConnect').hide();
      $('#share-button').show();
    },
    /**
     * Calls the server endpoint to disconnect the app for the user.
     */
    disconnectServer: function() {
      // Revoke the server tokens
      $.ajax({
        type: 'POST',
        url: '/signin/disconnect',
        async: false,
        success: function(result) {
          console.log('revoke response: ' + result);
          $('#authOps').hide();
          $('#gConnect').show();
          $('#share-button').hide();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },
    /**
     * Calls the server endpoint to connect the app for the user.
     */
    connectServer: function() {
      console.log(this.authResult.code);
      $.ajax({
        type: 'POST',
        url: '/signin/connect?state=' + $("#state").text(),
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {

        },
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token
      });
    },

    loadGoogleSourcedFeeds: function() {
        var feed = new google.feeds.Feed("http://feeds.reuters.com/news/economy");
        feed.setNumEntries(10)
        feed.load(function(result) {
        if (!result.error) {
          var container = document.getElementById("more-feed");
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var storyLink = document.createElement("a");
            var snippet = document.createElement("p");
            storyLink.appendChild(document.createTextNode(entry.title));
            snippet.appendChild(document.createTextNode(entry.contentSnippet))
            storyLink.href = entry.link
            storyLink.setAttribute('target', '_blank')
            container.appendChild(storyLink);
            container.appendChild(snippet);
            }
          }
        });
        var feed = new google.feeds.Feed("http://www.accountancyage.com/feeds/rss/type/news");
        feed.setNumEntries(10)
        feed.load(function(result) {
        if (!result.error) {
          var container = document.getElementById("more-feed");
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var storyLink = document.createElement("a");
            var snippet = document.createElement("p");
            storyLink.appendChild(document.createTextNode(entry.title));
            snippet.appendChild(document.createTextNode(entry.publishedDate))
            storyLink.href = entry.link
            storyLink.setAttribute('target', '_blank')
            container.appendChild(storyLink);
            container.appendChild(snippet);
            }
          }
        });
        var feed = new google.feeds.Feed("http://feeds.reuters.com/reuters/globalmarketsNews");
        feed.setNumEntries(10)
        feed.load(function(result) {
        if (!result.error) {
          var container = document.getElementById("more-feed");
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var storyLink = document.createElement("a");
            var snippet = document.createElement("p");
            storyLink.appendChild(document.createTextNode(entry.title));
            snippet.appendChild(document.createTextNode(entry.contentSnippet))
            storyLink.href = entry.link
            storyLink.setAttribute('target', '_blank')
            container.appendChild(storyLink);
            container.appendChild(snippet);
            }
          }
        });
    },
    
    loadBBCFeed: function() {
      var feed = new google.feeds.Feed("http://feeds.bbci.co.uk/news/business/rss.xml?maxitems=-1");
        feed.setNumEntries(20)
        feed.load(function(result) {
        if (!result.error) {
          var container = document.getElementById("bbc-feed");
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var storyLink = document.createElement("a");
            var snippet = document.createElement("p");
            storyLink.appendChild(document.createTextNode(entry.title));
            snippet.appendChild(document.createTextNode(entry.contentSnippet))
            storyLink.href = entry.link
            storyLink.setAttribute('target', '_blank')
            container.appendChild(storyLink);
            container.appendChild(snippet);
            }
          }
        });
    },

    /**
     * Calls the server endpoint to get the list of events in calendar.
     */
    calendar: function() {
      $.ajax({
        type: 'GET',
        url: '/calendars/primary/events',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendCalendar(result);
        },
        processData: false
      });
    },

    /**
     * Calls the server endpoint to get the list of files in google drive.
     */
    files: function() {
      $.ajax({
        type: 'GET',
        url: '/files',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendDrive(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the task lists.
     */
    task_lists: function() {
      $.ajax({
        type: 'GET',
        url: '/task_lists',
        contentType: 'application/octet-stream; charset=utf-8',
        async: false,
        success: function(result) {
          console.log(result);
          helper.appendTaskLists(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the list of tasks.
     */
    tasks: function(taskListId) {
      $.ajax({
        type: 'GET',
        url: '/task_lists/' + taskListId + '/tasks',
        contentType: 'application/octet-stream; charset=utf-8',
        async: false,
        success: function(result) {
          console.log(result);
          helper.appendTasks(result, taskListId);
        },
        processData: false
      });
    },
    /**
     * Get Circles from DB.
     */
    circles: function() {
      $.ajax({
        type: 'GET',
        url: '/circles',
        dataType: 'json',
        contentType: 'application/json',
        data: {user_google_id: user_google_id},
        success: function(result) {
          helper.appendCircles(result);
          helper.team_member_circles();
          helper.setStorage('circles', result)
        }
      });
    },

    team_member_circles: function() {
      $.ajax({
        type: 'GET',
        url: '/circles/user_team_member_circles',
        dataType: 'json',
        contentType: 'application/json',
        data: {user_google_id: user_google_id},
        success: function(result) {
          //helper.setStorage('userMemberCircles', result)
          helper.appendMemberCircles(result);
          helper.setStorage('memberCircles', result)
        }
      });
    },

    loadFileShare: function(button) {
      link = $(button).data('href');
      var shareButton = '<script src="https://apis.google.com/js/platform.js" async defer></script>'+'<div class="g-plus" data-action="share" data-href="'+link+'" data-annotation="none" data-height="15"></div>'
      container = $(button).parent();
      $(container).append(shareButton);
    },

    setStorage: function(key, result) {
      localStorage.setItem(key, JSON.stringify(result));
    },
    /**
     * Displays circles retrieved from DB.
     */
    appendCircles: function(circles) {
      var circleCount = 0;
      $('#monea-teams').empty();
      $('#monea-teams').show();
      for (var c in circles) {
        circleCount++;
        circle = circles[c];
        $('#monea-teams').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-users"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3>' + '<a style="color:#e10707;" href="/circles/' + circle.id + '">' + circle.display_name + '</a>' + '</h3>' +
                '<p>' + circle.description +
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
      if(circleCount==0){
        $('#noCircle').show();
      }
    },


    appendMemberCircles: function(circles) {
      var circleCount = 0;
      for (var c in circles) {
        circleCount++;
        circle = circles[c];
        
        $('#monea-teams').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-users"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3>' + '<a style="color:#e10707;" href="/circles/' + circle.circle_id + '">' + circle.circle_id + '</a>' + '</h3>' +
                '<p>teamMember circle</p>'+
              '</div>'+
            '</div>'+
          '</div>'

        );
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      var calendarCount = 0;
      $('#calendarEvent').empty();
      console.log(events.items.length)
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        calendarCount++;
        $('#calendarEvent').show();
        if(event.hangoutLink) {
          $('#calendarEvent').append(
            '<div id="'+ event.id +'" class="col-md-3">'+
              '<div class="feature-box-style2">'+
                '<div class="feature-box-title">'+
                  '<i class="fa fa-calendar"></i>'+
                '</div>'+
                '<div class="feature-box-containt" style="height:250px; overflow:scroll;">'+
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<p>' + event.description + '</p>'+
                  '<p>'+
                    ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy"><i class="fa fa-trash-o"><i></a>'+
                    ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '"><i class="fa fa-edit"></i></a>'+
                    ' <a class="btn btn-primary" href="' + event.hangoutLink + '" target="_blank">Hangout</a>'+
                  '</p>'+
                '</div>'+
              '</div>'+
            '</div>'
          );
        } else {
          $('#calendarEvent').append(
            '<div id="'+ event.id +'" class="col-md-3">'+
              '<div class="feature-box-style2">'+
                '<div class="feature-box-title">'+
                  '<i class="fa fa-calendar"></i>'+
                '</div>'+
                '<div class="feature-box-containt" style="max-height:250px; overflow:scroll;">'+
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<p>' + event.description + '</p>'+
                  '<p>'+
                    ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy"><i class="fa fa-trash-o"></i></a>'+
                    ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '"><i class="fa fa-edit"></i></a>'+
                  '</p>'+
                '</div>'+
              '</div>'+
            '</div>'
          );
        }
      }
      if(calendarCount == 0){
        $('#noCalendarEvent').show();
      }
    },
    /**
     * Displays available files in drive retrieved from server.
     */
    appendDrive: function(drive) {
      var fileCount = 0;
      var countShared = 0;

      $('#driveFiles').empty();
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        var container = "";
        $('#driveFiles').show();
        $('#shared-driveFiles').show();
        if(!item.explicitlyTrashed) {

          if(item.thumbnailLink) {
              containerInstance = "";
              if(item.sharingUser) {
                  container = $('#shared-driveFiles')
                  containerInstance = "shared";
                  countShared++;
                  if(countShared%4 == 1) {
                    container.append('<div class="row">');
                  }
              } else {
                  container = $('#driveFiles')
                  containerInstance = "user";
                  fileCount++;
                  if(fileCount%4 == 1) {
                    container.append('<div class="row">');
                  }
              };

              container.append(
               '<div class="col-md-3">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-file-text"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<p>Owner: '+ item.ownerNames[0] + '</p>'+
                    '<h3>'+
                      '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                      '<ul class="project-details">'+
                        '<li>'+
                          '<img src="' + item.thumbnailLink + '" alt="screen" style="width: 100px;height: 75px;"/>'+
                        '</li>'+
                      '</ul>'+
                    '</h3>'+
                    '<p>'+
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy"><i class="fa fa-trash-o"></i></a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy"><i class="fa fa-copy"></i></a>'+
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show"><i class="fa fa-comment-o"></i></a>'+
                    '</p>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/share">Teams.share</a>'+
                      ' <a class="btn btn-sm btn-primary" onclick="helper.loadFileShare(this)" data-href="'+item.alternateLink+'">Users.share</a>'+
                    '</p>'+
                    //appends after this code block..
                    '<div id="export-links-' + item.id + '"></div>'+
                  '</div>'+
                '</div>'+

              '</div>'
            );
            if(item.exportLinks){
              var st = "#export-links-"+item.id
              $(st).html(
                'Export: '
              );
              Object.keys(item.exportLinks).forEach(function(key) {
                $(st).append(
                  '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                );
              });
            }
            if (containerInstance == "shared") {
                if(countShared%4 == 0) {
                  $('#shared-driveFiles').append('</div>');
                }
            }
            if (containerInstance == "user") {
                if(fileCount%4 == 0) {
                  $('#driveFiles').append('</div>');
                }
            };
            
          } else {
            
            containerInstance = "";
              if(item.sharingUser) {
                  container = $('#shared-driveFiles')
                  containerInstance = "shared";
                  countShared++;
                  if(countShared%4 == 1) {
                    container.append('<div class="row">');
                  }
              } else {
                  container = $('#driveFiles')
                  containerInstance = "user";
                  fileCount++;
                  if(fileCount%4 == 1) {
                    container.append('<div class="row">');
                  }
              };

            container.append(
              '<div class="col-md-3">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-folder"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<p>Owner: '+ item.ownerNames[0] + '</p>'+
                    '<h3>'+
                      '<a href="' + item.alternateLink + '" target="_blank">' + item.title + '</a>'+
                      '<ul class="project-details">'+
                        '<li>'+
                          '<img src="' + item.iconLink + '" alt="screen"/>'+
                        '</li>'+
                      '</ul>'+
                    '</h3>'+
                    '<p>'+
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy"><i class="fa fa-trash-o"></i></a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy"><i class="fa fa-copy"></i></a>'+
                      ' <a class="btn btn-sm btn-main-0" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show"><i class="fa fa-comment-o"></i></a>'+
                    '</p>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/share">Teams.share</a>'+
                      ' <a class="btn btn-sm btn-primary" onclick="helper.loadFileShare(this)" data-href="'+item.alternateLink+'">Users.share</a>'+
                    '</p>'+
                    '<div id="export-links-' + item.id + '"></div>'+
                  '</div>'+
                '</div>'+
              '</div>'
            );
            if(item.exportLinks){
              var st = "#export-links-"+item.id
              $(st).html(
                'Export: '
              );
              Object.keys(item.exportLinks).forEach(function(key) {
                $(st).append(
                  '<a class="capitalize" href="' + item.exportLinks[key] + '" target="_blank">' + item.exportLinks[key].substring(item.exportLinks[key].lastIndexOf("=")+1,item.exportLinks[key].length) + '</a> '
                );
              });
            }
            
            if (containerInstance == "shared") {
                if(countShared%4 == 0) {
                  $('#shared-driveFiles').append('</div>');
                }
            }
            if (containerInstance == "user") {
                if(fileCount%4 == 0) {
                  $('#driveFiles').append('</div>');
                }
            }

          }
        }
      }
      if(fileCount == 0){
        $('#noDriveFiles').show();
      }

    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      for (var taskListIndex in taskLists.items) {
        taskListsCount++;
        $('#taskLists').show();
        taskList = taskLists.items[taskListIndex];
        $('#task_list_id').val(taskList.id);
        $('#taskLists').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-tasks"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3>' + taskList.title + '</h3>' +

                '<p>' + ' <a id="create-task-list-to-do" class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/tasks/new">Task.new</a>' +
                  
                '<p>'+
                  ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/destroy"><i class="fa fa-trash-o"></i></a>'+
                  ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '"><i class="fa fa-edit"></i></a>'+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        helper.tasks(taskList.id);
      }
      if(taskListsCount == 0){
        $('#noTaskLists').show();
      }
      if(taskCompletedCount == 0 && taskPendingCount == 0){
        $('#noTasks').show();
      }
    },
    /**
     * Displays available Tasks in Task List retrieved from server.
     */
    appendTasks: function(tasks, taskListId) {
      for (var taskIndex in tasks.items) {
        task = tasks.items[taskIndex];
        if(task.title.lastIndexOf("[") >= 0) {
          if (task.status == "completed" && task.completed) {
            taskCompletedCount++;
            $('#completedTasks').show();
            $('#tasksCompleted').append(
              '<div id=' + task.id + '>' +
                '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                '</p>' +
              '</div>'
            );
          } else if(task.status == "needsAction") {
            taskPendingCount++;
            $('#pendingTasks').show();
            var dateIfEntered = ""
            if ( !task.due ) {
              dateIfEntered = "None-SetBy-User"
            } else {
              dateIfEntered = task.due.substring(0, task.title.lastIndexOf("["))
            };
            $('#tasksPending').append(
              '<div id=' + task.id + '>' +
                '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + dateIfEntered + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
                '</p>' +
              '</div>'
            );
          }
        } else {
          if (task.status == "completed" && task.completed) {
            taskCompletedCount++;
            $('#completedTasks').show();
            $('#tasksCompleted').append(
              '<div id=' + task.id + '>' +
                '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                '</p>' +
              '</div>'
            );
          } else if(task.status == "needsAction") {
            taskPendingCount++;
            $('#pendingTasks').show();
            var dateIfEntered = ""
            if ( !task.due ) {
              dateIfEntered = "None-SetBy-User"
            } else {
              dateIfEntered = task.due.substring(0,10)
            };
            $('#tasksPending').append(
              '<div id=' + task.id + '>' +
                '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + dateIfEntered + '</p>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
                '</p>' +
              '</div>'
            );
          }
        }
      }
    },
    /**
     * Displays Search Results retrieved from server.
     */
  };
})();




