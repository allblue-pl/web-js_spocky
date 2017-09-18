'use strict';

const abTypes = require('../ab-types');

const ConfigInfo = require('../core/ConfigInfo');
const ContainerInfo = require('../core/ContainerInfo');
const Infos = require('../core/Infos');
const PageInfo = require('../core/PageInfo');


class Config
{

    constructor(infos, config_configInfo)
    {
        abTypes.args(arguments, Infos, ConfigInfo);

        this._infos = infos;
        this._configInfo = config_configInfo;
    }

    base(base_uri)
    {
        abTypes.args(arguments, 'string');

        this._configInfo.baseUri = base_uri;

        return this;
    }

    container(html_element_id, modules_map)
    {
        abTypes.args(arguments, 'string', Map);

        /* Validate HTML Element */
        let html_element = document.getElementById(html_element_id);
        if (html_element === null)
            throw new Error(`\`HtmlElement\` with id \`{html_element_id}\` does not exist.`);

        /* Create Container */
        let container_info = new ContainerInfo(html_element_id, modules_map);
        /* Validate Module Paths */
        for (let root_module_configInfo of container_info.rootModuleInfos) {
            let path_configInfo = root_module_configInfo.pathInfo;
            if (!(path_configInfo.packagePath in this._infos.packages))
                throw new Error(`Module \`${path_configInfo.fullPath}\` package does not exist.`);
        }

        this._configInfo.containerInfos.set(container_info.id, container_info);
        /* / Create Container */

        return this;
    }

    hash(use_hash)
    {
        abTypes.args(arguments, 'boolean');

        this._configInfo.useHash = use_hash;

        return this;
    }

    page(page_name, page_alias)
    {
        abTypes.args(arguments, 'string', 'string');

        if (page_name in this._configInfo.pages.keys()) {
            throw new Error('Root module with id `' + page_name +
                    '` already exists.');
        }

        this._configInfo.pages.set(page_name, new PageInfo(page_name, page_alias));

        return this;
    }

}
module.exports = Config;
