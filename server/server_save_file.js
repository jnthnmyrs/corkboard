/**
 * TODO support other encodings:
 * http://stackoverflow.com/questions/7329128/how-to-write-binary-data-to-a-file-using-node-js
 */
Meteor.methods({
  saveFile: function(blob, name, path, encoding) {

    
    var path = cleanPath(path), fs = Npm.require('fs'),
      name = cleanName(name || 'file'), encoding = encoding || 'binary',
      chroot = Meteor.chroot || 'public/pictures';
    // Clean up the path. Remove any initial and final '/' -we prefix them-,
    // any sort of attempt to go to the parent directory '..' and any empty directories in
    // between '/////' - which may happen after removing '..'
    path = chroot + (path ? '/' + path + '/' : '/');
    
    console.log(path, name, encoding, blob.length);

    // TODO Add file existance checks, etc...
    fs.writeFileSync(path + name, blob, encoding, function(err) {
      if (err) {
        throw (new Meteor.Error(500, 'Failed to save file.', err));
      } else {
        console.log('The file ' + name + ' (' + encoding + ') was saved to ' + path);
      }
    }); 

    // var im = Npm.require('imagemagick');
    // im.resize({
    //   srcData: fs.readFileSync(path + name, 'binary'),
    //   width:   256
    // }, function(err, stdout, stderr){
    //   if (err) throw err
    //   fs.writeFileSync(path + 'thumb' + name, stdout, 'binary');
    //   console.log('resized kittens.jpg to fit within 256x256px')
    // });


    function cleanPath(str) {
      if (str) {
        return str.replace(/\.\./g,'').replace(/\/+/g,'').
          replace(/^\/+/,'').replace(/\/+$/,'');
      }
    }
    function cleanName(str) {
      return str.replace(/\.\./g,'').replace(/\//g,'');
    }
  }
});