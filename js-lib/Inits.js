'use strict';


class Inits
{

    constructor()
    {
        Object.defineProperties(this, {
            app: { value: [] },
            configs: { value: [], writable: true, },
            ext: { value: new Map(), },
            layout: { value: new Map(), },
            package: { value: new Map(), },
        });
    }

}
module.exports = Inits;
