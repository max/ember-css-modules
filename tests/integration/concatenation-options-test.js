import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('Integration | Concatenation Options', {
  integration: true
});

test('addon config - concat.headerFiles', function(assert) {
  this.render(hbs`<div class="global-green-addon-class"></div>`);

  const el = this.$('.global-green-addon-class')[0];
  const styles = window.getComputedStyle(el);
  assert.equal(styles.fontFamily, 'green-from-addon-css');
});

test('addon config - concat.exclude', function(assert) {
  // see dummy-addon/addon/styles/excluded.css
  this.render(hbs`<div>hello</div>`);

  const el = this.$('div')[0];
  const styles = window.getComputedStyle(el);
  assert.notEqual(styles.backgroundColor, 'red');
});

test('app config - concat.headerFiles', function(assert) {
  this.render(hbs`<div class="global-green-addon-class"></div>`);

  const el = this.$('.global-green-addon-class')[0];
  const styles = window.getComputedStyle(el);
  assert.equal(styles.fontFamily, 'green-from-addon-css');
});

test('addon config - concat.exclude', function(assert) {
  // see dummy/app/styles/excluded.css
  this.render(hbs`<div>hello</div>`);

  const el = this.$('div')[0];
  const styles = window.getComputedStyle(el);
  assert.notEqual(styles.backgroundColor, 'orange');
});
