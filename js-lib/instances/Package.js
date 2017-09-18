'use strict'

const abTypes = require('../ab-types');

const Viewable = require('../Viewable');

const Module = require('./Module');


class Package
{

    constructor(package_path)
    {
        Object.defineProperties(this, {
            $path: { value: package_path, },
        });
    }

    module(module_name, module_init_fn, module_prototype = null)
    {
        if (this._$initialized)
            throw new Error('Cannot declare modules after initialization.');

        let module_class = Module.CreatePublic(this, module_name, module_init_fn,
                module_prototype);

        Object.defineProperty(this, '$' + module_name, {
            value: module_class,
            enumerable: true,
        });

        return this;
    }

}
module.exports = Package;
