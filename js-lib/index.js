'use strict';

const
    js0 = require('js0'),

    abFields = require('ab-fields')
;

export const App = require('./App');
export const Ext = require('./Ext');
export const Layout = require('./Layout');
export const Module = require('./Module');


const exts = [];

export function ext(spockyExt) {
    js0.args(arguments, Ext);

    Layout.Extensions.push((layoutNode) => {
        spockyExt.onParseLayoutNode(layoutNode);
    });
}


export let Debug = false;
export function setDebug(debug) {
    exports.Debug = debug;
    abFields.setDebug(debug);
};