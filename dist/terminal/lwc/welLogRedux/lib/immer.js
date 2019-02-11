var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
};

var createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var defineProperty = function(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }

    return obj;
};

var NOTHING = typeof Symbol !== "undefined" ? Symbol("immer-nothing") : defineProperty({}, "immer-nothing", true);

var DRAFTABLE = typeof Symbol !== "undefined" ? Symbol("immer-draftable") : "__$immer_draftable";

var DRAFT_STATE = typeof Symbol !== "undefined" ? Symbol("immer-state") : "__$immer_state";

function isDraft(value) {
    return !!value && !!value[DRAFT_STATE];
}

function isDraftable(value) {
    if (!value || (typeof value === "undefined" ? "undefined" : _typeof(value)) !== "object") return false;
    if (Array.isArray(value)) return true;
    var proto = Object.getPrototypeOf(value);
    if (!proto || proto === Object.prototype) return true;
    return !!value[DRAFTABLE] || !!value.constructor[DRAFTABLE];
}

function original(value) {
    if (value && value[DRAFT_STATE]) {
        return value[DRAFT_STATE].base;
    }

}

var assign = Object.assign || function assign(target, value) {
    for (var key in value) {
        if (has(value, key)) {
            target[key] = value[key];
        }
    }
    return target;
};

var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : typeof Object.getOwnPropertySymbols !== "undefined" ? function(obj) {
    return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
} : Object.getOwnPropertyNames;

function shallowCopy(base) {
    var invokeGetters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (Array.isArray(base)) return base.slice();
    var clone = Object.create(Object.getPrototypeOf(base));
    ownKeys(base).forEach(function(key) {
        if (key === DRAFT_STATE) {
            return;
        }
        var desc = Object.getOwnPropertyDescriptor(base, key);
        if (desc.get) {
            if (!invokeGetters) {
                throw new Error("Immer drafts cannot have computed properties");
            }
            desc.value = desc.get.call(base);
        }
        if (desc.enumerable) {
            clone[key] = desc.value;
        } else {
            Object.defineProperty(clone, key, {
                value: desc.value,
                writable: true,
                configurable: true
            });
        }
    });
    return clone;
}

function each(value, cb) {
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            cb(i, value[i], value);
        }
    } else {
        ownKeys(value).forEach(function(key) {
            return cb(key, value[key], value);
        });
    }
}

function isEnumerable(base, prop) {
    return Object.getOwnPropertyDescriptor(base, prop).enumerable;
}

function has(thing, prop) {
    return Object.prototype.hasOwnProperty.call(thing, prop);
}

function is(x, y) {

    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}

var ImmerScope = function() {
    function ImmerScope(parent) {
        classCallCheck(this, ImmerScope);

        this.drafts = [];
        this.parent = parent;



        this.canAutoFreeze = true;


        this.patches = null;
    }

    createClass(ImmerScope, [{
        key: "usePatches",
        value: function usePatches(patchListener) {
            if (patchListener) {
                this.patches = [];
                this.inversePatches = [];
                this.patchListener = patchListener;
            }
        }
    }, {
        key: "revoke",
        value: function revoke() {
            this.leave();
            this.drafts.forEach(_revoke);
            this.drafts = null;
        }
    }, {
        key: "leave",
        value: function leave() {
            if (this === ImmerScope.current) {
                ImmerScope.current = this.parent;
            }
        }
    }]);
    return ImmerScope;
}();

ImmerScope.current = null;
ImmerScope.enter = function() {
    return this.current = new ImmerScope(this.current);
};

function _revoke(draft) {
    draft[DRAFT_STATE].revoke();
}

var descriptors = {};

function willFinalize(scope, result, isReplaced) {
    scope.drafts.forEach(function(draft) {
        draft[DRAFT_STATE].finalizing = true;
    });
    if (!isReplaced) {
        if (scope.patches) {
            markChangesRecursively(scope.drafts[0]);
        }

        markChangesSweep(scope.drafts);
    } else if (isDraft(result) && result[DRAFT_STATE].scope === scope) {
        markChangesSweep(scope.drafts);
    }
}

