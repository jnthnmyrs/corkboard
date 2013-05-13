
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