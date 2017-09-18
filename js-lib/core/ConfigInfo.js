'use strict';

const abTypes = require('../ab-types');

const Config = require('../instances/Config');
const Infos = require('./Infos');


class ConfigInfo {

    constructor(infos)
    {
        abTypes.args(arguments, Infos);

        Object.defineProperties(this, {
            useHash: { value: false, writable: true, },
            baseUri: { value: null, writable: true, },
            pages: { value: new Map(), },
            containerInfos: { value: new Map(), },

            _infos: { value: infos },
        });
    }

    init()
    {
        if (this._initialized)
            throw new Error('`spocky` already initialized.');

        let config = new Config(this._infos, this);
        for (let i = 0; i < this._infos.configs.length; i++)
            this._infos.configs[i].initFn(config);

        if (this.baseUri === null) {
            let pathname = window.location.pathname;
            let base_uri_end_index = pathname.lastIndexOf('/');
            if (base_uri_end_index === false)
                this.baseUri = '';
            else
                this.baseUri = pathname.substring(0, base_uri_end_index + 1);
        }
    }

}
module.exports = ConfigInfo;
