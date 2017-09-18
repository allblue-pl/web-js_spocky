'use strict';

const abNodes = require('../ab-nodes');

const ConfigInfo = require('../core/ConfigInfo');
const Uri = require('../core/Uri');

const Package = require('../instances/Package');

const LayoutInfo = require('./Layout');


class App
{

    get page() {
        return ;
    }

    get state() {
        return this._state;
    }

    get uri() {
        return ;
    }


    constructor(infos)
    {
        let config = new ConfigInfo(infos);

        Object.defineProperties(this, {
            _infos: { value: infos, },

            _config: { value: config, },
            _uri: { value: new Uri(config), },
            _packages: { value: new App.Packages(this, infos) },

            _state: { value: App.State.None, writable: true, },

            _rootModules: { value: new Map(), },
        });

        this._config.init();

        this._state = App.State.Initializing;
        for (let app_init_info of this._infos.appInits)
            app_init_info.initFn(this);

        window.onpopstate = function() {
            self._parseUri(self._getUri());
        };
        this._parseUri(this._getUri());
    }

    import(package_path)
    {
        return this._packages.import(package_path, this._state);
    }

    module(module_path)
    {
        let module_path_info = new Module.PathInfo(module_path);

        let package_instance = this.import(module_path_info.packagePath);

        return package_instance._$createModule(module_path_info.moduleName);
    }

    layout(layout_path)
    {
        if (!(layout_path in this._infos.layouts))
            throw new Error('Layout `' + layout_path + '` does not exist.');

        let layout_info = this._spocky._$layoutInfos[layout_path];
        if (layout_info.raw)
            return new Layout(layout_info.initFn());
        else
            return Layout.Parse(layout_info.initFn());
    }

    setPage(page_name, args)
    {

    }

    setUri(uri)
    {

    }


    _getUri()
    {
        if (this._config.useHash) {
            return window.location.hash === '' ?
                    '' : window.location.hash.substring(1);
        } else
            return window.location.pathname + window.location.search;
    }

    _parseUri(uri, push_state)
    {
        this._state = App.State.LoadingRootPackages;
        let page = this._uri.parse(uri);
        if (page === null)
            throw new Error(`No page matches uri \`${uri}\`.`);

        this._setPage(page);
    }

    _setPage(page)
    {
        this._packages.coreImport_Start();

        if (this._config.containerInfos.size === 0)
            throw new Error('No conainers set in config.');

        /* Get Root Module Info */
        for (let container_info of this._config.containerInfos.values()) {
            let root_module_info = container_info.getRootModuleInfo_FromPageName(
                    page.info.name);
            if (root_module_info === null) {
                throw new Error(`Page name \`${page.info.name}\` does not match any` +
                        ` module in container \`${container_info.id}\`.`);
            }
            let module_path_info = root_module_info.pathInfo;

            /* Package */
            let package_path = module_path_info.packagePath;
            let package_info = this._infos.packages[package_path];
            let package_instance = new Package(package_path);
            for (let i = 0; i < package_info.initFns.length; i++)
                package_info.initFns[i](this, package_instance);

            /* Module */
            let module_name = module_path_info.moduleName;
            if (!('$' + module_name in package_instance)) {
                throw new Error(`Root module \`${module_path_info.path}\`` +
                        ` does not exist.`);
            }

            let init_fn = package_instance['$' + module_name];
            let root_module = new package_instance['$' + module_name]();

            let root_node = new abNodes.RootNode(module_path_info.htmlElement);
            let root_module_nodes = root_module._$viewable.getNodes();
            for (let i = 0; i < root_module_nodes.length; i++)
                root_node.children.add(root_module_nodes[i]);
            root_node.activate();
        }


        this._packages.coreImport_Finish();
    }

}
module.exports = App;


Object.defineProperties(App, {

    State: { value:
    Object.create(null, {
        None: { value: 0, },
        Initializing: { value: 1, },
        Running: { value: 2, },
    })},

});


require('./App.Packages');
