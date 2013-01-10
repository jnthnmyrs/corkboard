var Pictures = new Meteor.Collection("pictures");
var Comments = new Meteor.Collection("comments");
var Tags = new Meteor.Collection("tags");


Pictures.allow({
	insert: function (userID, picture){
        return true;
	},
	update: function (userID, pictures, fields, modifier){
		return _.all(pictures, function (picture) {
			if (userID !== picture.owner)
				return false; // not the owner

			var allowed = ["title", "imgUrl"];
			if (_.difference(fields, allowed).length)
				return false; // tried to write to forbidden field

			return true;
		});
	},
	remove: function (userID, pictures) {
        return _.all(pictures, function (pic) {
            return pic.owner == userID;
        });
	}

});

Comments.allow({
	insert: function (userID, comment){
    	return true;
	},
	remove: function (userID, comments) {
        return _.all(comments, function (com) {
            return com.owner == userID;
    	});
    }
});

Tags.allow({
	insert: function (userID, tag){
    	return true;
	},
	remove: function (userID, tag) {
        return _.all(tags, function (tg) {
            return tg.owner == userID;
    	});
    }
});

Meteor.users.allow({
  update: function(userId, docs) {
    var user = Meteor.users.findOne(userId);
    return user == userId;
  }
});
