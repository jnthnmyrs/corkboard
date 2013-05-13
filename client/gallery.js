
//--------------------------------------------------
//  Gallery
//--------------------------------------------------


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



var postLimit = 5;
Session.set("postLimit", postLimit);
var searchValue = $("#tagSearch").val();
Session.set("searchToken", searchValue);

Template.gallery.thumbnails = function() {
    if(Session.get("searchToken")){
        var key = "tags." + Session.get("searchToken");
        var query = {};
        query[key] = { "$exists": true };
        return Pictures.find(query);
    }
    if(Session.get("selected_thumbnail")){

        return Pictures.find({"_id": Session.get("selected_thumbnail")});
    }
    return Pictures.find({},{limit: Session.get("postLimit"), sort: {timestamp: -1}});  //,{sort: {timestamp: -1}}
};

// Template.gallery.loadMoreLink = function () {
//     return    this.html('<a href="#" id="loadMoreLink">Load More Posts</a>');
// };

Template.tagSearch.resetButton = function(){
    return "✖";
};


Template.tagSearch.events = ({
    'keyup #tagSearch': function() {
        var searchValue = $("#tagSearch").val();
        Session.set("searchToken", searchValue);
        Session.set("selected_thumbnail", null);
        var key = "tags." + Session.get("searchToken");
        var query = {};
        query[key] = { "$exists": true };

        var results = Pictures.find(query);
        results.forEach(function (item) {
            console.log(item.tags)
        });
    },
    'click .reset': function (){
        $("#tagSearch").val('');
        Session.set("searchToken", null);
        Session.set("selected_thumbnail", null);
    }
});
    
Template.gallery.events = {
    'click #loadMoreLink': function() { 
        postLimit += 5;
        Session.set("postLimit", postLimit);
        //console.log(postLimit);
    },
    'click .back': function(){
        Session.set("selected_thumbnail", undefined);
        // $("#tagSearch").val() = null;
    }
};


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

        // Router.setList(this._id);

        var id = Session.get("selected_thumbnail");
        var tagId = Tags.find({targetPicture: id},{})._id;
        var commentId = Comments.findOne({targetPicture: id});

        // console.log(commentId);

        return true;
    },

    'click .delete': function(e){
        if( this.pictureOwner._id == Meteor.userId()){
            if(confirm("Delete " + '"' + this.title + '"' + "?")){
                
                var id = Session.get("selected_thumbnail");
                // var tagId = Tags.find({targetPicture: id},{})._id;
                var commentId = Comments.find({targetPicture: id});

                // console.log(commentId.collection.docs);

                Pictures.remove(this._id);
                
                for (var i = commentId.collection.docs.length - 1; i >= 0; i--) {
                    Comments.remove({"_id": commentId.collection.docs[i]._id});
                };

                
                
                
                Session.set("selected_thumbnail", null);
                
            }
        }
        e.preventDefault();

    },

    'dblclick .title': function (evt, tmpl) { // start editing list name    contextmenu
        evt.preventDefault();
        if( this.pictureOwner._id == Meteor.userId()){
            Session.set('editing_title', this._id);
            Meteor.flush(); // force DOM redraw, so we can focus the edit field
            activateInput(tmpl.find(".title-input"));
        };
  }

});