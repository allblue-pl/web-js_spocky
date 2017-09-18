'use strict';

const ElementNode = require('./ElementNode');
const LayoutNode = require('./LayoutNode');


const abLayouts = new class abLayouts
{

    get ElementNode() {
        return ElementNode;
    }

    get LayoutNode() {
        return LayoutNode;
    }

    get Parser() {
        return require('./Parser');
    }

}();
module.exports = abLayouts;
