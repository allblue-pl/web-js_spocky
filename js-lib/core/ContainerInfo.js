'use strict';

const Module = require('../instances/Module');


class ContainerInfo
{

    constructor(container_id, modules_map)
    {
        Object.defineProperties(this, {
            id: { value: container_id, },
            rootModuleInfos: { value: [], },
        });

        for (let [ pages_prefix, module_path ] of modules_map)
            this.rootModuleInfos.push(new ContainerInfo.RootModuleInfo(pages_prefix,
                    module_path));
    }

    getRootModuleInfo_FromPageName(page_name)
    {
        let best_match = null;
        let best_match_length = -1;
        for (let root_module_info of this.rootModuleInfos) {
            if (root_module_info.matchesPage(page_name)) {
                let match_length = root_module_info.pagesPrefix.length;

                if (match_length > best_match_length) {
                    best_match = root_module_info;
                    best_match_length = match_length;
                }
            }
        }

        return best_match;
    }

}
module.exports = ContainerInfo;


Object.defineProperties(ContainerInfo, {

    RootModuleInfo: { value:
    class Container_RootModuleInfo {

        constructor(pages_prefix, module_path)
        {
            Object.defineProperties(this, {
                pagesPrefix: { value: pages_prefix, },
                pathInfo: { value: new Module.PathInfo(module_path), },
            });
        }

        matchesPage(page_name)
        {
            if (page_name.indexOf(this.pagesPrefix) === 0)
                return true;

            return false;
        }

    }},

});
