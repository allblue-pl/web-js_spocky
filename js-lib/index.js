'use strict';

const
    js0 = require('js0'),

    abFields = require('ab-fields')
;

export const Ext = require('./Ext');
export const Layout = require('./Layout');
export const Module = require('./Module');
export const Site = require('./Site');


const exts = [];

export function ext(spockyExt) {
    js0.args(arguments, Ext);

    Layout.Extensions.push((layoutNode) => {
        spockyExt.onParseLayoutNode(layoutNode);
    });
}


export const Debug = false;
export function setDebug(debug) {
    module.exports.Debug = debug;
    abFields.setDebug(debug);
};