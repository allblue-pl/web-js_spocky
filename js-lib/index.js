'use strict';

const js0 = require('js0');

const abFields = require('./ab-fields');
const abNodes = require('ab-nodes');

const App = require('./instances/App');
const Config = require('./instances/Config');
const Layout = require('./instances/Layout');
const Module = require('./instances/Module');
const Package = require('./instances/Package');
const Page = require('./instances/Page');

const Infos = require('./core/Infos');


class spocky_Class
{

    get nodes() {
        return abNodes;
    }

    get types() {
        return js0;
    }

    get Fields() {
        return abFields.RootField;
    }


    constructor()
    {
        Object.defineProperties(this, {
            App: { value: App, },
            Config: { value: Config, },
            Layout: { value: Layout, },
            Module: { value: Module, },
            Package: { value: Package, },
            Page: { value: Page, },

            _infos: { value: new Infos() },

            _initialized: { value: false, writable: true, },
        });
    }

    app(app_initFn)
    {
        js0.args(arguments, 'function');

        this._infos.appInits.push({
            initFn: app_initFn,
        });
    }

    config(initFn)
    {
        js0.args(arguments, 'function');

        this._infos.configs.push({
            initFn: initFn,
        });
    }

    ext(ext_initFn)
    {
        js0.args(arguments, 'function');

        this._infos.appInits.push({
            initFn:ext_initFn,
        });
    }

    init(debug = false)
    {
        if (this._initialized)
            throw new Error('`spocky` already initialized.');
        this._initialized = true;

        this._$debug = debug;

        /* Config */
        new App(this._infos);
    }

    layout(layoutPath, layoutInitPath)
    {
        this._layout(layoutPath, layoutInitPath, false);
    }

    layout_Raw(layoutPath, layoutInitPath)
    {
        this._layout(layoutPath, layoutInitPath, true);
    }

    package(packagePath, packageInitFn, packagePrototype = null)
    {
        js0.args(arguments, 'string', 'function', [ 'function', js0.Default ]);

        if (this._initialized)
            throw new Error('Cannot define package after initialization.');

        let packageInfo = null;
        if (packagePath in this._infos.packages) {
            packageInfo = this._infos.packages[packagePath];

            if (packageInfo.prototype !== null && packagePrototype !== null)
                throw new Error('Cannot redeclare package prototype.');
        } else {
            packageInfo = {
                path: packagePath,
                initFns: [],
                prototype: packagePrototype,
            };
            this._infos.packages[packagePath] = packageInfo;
        }

        packageInfo.initFns.push(packageInitFn);
        if (packagePrototype !== null)
            packageInfo.prototype = packagePrototype;
    }


    _layout(layoutPath, layoutInitPath, raw)
    {
        js0.args(arguments, 'string', 'function', 'boolean');

        if (this._initialized)
            throw new Error('Cannot define layout after initialization.');

        if (layoutPath in this._infos.layouts) {
            if (this._$debug)
                console.warn('Layout `' + layoutPath + '` already exists. Overwriting.');
        }

        this._infos.layouts[layoutPath] = {
            raw: raw,
            path: layoutPath,
            initFn: layoutInitPath,
        };
    }

    _parseUri(uri, push_state)
    {
        let page_info = this._uri.parse(uri);
        if (page_info === null)
            throw new Error(`No page matches uri \`${uri}\`.`);

        this._setPage(page_info.name, page_info.args, push_state);
    }

};
module.exports = new spocky_Class();