function createProxy(base, parent) {
    var isArray = Array.isArray(base);
    var draft = clonePotentialDraft(base);
    each(draft, function(prop) {
        proxyProperty(draft, prop, isArray || isEnumerable(base, prop));
    });

    var scope = parent ? parent.scope : ImmerScope.current;
    var state = {
        scope: scope,
        modified: false,
        finalizing: false,
        finalized: false,
        assigned: {},
        parent: parent,
        base: base,
        draft: draft,
        copy: null,
        revoke: revoke,
        revoked: false
    };

    createHiddenProperty(draft, DRAFT_STATE, state);
    scope.drafts.push(draft);
    return draft;
}

function revoke() {
    this.revoked = true;
}

function source(state) {
    return state.copy || state.base;
}

function _get(state, prop) {
    assertUnrevoked(state);
    var value = source(state)[prop];

    if (!state.finalizing && value === state.base[prop] && isDraftable(value)) {
        prepareCopy(state);
        return state.copy[prop] = createProxy(value, state);
    }
    return value;
}

function _set(state, prop, value) {
    assertUnrevoked(state);
    state.assigned[prop] = true;
    if (!state.modified) {
        if (is(source(state)[prop], value)) return;
        markChanged(state);
        prepareCopy(state);
    }
    state.copy[prop] = value;
}

function markChanged(state) {
    if (!state.modified) {
        state.modified = true;
        if (state.parent) markChanged(state.parent);
    }
}

function prepareCopy(state) {
    if (!state.copy) state.copy = clonePotentialDraft(state.base);
}

function clonePotentialDraft(base) {
    var state = base && base[DRAFT_STATE];
    if (state) {
        state.finalizing = true;
        var draft = shallowCopy(state.draft, true);
        state.finalizing = false;
        return draft;
    }
    return shallowCopy(base);
}

function proxyProperty(draft, prop, enumerable) {
    var desc = descriptors[prop];
    if (desc) {
        desc.enumerable = enumerable;
    } else {
        descriptors[prop] = desc = {
            configurable: true,
            enumerable: enumerable,
            get: function get$$1() {
                return _get(this[DRAFT_STATE], prop);
            },
            set: function set$$1(value) {
                _set(this[DRAFT_STATE], prop, value);
            }
        };
    }
    Object.defineProperty(draft, prop, desc);
}

