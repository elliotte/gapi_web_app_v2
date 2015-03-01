
var userHelper = (function() {
  var authResult = undefined;

  return {
    /**
    * Hides the sign-in button and connects the server-side app after
    * the user successfully signs in.
    */
    addToTeam: function(person) {
      console.log('here')
      console.log()
      $('#friend-networks-container').fadeOut('slow');
      $('#add-to-team-form').fadeIn('slow');
      $('#person_google_id').val($(person).data('id'))
      $('#people-name-placeholder').text($(person).data('name'))
      
      $.ajax({
        type: 'GET',
        url: '/circles/circles_names',
        dataType: 'json',
        contentType: 'application/json',
        success: function(circles) {
              
          container = $('#add-to-which-team-container')
          
          for (c in circles) {
              circle = circles[c]
              html = '<input name="circle_id" type="checkbox" value="'+circle.id+'" style="margin-right: 7px;">'+
                     '<p style="margin-right: 7px;">'+circle.name+'</p>'
              container.append(html)
          }

        },
      
      });

    },

    appendPeopleSearch: function(search) {
      $('.search_result').empty();
      if(search.length == 0) {
        $('.search_result').append(
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
      }
      for (var searchIndex in search) {
        people = search[searchIndex];
        $('.search_result').append(
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
        
      }
      $("#modal-window-g-plus-search-result").modal("show");

    },

  };
})();



