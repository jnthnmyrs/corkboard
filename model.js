var Pictures = new Meteor.Collection("pictures");
var Comments = new Meteor.Collection("comments");
var Tags = new Meteor.Collection("tags");


Pictures.allow({
	insert: function (userID, picture){
        return true;
	},

	// // THIS IS NOT CURRENTLY WORKING //

	// update: function (userID, pictures, fields, modifier){

	// 	var allowed = ["title", "imgUrl"];

	// 	return _.all(pictures, function (picture) {
	// 		 if (userID !== picture.owner){
	// 		 	return false; // not the owner
	// 		 } else if (_.difference(fields, allowed).length){
	// 		 	return false; // tried to write to forbidden field
	// 		 } else {
	// 		 	return true;

	// 		 };
	// 	});
	// },

	update: function (userID, picture, fields, modifier){

		return picture.pictureOwner._id === userID;

	},


	remove: function (userID, picture) {
       
            return picture.pictureOwner._id === userID;
       
	}

});

Comments.allow({
	insert: function (userID, comment){
    	return true;
	},
	remove: function (userID, comment) {
        // This is set to return true because I don't yet know how to 
        // delete comments when a whole picture is deleted.
        // When a picture is deleted, the comment conversation should
        // be deleted with it, but if this is checking to see if the 
        // comment.owner and userID match it won't delete those other 
        // comments.

        return true; //comment.commentOwner === userID;
    	
    }
});



Tags.allow({
	insert: function (userID, tag){
    	return true;
	},
	remove: function (userID, tag) {
        return true;
    }
});


