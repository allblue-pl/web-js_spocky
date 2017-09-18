'use strict';


class Infos
{

    constructor()
    {
        Object.defineProperties(this, {
            exts: { value: {} },
            layouts: { value: {}, },
            packages: { value: {}, },
            appInits: { value: [] },
            configs: { value: [], },
        });
    }

}
module.exports = Infos;
