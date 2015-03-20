
var helper = (function() {

  var authResult = undefined;
  var user_google_id = "";
  var taskListsCount = 0;
  var taskCompletedCount = 0;
  var taskPendingCount = 0;
  var authError = false;

  return {

    setAuth: function(authResult) {
         console.log('authResult HelperCallBack', authResult);
         // The user has JSAPI verified authentication
         this.authResult = authResult; 
    },
    /**
     * Calls the google server endpoint to signout and revoke the app for the user.
     */
    disconnectUser: function(page_reload) {

        var true_reload = page_reload
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
            this.authResult.access_token;
        // Perform an asynchronous disConnect GET request.
        $.ajax({
            type: 'GET',
            url: revokeUrl,
            async: false,
            contentType: "application/json",
            dataType: 'jsonp',
            success: function(nullResponse) {
                console.log('FRONTEND token Revoke')
                helper.secureLanding();
                if (true_reload) {
                  window.location.reload();
                }
            },
            error: function(e) {
              helper.secureLanding();
            }
        });
    }, 
    /**
     * Calls the server endpoint to connect the app for the user.
     */
    connectServerSide: function(frontEndState) {
      //console.log(this.authResult.code);
      var loaderWheel = document.getElementById('loader-wheel')
      var connectButton = document.getElementById('gConnect')

      $.ajax({
        type: 'POST',
        url: '/signin/connect?state=' + frontEndState,
        contentType: 'application/octet-stream; charset=utf-8',
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token,
        success: function(result) {

            if (typeof result == "string") {
               console.log('ERRORRRRR endPoint String Result from connectServer  ::  ' + result);
              
               $('#signin-in-error-modal-body').empty();
               $('#modal-window-signin-error').modal('show');
               $('#signin-in-error-modal-body').append('<p>' 
                    + 'Server Side Authentication Failed, you need to REFRESH your connection below' +
                    '</p>' + 
                    '<p>' + 
                    'We check over 10 steps of authentication on signin, all of which are impacted by browser inactivity.' + 
                    '</p>' +
                    '<p>' + 'Please understand we do this for your utmost data and business protection and security' + '</p>' +
                    '<a class="btn btn-main-o" href="/signin/refresh_connection" ><i class="fa fa-exchange"></i>' + 'Refresh' + '</a>'
                );
               helper.disconnectUser();
               helper.secureLanding();

            } else {
               console.log('wooooooooo success valid result returned from serverEndPoint');
               helper.circles();
               //foodHelper.loadLandingFeeds();
               helper.fireServerCalls();
            }

        },
        error: function(e) {
               console.log('ERRORR ERRORRRRR endPoint String Result for connectServer  ::  ' + e);
               helper.disconnectUser(true);
               helper.secureLanding();
        }

      });//end of AJAX Post
      
    },//END of CONNECTSERVER
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
            helper.disconnectUser(true);
          },
          error: function(e) {
            console.log(e);
            helper.disconnectUser(true);
          }
        });
    },

    fireServerCalls: function() {
          helper.task_lists();
          //loads tasks after tasklist
          helper.calendar();
          helper.files();

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
          console.log('JS calendar-first google fire result returned to console says --- '+ result);
          if (typeof result == "string") {
            helper.disconnectUser(false);
          } else {
            helper.appendCalendar(result);
          }
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
          if (typeof result == "string") {
            helper.disconnectUser(false);
          } else {
            helper.appendDrive(result);
          }
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
        success: function(result) {
          console.log(result);
          if (typeof result == "string") {
            helper.disconnectUser(false);
          } else {
            helper.appendTaskLists(result);
          }
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
      //no google_id uses session - call fired after auth and sess set
      $.ajax({
        type: 'GET',
        url: '/circles/circles_names',
        dataType: 'json',
        contentType: 'application/json',
        success: function(result) {
          helper.appendCircles(result);
         // helper.setStorage('circles', result)
        }
      });
    },

    loadFileShare: function(button) {
      link = $(button).data('href');
      var shareButton = '<script src="https://apis.google.com/js/platform.js" async defer></script>'+'<div class="g-plus" data-action="share" data-href="'+link+'" data-annotation="none" data-height="15"></div>'
      container = $(button).parent();
      $(container).append( '<br>' + shareButton);
    },

    setStorage: function(key, result) {
      localStorage.setItem(key, JSON.stringify(result));
    },

    secureLanding: function() {

            $('body').addClass('overflow-hidden');
            //$('#authOps').hide();
            signInButton = document.getElementById('gConnect');
            //loaderWheel = document.getElementById('loader-wheel');

            signInButton.style.display = 'block';
             $('#not-auth-ops').show();
            //loaderWheel.style.display = 'none';

            // var shareButton = document.getElementById('share-button')
            // if (shareButton.style.display = 'block' ) {
            //      shareButton.style.display = 'none';
            // }
    },

    appendProfile: function(profile) {
        $('#profile').empty();
        
        if (profile.error) {
          $('#profile').append(profile.error);
        }
        $('#profile').append(
            '<h1 class="h1-about"><a href="' + profile.url + '" target="_blank" class="w-inline-block action-button">' + '<img class="grid-button" src="' + profile.image.url + '">' + '</a>'+ '<br>' +
            '<a href="' + profile.url + '" target="_blank">'+profile.displayName+'</a></h1>'
        );
    },
    /**
     * Displays circles retrieved from DB.
     */
    appendCircles: function(circles) {
      var circleCount = 0;
      for (var c in circles) {
        circleCount++;
        circle = circles[c];
         $('#landing-teams-append').append(
          '<p>' +
              '<a class="grid-button action-button" target="_blank" href="/circles/' + circle.id + '">' + circle.name + '</a>' +
          '</p>'
         );
      }
      if(circleCount==0){
        $('#landing-teams-append').append('No Teams');
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      var calendarCount = 0;

      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        calendarCount++;
        console.log(events.items.length)
        if(event.hangoutLink) {
          $('#calendarEvent').append(
            '<div id="'+ event.id +'" class="col-md-3">'+
              '<div class="feature-box-style2">'+
                '<div class="feature-box-title">'+
                  '<i class="fa fa-calendar"></i>'+
                '</div>'+
                '<div class="feature-box-containt" style="height:250px; overflow:scroll;">'+
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<p>' + attendees_email_list.join(" and ") + '</p>'+
                  '<p>' + eventDate.toLocaleDateString() + ' ,' + eventDate.toLocaleTimeString() + '</p>'+
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
           $('#diary-container').append(uiHelper.calendarHtml(event))
        }
        
      }//ENd of FOR loop
      if(calendarCount == 0){
        $('#noCalendarEvent').show();
      }
    },
    /**
     * Displays available files in drive retrieved from server.
     */
    appendDrive: function(drive) {
      containerUser = $('#latest-files-container')
      containerShared = $('#shared-files-container')
      var userShowCount = 0;
      var sharedShowCount = 0;
      for (file in drive.items) {
          item = drive.items[file]
          if(!item.explicitlyTrashed) {
              if(item.sharingUser) {
                  var limit = 4
                  if (sharedShowCount <= limit) {
                      sharedShowCount++;
                      containerShared.append(uiHelper.filesHtml(item));//end of append
                  };
                  if (sharedShowCount > limit) {
                    sharedShowCount++;
                    $('#landing-shared-files-append').append(uiHelper.filesModalHtml(item));
                  };
              } else {
                  var limit = 4
                  if (userShowCount <= limit) {
                    userShowCount++;
                    containerUser.append(uiHelper.filesHtml(item))
                  };
                  if (userShowCount > limit) {
                     userShowCount++;
                     $('#landing-files-append').append(uiHelper.filesModalHtml(item))
                  }
              }//end of shared filter
              if(item.exportLinks){
                 uiHelper.appendExportLinks(item);
              }// end of exportLinks
          }//end of Trash Filter
      }//end of For Loop
      var moreCard = '<div class="about-employee">' + 
                                      '<div class="table-cell-wrapper">' + 
                                        '<a id="view-all-user-files" href="#" class="user-button-landing action-button">'+ 'view.all' + '</a>' +
                                      '</div>' + 
                                    '</div>'
      containerUser.append(moreCard);
      var sharedMoreCard = '<div class="about-employee">' + 
                                      '<div class="table-cell-wrapper">' + 
                                        '<a id="view-all-user-shared-files" href="#" class="user-button-landing action-button">'+ 'view.all' + '</a>' +
                                      '</div>' + 
                                    '</div>'
      containerShared.append(sharedMoreCard);
      var viewButton = document.getElementById('view-all-user-files');
      viewButton.addEventListener('click', function() {
           $("#modal-window-user-files").modal("show");
      });
      var viewButtonShared = document.getElementById('view-all-user-shared-files');
      viewButtonShared.addEventListener('click', function() {
           $("#modal-window-user-shared-files").modal("show");
      });
    },
    /**
     * Displays available Task Lists retrieved from server.
     */
    appendTaskLists: function(taskLists) {
      var taskListsCount = 0;
      var taskCompletedCount = 0;
      var taskPendingCount = 0;
      for (var taskListIndex in taskLists.items) {
        taskListsCount++;
        taskList = taskLists.items[taskListIndex];
        $('#task_list_id').val(taskList.id);
        $('#new-to-do-button-container').append('<br>' + '<a id="create-task-list-to-do" class="btn no-text-decoration" data-remote=true href="/task_lists/' + taskList.id + '/tasks/new">.new</a>');
        helper.tasks(taskList.id);
      }
      if(taskListsCount == 0){
        $('#noTaskLists').show();
      }
    },
    /**
     * Displays available Tasks in Task List retrieved from server.
     */
    appendTasks: function(tasks, taskListId) {
      var taskCompletedCount = 0;
      var taskPendingCount = 0;
      for (var taskIndex in tasks.items) {
        task = tasks.items[taskIndex];
        if (task.status == "completed") {
          taskCompletedCount++;
          $('#tasks-complete-container').append(
            uiHelper.tasksHtml(task, taskListId)
          );

        } else if(task.status == "needsAction") {
          taskPendingCount++;
          $('#tasks-pending-container').append(
            uiHelper.tasksHtml(task, taskListId)
          );
        }
        if(taskCompletedCount == 0 && taskPendingCount == 0){
          $('#noTasks').show();
        }
      }
      $('.loader-wrapper').hide();
      $('#not-auth-ops').hide();
      Webflow.require("ix").init([
          {"slug":"open-contact","name":"open contact","value":{"style":{},"triggers":[{"type":"click","selector":".contact","stepsA":[{"display":"block","height":"0px"},{"height":"auto","transition":"height 500ms ease 0ms"}],"stepsB":[{"height":"0px","transition":"height 500ms ease 0ms"},{"display":"none"}]}]}},
          {"slug":"logo-hover","name":"logo hover","value":{"style":{},"triggers":[{"type":"hover","selector":".logo-pink","stepsA":[{"opacity":1,"transition":"opacity 500ms ease 0ms"}],"stepsB":[{"opacity":0,"transition":"opacity 500ms ease 0ms"}]},{"type":"hover","selector":".logo-black","stepsA":[{"opacity":0,"transition":"opacity 500ms ease 0ms"}],"stepsB":[{"opacity":1,"transition":"opacity 500ms ease 0ms"}]}]}},
          {"slug":"show-on-scroll","name":"show on scroll","value":{"style":{"opacity":0,"x":"0px","y":"100px"},"triggers":[{"type":"scroll","stepsA":[{"opacity":1,"wait":0,"transition":"transform 500ms ease-in-out-sine 0ms, opacity 500ms ease-in-out-sine 0ms","x":"0px","y":"0px"}],"stepsB":[{"opacity":0,"transition":"transform 1000ms ease-in-out-sine 0ms, opacity 1000ms ease-in-out-sine 0ms","x":"0px","y":"100px"}]}]}}
      ])
      Webflow.require("slider").redraw();
      $('body').removeClass('overflow-hidden');

    },
    /**
     * ENNNNNDDDD OF HELPERS.FUNCTIONS.
     */
  };
  /**
     * ENNNNNDDDD OF RETURN.
  */
})(); // END of HELPER




