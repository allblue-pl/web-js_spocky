'use strict';

const js0 = require('js0');

const Config = require('../instances/Config');
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
