/* jshint node: true */
'use strict';

var debug = require('debug')('ember-css-modules:output-styles-preprocessor');
var path = require('path');
var toposort = require('toposort');
var Concat = require('broccoli-concat');
var Funnel = require('broccoli-funnel');

module.exports = OutputStylesPreprocessor;

function OutputStylesPreprocessor(options) {
  this.owner = options.owner;
}

OutputStylesPreprocessor.prototype.constructor = OutputStylesPreprocessor;
OutputStylesPreprocessor.prototype.toTree = function(inputNode, inputPath, outputDirectory, options) {
  var outputFile = options.outputPaths[this.owner.belongsToAddon() ? 'addon' : 'app'];
  var concatOptions = {
    inputFiles: ['**/*.css'],
    outputFile: outputFile,
    allowNone: true
  };

  debug('concatenating module stylesheets: %o', concatOptions);

  return this.dynamicHeaderConcat(concatOptions);
};

/*
 * Based on the @after-module directives in the source files, produces an ordered list of files that should be
 * boosted to the top of the concatenated output.
 */
OutputStylesPreprocessor.prototype.getHeaderFiles = function(modulesTree) {
  var dependencies = this.owner.getModuleDependencies();
  var basePath = modulesTree.inputPaths[0];
  var input = [];

  Object.keys(dependencies).forEach(function(file) {
    var deps = dependencies[file];
    if (!deps.length) return;

    // For each file with module dependencies, create a chain of edges in the reverse order they appear in source
    var relativeFile = file.replace(basePath, '');
    for (var i = deps.length - 1; i >= 0; i--) {
      var relativeDep = deps[i].replace(basePath, '');
      input.push([relativeFile, relativeDep]);
      relativeFile = relativeDep;
    }
  });

  var sorted = toposort(input).reverse();
  debug('sorted dependencies %o', sorted);
  return sorted;
};

/*
 * A broccoli-concat tree that will dynamically order header files based on our @after-module directives.
 */
OutputStylesPreprocessor.prototype.dynamicHeaderConcat = function(options) {
  var modulesTree = this.owner.getModulesTree();
  var getHeaderFiles = this.getHeaderFiles.bind(this, modulesTree);

  var concat = new Concat(modulesTree, options);
  var build = concat.build;
  concat.build = function() {
    this.headerFiles = getHeaderFiles();
    return build.apply(this, arguments);
  };

  return concat;
}
