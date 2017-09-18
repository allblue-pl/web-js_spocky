'use strict';

const App = require('./App');

const abTypes = require('../ab-types');

const Infos = require('../core/Infos');
const Package  = require('../instances/Package');


Object.defineProperties(App, {

    Packages: { value:
    class App_Packages {

        constructor(app, infos)
        {
            abTypes.args(arguments, App, Infos);

            this._app = app;
            this._infos = infos;

            this._packages = {};

            this._appPackagePaths = new Set();
            this._corePackagePaths = new Set();

            this._coreImport = false;
        }

        coreImport_Finish()
        {
            for (let package_path in this._packages) {
                if (!this._appPackagePaths.has(package_path) &&
                        !this._corePackagePaths.has(package_path))
                    delete this._packages[package_path];
            }
            this._coreImport = false;
        }

        coreImport_Start()
        {
            this._corePackagePaths.clear();
            this._coreImport = true;
        }

        import(package_path)
        {
            if (this._app.state === App.State.Initializing) {
                if (!this._appPackagePaths.has(package_path))
                    this._appPackagePaths.add(package_path);
            } else if (this._coreImport) {
                if (!this._corePackagePaths.has(package_path))
                    this._corePackagePaths.add(package_path);
            }

            if (package_path in this._packages)
                return this._packages[package_path];

            if (!(package_path in this._infos.packages))
                throw new Error(`Package \`${package_path}\` does not exist.`);

            let package_info = this._infos.packages[package_path];

            let package_instance = new Package(package_path);
            this._packages[package_path] = package_instance;
            for (let i = 0; i < package_info.initFns.length; i++)
                package_info.initFns[i](this._app, package_instance);

            return package_instance;
        }

    }},

});
module.exports = App;
