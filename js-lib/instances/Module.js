'use strict';

const abTypes = require('../ab-types');

const Viewable = require('../Viewable');


class Module
{

    static get Property() {
        return '_$module';
    }


    constructor(public_instance)
    {
        Object.defineProperties(this, {
            public: { value: public_instance },

            _view: { value: null, writable: true, },
        });
    }

    view_Get()
    {
        return this._view;
    }

    view_Set(value)
    {
        if (value === null)
            this._view = null;
        else if (abTypes.implementsC(value, Viewable))
            this._view = value;
        else if (value instanceof Array)
            this._view = new Module.MultiView(value);
        else
            throw new Error('`$view` must be an `Array` or implement `Viewable`.');
    }

}
module.exports = Module;


Object.defineProperties(Module, {

    CreatePublic: { value:
    (package_instance, module_name, module_init_fn, module_prototype = null) => {
        if (module_prototype === null)
            module_prototype = class { };

        let module_path = `${package_instance.$path}.${module_name}`;

        return class Module_Public extends module_prototype {

            static get name() {
                return module_path;
            }

            constructor()
            { super(); let self = this;
                abTypes.prop(this, Module);
                abTypes.prop(this, Module.Viewable, this);

                Object.defineProperties(this, {
                    $path: { value: module_path, },
                    $name: { value: module_name },
                    $view: {
                        get: () => { return self._$module.view_Get(); },
                        set: (value) => { self._$module.view_Set(value); },
                    }
                });

                module_init_fn(this);
            }

        };
    }},


    PathInfo: { value:
    class Module_PathInfo {

        constructor(path)
        {
            let package_path = path.substring(0, path.indexOf('.'));
            let module_name = path.substring(path.lastIndexOf('.') + 1);

            Object.defineProperties(this, {
                fullPath: { value: path, },
                packagePath: { value: package_path, },
                moduleName: { value: module_name, },
            });
        }

    }},


    Viewable: { value:
    class extends Viewable {

        constructor(module_public)
        { super();
            this._modulePublic = module_public;
        }

        getNodes()
        {
            let view = this._modulePublic._$module._view;

            if (view === null)
                return [];
            else if (abTypes.implementsC(view, Module.Viewable))
                return view._$viewable.getNodes();
            else if (view instanceof Module.MultiView)
                return view._$viewable.getNodes();

            abTypes.assert(false, '`view` does not implement `Viewable`.');
        }

    }},

});