function assertUnrevoked(state) {
    if (state.revoked === true) throw new Error("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + JSON.stringify(source(state)));
}


function markChangesSweep(drafts) {
    for (var i = drafts.length - 1; i >= 0; i--) {
        var state = drafts[i][DRAFT_STATE];
        if (!state.modified) {
            if (Array.isArray(state.base)) {
                if (hasArrayChanges(state)) markChanged(state);
            } else if (hasObjectChanges(state)) markChanged(state);
        }
    }
}

function markChangesRecursively(object) {
    if (!object || (typeof object === "undefined" ? "undefined" : _typeof(object)) !== "object") return;
    var state = object[DRAFT_STATE];
    if (!state) return;
    var base = state.base,
        draft = state.draft,
        assigned = state.assigned;

    if (!Array.isArray(object)) {

        Object.keys(draft).forEach(function(key) {

            if (base[key] === undefined && !has(base, key)) {
                assigned[key] = true;
                markChanged(state);
            } else if (!assigned[key]) {

                markChangesRecursively(draft[key]);
            }
        });

        Object.keys(base).forEach(function(key) {

            if (draft[key] === undefined && !has(draft, key)) {
                assigned[key] = false;
                markChanged(state);
            }
        });
    } else if (hasArrayChanges(state)) {
        markChanged(state);
        assigned.length = true;
        if (draft.length < base.length) {
            for (var i = draft.length; i < base.length; i++) {
                assigned[i] = false;
            }
        } else {
            for (var _i = base.length; _i < draft.length; _i++) {
                assigned[_i] = true;
            }
        }
        for (var _i2 = 0; _i2 < draft.length; _i2++) {

            if (assigned[_i2] === undefined) markChangesRecursively(draft[_i2]);
        }
    }
}

function hasObjectChanges(state) {
    var base = state.base,
        draft = state.draft;
    var keys = Object.keys(draft);
    for (var i = keys.length - 1; i >= 0; i--) {

        if (base[keys[i]] === undefined && !has(base, keys[i])) {
            return true;
        }
    }
    return keys.length !== Object.keys(base).length;
}

function hasArrayChanges(state) {
    var draft = state.draft;

    if (draft.length !== state.base.length) return true;

    var descriptor = Object.getOwnPropertyDescriptor(draft, draft.length - 1);

    if (descriptor && !descriptor.get) return true;

    return false;
}

function createHiddenProperty(target, prop, value) {
    Object.defineProperty(target, prop, {
        value: value,
        enumerable: false,
        writable: true
    });
}

var legacyProxy = Object.freeze({
    willFinalize: willFinalize,
    createProxy: createProxy
});

function willFinalize$1() {}

function createProxy$1(base, parent) {
    var scope = parent ? parent.scope : ImmerScope.current;
    var state = {

        scope: scope,

        modified: false,

        finalized: false,

        assigned: {},

        parent: parent,

        base: base,

        draft: null,

        drafts: {},

        copy: null,

        revoke: null
    };

    var _ref = Array.isArray(base) ?

        Proxy.revocable([state], arrayTraps) : Proxy.revocable(state, objectTraps),
        revoke = _ref.revoke,
        proxy = _ref.proxy;

    state.draft = proxy;
    state.revoke = revoke;

    scope.drafts.push(proxy);
    return proxy;
}

var objectTraps = {
    get: get$1,
    has: function has$$1(target, prop) {
        return prop in source$1(target);
    },
    ownKeys: function ownKeys$$1(target) {
        return Reflect.ownKeys(source$1(target));
    },

    set: set$1,
    deleteProperty: deleteProperty,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    defineProperty: function defineProperty() {
        throw new Error("Object.defineProperty() cannot be used on an Immer draft");
    },
    getPrototypeOf: function getPrototypeOf(target) {
        return Object.getPrototypeOf(target.base);
    },
    setPrototypeOf: function setPrototypeOf() {
        throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft");
    }
};

var arrayTraps = {};
each(objectTraps, function(key, fn) {
    arrayTraps[key] = function() {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
    };
});
arrayTraps.deleteProperty = function(state, prop) {
    if (isNaN(parseInt(prop))) {
        throw new Error("Immer only supports deleting array indices");
    }
    return objectTraps.deleteProperty.call(this, state[0], prop);
};
arrayTraps.set = function(state, prop, value) {
    if (prop !== "length" && isNaN(parseInt(prop))) {
        throw new Error("Immer only supports setting array indices and the 'length' property");
    }
    return objectTraps.set.call(this, state[0], prop, value);
};

function source$1(state) {
    return state.copy || state.base;
}

function get$1(state, prop) {
    if (prop === DRAFT_STATE) return state;
    var drafts = state.drafts;

    if (!state.modified && has(drafts, prop)) {
        return drafts[prop];
    }

    var value = source$1(state)[prop];
    if (state.finalized || !isDraftable(value)) return value;


    if (state.modified) {

        if (value !== state.base[prop]) return value;

        drafts = state.copy;
    }

    return drafts[prop] = createProxy$1(value, state);
}

function set$1(state, prop, value) {
    if (!state.modified) {
        var isUnchanged = value ? is(state.base[prop], value) || value === state.drafts[prop] : is(state.base[prop], value) && prop in state.base;
        if (isUnchanged) return true;
        markChanged$1(state);
    }
    state.assigned[prop] = true;
    state.copy[prop] = value;
    return true;
}

function deleteProperty(state, prop) {
    if (state.base[prop] !== undefined || prop in state.base) {
        state.assigned[prop] = false;
        markChanged$1(state);
    }
    if (state.copy) delete state.copy[prop];
    return true;
}

function getOwnPropertyDescriptor(state, prop) {
    var owner = source$1(state);
    var desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (desc) {
        desc.writable = true;
        desc.configurable = !Array.isArray(owner) || prop !== "length";
    }
    return desc;
}

function markChanged$1(state) {
    if (!state.modified) {
        state.modified = true;
        state.copy = assign(shallowCopy(state.base), state.drafts);
        state.drafts = null;
        if (state.parent) markChanged$1(state.parent);
    }
}

var modernProxy = Object.freeze({
    willFinalize: willFinalize$1,
    createProxy: createProxy$1
});

function generatePatches(state, basePath, patches, inversePatches) {
    Array.isArray(state.base) ? generateArrayPatches(state, basePath, patches, inversePatches) : generateObjectPatches(state, basePath, patches, inversePatches);
}

function generateArrayPatches(state, basePath, patches, inversePatches) {
    var base = state.base,
        copy = state.copy,
        assigned = state.assigned;

    var minLength = Math.min(base.length, copy.length);


    for (var i = 0; i < minLength; i++) {
        if (assigned[i] && base[i] !== copy[i]) {
            var path = basePath.concat(i);
            patches.push({
                op: "replace",
                path: path,
                value: copy[i]
            });
            inversePatches.push({
                op: "replace",
                path: path,
                value: base[i]
            });
        }
    }


    if (minLength < copy.length) {
        for (var _i = minLength; _i < copy.length; _i++) {
            patches.push({
                op: "add",
                path: basePath.concat(_i),
                value: copy[_i]
            });
        }
        inversePatches.push({
            op: "replace",
            path: basePath.concat("length"),
            value: base.length
        });
    } else if (minLength < base.length) {
        patches.push({
            op: "replace",
            path: basePath.concat("length"),
            value: copy.length
        });
        for (var _i2 = minLength; _i2 < base.length; _i2++) {
            inversePatches.push({
                op: "add",
                path: basePath.concat(_i2),
                value: base[_i2]
            });
        }
    }
}

function generateObjectPatches(state, basePath, patches, inversePatches) {
    var base = state.base,
        copy = state.copy;

    each(state.assigned, function(key, assignedValue) {
        var origValue = base[key];
        var value = copy[key];
        var op = !assignedValue ? "remove" : key in base ? "replace" : "add";
        if (origValue === value && op === "replace") return;
        var path = basePath.concat(key);
        patches.push(op === "remove" ? {
            op: op,
            path: path
        } : {
            op: op,
            path: path,
            value: value
        });
        inversePatches.push(op === "add" ? {
            op: "remove",
            path: path
        } : op === "remove" ? {
            op: "add",
            path: path,
            value: origValue
        } : {
            op: "replace",
            path: path,
            value: origValue
        });
    });
}

function applyPatches(draft, patches) {
    for (var i = 0; i < patches.length; i++) {
        var patch = patches[i];
        var path = patch.path;

        if (path.length === 0 && patch.op === "replace") {
            draft = patch.value;
        } else {
            var base = draft;
            for (var _i3 = 0; _i3 < path.length - 1; _i3++) {
                base = base[path[_i3]];
                if (!base || (typeof base === "undefined" ? "undefined" : _typeof(base)) !== "object") throw new Error("Cannot apply patch, path doesn't resolve: " + path.join("/"));
            }
            var key = path[path.length - 1];
            switch (patch.op) {
                case "replace":
                case "add":

                    base[key] = patch.value;
                    break;
                case "remove":
                    if (Array.isArray(base)) {
                        if (key !== base.length - 1) throw new Error("Only the last index of an array can be removed, index: " + key + ", length: " + base.length);
                        base.length -= 1;
                    } else {
                        delete base[key];
                    }
                    break;
                default:
                    throw new Error("Unsupported patch operation: " + patch.op);
            }
        }
    }
    return draft;
}

function verifyMinified() {}

var configDefaults = {
    useProxies: typeof Proxy !== "undefined" && typeof Reflect !== "undefined",
    autoFreeze: typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : verifyMinified.name === "verifyMinified",
    onAssign: null,
    onDelete: null,
    onCopy: null
};

var Immer = function() {
    function Immer(config) {
        classCallCheck(this, Immer);

        assign(this, configDefaults, config);
        this.setUseProxies(this.useProxies);
        this.produce = this.produce.bind(this);
    }

    createClass(Immer, [{
        key: "produce",
        value: function produce(base, recipe, patchListener) {
            var _this = this;

            if (typeof base === "function" && typeof recipe !== "function") {
                var defaultBase = recipe;
                recipe = base;

                return function() {
                    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                    }

                    var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultBase;
                    return _this.produce(base, function(draft) {
                        var _recipe;

                        return (_recipe = recipe).call.apply(_recipe, [draft, draft].concat(args));
                    });
                };
            }

            {
                if (typeof recipe !== "function") throw new Error("if first argument is not a function, the second argument to produce should be a function");
                if (patchListener !== undefined && typeof patchListener !== "function") throw new Error("the third argument of a producer should not be set or a function");
            }

            var result = void 0;


            if (isDraftable(base)) {
                var scope = ImmerScope.enter();
                var proxy = this.createProxy(base);
                var hasError = true;
                try {
                    result = recipe.call(proxy, proxy);
                    hasError = false;
                } finally {
                    if (hasError) scope.revoke();
                    else scope.leave();
                }
                if (result instanceof Promise) {
                    return result.then(function(result) {
                        scope.usePatches(patchListener);
                        return _this.processResult(result, scope);
                    }, function(error) {
                        scope.revoke();
                        throw error;
                    });
                }
                scope.usePatches(patchListener);
                return this.processResult(result, scope);
            } else {
                result = recipe(base);
                if (result === undefined) return base;
                return result !== NOTHING ? result : undefined;
            }
        }
    }, {
        key: "createDraft",
        value: function createDraft(base) {
            if (!isDraftable(base)) throw new Error("First argument to createDraft should be a plain object, an array, or an immerable object.");
            var scope = ImmerScope.enter();
            var proxy = this.createProxy(base);
            scope.leave();
            proxy[DRAFT_STATE].customDraft = true;
            return proxy;
        }
    }, {
        key: "finishDraft",
        value: function finishDraft(draft, patchListener) {
            if (!isDraft(draft)) throw new Error("First argument to finishDraft should be an object from createDraft.");
            var state = draft[DRAFT_STATE];
            if (!state.customDraft) throw new Error("The draft provided was not created using `createDraft`");
            if (state.finalized) throw new Error("The draft provided was has already been finished");

            var scope = state.scope;

            scope.usePatches(patchListener);
            return this.processResult(undefined, scope);
        }
    }, {
        key: "setAutoFreeze",
        value: function setAutoFreeze(value) {
            this.autoFreeze = value;
        }
    }, {
        key: "setUseProxies",
        value: function setUseProxies(value) {
            this.useProxies = value;
            assign(this, value ? modernProxy : legacyProxy);
        }
    }, {
        key: "applyPatches",
        value: function applyPatches$$1(base, patches) {

            if (isDraft(base)) {
                return applyPatches(base, patches);
            }

            return this.produce(base, function(draft) {
                return applyPatches(draft, patches);
            });
        }
        /** @internal */

    }, {
        key: "processResult",
        value: function processResult(result, scope) {
            var baseDraft = scope.drafts[0];
            var isReplaced = result !== undefined && result !== baseDraft;
            this.willFinalize(scope, result, isReplaced);
            if (isReplaced) {
                if (baseDraft[DRAFT_STATE].modified) {
                    scope.revoke();
                    throw new Error("An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.");
                }
                if (isDraftable(result)) {

                    result = this.finalize(result, null, scope);
                }
                if (scope.patches) {
                    scope.patches.push({
                        op: "replace",
                        path: [],
                        value: result
                    });
                    scope.inversePatches.push({
                        op: "replace",
                        path: [],
                        value: baseDraft[DRAFT_STATE].base
                    });
                }
            } else {

                result = this.finalize(baseDraft, [], scope);
            }
            scope.revoke();
            if (scope.patches) {
                scope.patchListener(scope.patches, scope.inversePatches);
            }
            return result !== NOTHING ? result : undefined;
        }
    }, {
        key: "finalize",
        value: function finalize(draft, path, scope) {
            var _this2 = this;

            var state = draft[DRAFT_STATE];
            if (!state) {
                if (Object.isFrozen(draft)) return draft;
                return this.finalizeTree(draft, null, scope);
            }

            if (state.scope !== scope) {
                return draft;
            }
            if (!state.modified) {
                return state.base;
            }
            if (!state.finalized) {
                state.finalized = true;
                this.finalizeTree(state.draft, path, scope);

                if (this.onDelete) {

                    if (this.useProxies) {
                        var assigned = state.assigned;

                        for (var prop in assigned) {
                            if (!assigned[prop]) this.onDelete(state, prop);
                        }
                    } else {
                        var base = state.base,
                            copy = state.copy;

                        each(base, function(prop) {
                            if (!has(copy, prop)) _this2.onDelete(state, prop);
                        });
                    }
                }
                if (this.onCopy) {
                    this.onCopy(state);
                }



                if (this.autoFreeze && scope.canAutoFreeze) {
                    Object.freeze(state.copy);
                }

                if (path && scope.patches) {
                    generatePatches(state, path, scope.patches, scope.inversePatches);
                }
            }
            return state.copy;
        }
    }, {
        key: "finalizeTree",
        value: function finalizeTree(root, rootPath, scope) {
            var _this3 = this;

            var state = root[DRAFT_STATE];
            if (state) {
                if (!this.useProxies) {
                    state.finalizing = true;
                    state.copy = shallowCopy(state.draft, true);
                    state.finalizing = false;
                }
                root = state.copy;
            }

            var needPatches = !!rootPath && !!scope.patches;
            var finalizeProperty = function finalizeProperty(prop, value, parent) {
                if (value === parent) {
                    throw Error("Immer forbids circular references");
                }


                var isDraftProp = !!state && parent === root;

                if (isDraft(value)) {
                    var path = isDraftProp && needPatches && !state.assigned[prop] ? rootPath.concat(prop) : null;


                    value = _this3.finalize(value, path, scope);


                    if (isDraft(value)) {
                        scope.canAutoFreeze = false;
                    }


                    if (Array.isArray(parent) || isEnumerable(parent, prop)) {
                        parent[prop] = value;
                    } else {
                        Object.defineProperty(parent, prop, {
                            value: value
                        });
                    }


                    if (isDraftProp && value === state.base[prop]) return;
                } else if (isDraftProp && is(value, state.base[prop])) {
                    return;
                } else if (isDraftable(value) && !Object.isFrozen(value)) {
                    each(value, finalizeProperty);
                }

                if (isDraftProp && _this3.onAssign) {
                    _this3.onAssign(state, prop, value);
                }
            };

            each(root, finalizeProperty);
            return root;
        }
    }]);
    return Immer;
}();

var immer = new Immer();
var produce = immer.produce;
var setAutoFreeze = immer.setAutoFreeze.bind(immer);
var setUseProxies = immer.setUseProxies.bind(immer);
var applyPatches$1 = immer.applyPatches.bind(immer);
var createDraft = immer.createDraft.bind(immer);
var finishDraft = immer.finishDraft.bind(immer);

export {
    produce,
    setAutoFreeze,
    setUseProxies,
    applyPatches$1 as applyPatches,
    createDraft,
    finishDraft,
    Immer,
    original,
    isDraft,
    isDraftable,
    NOTHING as nothing,
    DRAFTABLE as immerable
};
export default produce;