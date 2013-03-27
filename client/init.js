$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });

    //$('img.lazy').lazyload();

});


//--------------------------------------------------
//  Session variables
//--------------------------------------------------


// When editing a title, ID of the title
Session.set('editing_title', null);

// When editing a comment, ID of the comment
Session.set('editing_comment', null);


//--------------------------------------------------
// Helpers for in-place editing
//--------------------------------------------------
// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27 ||
                 evt.type === "focusout") {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13) {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};

//---

var activateInput = function (input) {
  input.focus();
  input.select();
};




//--------------------------------------------------
//  Sidebar
//--------------------------------------------------

// Template.sidebar.rendered = function () { 

// };

Template.sidebar.events({

    'drop #dropzone': function (e) {
        e.preventDefault();
        $(e.currentTarget).removeClass('focused');

        var dt = e.dataTransfer;
        var file = dt.files[0];
        var reader = new FileReader();
        var d = new Date().toISOString(); //"2011-12-19T15:28:46.493Z"  //.toDateString("year");
        var title = prompt("Title of image:");
        var timestamp = (new Date()).getTime();
        var ownerName = "Someone";
        
        reader.onload = function (evt) {
            Pictures.insert({
                title: title,
                date: d,
                timestamp: timestamp,
                imgUrl: reader.result,
                pictureOwner: Meteor.user()
            });
        };
        reader.readAsDataURL(file);

        // Here's an email send directive
        // Email.send({
        //     to,
        //     from,
        //     subject,
        //     text
        // }

        Meteor.call('sendEmail',
            'jonathan.myers@markit.com',
            'jonathan.myers@markit.com',
            'Hello from Corkboard!',
            'This is a test of Email.send.');

    },

    'dragover #dropzone': function (e) {
        e.preventDefault();
        $(e.currentTarget).addClass('focused');
    },

    'dragleave #dropzone': function (e) {
        $(e.currentTarget).removeClass('focused');
    },
    'click #homeLink': function() {
        return Session.set("selected_thumbnail", undefined);
    }

});


// This is here to swap out the search and upload boxes with the commentForm
Template.sidebar.hiddenSearchUpload = function () {
        if (Session.get("selected_thumbnail")) {
        return "hidden";
    } else {
        return "notHidden";
    };
};


Template.sidebar.about = function () {
// This guy is here to create "random" little things that show up in the upper-left corner right under "Corkboard"
    var phraseArray = ["Share your work.", "Get feedback.", "Give tips.", "Pass it on.", "Work fast.", "Converse.", "Capitalize.", "Achieve.", "Sharpen.", "Proof read."]
    var phraseNumber = Math.floor(Math.random()*10);
    return phraseArray[phraseNumber]; // (Math.floor(Math.random()*10)
};


Template.sidebar.hasFileReader = function () {
    return !!window.FileReader;
};
// This is here to display the title of the picture above its comments
Template.sidebar.selectedTitle = function () {
    var tp = Session.get("selected_thumbnail"); 
    var title = Pictures.find({_id:tp}, {}).fetch()[0];    //findOne({_id:tp});
    if (title) {
        return title.title;
    };
};


//--------------------------------------------------
//  Gallery
//--------------------------------------------------
Template.gallery.thumbnails = function() {
    return Pictures.find({},{sort: {timestamp: -1}});

};
    

//Put in the Template.gallery.events stuff here for unsetting the selected_thumbnail


//--------------------------------------------------
//  Thumbnails
//--------------------------------------------------
Template.thumbnail.selected = function() {
    if (Session.equals("selected_thumbnail", this._id)) {
      return "selected";
    } else {
      return "";
    }
};


Template.thumbnail.pictureOwner = function(){
    var pictureOwner = this.pictureOwner.emails[0].address.split('@').shift().replace('.', ' ');
    return pictureOwner;

};

Template.thumbnail.date = function () {
    thisDate = this.date;
    $("time.timeago").timeago();
    return thisDate;
};


Template.thumbnail.editing_title = function () {
  return Session.equals('editing_title', this._id);
};


Template.thumbnail.deleteButton = function () {
    if( this.pictureOwner._id == Meteor.userId()){
        return "✖"; // "&#10006;";
    }
};


// // // // // // // // // // // // // // // // // // // // // // // //  
// // // // // // // // // // // // // // // // // // // // // // // //  
// // // // // // // It's raining// // // // // // // // // // // // //  
// // // // // // // // // // // // // // // // // // // // // // // //  
// // // // // // // // // // // // // // // // // // // // // // // //  

