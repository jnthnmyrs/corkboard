$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });
});



//--------------------------------------------------
//  Sidebar
//--------------------------------------------------

Template.sidebar.events({

    'drop #dropzone': function (e) {
        e.preventDefault();
        $(e.currentTarget).removeClass('focused');

        var dt = e.dataTransfer;
        var file = dt.files[0];
        var reader = new FileReader();
        var d = new Date().toDateString("year");
        var title = prompt("What would you like to title this image?");
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


// I've placed these two variables (phraseArray and randomNumber)
// outside of the Template.sidebar.about function so that it
// won't update every time the sidebar is rendered.  I suspect 
// there is a nicer way to go about this.  - Jonathan
// This guy is here to create "random" little things that show up in the upper-left corner right under "Corkboard"
var phraseArray = ["", "Share your work.", "Get feedback.", "Give tips.", "Pass it on.", "Work fast.", "Converse.", "Capitalize.", "Achieve.", "Sharpen.", "Proof read."]
var randomNumber=Math.floor(Math.random()*11)
Template.sidebar.about = function () {
    return phraseArray[randomNumber];
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

Template.thumbnail.username = function() {
    return this.owner;
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

    'dblclick .title': function (evt, tmpl) { // start editing list name
        Session.set('editing_listname', this._id);
        Meteor.flush(); // force DOM redraw, so we can focus the edit field
        console.log('editing...');
        activateInput(tmpl.find("#title-input"));
        
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




