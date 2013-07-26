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
        var fileName = file.name;
        var reader = new FileReader();
        var d = new Date().toISOString(); //"2011-12-19T15:28:46.493Z"  //.toDateString("year");
        var title = prompt("Title of image:");
        var timestamp = (new Date()).getTime();
        var ownerName = "Someone";
        var userEmail = Meteor.user().emails[0].address;
        var userName = userEmail.split('@').shift().replace('.', ' ');

        console.log(file);

        reader.onload = function (evt) {
            Meteor.call('saveFile', evt.srcElement.result, fileName, null, 'binary');
            console.log(evt);
            // evt.srcElement.file, function(file) {
            // Meteor.saveFile(file, file.name);
            // };

            var newPicture = {
                title: title,
                date: d,
                timestamp: timestamp,
                imgUrl: "public/" + fileName,
                pictureOwner: Meteor.user(),
                tags: {},
                emailList: []
            };
            newPicture.emailList.push(userEmail);
            newPicture.tags[userName] = 0;
            Pictures.insert(newPicture);

        };
        reader.readAsBinaryString(file);

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
        Router.setList("home");
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
    var phraseArray = ["Share your work.", true, 10, undefined, "Get feedback.", "Give tips.", "Pass it on.", "Work fast.", "Converse.", "Capitalize.", "Achieve stuff.", "Sharpen.", "Proof read."]
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