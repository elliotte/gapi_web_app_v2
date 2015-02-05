(function() {
  var po = document.createElement('script');
  po.type = 'text/javascript'; po.async = true;
  po.src = 'http://plus.google.com/js/client:plusone.js';
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
        gapi.client.load('plus','v1',this.renderProfile);
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
        console.log(profile);
        $.ajax({
          type: 'POST',
          url: '/signin/save_user',
          data: {id: profile.id, email: profile.emails[0].value},
          success: function(result) {
            console.log(result);
            helper.circles();
          }
        });
        $('#circle_user_id').val(profile.id);
        user_google_id = profile.id;
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
          console.log(result);
          helper.calendar();
          helper.files();
          helper.task_lists();
          helper.activities();
        },
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token
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
     * Calls the server endpoint to get the list of Activities.
     */
    activities: function() {
      $.ajax({
        type: 'GET',
        url: '/activities',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          helper.appendActivity(result);
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
          console.log(result);
          helper.appendCircles(result);
        }
      });
    },
    /**
     * Displays circles retrieved from DB.
     */
    appendCircles: function(circles) {
      var circleCount = 0;
      $('#circle').empty();
      for (var c in circles) {
        circleCount++;
        $('#circle').show();
        circle = circles[c];
        $('#circle').append(
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-support"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="/circles/' + circle.id + '">' + circle.display_name + '</a></h3>'+
                '<p>' + circle.description + '</p>'+
                '<p>'+
                  ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/circles/' + circle.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/circles/' + circle.id + '/edit">Update</a>'+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
      if(circleCount==0){
        $('#noCircle').show();
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      var calendarCount = 0;
      $('#calendarEvent').empty();
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        calendarCount++;
        $('#calendarEvent').show();
        if(event.hangoutLink) {
          $('#calendarEvent').append(
            '<div class="col-md-6">'+
              '<div class="feature-box-style2">'+
                '<div class="feature-box-title">'+
                  '<i class="fa fa-calendar"></i>'+
                '</div>'+
                '<div class="feature-box-containt">'+
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<p>' + event.description + '</p>'+
                  '<p>'+
                    ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                    ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
                    ' <a class="btn btn-primary" href="' + event.hangoutLink + '" target="_blank">Hangout</a>'+
                  '</p>'+
                '</div>'+
              '</div>'+
            '</div>'
          );
        } else {
          $('#calendarEvent').append(
            '<div class="col-md-6">'+
              '<div class="feature-box-style2">'+
                '<div class="feature-box-title">'+
                  '<i class="fa fa-calendar"></i>'+
                '</div>'+
                '<div class="feature-box-containt">'+
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<p>' + event.description + '</p>'+
                  '<p>'+
                    ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">Delete</a>'+
                    ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">Update</a>'+
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
      $('#driveFiles').empty();
      var count = 0;
      for (var itemIndex in drive.items) {
        item = drive.items[itemIndex];
        if(!item.explicitlyTrashed) {
          count++;
          fileCount++;
          $('#driveFiles').show();
          if(item.thumbnailLink) {
            if(fileCount%4 == 1) {
              $('#driveFiles').append('<div class="row">');
            }
            $('#driveFiles').append(
              '<div class="col-md-3">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-file"></i>'+
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
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                    '</p>'+
                    '<div id="export-links-' + item.id + '"></div>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/share"><i class="fa fa-google-plus"></i> Share with teams</a>'+
                    '</p>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                    '</p>'+
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
            if(fileCount%4 == 0) {
              $('#driveFiles').append('</div>');
            }
          } else {
            if(fileCount%4 == 1) {
              $('#driveFiles').append('<div class="row">');
            }
            $('#driveFiles').append(
              '<div class="col-md-3">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-file"></i>'+
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
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">Delete</a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">Copy</a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">Comments</a>'+
                    '</p>'+
                    '<div id="export-links-' + item.id + '"></div>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/share"><i class="fa fa-google-plus"></i> Share with teams</a>'+
                    '</p>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + item.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                    '</p>'+
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
            if(fileCount%4 == 0) {
              $('#driveFiles').append('</div>');
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
          '<div class="col-md-6">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-tasks"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3>' + taskList.title + ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/tasks/new">Create Task</a></h3>'+
                '<p>'+
                  ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskList.id + '">Update</a>'+
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
              '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
              '</p>'
            );
          } else if(task.status == "needsAction" && task.due) {
            taskPendingCount++;
            $('#pendingTasks').show();
            $('#tasksPending').append(
              '<p>'+ '- Title: ' + task.title.substring(0, task.title.lastIndexOf("[")) + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
              '</p>'
            );
          }
        } else {
          if (task.status == "completed" && task.completed) {
            taskCompletedCount++;
            $('#completedTasks').show();
            $('#tasksCompleted').append(
              '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Completed at: ' + task.completed.substring(0,10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
              '</p>'
            );
          } else if(task.status == "needsAction" && task.due) {
            taskPendingCount++;
            $('#pendingTasks').show();
            $('#tasksPending').append(
              '<p>'+ '- Title: ' + task.title + ', Notes: ' + task.notes + ', Due Date: ' + task.due.substring(0, 10) + '</p>'+
              '<p>'+
                ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">Delete</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">Update</a>'+
                ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/complete">Complete</a>'+
              '</p>'
            );
          }
        }
      }
    },
    /**
     * Displays available Activities retrieved from server.
     */
    appendActivity: function(activity) {
      var activityCount = 0;
      $('#activityFeeds').empty();
      for (var activityIndex in activity.items) {
        activityCount++;
        $('#activityFeeds').show();
        item = activity.items[activityIndex];
        $('#activityFeeds').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-archive"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + item.url + '" target="_blank">' + item.title + '</a></h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
      if(activityCount == 0){
        $('#noActivityFeeds').show();
      }
    },
    /**
     * Displays Search Results retrieved from server.
     */
    appendSearchResult: function(search) {
      var count_search = 0;
      $('#search_result').empty();
      $("#modal-window-add-circle-member").modal("hide");
      for (var searchIndex in search.items) {
        count_search++;
        people = search.items[searchIndex];
        $('#search_result').append(
          '<div class="feature-boxs-wrapper">'+
            '<div class="feature-box-style2" style="margin: 0 0 5px 0;">'+
              '<div class="feature-box-containt" style="margin-top: 0px;padding: 5px 0px 0;">'+
                '<h3 style="padding-bottom: 5px;">'+
                  '<div class="form-group" style="margin-bottom: 0px;">'+
                    '<input name="google_id[]" type="checkbox" value="'+people.id+'" style="margin-right: 7px;">'+
                    '<a href="'+people.url+'" target="_blank" style="margin-right: 7px;">'+people.displayName+'</a>'+
                    '<a href="'+people.url+'" target="_blank"><img src="'+people.image.url+'"></a>'+
                  '</div'+
                '</h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        if(search.nextPageToken) {
          $('#next_results').html('<input id="next_page_token" name="next_page_token" type="hidden" value="'+search.nextPageToken+'">');
        }
      }
      if(count_search == 0) {
        $('#search_result').append(
          '<div class="feature-boxs-wrapper">'+
            '<div class="feature-box-style2" style="margin: 0 0 5px 0;">'+
              '<div class="feature-box-containt" style="margin-top: 0px;padding: 5px 0px 0;">'+
                '<h3 style="padding-bottom: 5px;">'+
                  'No Result Found!!!!'+
                '</h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        $("#next_button_circle_member_search").hide();
      }
      $("#modal-window-circle-members-result").modal("show");
    },
  };
})();

$(document).ready(function() {
  $('#disconnect').click(helper.disconnectServer);
  $('#create_button_circle_member').click(function(){
    $('form#add_circle_member_form .error').remove();
    var hasError = false;
    $('form#add_circle_member_form .requiredField').each(function () {
      if (jQuery.trim($(this).val()) === '') {
        $(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
        $(this).addClass('inputError');
        hasError = true;
      }
    });
    if (hasError) {
      return false;
    } else {
      $.ajax({
        type: 'GET',
        url: '/peoples/search',
        dataType: 'json',
        contentType: 'application/json',
        data: {query: $("#add_circle_member_form #query").val()},
        success: function(result) {
          console.log(result);
          helper.appendSearchResult(result);
        }
      });
    }
  });
  $('#next_button_circle_member_search').click(function(){
    $.ajax({
      type: 'GET',
      url: '/peoples/search',
      dataType: 'json',
      contentType: 'application/json',
      data: {query: $("#add_circle_member_form #query").val(), next_page_token: $("#add_circle_member_search_form #next_page_token").val()},
      success: function(result) {
        console.log(result);
        helper.appendSearchResult(result);
      }
    });
  });
});

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);

}

function deleteEvent(e_id){
  $.ajax({
        url: "/signin/delete_calendar_event/" + e_id ,
        type: "post",
        dataType: "json",
        data: {"_method":"delete"},
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          alert("event deleted");
          // console.log(result);
          //:success => "$(this).up('.postS').remove();"
          $('#calendarEvent').up(e_id).remove();
        },
        processData: false
      });
}

function updateEvent(e_id){
  //alert("bhimasen");
  $.ajax({
        url: "/signin/update_calendar_event/" + e_id ,
        type: "put",
        //dataType: "json",
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          alert("update event")
          // console.log(result);
          // helper.appendCalender(result);
        },
        processData: false
      });
}

