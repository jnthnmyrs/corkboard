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
        var d = new Date().toDateString("year");
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

// if (Session.get("selected_thumbnail")) {
//     $('#searchUpload').hide('fast');
// } else {
//     $('#searchUpload').show();
// };


Template.sidebar.about = function () {
// This guy is here to create "random" little things that show up in the upper-left corner right under "Corkboard"
    var phraseArray = ["Share your work.", "Get feedback.", "Give tips.", "Pass it on.", "Work fast.", "Converse.", "Capitalize.", "Achieve.", "Sharpen.", "Proof read."]
    return phraseArray[0]; // (Math.floor(Math.random()*10)
};

// Template.sidebar.currentThumb = function () {
//     var ct = Session.get("selected_thumbnail", "imgUrl");
//     return ct;
// };

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


// Template.thumbnail.owner = function(){

//     var owner = "";
//      console.log(owner.length);
//     // while(owner.length = 0){
//     //     owner = Meteor.users.findOne({'_id': this.owner});
//     // };
//     owner = Meteor.users.findOne({'_id': this.owner});
//     console.log(owner.emails[0].address);

//     // var owner = Meteor.users.findOne({'_id': this.owner}),
//     //     emailUnknown = "unknown";
//     // if(owner.length > 0){
//     //    var emailAddress = owner.emails[0].address;

//     //     alert(emailAddress);
//     //     }

//     // if(!owner)
//     // {
//     //     return emailUnknown; 
//     // }else{
//     //     email = owner.emails;
//     //     // console.log("This is the owner's email address " + email);
//     //     var name = email[0].address.split('@');
//     //     return name;//name.shift().replace('.', ' ');
//     // }
// };
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
        
          // console.log("The owner of this picture is " + this.owner);
          // console.log("The logged-in user is " + Meteor.userId());
    },
    cancel: function () {
      Session.set('editing_title', null);
    }
  }));


Template.thumbnail.editing_title = function () {
  return Session.equals('editing_title', this._id);
};


Template.thumbnail.events({

    'click': function() {  
        if(Session.get("selected_thumbnail", this._id)){
            Session.set("selected_thumbnail", null); 
        } else {
            Session.set("selected_thumbnail", this._id); 
        }
        
        // $(this).css("height", "900px");
        return true;
    },

    'click .delete': function(){
        // var tp = Session.get("selected_thumbnail");
        // var dp = Pictures.remove(this._id);
        // var dc = Comments.remove({targetPicture: tp});
        // var dpc = dp, dc;
        // Session.set("selected_thumbnail", undefined);

        // return confirm("Really? Delete your own handywork?").dpc;

        
        if(confirm("you sure?")){
            Pictures.remove(this._id);
            Comments.remove({targetPicture: this._id});
            Session.set("selected_thumbnail", null);
        }
    },

    'contextmenu .title': function (evt, tmpl) { // start editing list name
        evt.preventDefault();
        Session.set('editing_title', this._id);
        Meteor.flush(); // force DOM redraw, so we can focus the edit field
        console.log('editing...');
        activateInput(tmpl.find(".title-input"));
        
  }

});


//--------------------------------------------------
//  Tags
//--------------------------------------------------
Template.tagList.tags = function() {
    var tp = Session.get("selected_thumbnail");

    return Tags.find({targetPicture: tp},{sort: {timestamp: -1}});
};



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


//     var owner = Meteor.users.findOne({'_id': this.owner}),
//         email = "unknown";

//     if(!owner)
//     {
//         return email; 
//     }
// // THIS ISN'T WORKING RIGHT NOW. Something about Deps
//     email = owner.emails.shift();
//     var name = email.address.split('@');

//     return name.shift().replace('.', ' ');

};



// // This stuff is for when you press Return or Esc
// Template.commentEntry.events(okCancelEvents(
//   '.commentContent.title',
//   {
//     ok: function (value) {
//       Comments.update(this._id, {$set: {commentContent: value}});
//       Session.set('editing_comment', null);
//     },
//     cancel: function () {
//       Session.set('editing_comment', null);
//     }
//   }));

Template.commentEntry.events = ({

    'click .delete': function () {
        return Comments.remove(this._id);
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
            // owner: Meteor.userId()
        });
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

    },

});




//--------------------------------------------------
//  Other stuff
//--------------------------------------------------



