'use strict';

const App = require('./app/App');


class SpockyInstance
{

    constructor(spocky)
    { let self = this;
        this._spocky = spocky;

        /* App Init */
        this._appInstance = new App(this._spocky);
        this._appInstance._$setState(AppInstance.State.AppInit)
        for (let app_init_info of this._spocky._$appInitInfos)
            app_init_info.initFn(this._appInstance);
        /* / App Init */

        window.onpopstate = function() {
            self.parseUri(self.getUri());
        };
        this.parseUri(this.getUri());
    }

    getUri()
    {
        if (this._$config.useHash) {
            return window.location.hash === '' ?
                    '' : window.location.hash.substring(1);
        } else
            return window.location.pathname + window.location.search;
    }

    parseUri(uri, push_state)
    {
        let page_info = this._uri.parse(uri);
        if (page_info === null)
            throw new Error(`No page matches uri \`${uri}\`.`);

        this._setPage(page_info.name, page_info.args, push_state);
    }

    setPage(page_name)
    {
        /* Get Root Module Info */
        let new_containers = {};
        for (let container_info of this._$config.containerInfos) {
            let root_module_info = container_info.getRootModuleInfo_FromPageName(
                    page_name);
            if (root_module_info === null) {
                throw new Error(`Page name \`${page_name}\` does not match any` +
                        ` module in container \`${container_info.id}\`.`);
            }
        }

        /** Check if root modules have changed and if yes deactivate app (unlaod
                packages). */
        this._corePackages = {};
        this._packages = {};
        if (this._appInstance !== null) {
            for (let container_name in this._containers) {
                let old_root_module_info = this._containers[container_name];
                let new_root_module_info = new_containers[container_name];

                if (old_root_module_info.pathInfo.fullPath !==
                        new_root_module_info.fullPath) {
                    this._appInstance.deactivate();
                    this._appInstance = null;
                }
            }
        }

        /* App Instance */
        if (this._appInstance === null)
            this._appInstance = new AppInstance(this.spocky);

        /* Pre Init */

        /* Root Modules */
        this._containers = new_containers;
        for (let root_module_info of new_containers) {
            /* Package */
            let package_path = root_module_info.pathInfo.packagePath;
            let $pkg = new PackageInstance(package_path);
            for (let i = 0; i < this._$packageInfos[package_path].length; i++)
                this._$packageInfos[package_path][i].initFn($app, $pkg);

            /* Module */
            let module_name = root_module_info.pathInfo.moduleName;
            if (!('$' + module_name in $pkg)) {
                throw new Error(`Root module \`${root_module_info.pathInfo.path}\`` +
                        ` does not exist.`);
            }

            let init_fn = $pkg['$' + module_name];
            let root_module = new $pkg['$' + module_name]();

            let root_node = new abNodes.RootNode(root_module_info.htmlElement);
            let root_module_nodes = root_module._$viewable.getNodes();
            for (let i = 0; i < root_module_nodes.length; i++)
                root_node.children.add(root_module_nodes[i]);
            root_node.activate();
        }

        /* Post Init ? */
    }

}
module.exports = SpockyInstance;
