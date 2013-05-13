$(document).ready( function () {

    // Don't respond to drop events on the main page.
    $(document).on('drop', function (e) {
        e.preventDefault();
    });
 
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



//---

Template.allTheContent.events({
    'click .back': function(){
        Session.set("selected_thumbnail", undefined);
        // $("#tagSearch").val() = null;


    }
});




//--------------------------------------------------
//  Routing
//--------------------------------------------------


// var TodosRouter = Backbone.Router.extend({
//   routes: {
//     ":selected_thumbnail": "main"
//   },
//   main: function (selected_thumbnail) {
//     Session.set("selected_thumbnail", selected_thumbnail);
//     Session.set("tag_filter", null);
//   },
//   setList: function (selected_thumbnail) {
//     this.navigate(selected_thumbnail, true);
//   }
// });

// Router = new TodosRouter;

// Meteor.startup(function () {
//   Backbone.history.start({pushState: true});
// });
















