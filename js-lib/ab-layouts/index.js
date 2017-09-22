'use strict';

const LayoutNode = require('./LayoutNode');


const abLayouts = new class abLayouts
{

    get LayoutNode() {
        return LayoutNode;
    }

    get Parser() {
        return require('./Parser');
    }

}();
module.exports = abLayouts;
