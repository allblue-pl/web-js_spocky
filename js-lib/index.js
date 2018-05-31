'use strict';

const
    abFields = require('ab-fields')
;


module.exports.Debug = false;
module.exports.setDebug = function setDebug(debug) {
    module.exports.Debug = debug;
    abFields.setDebug(debug);
};

module.exports.Layout = require('./Layout');
module.exports.Module = require('./Module');
module.exports.Site = require('./Site');