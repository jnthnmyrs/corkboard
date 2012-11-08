Pictures = new Meteor.Collection("pictures");

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
