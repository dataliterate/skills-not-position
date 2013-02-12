var _ = require('underscore');
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};
module.exports = _;