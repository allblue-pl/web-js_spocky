'use strict';

const 
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    Config = require('./Config'),
    ConfigInfo = require('./ConfigInfo'),
    Inits = require('./Inits'),
    Layout = require('./Layout'),
    Module = require('./Module'),
    PathInfo = require('./PathInfo')
;

export default class AppInstance
{

    constructor(inits)
    {
        js0.args(arguments, Inits);

        let config = new ConfigInfo();

        Object.defineProperties(this, {
            _config: { value: new ConfigInfo(), },
            _inits: { value: inits, },
            // _jsLibs: { value: new jsLibs_Class(), },
            _jsLibs: { value: jsLibs, },
        });

        /* Confit Init */
        let cfg = new Config(this._config);
        this._inits.config(this, cfg);

        /* App Inits */
        for (let initFn of this._inits.app)
            initFn(this);

        /* Containers Init */
        for (let [ containerId, containerInfo ] of this._config.containerInfos) {
            let rootNode = new abNodes.RootNode(containerInfo.htmlElement);
            let module = new containerInfo.moduleClass();
            if (!(module instanceof Module))
                throw new Error(`Containers '${containerId}' class is not a Spocky module.`);

            rootNode.activate();
            module._$viewable.activate(rootNode);
        }
    }

    // $create(fullCreatePath)
    // {
    //     let createPathInfo = new PathInfo(fullCreatePath);

    //     let pkg = this.$import(createPathInfo.packagePath);

    //     return pkg.$create(createPathInfo.name);
    // }

}
