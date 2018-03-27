'use strict';

const 
    js0 = require('js0'),

    // test = require('test'),

    App = require('./instances/App'),
    // Config = require('./instances/Config'),
    // Layout = require('./instances/Layout'),
    // Package = require('./instances/Package'),
    // Page = require('./instances/Page'),

    Inits = require('./Inits'),
    Layout = require('./Layout'),
    Module = require('./Module')
;

class spocky_Class
{

    get Layout() {
        return Layout;
    }

    get Module() {
        return Module;
    }


    constructor()
    {
        this._debug = false;
        this._initialized = false;

        Object.defineProperties(this, {
            _debug: { value: false, readonly: false },
            _initialized: { value: false, readonly: false },

            _inits: { value: new Inits() },
        //     App: { value: App, },
        //     Config: { value: Config, },
        //     Layout: { value: Layout, },
        //     Module: { value: Module, },
        //     Package: { value: Package, },
        //     Page: { value: Page, },

            // _infos: { value: new Infos() },

        //     _initialized: { value: false, writable: true, },
        });
    }

    app(appInitFn)
    {
        js0.args(arguments, 'function');

        this._inits.app.push(appInitFn);
    }

    config(initFn)
    {
        js0.args(arguments, 'function');

        if (this._inits.config !== null)
            throw new Error('Config already declared.');

        this._inits.config = initFn;
    }

    // ext(ext_initFn)
    // {
    //     js0.args(arguments, 'function');

    //     this._infos.appInits.push({
    //         initFn:ext_initFn,
    //     });
    // }

    init(debug = false)
    {
        if (this._initialized)
            throw new Error('`spocky` already initialized.');
        this._initialized = true;

        this._debug = debug;

        /* Config */
        new App(this._inits);
    }

    layout(layoutPath, layoutInitFn)
    {
        js0.args(arguments, 'string', 'function');

        if (this._initialized)
            throw new Error('Cannot define layout after initialization.');

        if (layoutPath in this._inits.layout)
            throw new Error(`Layout '${layoutPath}' already exists.`);

        this._inits.layout[layoutPath] = layoutInitFn;
    }

    package(packagePath, packageInitFn)
    {
        js0.args(arguments, 'string', 'function');

        if (this._initialized)
            throw new Error('Cannot define package after initialization.');

        if (!(packagePath in this._inits.package))
            this._inits.package.set(packagePath, []);

        this._inits.package.get(packagePath).push(packageInitFn);
    }


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
module.exports = new spocky_Class();
