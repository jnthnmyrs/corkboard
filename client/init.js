$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });

});


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

        reader.onload = function (evt) {
            Pictures.insert({
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
    }

});


////////  This is temporary
Template.sidebar.userName = function () {
    return "Soren";
};

Template.sidebar.about = function () {
    return "Share your work.";
};

Template.sidebar.hasFileReader = function () {
    return !!window.FileReader;
};

//--------------------------------------------------
//  Gallery
//--------------------------------------------------
Template.gallery.thumbnails = function() {
    return Pictures.find({}, {
      sort: {
        date: -1,
        name: 1
      }
    });
};
    
//--------------------------------------------------
//  Thumbnails
//--------------------------------------------------
Template.thumbnail.events({

    'click': function() {
        return Session.set("selected_thumbnail", this._id);
    },

    'click .delete': function(){
        return Pictures.remove(this);
    }

});

