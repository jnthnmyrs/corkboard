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

// ID of currently selected list
Session.set('list_id', null);

// Name of currently selected tag for filtering
Session.set('tag_filter', null);

// When adding tag to a picture, ID of the picture
Session.set('editing_addtag', null);

// When editing a list name, ID of the list
Session.set('editing_listname', null);

// When editing todo text, ID of the todo
Session.set('editing_itemname', null);


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
        var title = null;
        var timestamp = (new Date()).getTime();

        
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

    'dragenter #dropzone': function (e) {
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


Template.thumbnail.events({

    'click': function() {  
        return Session.set("selected_thumbnail", this._id);
    },

    'click .delete': function(){
        var tp = Session.get("selected_thumbnail");
        var dp = Pictures.remove(this);
        var dc = Comments.remove({targetPicture: tp});
        var dpc = dp, dc;
        Session.set("selected_thumbnail", undefined);

        return dpc;
    },

    'dblclick .title': function (evt, tmpl) { // start editing list name
        Session.set('editing_listname', this._id);
        Meteor.flush(); // force DOM redraw, so we can focus the edit field
        activateInput(tmpl.find("#title-input"));
        console
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













