'use strict';

const abNodes = require('./ab-nodes');
const abTypes = require('./ab-types');

const App = require('./instances/App');
const Config = require('./instances/Config');
const Layout = require('./instances/Layout');
const Module = require('./instances/Module');
const Package = require('./instances/Package');
const Page = require('./instances/Page');


const Infos = require('./core/Infos');


const spocky = new class spocky
{

    get nodes() {
        return abNodes;
    }

    get types() {
        return abTypes;
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

    app(app_init_fn)
    {
        abTypes.args(arguments, 'function');

        this._infos.appInits.push({
            initFn: app_init_fn,
        });
    }

    config(init_fn)
    {
        abTypes.args(arguments, 'function');

        this._infos.configs.push({
            initFn: init_fn,
        });
    }

    ext(ext_init_fn)
    {
        abTypes.args(arguments, 'function');

        this._infos.appInits.push({
            initFn:ext_init_fn,
        });
    }

    init(debug = false)
    { let self = this;
        if (this._initialized)
            throw new Error('`spocky` already initialized.');
        this._initialized = true;

        this._$debug = debug;

        /* Config */
        new App(this._infos);
    }

    layout(layout_path, layout_init_fn)
    {
        this._layout(layout_path, layout_init_fn, false);
    }

    layout_Raw(layout_path, layout_init_fn)
    {
        this._layout(layout_path, layout_init_fn, true);
    }

    package(package_path, package_init_fn, package_prototype = null)
    {
        abTypes.args(arguments, 'string', 'function', 'function');

        if (this._initialized)
            throw new Error('Cannot define package after initialization.');

        let package_info = null;
        if (package_path in this._infos.packages) {
            package_info = this._infos.packages[package_path];

            if (package_info.prototype !== null && package_prototype !== null)
                throw new Error('Cannot redeclare package prototype.');
        } else {
            package_info = {
                path: package_path,
                initFns: [],
                prototype: package_prototype,
            };
            this._infos.packages[package_path] = package_info;
        }

        package_info.initFns.push(package_init_fn);
        if (package_prototype !== null)
            package_info.prototype = package_prototype;
    }


    _layout(layout_path, layout_init_fn, raw)
    {
        abTypes.args(arguments, 'string', 'function', 'boolean');

        if (this._initialized)
            throw new Error('Cannot define layout after initialization.');

        if (layout_path in this._infos.layouts) {
            if (this._$debug)
                console.warn('Layout `' + layout_path + '` already exists. Overwriting.');
        }

        this._infos.layouts[layout_path] = {
            raw: raw,
            path: layout_path,
            initFn: layout_init_fn,
        };
    }

    _parseUri(uri, push_state)
    {
        let page_info = this._uri.parse(uri);
        if (page_info === null)
            throw new Error(`No page matches uri \`${uri}\`.`);

        this._setPage(page_info.name, page_info.args, push_state);
    }

}();
module.exports = spocky;
