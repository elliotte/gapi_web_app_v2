// function getPersonEmail(id) {
	
// 	route = '/peoples/' + id

// 	var response = 'no-email';
// 	$.ajax({ type: "GET",   
// 	         url: route,   
// 	         async: false,
// 	         success : function(text)
// 	         {
// 	            if (typeof text.emails !== "undefined") {
// 				    response = text.emails[0]['value']
// 				}
// 				return
// 	         }
// 	});
// 	return response
// };

$(document).ready(function () {

	$("#go-home").click(function(e) {
		e.preventDefault();
		window.location.href = '/';
	});
	$("#quick_add_event").click(function() {
		$("#modal-window-quick-create-event").modal("show");
	});
	$("#add_event").click(function() {
		$("#modal-window-create-event").modal("show");
		 //to add tokenInput
   		 $("#event_attendee_id_1").append('<option value="no-attendees">' + 'No-attendees' + '</option>')
   		 $("#event_attendee_id_2").append('<option value="no-attendees">' + 'No-attendees' + '</option>')
   		 $("#event_attendee_id_3").append('<option value="no-attendees">' + 'No-attendees' + '</option>')
   		 $("#event_attendee_id_4").append('<option value="no-attendees">' + 'No-attendees' + '</option>')

   		 $("#search_calendar_ppl").tokenInput("/circles/circle_names.json", {
      		theme: "facebook",
      		crossDomain: false,
      		hintText: "NOT WORKING add attendees"
    	 });
    	$(".token-input-dropdown-facebook").css("z-index","9999")


   // 		 $(friends).each(function(i) {
   // 		 	if (typeof friends[i].emails !== "undefined") {
   // 		 		email = friends[i].emails[0]['value']
			// 	$("#event_attendee_id_1").append('<option value="'+email+'">' + friends[i].displayName + '</option>');
	  //  		 	$("#event_attendee_id_2").append('<option value="'+email+'">' + friends[i].displayName + '</option>');
	  //  		 	$("#event_attendee_id_3").append('<option value="'+email+'">' + friends[i].displayName + '</option>');
	  //  		 	$("#event_attendee_id_4").append('<option value="'+email+'">' + friends[i].displayName + '</option>');
   // 		 	}; 
   // 		 });
	});

	$("#new_doc").click(function() {
		$("#modal-window-new-doc").modal("show");
	});
	$("#add-to-do").click(function() {
		var route = $("#create-task-list-to-do").attr('href');
		$.get(route);
	});
	$("#new_ss").click(function() {
		$("#modal-window-new-ss").modal("show");
	});
	$("#create_circle").click(function() {
		$("#modal-window-create-circle").modal("show");
	});
	$("#create_spreadsheet").click(function() {
		$("#modal-window-create-spreadsheet").modal("show");
	});
	$("#create_document").click(function() {
		$("#modal-window-create-document").modal("show");
	});
	$("#create_tasklist").click(function() {
		$("#modal-window-create-tasklist").modal("show");
	});
	$("#add_team_member").click(function() {
		$("#modal-window-add-circle-member").modal("show");

	});
	// $("#create_team_event").click(function() {
	// 	$("#modal-window-create-circle-event").modal("show");
	// });
	$("#create_team_message").click(function() {
		$("#modal-window-circle-add-message").modal("show");
	});
	$("#create_team_wallpin").click(function() {
		$("#modal-window-circle-add-wallpin").modal("show");
	});
	$("#create_team_file").click(function() {
		$("#modal-window-create-circle-document").modal("show");
	});
	$(".destroy-item").click(function() {
		$("#modal-window-destroy-item").modal("show");
		$('#circle_item_id').val($(this).data('id'));
		$('#circle_item_type').val($(this).data('item'));
	});

	$('#create_button_circle_member_search').click(function(){
	    $('#add_circle_member_search_form').submit();
	});
	$('#create_button_circle_event').click(function(){
		$('form#create_circle_event_form .error').remove();
	    var hasError = false;
	    $('form#create_circle_event_form .requiredField').each(function () {
	      	if (jQuery.trim($(this).val()) === '') {
	        	$(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
	        	$(this).addClass('inputError');
	        	hasError = true;
	      	} else if ($(this).hasClass('email')) {
                var emailReg = /^([\w-\.]+@([\w]+\.)+[\w]{2,4})?$/;
                if (!emailReg.test(jQuery.trim($(this).val()))) {
                    $(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
                    $(this).addClass('inputError');
                    hasError = true;
                }
            }
	    });
	    if (hasError) {
	      	return false;
	    } else {
	    	$('#create_circle_event_form').submit();
	    }
	});
	$('#create_button_circle_task').click(function(){
		$('form#create_circle_task_form .error').remove();
	    var hasError = false;
	    $('form#create_circle_task_form .requiredField').each(function () {
	      	if (jQuery.trim($(this).val()) === '') {
	        	$(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
	        	$(this).addClass('inputError');
	        	hasError = true;
	      	}
	    });
	    if (hasError) {
	      	return false;
	    } else {
	    	$('#create_circle_task_form').submit();
	    }
	});
	$('#create_button_circle_document').click(function(){
		$('form#create_circle_document_form .error').remove();
	    var hasError = false;
	    $('form#create_circle_document_form .requiredField').each(function () {
	      	if (jQuery.trim($(this).val()) === '') {
	        	$(this).parent().append('<span class="error"><i class="fa fa-exclamation-triangle"></i></span>');
	        	$(this).addClass('inputError');
	        	hasError = true;
	      	}
	    });
	    if (hasError) {
	      	return false;
	    } else {
	    	$('#create_circle_document_form').submit();
	    }
	});

	$('#quick_create_button_close').click(function(){
		$('#quick-events-modal-body').empty();
		$('#modal-window-quick-create-event').modal('close');
	});
	$('#new-doc-insert-close').click(function(){
		$('#new-doc-modal-body').empty();
	});
	$('#create_button_event').click(function(){
		$('#create_event_form').submit();
	});
	$('#create_button_circle').click(function(){
		$('#create_circle_form').submit();
	});
	$('#create_button_spreadsheet').click(function(){
		$('#create_spreadsheet_form').submit();
	});
	$('#create_button_document').click(function(){
		$('#create_document_form').submit();
	});
	$('#create_button_tasklist').click(function(){
	    $('#create_tasklist_form').submit();
	});

	// cancelling time option so commented out for now..
	// $('#start_time_event').datepicker({
	//     format: "yyyy/mm/dd",
	//     autoclose: true
	// });
	// $('#end_time_event').datepicker({
	//     format: "yyyy/mm/dd",
	//     autoclose: true
	// });

	$('#go-to-events').on('click', function(e) {
		e.preventDefault();
		var top = $('#events-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1000)
	});
	$('#go-to-files').on('click', function(e) {
		e.preventDefault();
		var top = $('#files-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1000)
	});
	$('#go-to-shared-files').on('click', function(e) {
		e.preventDefault();
		var top = $('#shared-files-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1000)
	});
	$('#go-to-tasks').on('click', function(e) {
		e.preventDefault();
		var top = $('#tasks-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1000)
	});
	$('#team-members-view').on('click', function(e) {
		e.preventDefault();
		var top = $('#team-members-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1500)
	});

});


//$(document).keydown(function(e) {
    // if (e.keyCode == 65 ) {
    // 	$('#modal-window-friends-collaborate').modal('show');
   	// 	 var friends = JSON.parse(localStorage.friends);
   	// 	 console.log(friends);
   	// 	 var modal = $('#people-collaborate-modal-body')
   	// 	 $(friends).each(function(i) {
   	// 	 	$(modal).append('<p>' + friends[i].displayName + '</p>');
   	// 	 });
    // };
//});







