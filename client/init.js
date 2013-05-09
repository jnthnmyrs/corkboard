$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });

    //$('img.lazy').lazyload();

    // function loadURL(url) {
    //             console.log("loadURL: " + url);
    //             $("#area").load(url);
    // };

    // $.address.init(function(event) {
    //     console.log("init: " + $('[rel=address:' + event.value + ']').attr('href'));
    // }).change(function(event) {
    //     $("#area").load($('[rel=address:' + event.value + ']').attr('href'));
    //     console.log("change");
    // })

    // $('a').address(function() {  
    //     console.log('this is happening');
    //     return $(this).attr('href').replace(/^#/, '');  
    // });  
});







//--------------------------------------------------
//  Session variables
//--------------------------------------------------


// When editing a title, ID of the title
Session.set('editing_title', null);

// When editing a comment, ID of the comment
Session.set('editing_comment', null);

Handlebars.registerHelper('selected_thumbnail',function(input){
  return Session.get("selected_thumbnail");
});


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


Template.allTheContent.events({
    'click .back': function(){
        Session.set("selected_thumbnail", undefined);
        // $("#tagSearch").val() = null;


    }
});

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
        var userEmail = Meteor.user().emails[0].address;
        var userName = userEmail.split('@').shift().replace('.', ' ');

        reader.onload = function (evt) {

            var newPicture = {
                title: title,
                date: d,
                timestamp: timestamp,
                imgUrl: reader.result,
                pictureOwner: Meteor.user(),
                tags: {},
                emailList: []
            };
            newPicture.emailList.push(userEmail);
            newPicture.tags[userName] = 0;
            Pictures.insert(newPicture);

        };
        reader.readAsDataURL(file);

        // Here's an email send directive
        // Email.send({
        //     to,
        //     from,
        //     subject,
        //     text
        // }

    //     Meteor.call('sendEmail',
    //         'jonathan.myers@markit.com',
    //         'jonathan.myers@markit.com',
    //         'Hello from Corkboard!',
    //         'This is a test of Email.send.');

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
    var phraseArray = ["Share your work.", "Get feedback.", "Give tips.", "Pass it on.", "Work fast.", "Converse.", "Capitalize.", "Achieve stuff.", "Sharpen.", "Proof read."]
    var phraseNumber = Math.floor(Math.random()*10);
    return phraseArray[phraseNumber]; // (Math.floor(Math.random()*10)
};


Template.sidebar.hasFileReader = function () {
    return !!window.FileReader;
};
// This is here to display the title of the picture above its comments
Template.sidebar.selectedTitle = function () {
    var tp = Session.get("selected_thumbnail"); 
    var title = Pictures.findOne({_id:tp}, {});//.fetch()[0];    //findOne({_id:tp});
    if (title) {
        return title.title;
    };
};


//--------------------------------------------------
//  Gallery
//--------------------------------------------------
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
   // $("time.timeago").timeago();
   //  thisDate = this.date;
   thisDate = $.timeago(this.date);
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

Template.commentList.subscribeButtonClass = function () {
    if(Meteor.user()){
    if(Session.get("selected_thumbnail")){
        var targetPicture = Session.get("selected_thumbnail");
        var user = Meteor.user();
        var userEmail = user.emails[0].address;
        var thisPicture = Pictures.findOne({"_id": targetPicture});
        var emailAdds = thisPicture.emailList;
        //console.log(user);

        //This checks if the user has already subscribed  
        if(emailAdds.indexOf( userEmail ) > -1) {
            
            return "btn-success";

        } else {
            
            return "";
        };
    };
    };
};

Template.commentList.subscribeButtonText = function () {
    if(Meteor.user()){
    if(Session.get("selected_thumbnail")){
        var targetPicture = Session.get("selected_thumbnail");
        var user = Meteor.user();
        var userEmail = user.emails[0].address;
        var thisPicture = Pictures.findOne({"_id": targetPicture});
        var emailAdds = thisPicture.emailList;
        //console.log(user);

        //This checks if the user has already subscribed  
        if(emailAdds.indexOf( userEmail ) > -1) {
            
            return "You are subscribed";

        } else {
            
            return "Subscribe to this post?";
        };
    };
    };
};

Template.commentList.subscribedList = function () {
    if(Session.get("selected_thumbnail")) {
    var targetPicture = Session.get("selected_thumbnail");
    var thisPicture = Pictures.findOne({"_id": targetPicture});
    var emailAdds = thisPicture.emailList;

    return emailAdds;
    }
    return "nothing selected";
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
        if( this.commentOwner == Meteor.userId()){
            return Comments.remove(this._id);
        };
    }

});


