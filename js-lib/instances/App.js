'use strict';

const 
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    ConfigInfo = require('../ConfigInfo'),
    Inits = require('../Inits'),
    Layout = require('../Layout'),
    Module = require('../Module'),
    PathInfo = require('../PathInfo'),

    Config = require('./Config'),
    Package = require('./Package')
;

class App
{

    constructor(inits)
    {
        js0.args(arguments, Inits);

        let config = new ConfigInfo();

        Object.defineProperties(this, {
            _config: { value: new ConfigInfo(), },
            _inits: { value: inits, },
            _jsLibs: { value: new jsLibs_Class(), },
        });

        /* Export Packages */
        for (let [ packagePath, packageInits ] of inits.package) {
            this._jsLibs.exportModule(packagePath, 'index', (require, module) => {
                let pkg = new Package(this, packagePath);
                for (let initFn of packageInits)
                    initFn(this, pkg);

                module.exports = pkg;
            });
        }

        /* Confit Init */
        let cfg = new Config(this._config);
        this._inits.config(this, cfg);

        /* App Inits */
        for (let initFn of this._inits.app)
            initFn(this);

        /* Containers Init */
        for (let [ containerId, containerInfo ] of this._config.containerInfos) {
            let rootNode = new abNodes.RootNode(containerInfo.htmlElement);
            let module = this.create(containerInfo.modulePath);

            rootNode.activate();
            module._$viewable.activate(rootNode);
        }
    }

    import(importPath)
    {
        js0.args(arguments, 'string');

        let importPathArr = importPath.split('.');
        let packagePath = importPathArr[0];

        let pkg = this._jsLibs.importModule(packagePath, 'index');

        if (importPathArr.length > 1) {
            if (!(importPathArr[1] in pkg))
                throw new Error(`Package property '${importPathArr[1]}' does not exist`);

            return pkg[importPathArr[1]];
        }

        return pkg;
    }

    create(fullCreatePath)
    {
        let createPathInfo = new PathInfo(fullCreatePath);

        let pkg = this.import(createPathInfo.packagePath);

        return pkg.create(createPathInfo.name);
    }

}
module.exports = App;
