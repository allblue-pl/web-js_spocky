'use strict';

const js0 = require('js0');

const ConfigInfo = require('../core/ConfigInfo');
const ContainerInfo = require('../core/ContainerInfo');
const Infos = require('../core/Infos');
const PageInfo = require('../core/PageInfo');


class Config
{

    constructor(infos, configInfo)
    {
        js0.args(arguments, Infos, ConfigInfo);

        this._infos = infos;
        this._configInfo = configInfo;
    }

    base(baseUri)
    {
        js0.args(arguments, 'string');

        this._configInfo.baseUri = baseUri;

        return this;
    }

    container(htmlElementId, modulesMap)
    {
        js0.args(arguments, 'string', Map);

        /* Validate HTML Element */
        let htmlElement = document.getElementById(htmlElementId);
        if (htmlElement === null)
            throw new Error(`\`HtmlElement\` with id \`${htmlElementId}\` does not exist.`);

        /* Create Container */
        let containerInfo = new ContainerInfo(htmlElementId, htmlElement,
                modulesMap);
        /* Validate Module Paths */
        for (let root_module_configInfo of containerInfo.rootModuleInfos) {
            let path_configInfo = root_module_configInfo.pathInfo;
            if (!(path_configInfo.packagePath in this._infos.packages))
                throw new Error(`Module \`${path_configInfo.fullPath}\` package does not exist.`);
        }

        this._configInfo.containerInfos.set(containerInfo.id, containerInfo);
        /* / Create Container */

        return this;
    }

    hash(useHash)
    {
        js0.args(arguments, 'boolean');

        this._configInfo.useHash = useHash;

        return this;
    }

    page(pageName, pageAlias)
    {
        js0.args(arguments, 'string', 'string');

        if (pageName in this._configInfo.pages.keys()) {
            throw new Error('Root module with id `' + pageName +
                    '` already exists.');
        }

        this._configInfo.pages.set(pageName, new PageInfo(pageName, pageAlias));

        return this;
    }

}
module.exports = Config;
