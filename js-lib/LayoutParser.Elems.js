'use strict';

const
    js0 = require('js0')
;

export default class Elems {

    constructor() {
        this._elemInfos = {};
    }

    $exists(elemName) {
        js0.args(arguments, 'string');

        return elemName in this._elemInfos;
    }

    $get(elemName, keys = []) {
        js0.args(arguments, 'string', Array);

        if (!(elemName in this._elemInfos))
            throw new Error(`Elem '${elemName}' does not exist.`);

        return this._get(elemName, keys);
    }

    $getAll(elemName)
    {
        js0.args(arguments, 'string');

        let elems = [];
        let keysSets = this.$keys(elemName);
        for (let keys of keysSets)
            elems.push(this.$get(elemName, keys));

        return elems;
    }

    $index(elemName, keys)
    {
        js0.args(arguments, 'string', Array);

        let keySets = this.$keys();
        for (let i = 0; i < keySets.length; i++) {
            if (this._keysMatch(keySets[i], keys))
                return i;
        }

        return -1;
    }

    $keys(elemName) {
        js0.args(arguments, 'string');

        if (!this.$exists(elemName))
            throw new Error(`Elem '${elemName}' does not exist.`);

        let keys = [];
        for (let elemInfo of this._elemInfos[elemName]) {
            let keysArr = [];
            for (let key of elemInfo.keys)
                keysArr.push(key);
            keys.push(keysArr);
        }

        return keys;
    }

    _add(elemName, keys, elem) {
        this._elemInfos[elemName].push({
            elem: elem,
            keys: keys,
        });
    }

    _declare(elemName) {
        this._elemInfos[elemName] = [];
    }

    _get(elemName, keys) {
        for (let elemInfo of this._elemInfos[elemName]) {
            if (this._keysMatch(elemInfo.keys, keys))
                return elemInfo.elem;
        }

        throw new Error(`Elem '${elemName}' with keys '` + keys.join(', ') +
            `' does not exist.`);
    }

    _keysMatch(keysA, keysB) {
        if (keysA.length !== keysB.length)
            return false;

        for (let i = 0; i < keysA.length; i++) {
            if (keysA[i] !== keysB[i])
                return false;
        }

        return true;
    }

    _remove(elemName, keys) {
        if (!this.$exists(elemName))
            throw new Error(`Elem '${elemName}' does not exist.`);

        for (let i = 0; i < this._elemInfos[elemName].length; i++) {
            if (this._keysMatch(this._elemInfos[elemName][i].keys, keys)) {
                this._elemInfos[elemName].splice(i, 1);
                return;
            }
        }

        let keysStr = keys.join(', ');
        throw new Error(`Elem '${elemName}' with keys '${keysStr}' does not exist.`);
    }
}