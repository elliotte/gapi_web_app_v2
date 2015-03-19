
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
        this.renderProfile();


      } else if (authResult['error']) {
        // The user is not signed in.
        console.log('There was an error: ' + authResult['error']);
      }
      console.log('authResult', authResult);
    },
    
    renderProfile: function() {

      teamHelper.circleFiles();
      teamHelper.circleMembers();
      teamHelper.teams();
      teamHelper.setFormCircleIds();

    },

    setFormCircleIds: function() {
      $('form #circle_id').val($('#circle_id').val())
    },

    teams: function() {
      //no google_id uses session - call fired after auth and sess set
      $.ajax({
        type: 'GET',
        url: '/circles/circles_names',
        dataType: 'json',
        contentType: 'application/json',
        success: function(circles) {
          for (i = 0; i < 5; i++) {
              circle = circles[i];
              $('#landing-teams-append').append(
                '<p>' +
                    '<a class="grid-button action-button" target="_blank" href="/circles/' + circle.id + '">' + circle.name + '</a>' +
                '</p>'
               );
          }
          
        },
      });//END OF AJAX
      $('.loader-wrapper').hide();
      $('body').removeClass('overflow-hidden');
      Webflow.require("ix").init([
          {"slug":"open-contact","name":"open contact","value":{"style":{},"triggers":[{"type":"click","selector":".contact","stepsA":[{"display":"block","height":"0px"},{"height":"auto","transition":"height 500ms ease 0ms"}],"stepsB":[{"height":"0px","transition":"height 500ms ease 0ms"},{"display":"none"}]}]}},
          {"slug":"logo-hover","name":"logo hover","value":{"style":{},"triggers":[{"type":"hover","selector":".logo-pink","stepsA":[{"opacity":1,"transition":"opacity 500ms ease 0ms"}],"stepsB":[{"opacity":0,"transition":"opacity 500ms ease 0ms"}]},{"type":"hover","selector":".logo-black","stepsA":[{"opacity":0,"transition":"opacity 500ms ease 0ms"}],"stepsB":[{"opacity":1,"transition":"opacity 500ms ease 0ms"}]}]}},
          {"slug":"show-on-scroll","name":"show on scroll","value":{"style":{"opacity":0,"x":"0px","y":"100px"},"triggers":[{"type":"scroll","stepsA":[{"opacity":1,"wait":0,"transition":"transform 500ms ease-in-out-sine 0ms, opacity 500ms ease-in-out-sine 0ms","x":"0px","y":"0px"}],"stepsB":[{"opacity":0,"transition":"transform 1000ms ease-in-out-sine 0ms, opacity 1000ms ease-in-out-sine 0ms","x":"0px","y":"100px"}]}]}}
      ])
    },//END OF METHOD
    /**
     * Calls the server endpoint to get the Circle Member.
     */
    circleMembers: function() {
      $.ajax({
        type: 'GET',
        url: '/peoples/circle_peoples',
        dataType: 'json',
        contentType: 'application/json',
        data: {id: $("#circle_id").val()},
        success: function(result) {
          //uses list of userIDs from monea and gets the profiles from G+
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
            //console.log(result);
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
    circleFiles: function() {
      $.ajax({
        type: 'GET',
        url: '/files/circle_files',
        dataType: 'json',
        contentType: 'application/json',
        data: {id: $("#circle_id").val()},
        success: function(result) {
          console.log(result);
          teamHelper.getCircleFiles(result);
        }
      });
    },
     /**
     * Calls the server endpoint to get the file using IDs.
     */
    getCircleFiles: function(files) {
      var circleFilesCount = 0;
      var limit = 4
      
      for (var f in files) {
            file = files[f];
            $.ajax({
              type: 'GET',
              url: '/files/'+file.file_id,
              dataType: 'json',
              contentType: 'application/json',
              success: function(result) {
                  if (!result.error) {
                      if (circleFilesCount <= limit) {
                        circleFilesCount++;
                        teamHelper.appendCircleFile(result, false);
                      } 
                      if (circleFilesCount > limit) {
                        circleFilesCount++;
                        teamHelper.appendCircleFile(result, true);
                      }
                      
                  } else {
                    console.log('moneaMsg TeamFile ' + result.error.message + ' <fileID');
                  }
              },
            });//END OF AJAX

      }//END OF FOR LOOP
                        // var moreCard = '<div class="about-employee">' + 
                        //     '<div class="table-cell-wrapper">' + 
                        //       '<a id="view-all-team-files" href="#" class="user-button-landing action-button">'+ 'view.all' + '</a>' +
                        //     '</div>' + 
                        //   '</div>'
                        // $('#team-latest-files-container').append(moreCard);
      if(circleFilesCount == 0){
        $('#noDriveTeamFiles').show();
      }
      
    },
    /**
     * Displays circle files retrieved from DB.
     */
    appendCircleFile: function(file,modal) {

        containerShow = $('#team-latest-files-container')
        containerModal = $('#landing-teamfiles-append')

        if (!modal) {
            var html = uiHelper.filesHtml(file)
            containerShow.append(html)
        } else {
            var html = uiHelper.filesModalHtml(file)
            containerModal.append(html)
        }
       
        if(file.exportLinks){
           uiHelper.appendExportLinks(file);
        }// end of exportLinks

    },

    removeTeamMember: function(button) {
       
          var id = $(button).data('id');
          $.ajax({
            type: 'POST',
            url: '/peoples/remove_team_member/?google_id='+ id +'&circle_id='+ $("#circle_id").val(),
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
      containerShow = $('#team-members-container')
      var html = uiHelper.teamMembersHtml(member)
      containerShow.append(html)
      var owner = $('#team-owner').data('value');
      if (owner) {
        $('.team-member-delete').show();
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
  
  $('#create_button_circle_member').click(function(){
    //$('form#add_circle_member_form .error').remove();
    var hasError = false;
    // $('form#add_circle_member_form .requiredField').each(function () {
    //   if (jQuery.trim($(this).val()) === '') {
    //     $(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
    //     $(this).addClass('inputError');
    //     hasError = true;
    //   }
    // });
    if (hasError) {
      return false;
    
    } else {
        
        $.ajax({
          type: 'GET',
          url: '/peoples/monea_email_search',
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
  //TeamFiles.new submit html redirect after
  $('#create_button_circle_document').click(function(){
        $('#create_circle_document_form').submit();
  });

});
