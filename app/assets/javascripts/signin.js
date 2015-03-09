(function() {
    var po = document.createElement('script');
      po.type = 'text/javascript'; po.async = true;
      po.src = 'https://plus.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
})();


function onSignInCallback(authResult) {
   
        signInButton = document.getElementById('gConnect');
        loaderWheel = document.getElementById('loader-wheel');
        
        signInButton.style.display = 'none';
        loaderWheel.style.display = 'block';

        if (authResult['error']) {
            console.log('There was an error: ' + authResult['error']);
            // The user is not signed in.
            //user_signed_out callback versus immeditate_fail
            if (authResult['error'] == "immediate_failed") {
              console.log('NO APP ACCESS')

              $('#signin-in-error-modal-body').empty();
              $('#modal-window-signin-error').modal('show');
              $('#signin-in-error-modal-body').append( 
                '<p>' + 'No Access :: To Grant Access click G-SignIn Button and/or Reload Page First if you have just signed out' + '</p>'
              );
            }

            if (authResult['error'] == "user_signed_out") {

              $('#signin-in-error-modal-body').empty();
              $('#modal-window-signin-error').modal('show');
              $('#signin-in-error-modal-body').append( 
                '<p>' + 'User Signed Out :: Reload Page First if you want to sign in' + '</p>'
              );
              $.ajax({
                type: 'POST',
                url: '/signin/disconnect',
                async: false,
                success: function(result) {
                  console.log('revoke response: ' + result);
                 
                },
                error: function(e) {
                  console.log(e);
                }
              });
              //helper.disconnectServer();

              window.location.reload()
            }

            if (signInButton.style.display = 'none' ) {
               signInButton.style.display = 'block';
            }

            if (loaderWheel.style.display = 'block' ) {
               loaderWheel.style.display = 'none';
            }


        } else {

            if (verifyAccessToken(authResult)) {
                
                verified_auth_tokens = authResult
                var disconnectButton = document.getElementById('disconnect');
      
                disconnectButton.addEventListener('click', function() {
                     helper.disconnectServer();
                });
                gapi.client.load('plus','v1', JSProfileCallBack);

            } else {

              $('#signin-in-error-modal-body').empty();
              $('#modal-window-signin-error').modal('show');
              $('#signin-in-error-modal-body').append(
                  '<p>' + 'Browser Authentication Failed, you need to REFRESH your connection' +
                  '</p>' + 
                  '<p>' + 
                  'We check over 10 steps of authentication on signin, all of which are impacted by browser inactivity and state.' + 
                  '</p>' +
                  '<p>' + 'Please understand we do this for your utmost data and business protection and security' + '</p>' +
                  '<a class="btn btn-main-o" href="/signin/refresh_connection" ><i class="fa fa-exchange"></i>' + 'Refresh' + '</a>'
              );

              //helper.disconnectUser();
              //helper.disconnectServer();
            }
               
        }//End of ELSE[ERROR]

};//End of API console CallBack Reference

function verifyAccessToken(authResult) {
    
    var tokens_checked_and_safe = false

    $.ajax({

        type: 'GET',
        async: false,
        url: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + authResult.access_token,
        contentType: 'application/octet-stream; charset=utf-8',

        success: function(result) {
            if (!result.error) {
                helper.user_google_id = result.user_id;
                //for teamForms
                $('#circle_user_id').val(result.user_id)
                tokens_checked_and_safe = true
            }
        }//END of  SucceSS

    });//END OF AJAX
    return tokens_checked_and_safe
};  


function JSProfileCallBack() {
      var clientStateToken = $("#state").text();

      var route = window.location.href 
     
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      
      request.execute( function(profile) {
              //Renders the authenticated user's Google+ profile.
              helper.appendProfile(profile);
              //connects and verifies ServerSide client connection
              console.log(profile.id)
              if (route.indexOf("circle") > -1) {
                  teamHelper.onSignInCallback(verified_auth_tokens);
                  loaderWheel.style.display = 'none';
              } else {
                  helper.setAuth(verified_auth_tokens);
                  helper.connectServerSide(clientStateToken);
              }
      });//End of requestExecute
};//end of CallBack


