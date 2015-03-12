
var uiHelper = (function() {

  return {
    // files html method
    filesHtml: function(item) {
       mimeType = item.mimeType
       imageLink = "";

       if (item.thumbnailLink) {
         imageLink = item.thumbnailLink;
         console.log(mimeType)
         console.log(item)
       } else {
         
          if (mimeType.indexOf('folder') >= -1 ) {
              imageLink = "http://www.iconhot.com/icon/ico/vista-folder-colors/blue-folder.ico";
          }
          if (mimeType == "text/csv" ) {
              imageLink = "http://www.iconhot.com/icon/ico/vista-folder-colors/blue-folder.ico";
          }
          if (mimeType == "application/vnd.google-apps.document" ) {
              imageLink = "http://blogs.uis.edu/isat/files/2014/03/google_docs.png";
          } 
          if (mimeType.mimeType == "application/vnd.google-apps.spreadsheet") {
              imageLink = "http://icons.iconarchive.com/icons/carlosjj/google-jfk/128/spreadsheets-icon.png";
          }

       };

       var html =   '<div id=' + item.id + ' class="about-employee" style="background-image: url('+ imageLink +');">' +
                        '<div class="employee-bio">' +
                            '<a href="'+item.alternateLink+'" class="employee-name" target="_blank">' + item.title + '</a>' +
                            '<p class="bio-text file-card">' +
                             ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/destroy">' + 
                                 '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/trash-white.png" alt="asset-error">' + '</a>' +
                             ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/copy">' +
                                '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/copy icon.png" alt="asset-error">' + '</a>' +
                             ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/files/' + item.id + '/comments/show">' +
                                '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/white-comment.png" alt="asset-error">' + '</a>' +
                            '</p>' + 
                            '<div style="padding-top:5px;"id="export-links-' + item.id + '"></div>'+
                        '</div>' +
                    '</div>'

       

        return html
    },

    tasksHtml: function(task, taskListId) {
        
        iconNames = ['passion.svg', 'communication.svg', 'diligence.svg', 'innovation.svg', 'reliability.svg' ]
        iconIndex = Math.floor(Math.random() * 4) + 1

        var dateIfEntered = ""
          if ( !task.due ) {
            dateIfEntered = "None-SetBy-User"
          } else {
            dateIfEntered = task.due.substring(0,10)
          };
        var NotesIfTrue = ""
          if ( !task.notes ) {
            NotesIfTrue = "No-Notes"
          } else {
            NotesIfTrue = task.notes
          };
        var style = ""  
        var completeDate = ""
          if ( !task.completed ) {
            completeDate = "not-completed"
          } else {
            completeDate = task.completed.substring(0,10)
            style = "background-color:#62DF71;"
          };

        var html = '<div id=' + task.id + ' class="w-slide slide-about" style="'+style+'">' +
              '<div class="about-slide-container">' +
                  '<img class="about-icon" src="/assets/'+iconNames[iconIndex]+'" alt="asset-error">' +
                  '<h3>' + task.title + '</h3>' +
                  '<h3>' + NotesIfTrue + '</h3>' +
                  '<h3>' + completeDate + '</h3>' +
                  '<h3>'+
                    ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '/destroy">' + '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/trash icon.png" alt="asset-error">' + '</a>' +
                    ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/task_lists/' + taskListId + '/tasks/' + task.id + '">' + '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/edit icon.png" alt="asset-error">' + '</a>' +
                  '</h3>' +
              '</div>' +
        '</div>'

        return html

    },

     calendarHtml: function(event) {
        
        iconNames = ['passion.svg', 'communication.svg', 'diligence.svg', 'innovation.svg', 'reliability.svg' ]
        iconIndex = Math.floor(Math.random() * 4) + 1
        var attendees_email_list = [];
        
        if (event.attendees) {
          event.attendees.forEach(function(user) {
            string = user.email
            attendees_email_list.push(string);
          });
        } else {
          attendees_email_list.push("No attendees");
        }//END attendees prepare
        
        eventDate = new Date(event.start.dateTime)

        var html = '<div id=' + event.id + ' class="w-slide slide-about" style="background-color:#F9FE45;">' +
              '<div class="about-slide-container">' +
                  '<img class="about-icon" src="/assets/'+iconNames[iconIndex]+'" alt="asset-error">' +
                  '<h3><a href="' + event.htmlLink + '" target="_blank"> ' + event.summary + '</a></h3>'+
                  '<h3>' + attendees_email_list.join(" and ") + '</h3>' +
                  '<h3>' + eventDate.toLocaleDateString() + ' ,' + eventDate.toLocaleTimeString() + '</h3>' +
                  '<h3>'+
                    ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy">' + '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/trash icon.png" alt="asset-error">' + '</a>' +
                    ' <a data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '">' + '<img class="contact-icon action-button" style="display: inline-block;" src="/assets/edit icon.png" alt="asset-error">' + '</a>' +
                  '</h3>' +
              '</div>' +
        '</div>'

        return html
              // '<div class="feature-box-style2">'+
              //   '<div class="feature-box-title">'+
              //     '<i class="fa fa-calendar"></i>'+
              //   '</div>'+
              //   '<div class="feature-box-containt" style="height:250px; overflow:scroll;">'+
              //     '<p>' + attendees_email_list.join(" and ") + '</p>'+
              //     '<p>' + eventDate.toLocaleDateString() + ' ,' + eventDate.toLocaleTimeString() + '</p>'+
              //     '<p>'+
              //       ' <a class="btn btn-main-o" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '/destroy"><i class="fa fa-trash-o"><i></a>'+
              //       ' <a class="btn btn-primary" data-toggle="modal" data-target="#modal-window" data-remote=true href="/calendars/primary/events/' + event.id + '"><i class="fa fa-edit"></i></a>'+
              //       ' <a class="btn btn-primary" href="' + event.hangoutLink + '" target="_blank">Hangout</a>'+
              //     '</p>'+
              //   '</div>'+
              // '</div>'+

    },





  };


})();


