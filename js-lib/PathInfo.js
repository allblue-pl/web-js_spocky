'use strict';

class PathInfo {

    constructor(importPath)
    {
        let separatorIndex = importPath.lastIndexOf('.');
        let packagePath = importPath.substring(0, separatorIndex);
        let name = importPath.substring(separatorIndex + 1);

        Object.defineProperties(this, {
            path: { value: importPath, },
            name: { value: name, },
            packagePath: { value: packagePath, },
        });
    }

}
module.exports = PathInfo