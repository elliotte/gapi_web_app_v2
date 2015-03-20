

$(document).ready(function () {
    
	//$('#disconnect').click(helper.disconnectServer);

	// $("#go-home").click(function(e) {
	// 	e.preventDefault();
	// 	window.location.href = '/';
	// });
	$("#quick_add_event").click(function() {
		$("#modal-window-quick-create-event").modal("show");

	});
	$("#view-teams").click(function() {
		$("#modal-window-view-teams").modal("show");

	});
	$("#add_event").click(function() {
		 
		 $("#modal-window-create-event").modal("show");
   		 $("#search_calendar_ppl").tokenInput("/circles/circles_names.json", {
      		theme: "facebook",
      		crossDomain: false,
      		hintText: "search teams"
    	 });
    	$(".token-input-dropdown-facebook").css("z-index","9999")

	});
	$(".new_doc").click(function() {
		$("#modal-window-new-doc").modal("show");
	});
	$(".add-to-do").click(function() {
		var route = $("#create-task-list-to-do").attr('href');
		$.get(route);
	});
	$(".new_ss").click(function() {
		$("#modal-window-new-ss").modal("show");
	});
	// $("#create_circle").click(function() {
	// 	$("#modal-window-create-circle").modal("show");
	// });
	$("#team_new").click(function() {
		$("#modal-window-create-circle").modal("show");
	});
	$(".new_file_import").click(function() {
		$("#modal-window-new-file-import").modal("show");
	});
	$("#create_spreadsheet").click(function() {
		$('#modal-window-new-file-import').modal('hide');
		$("#modal-window-create-spreadsheet").modal("show");
	});
	$("#create_document").click(function() {
		$('#modal-window-new-file-import').modal('hide');
		$("#modal-window-create-document").modal("show");
	});
	$('#view-all-files').click(function() {
		$("#modal-window-user-files").modal("show");
	});

	$('view-all-team-files').click(function() {
		$('#modal-window-view-teamfiles').modal('show')
	})
	// $("#create_tasklist").click(function() {
	// 	$("#modal-window-create-tasklist").modal("show");
	// });
	$(".add-team-member").click(function() {
		$("#modal-window-add-circle-member").modal("show");
	});
	$("#create_team_message").click(function() {
		$("#modal-window-circle-add-message").modal("show");
	});
	
	$("#create-team-wallpin").click(function() {
		$("#modal-window-circle-add-wallpin").modal("show");
	});
	$(".create-team-file").click(function() {
		$("#modal-window-create-circle-document").modal("show");
	});

	$(".destroy-item").click(function() {
		$("#modal-window-destroy-item").modal("show");
		$('#circle_item_id').val($(this).data('id'));
		$('#circle_item_type').val($(this).data('item'));
	});
	// // search google Plus profiles
	// $("#search-glyphicon").on("click", function() {
	// 	text = $('#search_p').val()
	// 	//sets for use if nextPageToken
	// 	$('#query').val(text)
	// 	$.ajax({
 //          type: 'GET',
 //          url: '/peoples/search',
 //          dataType: 'json',
 //          contentType: 'application/json',
 //          data: {query: text},
 //          success: function(result) {
 //          	token = JSON.parse(result)['nextPageToken']
 //          	results = JSON.parse(result).items
 //            userHelper.appendPeopleSearch(results);
 //            //sets NextPageToken
	//         $('#googlePlus_search_form #next_page_token').val(token);
 //          }
 //        });
	// });
	// // gets nextPage of Search Results
	// $('#next_button_gplus_people_search').click(function(){
	//     $.ajax({
	//       type: 'GET',
	//       url: '/peoples/search',
	//       dataType: 'json',
	//       contentType: 'application/json',
	//       data: {query: $('#search_p').val(), next_page_token: $("#googlePlus_search_form #next_page_token").val()},
	//       success: function(result) {
	//       	token = JSON.parse(result)['nextPageToken']
	//         results = JSON.parse(result).items
	//         userHelper.appendPeopleSearch(results);
	//         $('#googlePlus_search_form #next_page_token').val(token);
	//       }
	//     });
	// });

	// // two seaerch modals and forms..
	$("#search_files").click(function() {
		$("#modal-window-quick-search-files").modal("show");
		$("#search_files_box").tokenInput("/files/search_files.json", {
      		theme: "facebook",
      		crossDomain: false,
      		hintText: "Enter search text"
    	 });
    	$(".token-input-dropdown-facebook").css("z-index","9999")
	});

	// $('#quick_create_button_close').click(function(){
	// 	$('#quick-events-modal-body').empty();
	// 	$('#modal-window-quick-create-event').modal('close');
	// });
	// $('#new-doc-insert-close').click(function(){
	// 	$('#new-doc-modal-body').empty();
	// });
	// $('#create_button_event').click(function(){
	// 	$('#create_event_form').submit();
	// });
	$('#create_button_circle').click(function(){
		$('#create_circle_form').submit();
	});
	$('#create_button_spreadsheet').click(function(){
		$('#create_spreadsheet_form').submit();
	});
	$('#create_button_document').click(function(){
		$('#create_document_form').submit();
	});
	// $('#create_button_tasklist').click(function(){
	//     $('#create_tasklist_form').submit();
	// });

	// $('#go-to-events').on('click', function(e) {
	// 	e.preventDefault();
	// 	var top = $('#events-anchor').offset().top - 75
	// 	$('html, body').animate({ scrollTop: top }, 1000)
	// });
	// $('#go-to-files').on('click', function(e) {
	// 	e.preventDefault();
	// 	var top = $('#files-anchor').offset().top - 75
	// 	$('html, body').animate({ scrollTop: top }, 1000)
	// });
	// $('#go-to-shared-files').on('click', function(e) {
	// 	e.preventDefault();
	// 	var top = $('#shared-files-anchor').offset().top - 75
	// 	$('html, body').animate({ scrollTop: top }, 1000)
	// });
	// $('#go-to-tasks').on('click', function(e) {
	// 	e.preventDefault();
	// 	var top = $('#tasks-anchor').offset().top - 75
	// 	$('html, body').animate({ scrollTop: top }, 1000)
	// });


	
	// cancelling time option so commented out for now..
	// $('#start_time_event').datepicker({
	//     format: "yyyy/mm/dd",
	//     autoclose: true
	// });
	// $('#end_time_event').datepicker({
	//     format: "yyyy/mm/dd",
	//     autoclose: true
	// });


});







