'use strict';

const js0 = require('js0');

const Config = require('./Config');
const Inits = require('./Inits');


class ConfigInfo {

    constructor()
    {
        Object.defineProperties(this, {
            containerInfos: { value: new Map(), },
        });
    }

}
module.exports = ConfigInfo;
