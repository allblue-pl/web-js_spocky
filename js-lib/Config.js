'use strict';

const js0 = require('js0');

const ConfigInfo = require('../ConfigInfo');
const ContainerInfo = require('../ContainerInfo');
const Inits = require('../Inits');
const Module = require('../Module');


class Config
{

    constructor(configInfo)
    {
        js0.args(arguments, ConfigInfo);

        this._configInfo = configInfo;
    }

    container(htmlElementId, moduleClass, moduleArgs = [])
    {
        js0.args(arguments, 'string', 'function', [ Array, js0.Default ]);

        /* Validate HTML Element */
        let htmlElement = document.getElementById(htmlElementId);
        if (htmlElement === null)
            throw new Error(`\`HtmlElement\` with id \`${htmlElementId}\` does not exist.`);

        /* Create Container */
        let containerInfo = new ContainerInfo(htmlElementId, htmlElement,
                moduleClass, moduleArgs);

        // /* Validate Module Paths */
        // for (let modulePath of containerInfo.modulePath) {            
        //     if (!(path_configInfo.packagePath in this._infos.packages))
        //         throw new Error(`Module \`${path_configInfo.fullPath}\` package does not exist.`);
        // }

        this._configInfo.containerInfos.set(containerInfo.id, containerInfo);
        /* / Create Container */

        return this;
    }

}
module.exports = Config;
