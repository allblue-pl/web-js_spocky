'use strict';

const 
    js0 = require('js0'),

    // test = require('test'),

    // Config = require('./instances/Config'),
    // Layout = require('./instances/Layout'),
    // Package = require('./instances/Package'),
    // Page = require('./instances/Page'),

    AppInstance = require('./AppInstance'),
    Inits = require('./Inits'),
    Layout = require('./Layout'),
    Module = require('./Module')
;

export default class App
{

    constructor()
    {
        this._initialized = false;
        this._inits = new Inits();
    }

    app(appInitFn)
    {
        js0.args(arguments, 'function');

        this._inits.app.push(appInitFn);

        return this;
    }

    config(configFn)
    {
        js0.args(arguments, 'function');

        if (this._initialized)
            throw new Error('App already initialized.');

        this._inits.configs.push(configFn);

        return this;
    }

    // ext(ext_initFn)
    // {
    //     js0.args(arguments, 'function');

    //     this._infos.appInits.push({
    //         initFn:ext_initFn,
    //     });
    // }

    init()
    {
        if (this._initialized)
            throw new Error('`spocky` already initialized.');
        this._initialized = true;

        /* Config */
        new AppInstance(this._inits);

        return this;
    }

    // layout(layoutPath, layoutInitFn)
    // {
    //     js0.args(arguments, 'string', 'function');

    //     if (this._initialized)
    //         throw new Error('Cannot define layout after initialization.');

    //     if (layoutPath in this._inits.layout)
    //         throw new Error(`Layout '${layoutPath}' already exists.`);

    //     this._inits.layout[layoutPath] = layoutInitFn;
    // }

    // package(packagePath, packageInitFn)
    // {
    //     js0.args(arguments, 'string', 'function');

    //     if (this._initialized)
    //         throw new Error('Cannot define package after initialization.');

    //     if (!this._inits.package.has(packagePath))
    //         this._inits.package.set(packagePath, []);

    //     this._inits.package.get(packagePath).push(packageInitFn);
    // }


    // _layout(layoutPath, layoutInitPath, raw)
    // {
    //     js0.args(arguments, 'string', 'function', 'boolean');

    //     if (this._initialized)
    //         throw new Error('Cannot define layout after initialization.');

    //     if (layoutPath in this._infos.layouts) {
    //         if (this._$debug)
    //             console.warn('Layout `' + layoutPath + '` already exists. Overwriting.');
    //     }

    //     this._infos.layouts[layoutPath] = {
    //         raw: raw,
    //         path: layoutPath,
    //         initFn: layoutInitPath,
    //     };
    // }

    // _parseUri(uri, push_state)
    // {
    //     let page_info = this._uri.parse(uri);
    //     if (page_info === null)
    //         throw new Error(`No page matches uri \`${uri}\`.`);

    //     this._setPage(page_info.name, page_info.args, push_state);
    // }

};
