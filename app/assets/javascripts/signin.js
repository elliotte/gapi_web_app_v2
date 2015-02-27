(function() {
    var po = document.createElement('script');
      po.type = 'text/javascript'; po.async = true;
      po.src = 'https://plus.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
})();


function onSignInCallback(authResult) {

   document.getElementById('gConnect').style.display = 'none';
   document.getElementById('loader-wheel').style.display = 'block';

   var route = window.location.href 

   if (route.indexOf("circle") > -1) {

      teamHelper.onSignInCallback(authResult);
      document.getElementById('loader-wheel').style.display = 'none';

   } else {

        if (authResult['error']) {
            // The user is not signed in.
            console.log('There was an error: ' + authResult['error']);

            $('#signin-in-error-modal-body').empty();
            $('#modal-window-signin-error').modal('show');
            $('#signin-in-error-modal-body').append( 
                '<p>' + 'Click Button To Grant Access or Reload Page' + '</p>' +
                '<p>' + 'OR' + '</p>' +
                '<a class="btn btn-main-o" href="/signin/refresh_connection" ><i class="fa fa-exchange"></i>' + 'Refresh' + '</a>'
            );

            helper.disconnectServer();
            document.getElementById('loader-wheel').style.display = 'none';

        } else {

               gapi.client.load('plus','v1', JSProfileCallBack);

               function JSProfileCallBack() {

                      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
                      request.execute( function(profile) {
                          
                          if (profile.error) {
                            $('#signin-in-error-modal-body').empty();
                            $('#modal-window-signin-error').modal('show');
                            $('#signin-in-error-modal-body').append(
                                '<p>' + 'Authentication Failed, you need to REFRESH your connection using the monea.build dropDown, and/or reload the page. ' +
                                '</p>' + 
                                '<p>' + 
                                'We check over 10 steps of authentication on signin, all of which are impacted by browser inactivity and state.' + 
                                '</p>' +
                                '<p>' + 'Please understand we do this for your utmost data and business protection and security' + '</p>' +
                                '<a class="btn btn-main-o" href="/signin/refresh_connection" ><i class="fa fa-exchange"></i>' + 'Refresh' + '</a>'
                            );
                            document.getElementById('loader-wheel').style.display = 'none';
                            document.getElementById('gConnect').style.display = 'block';
                          } else {

                            helper.user_google_id = profile.id;
                            //for teamForms
                            $('#circle_user_id').val(profile.id);
                            //Retrieves and renders the authenticated user's Google+ profile.
                            helper.appendProfile(profile);
                            //connects and verifies ServerSide client connection
                            helper.onSignInCallback(authResult);
                            foodHelper.loadLandingFeeds();

                          }

                      });//End of requestExecute

               };//end of CallBack

        }//End of ELSE[ERROR]

   };//End RouteSignInFilter

};//End of API console CallBack Reference
