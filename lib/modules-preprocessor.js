/* jshint node: true */
'use strict';

var Funnel = require('broccoli-funnel');
var CSSModules = require('broccoli-css-modules');
var MergeTrees = require('broccoli-merge-trees');

var generateScopedName = require('./generate-scoped-name');
var resolvePath = require('./resolve-path');

module.exports = ModulesPreprocessor;

function ModulesPreprocessor(options) {
  this.owner = options.owner;
  this.ext = this.getExtension();
  this.modulesTree = null;
}

ModulesPreprocessor.prototype.constructor = ModulesPreprocessor;
ModulesPreprocessor.prototype.name = 'ember-css-modules';

ModulesPreprocessor.prototype.getModulesTree = function() {
  if (!this.modulesTree) {
    throw new Error('Unable to provide the modules tree before the preprocessor has been invoked');
  }

  return this.modulesTree;
};

ModulesPreprocessor.prototype.toTree = function(inputTree, path) {
  if (path !== '/') { return inputTree; }

  var inputWithStyles = this.inputTreeWithStyles(inputTree);

  // Hack: manually exclude stuff in tests/modules because of https://github.com/ember-cli/ember-cli-qunit/pull/96
  var modulesSources = new Funnel(inputWithStyles, {
    exclude: ['**/tests/modules/**'],
    include: ['**/*.css']
  });

  this.modulesTree = new CSSModules(modulesSources, {
    plugins: this.getPlugins(),
    generateScopedName: generateScopedName,
    resolvePath: resolvePath
  });

  var merged = new MergeTrees([inputWithStyles, this.modulesTree], { overwrite: true });

  // Exclude the individual CSS files – those will be concatenated into the styles tree later
  return new Funnel(merged, { exclude: ['**/*.css'] });
};

// This is gross, but we don't have a way to treat stuff in /app/styles uniformly with everything else in /app
ModulesPreprocessor.prototype.inputTreeWithStyles = function(inputTree) {
  // If we're attached to an addon, we're already good
  if (this.owner.belongsToAddon()) { return inputTree; }

  var appStyles = new Funnel(this.owner.app.trees.styles, { destDir: this.owner.app.name + '/styles' });
  return new MergeTrees([inputTree, appStyles]);
}

/*
 * When processing an addon, CSS won't be included unless `.css` is specified as the extension. On the other hand,
 * we'll get the CSS regardless when processing apps, but registering as a `.css` processor will cause terrible things
 * to happen when `app.import`ing a CSS file.
 */
ModulesPreprocessor.prototype.getExtension = function() {
  return this.owner.belongsToAddon() ? 'css' : null;
};

ModulesPreprocessor.prototype.getPlugins = function() {
  if (!this._plugins) {
    var plugins = this._plugins = this.owner.getPlugins();

    // If the given plugins object is a function, wrap it so loading returns the module source directly
    if (typeof plugins === 'function') {
      this._plugins = function(load) {
        return plugins(function(modulePath) {
          return load(modulePath).then(function(result) {
            return result.injectableSource;
          });
        });
      };
    }
  }

  return this._plugins;
};
