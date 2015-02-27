
var teamHelper = (function() {
  var authResult = undefined;
  var user_google_id = "";

  return {
    //circlesRoute onSignCallBack
    onSignInCallback: function(authResult) {
      if (authResult['access_token']) {
        // The user is signed in
        this.authResult = authResult;
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
        teamHelper.user_google_id = profile.id;
      });
      
      teamHelper.loadPage();
      $('#authOps').show('slow');
      $('#gConnect').hide();
      $('#share-button').show();
    },

    loadPage: function() {
        teamHelper.circleMembers();
        teamHelper.circleFiles();
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
          teamHelper.getCircleMembers(result);
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
     * get circle files from DB.
     */
    getCircleFiles: function(files) {
      var circleFilesCount = 0;
      $('#driveTeamFiles').empty();
      for (var f in files) {
        if(circleFilesCount%4 == 1) {
            $('#driveTeamFiles').append('<div class="row">');
        }
        circleFilesCount++;
        $('#driveTeamFiles').show();
        file = files[f];
        $.ajax({
          type: 'GET',
          url: '/files/'+file.file_id,
          dataType: 'json',
          contentType: 'application/json',
          success: function(result) {
            if (!result.error) {
              teamHelper.appendCircleFile(result);
            } else {
              console.log('moneaMsg TeamFile ' + result.error.message + ' <fileID');
            }
          }
        });
        if(circleFilesCount%4 == 0) {
            $('#driveTeamFiles').append('</div>');
        }
      }//END OF FOR LOOP

      if(circleFilesCount == 0){
        $('#noDriveTeamFiles').show();
      }
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
    appendCircleFile: function(file) {

      if(!file.explicitlyTrashed) {
        $('#driveTeamFiles').append(
              '<div class="col-md-3">'+
                '<div class="feature-box-style2">'+
                  '<div class="feature-box-title">'+
                    '<i class="fa fa-file-text"></i>'+
                  '</div>'+
                  '<div class="feature-box-containt">'+
                    '<p>Owner: '+ file.ownerNames[0] + '</p>'+
                    '<h3>'+
                      '<a href="' + file.alternateLink + '" target="_blank">' + file.title + '</a>'+
                      '<ul class="project-details">'+
                        '<li>'+
                          '<img src="' + file.thumbnailLink + '" alt="screen" style="width: 100px;height: 75px;"/>'+
                        '</li>'+
                      '</ul>'+
                    '</h3>'+
                    '<p>'+
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/destroy"><i class="fa fa-trash-o"></i></a>'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/copy"><i class="fa fa-copy"></i></a>'+
                      ' <a class="btn btn-sm btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/comments/show"><i class="fa fa-comment-o"></i></a>'+
                    '</p>'+
                    '<p style="margin-bottom: 10px;">'+
                      ' <a class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + file.id + '/share">Teams.share</a>'+
                      ' <a class="btn btn-sm btn-primary" onclick="helper.loadFileShare(this)" data-href="'+file.alternateLink+'">Users.share</a>'+
                    '</p>'+
                    //appends after this code block..
                    '<div id="export-links-' + file.id + '"></div>'+
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