Template.commentList.events = ({

//This action if for subscribing to the comment emails for the currently selected post

    'click #subscribeButton': function(){
        var targetPicture = Session.get("selected_thumbnail");
        var user = Meteor.user();
        var userEmail = user.emails[0].address;
        var thisPicture = Pictures.findOne({"_id": targetPicture});
        var emailAdds = thisPicture.emailList;

        // This checks if the user has already subscribed
        if(emailAdds.indexOf( userEmail ) > -1) {
            emailAdds.splice(emailAdds.indexOf(userEmail), 1);
            Pictures.update({"_id": targetPicture}, {'$set': {emailList: emailAdds}});


        } else {
            emailAdds.push(userEmail);
            Pictures.update({"_id": targetPicture}, {'$set': {emailList: emailAdds}});

        };

    },

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
                commentOwner: Meteor.userId()
            });

            // Pictures.insert({targetPicture}, {comments: []);



            // Pictures.update({targetPicture}, comments, );
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

        // This is where an email gets sent to the creator of this picture
        var targetPictureObject = Pictures.findOne({"_id": targetPicture}); 
        var targetEmail = targetPictureObject.pictureOwner.emails[0].address;
        var targetName = targetEmail.split('@').shift().replace('.', ' ');
        var emailAdds = targetPictureObject.emailList;
        var commenterName = commentAuthor.emails[0].address.split('@').shift().replace('.', ' ');

       

        Meteor.call('sendEmail',
        emailAdds,
        'jonathan.myers@markit.com',
        commenterName + ' commented on ' + targetName + "'s" +' post!',
        "Hey, Gang!\n\n" + commenterName + ' commented on ' + targetName + "'s" +' post!\n\n---\n\n' + commentContent + "\n\n---\n\nCheck it out on Corkboard.\n\n- The Corkboard Team"
        );

       }
    },

    'click #commentSubmit': function(){

        var timestamp = (new Date()).getTime();
        var targetPicture = Session.get("selected_thumbnail");
        var commentContent = $("#commentField").val();
        var commentAuthor = Meteor.user();

        Comments.insert({
            targetPicture: targetPicture,
            commentContent: commentContent,
            commentAuthor: commentAuthor,
            commentOwner: Meteor.userId()
        });

        var targetPictureObject = Pictures.findOne({"_id": targetPicture}); 
        var targetEmail = targetPictureObject.pictureOwner.emails[0].address;
        var emailAdds = targetPictureObject.emailList;
        var targetName = targetEmail.split('@').shift().replace('.', ' ');
        var commenterName = commentAuthor.emails[0].address.split('@').shift().replace('.', ' ');

        

        Meteor.call('sendEmail',
        emailAdds,
        'jonathan.myers@markit.com',
        commenterName + ' commented on ' + targetName + "'s" +' post!',
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

    if(tp){
        var tags = Pictures.findOne({_id: tp}).tags;
        // console.log(tags);

        var tagList = [];
        for(var tag in tags)
        {
            tagList.push(tag);
        }
        return tagList;
    } return false;
};




Template.tagInput.events = ({
    'keyup': function(evt) {
        var tp = Session.get("selected_thumbnail");
        var to = Pictures.findOne({_id: tp}).pictureOwner._id;

           if (evt.which === 13  && $("#tagInput").val() != "" && to == Meteor.userId()){
            var timestamp = (new Date()).getTime();
            var targetPicture = Session.get("selected_thumbnail");
            var tagContent = $("#tagInput").val().toLowerCase();
            var tagAuthor = Meteor.user();
            var updatePicture = Pictures.findOne({_id: tp});

            var tags = updatePicture.tags;
            tags[tagContent] = 0;

                Pictures.update({_id: targetPicture}, {'$set': {tags: tags}});


                // this resets the commentField so the placeholder text shows up
                $('#tagInput').val('');

                var tagStuff = Pictures.findOne({_id: targetPicture}).tags;
                console.log(tagStuff);
            };     
    }
});

Template.tagEntry.deleteButton = function () {
    
    var tp = Session.get("selected_thumbnail");
    var to = Pictures.findOne({_id: tp}).pictureOwner._id;

    if( to == Meteor.userId()){
        return "✖";
    }
};

Template.tagEntry.events = ({
    'click .delete': function () {

        // This if statement might be a little bit redundant because the X won't even show up if it doesn't belong to you.

        var tp = Session.get("selected_thumbnail");
        // var to = Pictures.findOne({"_id": tp}).pictureOwner._id;
        var tagNames = Pictures.findOne({"_id": tp}).tags;
        //console.log("tagnames " + tagNames);
        // console.log("The id of the currently selected image: " + tp);
        // console.log(Pictures.findOne({"_id": tp}));

        delete tagNames[this];

        Pictures.update({_id: tp}, {"$set": {tags: tagNames}});
        $("#tagSearch").val() = $("#tagSearch").val("");
        
    },

    'click': function(){
        $("#tagSearch").val(this.toString());
        Session.set("searchToken", this.toString());
        console.log("The id of the currently selected image: " + Session.get("selected_thumbnail"));
        Session.set("selected_thumbnail", null);
    }
});




//--------------------------------------------------
//  Routing
//--------------------------------------------------


// var myAppRouter = Backbone.Router.extend({
//     routes: {
//         "*path" : "main"
//     },
//     main: function (url_path) {
//         Session.get('selected_thumbnail');
//     }
// });

// Router = new myAppRouter;

// Backbone.history.start({pushState: true});
// // use HTML5 pushState when available
    























