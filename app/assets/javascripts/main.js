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
	$("#create_team_event").click(function() {
		$("#modal-window-create-circle-event").modal("show");
	});
	$("#create_team_task").click(function() {
		$("#modal-window-create-circle-task").modal("show");
	});
	$("#create_team_file").click(function() {
		$("#modal-window-create-circle-document").modal("show");
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

	$('#start_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});
	$('#end_time_event').datepicker({
	    format: "yyyy/mm/dd",
	    autoclose: true
	});

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
	$('#go-to-tasks').on('click', function(e) {
		e.preventDefault();
		var top = $('#tasks-anchor').offset().top - 75
		$('html, body').animate({ scrollTop: top }, 1000)
	});

});









