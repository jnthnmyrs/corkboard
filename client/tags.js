
//--------------------------------------------------
//  Tags
//--------------------------------------------------


Template.tagList.tags = function() {
    var tp = Session.get("selected_thumbnail");

    if(tp){
        var tags = Pictures.findOne({_id: tp}).tags;
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