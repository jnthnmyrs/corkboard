
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
        var targetName = targetEmail.split('@').shift().split('.').shift(); //.replace('.', ' ');
        var emailAdds = targetPictureObject.emailList;
        var commenterName = commentAuthor.emails[0].address.split('@').shift().split('.').shift(); //.replace('.', ' ');

       

        Meteor.call('sendEmail',
        emailAdds,
        'noreply@markit.com',
        commenterName + ' commented on ' + targetName + "'s" +' post!',
        "Hello!\n\n" + commenterName + " commented on " + targetName + "'s post:\n\n" + '"' + commentContent + '"' + "\n\nBest,\n\nThe Corkboard Team"
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
        var targetName = targetEmail.split('@').shift().split('.').shift(); //.replace('.', ' ');
        var commenterName = commentAuthor.emails[0].address.split('@').shift().split('.').shift(); //.replace('.', ' ');

        

        Meteor.call('sendEmail',
        emailAdds,
        'noreply@markit.com',
        commenterName + ' commented on ' + targetName + "'s" +' post!',
        "Hello!\n\n" + commenterName + " commented on " + targetName + "'s post:\n\n" + '"' + commentContent + '"' + "\n\nBest,\n\nThe Corkboard Team"
        );
        
        // this resets the commentField so the placeholder text shows up
        $('#commentField').val('');

    },

});
