$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });

    // $("body").on('click', function(){
    //     Session.set("selected_thumbnail", undefined);
    //     console.log('unset');
    // });

    //$('img.lazy').lazyload();

});


//--------------------------------------------------
//  Session variables
//--------------------------------------------------


// When editing a title, ID of the title
Session.set('editing_title', null);




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
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
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

var activateInput = function (input) {
  input.focus();
  input.select();
};




//--------------------------------------------------
//  Sidebar
//--------------------------------------------------

Template.sidebar.rendered = function () { 

};

Template.sidebar.events({

    'drop #dropzone': function (e) {
        e.preventDefault();
        $(e.currentTarget).removeClass('focused');

        var dt = e.dataTransfer;
        var file = dt.files[0];
        var reader = new FileReader();
        var d = new Date().toDateString("year");
        var title = prompt("Title:");
        var timestamp = (new Date()).getTime();
        var ownerName = "Someone";
        
        reader.onload = function (evt) {
            Pictures.insert({
                title: title,
                date: d,
                timestamp: timestamp,
                imgUrl: reader.result,
                owner: Meteor.userId()
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

Template.sidebar.currentThumb = function () {
    var ct = Session.get("selected_thumbnail", "imgUrl");
    return ct;
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
//  Trying a hacky thing to unset the "selected_thumbnail" variable
//--------------------------------------------------
// Template.allTheContent.events({
//     'click' : function() {
//         return Session.set("selected_thumbnail", undefined);
//     }

// });


//--------------------------------------------------
//  Gallery
//--------------------------------------------------
Template.gallery.thumbnails = function() {
    return Pictures.find({},{sort: {timestamp: -1}});
    // return Pictures.find({}, {
    //   sort: {
    //     timestamp: 1,
    //   }
    // });
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

Template.thumbnail.owner = function(){
    var owner = Meteor.users.findOne({'_id': this.owner}),
        email = "unknown";
        // console.log(owner);

    if(!owner)
    {
        return email; 
    }

    email = owner.emails.shift();
    var name = email.address.split('@');

    return name.shift().replace('.', ' ');

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
        var tp = Session.get("selected_thumbnail");
        var dp = Pictures.remove(this);
        var dc = Comments.remove({targetPicture: tp});
        var dpc = dp, dc;
        Session.set("selected_thumbnail", undefined);

        return dpc;
    },

    'contextmenu .title': function (evt, tmpl) { // start editing list name
        evt.preventDefault();
        Session.set('editing_title', this._id);
        Meteor.flush(); // force DOM redraw, so we can focus the edit field
        console.log('editing...');
        activateInput(tmpl.find(".title-input"));
        
  }

});

// dblclick

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

Template.commentList.commentOwner = function(){
    var owner = Meteor.users.findOne({'_id': this.owner}),
        email = "unknown";

    if(!owner)
    {
        return email; 
    }

    email = owner.emails.shift();
    var name = email.address.split('@');

    return name.shift().replace('.', ' ');

};

// Just type the "Enter" key to submit a comment
$('#commentField').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#commentSubmit').focus().click();
        }
    });

Template.commentList.events = ({
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
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

    },
    'click .delete': function () {
        return Comments.remove(this);
    }

});



//--------------------------------------------------
//  Tracking selected list in URL
//--------------------------------------------------
// var TodosRouter = Backbone.Router.extend({
//   routes: {
//     ":list_id": "main"
//   },
//   main: function (list_id) {
//     Session.set("list_id", list_id);
//     Session.set("tag_filter", null);
//   },
//   setList: function (list_id) {
//     this.navigate(list_id, true);
//   }
// });

// Router = new TodosRouter;

// Meteor.startup(function () {
//   Backbone.history.start({pushState: true});
// });


// var Router = Backbone.Router.extend({
//   routes: {
//     "":                 "main", //this will be http://your_domain/
//     "help":             "help"  // http://your_domain/help
//   },

//   main: function() {
//     // Your homepage code
//     // for example: Session.set('currentPage', 'homePage');
//     Session.set('currentPage', 'homePage');
//   },

//   help: function() {
//     // Help page
//   }
// });
// var app = new Router;
// Meteor.startup(function () {
//   Backbone.history.start({pushState: true});
// });



//--------------------------------------------------
//  Other stuff
//--------------------------------------------------



