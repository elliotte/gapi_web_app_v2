
var teamHelper = (function() {
  var authResult = undefined;
  var user_google_id = "";
  var taskTeamCompletedCount = 0;
  var taskTeamPendingCount = 0;

  return {
    /**
    * Hides the sign-in button and connects the server-side app after
    * the user successfully signs in.
    */
    onSignInCallback: function(authResult) {
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
        teamHelper.connectServer();
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
        $('#circle_user_id').val(profile.id);
        user_google_id = profile.id;
      });
      $('#authOps').show('slow');
      $('#gConnect').hide();
      $('#share-button').show();
    },



    connectServer: function() {
      console.log(this.authResult.code);
      $.ajax({
        type: 'POST',
        url: '/signin/connect?state=' + $("#state").text(),
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          teamHelper.loadPage();
        },
        processData: false,
        data: this.authResult.code + ',' + this.authResult.id_token + ',' + this.authResult.access_token
      });
    },

    loadPage: function() {
        teamHelper.circleMembers();
        teamHelper.circleFiles();
    },

    removeTeamMember: function(button) {
       
       var id = $(button).data('id');
          $.ajax({
            type: 'POST',
            url: '/peoples/remove_team_member/?google_id='+ id +'&circle_id='+ $("#circle_id").text(),
            dataType: 'json',
            contentType: 'application/json',
            success: function(result) {
               console.log(result)
               $('#'+ id).remove();
            },
            processData: false
          });
    },
     // dont delete use for retrieving userCal events extendedProperties circleID
     /*
       * Calls the server endpoint to get the list of events in calendar.
     */
    calendar: function() {
      $.ajax({
        type: 'GET',
        url: '/calendars/primary/events',
        contentType: 'application/octet-stream; charset=utf-8',
        success: function(result) {
          console.log(result);
          teamHelper.appendCalendar(result);
        },
        processData: false
      });
    },
    /**
     * Calls the server endpoint to get the Circle Member.
     */
    circleMembers: function() {
      $.ajax({
        type: 'GET',
        url: '/peoples/circle_peoples',
        dataType: 'json',
        contentType: 'application/json',
        data: {id: $("#circle_id").text()},
        success: function(result) {
          console.log(result);
          teamHelper.getCircleMembers(result);
        }
      });
    },
    /**
     * Calls the server endpoint to get the Circle Files.
     */
    circleFiles: function() {
      $.ajax({
        type: 'GET',
        url: '/files/circle_files',
        dataType: 'json',
        contentType: 'application/json',
        data: {id: $("#circle_id").text()},
        success: function(result) {
          console.log(result);
          teamHelper.getCircleFiles(result);
        }
      });
    },
    /**
     * get circle members from DB.
     */
    getCircleMembers: function(members) {
      var circleMembersCount = 0;
      $('#circleMembers').empty();
      for (var m in members) {
        circleMembersCount++;
        $('#circleMembers').show();
        member = members[m];
        $.ajax({
          type: 'GET',
          url: '/peoples/'+member.google_id,
          dataType: 'json',
          contentType: 'application/json',
          success: function(result) {
            console.log(result);
            teamHelper.appendCircleMembers(result);
          }
        });
      }
      if(circleMembersCount == 0){
        $('#noCircleMembers').show();
      }
    },
    /**
     * get circle files from DB.
     */
    getCircleFiles: function(files) {
      var circleFilesCount = 0;
      $('#driveTeamFiles').empty();
      for (var f in files) {
        circleFilesCount++;
        $('#driveTeamFiles').show();
        file = files[f];
        $.ajax({
          type: 'GET',
          url: '/files/'+file.file_id,
          dataType: 'json',
          contentType: 'application/json',
          success: function(result) {
            console.log(result);
            teamHelper.appendCircleFiles(result);
          }
        });
      }
      if(circleFilesCount == 0){
        $('#noDriveTeamFiles').show();
      }
    },
    /**
     * Displays circle members retrieved from DB.
     */
    appendCircleMembers: function(member) {
      if(member.gender == "male") {
        $('#circleMembers').append(
          '<div id="'+member.id+'" class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-male"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
                '<p><a data-id="'+ member.id +'" onclick="teamHelper.removeTeamMember(this)" class="btn btn-main-o destroy-item"><i class="fa fa-trash-o"></i></a><p>' +
              '</div>'+
            '</div>'+
          '</div>'
        );
      } else if(member.gender == "female") {
        $('#circleMembers').append(
          '<div id="'+member.id+'" class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-female"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
                 '<p><a data-id="'+ member.id +'" onclick="teamHelper.removeTeamMember(this)" class="btn btn-main-o destroy-item"><i class="fa fa-trash-o"></i></a><p>' +
              
              '</div>'+
            '</div>'+
          '</div>'
        );
      } else {
        $('#circleMembers').append(
          '<div id="'+member.id+'" class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-users"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<h3><a href="' + member.url + '" target="_blank">' + member.displayName + '</a></h3>'+
                '<p><a href="' + member.url + '" target="_blank"><img src="' + member.image.url + '"></a></p>'+
                '<p><a data-id="'+ member.id +'" onclick="teamHelper.removeTeamMember(this)" class="btn btn-main-o destroy-item"><i class="fa fa-trash-o"></i></a><p>' +
              '</div>'+
            '</div>'+
          '</div>'
        );
      }
    },
    /**
     * Displays circle files retrieved from DB.
     */
    appendCircleFiles: function(file) {
      if(!file.explicitlyTrashed) {
        $('#driveTeamFiles').append(
          '<div class="col-md-3">'+
            '<div class="feature-box-style2">'+
              '<div class="feature-box-title">'+
                '<i class="fa fa-file"></i>'+
              '</div>'+
              '<div class="feature-box-containt">'+
                '<p>Owner: ' + file.ownerNames[0] + '</p>'+
                '<h3>'+
                  '<a href="' + file.alternateLink + '" target="_blank">' + file.title + '</a>'+
                  '<ul class="project-details">'+
                    '<li>'+
                      '<img src="' + file.thumbnailLink + '" alt="screen" style="width: 100px;height: 75px;"/>'+
                    '</li>'+
                  '</ul>'+
                '</h3>'+
                '<p>'+
                  ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/destroy">Delete</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/copy">Copy</a>'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/comments/show">Comments</a>'+
                '</p>'+
                '<div id="export-links-' + file.id + '"></div>'+
                '<p style="margin-bottom: 10px;">'+
                  ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/share"><i class="fa fa-google-plus"></i> Share with teams</a>'+
                '</p>'+
                '<p style="margin-bottom: 10px;">'+
                  ' <a class="btn btn-sm btn-primary" href="https://drive.google.com/file/d/' + file.id + '/edit?usp=sharing" target="_blank"><i class="fa fa-google-plus"></i> Share with users</a>'+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        if(file.exportLinks){
          var st = "#export-links-"+file.id
          $(st).html(
            'Export: '
          );
          Object.keys(file.exportLinks).forEach(function(key) {
            $(st).append(
              '<a class="capitalize" href="' + file.exportLinks[key] + '" target="_blank">' + file.exportLinks[key].substring(file.exportLinks[key].lastIndexOf("=")+1,file.exportLinks[key].length) + '</a> '
            );
          });
        }
      }
    },
    /**
     * Displays available Calendar Event retrieved from server.
     */
    appendCalendar: function(events) {
      var teamCalendarCount = 0;
      $('#calendarTeamEvents').empty();
      for (var eventIndex in events.items) {
        event = events.items[eventIndex];
        if(event.extendedProperties && event.extendedProperties.private.circle_id == $("#circle_id").text()) {
          teamCalendarCount++;
          $('#calendarTeamEvents').show();
          if(event.hangoutLink) {
            $('#calendarTeamEvents').append(
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
            $('#calendarTeamEvents').append(
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
      }
      if(teamCalendarCount==0){
        $('#noCalendarTeamEvents').show();
      }
    },
  
    appendEmailSearchResult: function(search) {
      var count_search = 0;
      $('#search_result').empty();
      $("#modal-window-add-circle-member").modal("hide");
      for (var searchIndex in search) {
        count_search++;
        people = search[searchIndex];
        $('#search_result').append(
          '<div class="feature-boxs-wrapper">'+
            '<div class="feature-box-style2" style="margin: 0 0 5px 0;">'+
              '<div class="feature-box-containt" style="margin-top: 0px;padding: 5px 0px 0;">'+
                '<h3 style="padding-bottom: 5px;">'+
                  '<div class="form-group" style="margin-bottom: 0px;">'+
                    '<input name="user_id" type="checkbox" value="'+people.id+'" style="margin-right: 7px;">'+
                    '<input value="'+people.google_id+'" style="display:none;">'+
                    '<p style="margin-right: 7px;">'+people.email+'</p>'+
                  '</div'+
                '</h3>'+
              '</div>'+
            '</div>'+
          '</div>'
        );
        $("#next_button_circle_member_search").hide();
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
  $('#disconnect').click(teamHelper.disconnectServer);
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
          url: '/peoples/monea_email_search',
          //url: '/peoples/search',
          dataType: 'json',
          contentType: 'application/json',
          data: {query: $("#add_circle_member_form #query").val()},
          success: function(result) {
            console.log(result);
             teamHelper.appendEmailSearchResult(result);
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
        teamHelper.appendSearchResult(result);
      }
    });
  });
});
