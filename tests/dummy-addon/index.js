/*jshint node:true*/
module.exports = {
  name: 'dummy-addon',

  options: {
    cssModules: {
      concat: {
        headerFiles: ['styles/header.css'],
        exclude: ['styles/excluded.css']
      }
    }
  },

  hintingEnabled: function() {
    return false;
  },

  isDevelopingAddon: function() {
    return true;
  }
};
