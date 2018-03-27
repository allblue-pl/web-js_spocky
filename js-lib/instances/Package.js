'use strict'

const 
    js0 = require('js0'),

    Module = require('../Module'),
    App = require('./App')
;

class Package
{

    constructor(app, packagePath)
    {
        js0.args(arguments, App, 'string');

        Object.defineProperties(this, {
            $path: { value: packagePath, },
        });
    }

    create(createPath, ...args)
    {
        if (!(createPath in this))
            throw new Error(`Module '${this.$path}.${createPath}' does not exist.`);

        if (typeof this[createPath] !== 'function')
            throw new Error(`'${this.$path}.${createPath}' is not creatable.`);

        return new (Function.prototype.bind.apply(this[createPath], args))();
    }

    export(moduleFn)
    {
        let moduleName = moduleFn.name;
        Object.defineProperty(this, moduleName, {
            value: moduleFn,
            enumerable: true,
        });
    }

    import(importPath)
    {

    }

}
module.exports = Package;