// This stuff is for when you press Return or Esc
Template.thumbnail.events(okCancelEvents(
  '.title-input',
  {
    ok: function (value) {
        
        Pictures.update(this._id, {$set: {title: value}});
        Session.set('editing_title', null);

    },

    cancel: function () {
      Session.set('editing_title', null);
    }
  }));



Template.thumbnail.events({

    'click': function() {  
        if(Session.get("selected_thumbnail", this._id)){
            Session.set("selected_thumbnail", null);
        }
        Session.set("selected_thumbnail", this._id);

        return true;
    },

    'click .delete': function(e){
        if( this.pictureOwner._id == Meteor.userId()){
            if(confirm("You sure?")){
                Pictures.remove(this._id);
                Comments.remove({targetPicture: this._id});
                Session.set("selected_thumbnail", null);
            }
        }
        e.preventDefault();

    },

    'contextmenu .title': function (evt, tmpl) { // start editing list name
        evt.preventDefault();
        if( this.pictureOwner._id == Meteor.userId()){
            Session.set('editing_title', this._id);
            Meteor.flush(); // force DOM redraw, so we can focus the edit field
            activateInput(tmpl.find(".title-input"));
        };
  }

});


//--------------------------------------------------
//  Comments
//--------------------------------------------------
Template.commentList.comments = function() {
    var tp = Session.get("selected_thumbnail");

    return Comments.find({targetPicture: tp},{sort: {timestamp: -1}});
};

Template.commentList.hiddenComments = function () {
    if (Session.get("selected_thumbnail")) {
        return "notHidden";
    } else {
        return "hidden";
    }
};

Template.commentEntry.commentOwner = function(){
    var commentAuthor = this.commentAuthor.emails[0].address.split('@').shift().replace('.', ' ');
    return commentAuthor;

};

Template.commentEntry.deleteButton = function () {
    if( this.commentAuthor._id == Meteor.userId()){
        return "✖";
    }
};

Template.commentEntry.events = ({

    'click .delete': function () {
        // This if statement might be a little bit redundant because the X won't even show up if it doesn't belong to you.
        if( this.owner == Meteor.userId()){
            return Comments.remove(this._id);
        };
    }

});


Template.commentList.events = ({
    'keyup': function(evt) {
           if (evt.which === 13  && $("#commentField").val() != ""){
            var timestamp = (new Date()).getTime();
            var targetPicture = Session.get("selected_thumbnail");
            var commentContent = $("#commentField").val();
            var commentAuthor = Meteor.user();

            Comments.insert({
                targetPicture: targetPicture,
                commentContent: commentContent,
                commentAuthor: commentAuthor,
                owner: Meteor.userId()
        });
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

        // This is where an email gets sent to the creator of this picture
        var targetPictureObject = Pictures.findOne({"_id": targetPicture}); 
        var targetEmail = targetPictureObject.pictureOwner.emails[0].address;
        var targetName = targetEmail.split('@').shift().replace('.', ' ');
        var commenterName = commentAuthor.emails[0].address.split('@').shift().replace('.', ' ');

       

        Meteor.call('sendEmail',
        targetEmail,
        'jonathan.myers@markit.com',
        commenterName + ' commented on your post!',
        'Hi, ' + targetName + "!\n" + commenterName + " commented on your post:\n" + commentContent + "\nCheck it out on Corkboard.\n- The Corkboard Team"
        );



       }
    },

    'click .btn': function(){

        var timestamp = (new Date()).getTime();
        var targetPicture = Session.get("selected_thumbnail");
        var commentContent = $("#commentField").val();
        var commentAuthor = Meteor.user();

        Comments.insert({
            targetPicture: targetPicture,
            commentContent: commentContent,
            commentAuthor: commentAuthor,
            owner: Meteor.userId()
        });

        var targetPictureObject = Pictures.findOne({"_id": targetPicture}); 
        var targetEmail = targetPictureObject.pictureOwner.emails[0].address;
        var targetName = targetEmail.split('@').shift().replace('.', ' ');
        var commenterName = commentAuthor.emails[0].address.split('@').shift().replace('.', ' ');

        

        Meteor.call('sendEmail',
        targetEmail,
        'jonathan.myers@markit.com',
        commenterName + ' commented on your post!',
        'Hi, ' + targetName + "!\n" + commenterName + " commented on your post:\n" + commentContent + "\nCheck it out on Corkboard.\n- The Corkboard Team"
        );
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

    },

});




//--------------------------------------------------
//  Tags
//--------------------------------------------------
Template.tagList.tags = function() {
    var tp = Session.get("selected_thumbnail");

    return Tags.find({targetPicture: tp},{sort: {timestamp: -1}});
};



//--------------------------------------------------
//  Other stuff
//--------------------------------------------------

     
    


