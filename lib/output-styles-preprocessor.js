/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:output-styles-preprocessor');
var path = require('path');
var Concat = require('broccoli-concat');
var Funnel = require('broccoli-funnel');

module.exports = OutputStylesPreprocessor;

function OutputStylesPreprocessor(options) {
  this.owner = options.owner;
}

OutputStylesPreprocessor.prototype.constructor = OutputStylesPreprocessor;
OutputStylesPreprocessor.prototype.toTree = function(inputNode, inputPath, outputDirectory, options) {
  var belongsToAddon = this.owner.belongsToAddon();
  var outputFile = options.outputPaths[belongsToAddon ? 'addon' : 'app'];
  var concatOptions = this.owner.getConcatOptions();
  var modulesTree = this.owner.getModulesTree();

  if (concatOptions.exclude) {
    var excludePaths = this.prefixParentFilePaths(concatOptions.exclude);
    debug('excluding files from concatenation: %o', excludePaths);
    modulesTree = new Funnel(modulesTree, { exclude: excludePaths });
  }

  var concatOptions = {
    headerFiles: this.prefixParentFilePaths(concatOptions.headerFiles),
    footerFiles: this.prefixParentFilePaths(concatOptions.footerFiles),
    inputFiles: ['**/*.css'],
    outputFile: outputFile,
    allowNone: true
  };

  debug('concatenating module stylesheets: %o', concatOptions);
  return new Concat(modulesTree, concatOptions);
};

OutputStylesPreprocessor.prototype.prefixParentFilePaths = function(paths) {
  if (!paths || !paths.length) { return []; }

  var parentName = this.owner.getParentName();
  var root = this.owner.belongsToAddon() ? path.join('modules', parentName) : parentName;

  return paths.map(function(file) {
    return path.join(root, file);
  });
}
