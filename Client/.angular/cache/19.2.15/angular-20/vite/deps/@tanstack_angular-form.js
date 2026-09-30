import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  Injectable,
  Injector,
  assertInInjectionContext,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  runInInjectionContext,
  setClassMetadata,
  signal,
  untracked,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵdefineDirective,
  ɵɵdefineInjectable
} from "./chunk-NZ5IK722.js";
import {
  __async,
  __objRest,
  __restKey,
  __spreadProps,
  __spreadValues
} from "./chunk-MSVQUNDQ.js";

// node_modules/@tanstack/store/dist/esm/scheduler.js
var __storeToDerived = /* @__PURE__ */ new WeakMap();
var __derivedToStore = /* @__PURE__ */ new WeakMap();
var __depsThatHaveWrittenThisTick = {
  current: []
};
var __isFlushing = false;
var __batchDepth = 0;
var __pendingUpdates = /* @__PURE__ */ new Set();
var __initialBatchValues = /* @__PURE__ */ new Map();
function __flush_internals(relatedVals) {
  const sorted = Array.from(relatedVals).sort((a, b) => {
    if (a instanceof Derived && a.options.deps.includes(b)) return 1;
    if (b instanceof Derived && b.options.deps.includes(a)) return -1;
    return 0;
  });
  for (const derived of sorted) {
    if (__depsThatHaveWrittenThisTick.current.includes(derived)) {
      continue;
    }
    __depsThatHaveWrittenThisTick.current.push(derived);
    derived.recompute();
    const stores = __derivedToStore.get(derived);
    if (stores) {
      for (const store of stores) {
        const relatedLinkedDerivedVals = __storeToDerived.get(store);
        if (!relatedLinkedDerivedVals) continue;
        __flush_internals(relatedLinkedDerivedVals);
      }
    }
  }
}
function __notifyListeners(store) {
  store.listeners.forEach((listener) => listener({
    prevVal: store.prevState,
    currentVal: store.state
  }));
}
function __notifyDerivedListeners(derived) {
  derived.listeners.forEach((listener) => listener({
    prevVal: derived.prevState,
    currentVal: derived.state
  }));
}
function __flush(store) {
  if (__batchDepth > 0 && !__initialBatchValues.has(store)) {
    __initialBatchValues.set(store, store.prevState);
  }
  __pendingUpdates.add(store);
  if (__batchDepth > 0) return;
  if (__isFlushing) return;
  try {
    __isFlushing = true;
    while (__pendingUpdates.size > 0) {
      const stores = Array.from(__pendingUpdates);
      __pendingUpdates.clear();
      for (const store2 of stores) {
        const prevState = __initialBatchValues.get(store2) ?? store2.prevState;
        store2.prevState = prevState;
        __notifyListeners(store2);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        __depsThatHaveWrittenThisTick.current.push(store2);
        __flush_internals(derivedVals);
      }
      for (const store2 of stores) {
        const derivedVals = __storeToDerived.get(store2);
        if (!derivedVals) continue;
        for (const derived of derivedVals) {
          __notifyDerivedListeners(derived);
        }
      }
    }
  } finally {
    __isFlushing = false;
    __depsThatHaveWrittenThisTick.current = [];
    __initialBatchValues.clear();
  }
}
function batch(fn) {
  __batchDepth++;
  try {
    fn();
  } finally {
    __batchDepth--;
    if (__batchDepth === 0) {
      const pendingUpdateToFlush = Array.from(__pendingUpdates)[0];
      if (pendingUpdateToFlush) {
        __flush(pendingUpdateToFlush);
      }
    }
  }
}

// node_modules/@tanstack/store/dist/esm/types.js
function isUpdaterFunction(updater) {
  return typeof updater === "function";
}

// node_modules/@tanstack/store/dist/esm/store.js
var Store = class {
  constructor(initialState, options) {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options) == null ? void 0 : _a.onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.prevState = initialState;
    this.state = initialState;
    this.options = options;
  }
  setState(updater) {
    var _a, _b, _c;
    this.prevState = this.state;
    if ((_a = this.options) == null ? void 0 : _a.updateFn) {
      this.state = this.options.updateFn(this.prevState)(updater);
    } else {
      if (isUpdaterFunction(updater)) {
        this.state = updater(this.prevState);
      } else {
        this.state = updater;
      }
    }
    (_c = (_b = this.options) == null ? void 0 : _b.onUpdate) == null ? void 0 : _c.call(_b);
    __flush(this);
  }
};

// node_modules/@tanstack/store/dist/esm/derived.js
var Derived = class _Derived {
  constructor(options) {
    this.listeners = /* @__PURE__ */ new Set();
    this._subscriptions = [];
    this.lastSeenDepValues = [];
    this.getDepVals = () => {
      const prevDepVals = [];
      const currDepVals = [];
      for (const dep of this.options.deps) {
        prevDepVals.push(dep.prevState);
        currDepVals.push(dep.state);
      }
      this.lastSeenDepValues = currDepVals;
      return {
        prevDepVals,
        currDepVals,
        prevVal: this.prevState ?? void 0
      };
    };
    this.recompute = () => {
      var _a, _b;
      this.prevState = this.state;
      const {
        prevDepVals,
        currDepVals,
        prevVal
      } = this.getDepVals();
      this.state = this.options.fn({
        prevDepVals,
        currDepVals,
        prevVal
      });
      (_b = (_a = this.options).onUpdate) == null ? void 0 : _b.call(_a);
    };
    this.checkIfRecalculationNeededDeeply = () => {
      for (const dep of this.options.deps) {
        if (dep instanceof _Derived) {
          dep.checkIfRecalculationNeededDeeply();
        }
      }
      let shouldRecompute = false;
      const lastSeenDepValues = this.lastSeenDepValues;
      const {
        currDepVals
      } = this.getDepVals();
      for (let i = 0; i < currDepVals.length; i++) {
        if (currDepVals[i] !== lastSeenDepValues[i]) {
          shouldRecompute = true;
          break;
        }
      }
      if (shouldRecompute) {
        this.recompute();
      }
    };
    this.mount = () => {
      this.registerOnGraph();
      this.checkIfRecalculationNeededDeeply();
      return () => {
        this.unregisterFromGraph();
        for (const cleanup of this._subscriptions) {
          cleanup();
        }
      };
    };
    this.subscribe = (listener) => {
      var _a, _b;
      this.listeners.add(listener);
      const unsub = (_b = (_a = this.options).onSubscribe) == null ? void 0 : _b.call(_a, listener, this);
      return () => {
        this.listeners.delete(listener);
        unsub == null ? void 0 : unsub();
      };
    };
    this.options = options;
    this.state = options.fn({
      prevDepVals: void 0,
      prevVal: void 0,
      currDepVals: this.getDepVals().currDepVals
    });
  }
  registerOnGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof _Derived) {
        dep.registerOnGraph();
        this.registerOnGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        let relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (!relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals = /* @__PURE__ */ new Set();
          __storeToDerived.set(dep, relatedLinkedDerivedVals);
        }
        relatedLinkedDerivedVals.add(this);
        let relatedStores = __derivedToStore.get(this);
        if (!relatedStores) {
          relatedStores = /* @__PURE__ */ new Set();
          __derivedToStore.set(this, relatedStores);
        }
        relatedStores.add(dep);
      }
    }
  }
  unregisterFromGraph(deps = this.options.deps) {
    for (const dep of deps) {
      if (dep instanceof _Derived) {
        this.unregisterFromGraph(dep.options.deps);
      } else if (dep instanceof Store) {
        const relatedLinkedDerivedVals = __storeToDerived.get(dep);
        if (relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals.delete(this);
        }
        const relatedStores = __derivedToStore.get(this);
        if (relatedStores) {
          relatedStores.delete(dep);
        }
      }
    }
  }
};

// node_modules/@tanstack/form-core/dist/esm/utils.js
function functionalUpdate(updater, input2) {
  return typeof updater === "function" ? updater(input2) : updater;
}
function getBy(obj, path) {
  const pathObj = makePathArray(path);
  return pathObj.reduce((current, pathPart) => {
    if (current === null) return null;
    if (typeof current !== "undefined") {
      return current[pathPart];
    }
    return void 0;
  }, obj);
}
function setBy(obj, _path, updater) {
  const path = makePathArray(_path);
  function doSet(parent) {
    if (!path.length) {
      return functionalUpdate(updater, parent);
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        if (parent === null) {
          parent = {};
        }
        return __spreadProps(__spreadValues({}, parent), {
          [key]: doSet(parent[key])
        });
      }
      return {
        [key]: doSet()
      };
    }
    if (Array.isArray(parent) && typeof key === "number") {
      const prefix = parent.slice(0, key);
      return [...prefix.length ? prefix : new Array(key), doSet(parent[key]), ...parent.slice(key + 1)];
    }
    return [...new Array(key), doSet()];
  }
  return doSet(obj);
}
function deleteBy(obj, _path) {
  const path = makePathArray(_path);
  function doDelete(parent) {
    if (!parent) return;
    if (path.length === 1) {
      const finalPath = path[0];
      if (Array.isArray(parent) && typeof finalPath === "number") {
        return parent.filter((_, i) => i !== finalPath);
      }
      const _a = parent, {
        [finalPath]: remove
      } = _a, rest = __objRest(_a, [
        __restKey(finalPath)
      ]);
      return rest;
    }
    const key = path.shift();
    if (typeof key === "string") {
      if (typeof parent === "object") {
        return __spreadProps(__spreadValues({}, parent), {
          [key]: doDelete(parent[key])
        });
      }
    }
    if (typeof key === "number") {
      if (Array.isArray(parent)) {
        if (key >= parent.length) {
          return parent;
        }
        const prefix = parent.slice(0, key);
        return [...prefix.length ? prefix : new Array(key), doDelete(parent[key]), ...parent.slice(key + 1)];
      }
    }
    throw new Error("It seems we have created an infinite loop in deleteBy. ");
  }
  return doDelete(obj);
}
var reLineOfOnlyDigits = /^(\d+)$/gm;
var reDigitsBetweenDots = /\.(\d+)(?=\.)/gm;
var reStartWithDigitThenDot = /^(\d+)\./gm;
var reDotWithDigitsToEnd = /\.(\d+$)/gm;
var reMultipleDots = /\.{2,}/gm;
var intPrefix = "__int__";
var intReplace = `${intPrefix}$1`;
function makePathArray(str) {
  if (Array.isArray(str)) {
    return [...str];
  }
  if (typeof str !== "string") {
    throw new Error("Path must be a string.");
  }
  return str.replace(/(^\[)|]/gm, "").replace(/\[/g, ".").replace(reLineOfOnlyDigits, intReplace).replace(reDigitsBetweenDots, `.${intReplace}.`).replace(reStartWithDigitThenDot, `${intReplace}.`).replace(reDotWithDigitsToEnd, `.${intReplace}`).replace(reMultipleDots, ".").split(".").map((d) => {
    if (d.startsWith(intPrefix)) {
      const numStr = d.substring(intPrefix.length);
      const num = parseInt(numStr, 10);
      if (String(num) === numStr) {
        return num;
      }
      return numStr;
    }
    return d;
  });
}
function concatenatePaths(path1, path2) {
  if (path1.length === 0) return path2;
  if (path2.length === 0) return path1;
  if (path2.startsWith("[")) {
    return path1 + path2;
  }
  if (path2.startsWith(".")) {
    return path1 + path2;
  }
  return `${path1}.${path2}`;
}
function isNonEmptyArray(obj) {
  return !(Array.isArray(obj) && obj.length === 0);
}
function getSyncValidatorArray(cause, options) {
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      return {
        cause: validator.cause,
        validate: validator.fn
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    validators: options.validators,
    event: {
      type: cause,
      async: false
    },
    runValidation
  });
}
function getAsyncValidatorArray(cause, options) {
  const {
    asyncDebounceMs
  } = options;
  const {
    onBlurAsyncDebounceMs,
    onChangeAsyncDebounceMs,
    onDynamicAsyncDebounceMs
  } = options.validators || {};
  const defaultDebounceMs = asyncDebounceMs ?? 0;
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      const validatorCause = validator?.cause || cause;
      let debounceMs = defaultDebounceMs;
      switch (validatorCause) {
        case "change":
          debounceMs = onChangeAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "blur":
          debounceMs = onBlurAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "dynamic":
          debounceMs = onDynamicAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "submit":
          debounceMs = 0;
          break;
      }
      if (cause === "submit") {
        debounceMs = 0;
      }
      return {
        cause: validatorCause,
        validate: validator.fn,
        debounceMs
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    validators: options.validators,
    event: {
      type: cause,
      async: true
    },
    runValidation
  });
}
var isGlobalFormValidationError = (error) => {
  return !!error && typeof error === "object" && "fields" in error;
};
function evaluate(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const v of objA) {
      if (!objB.has(v)) return false;
    }
    return true;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.includes(key) || !evaluate(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}
var determineFormLevelErrorSourceAndValue = ({
  newFormValidatorError,
  isPreviousErrorFromFormValidator,
  previousErrorValue
}) => {
  if (newFormValidatorError) {
    return {
      newErrorValue: newFormValidatorError,
      newSource: "form"
    };
  }
  if (isPreviousErrorFromFormValidator) {
    return {
      newErrorValue: void 0,
      newSource: void 0
    };
  }
  if (previousErrorValue) {
    return {
      newErrorValue: previousErrorValue,
      newSource: "field"
    };
  }
  return {
    newErrorValue: void 0,
    newSource: void 0
  };
};
var determineFieldLevelErrorSourceAndValue = ({
  formLevelError,
  fieldLevelError
}) => {
  if (fieldLevelError) {
    return {
      newErrorValue: fieldLevelError,
      newSource: "field"
    };
  }
  if (formLevelError) {
    return {
      newErrorValue: formLevelError,
      newSource: "form"
    };
  }
  return {
    newErrorValue: void 0,
    newSource: void 0
  };
};
function createFieldMap(values) {
  const output = {};
  for (const key in values) {
    output[key] = key;
  }
  return output;
}

// node_modules/@tanstack/form-core/dist/esm/ValidationLogic.js
var revalidateLogic = ({
  mode = "submit",
  modeAfterSubmission = "change"
} = {}) => (props) => {
  const validatorNames = Object.keys(props.validators ?? {});
  if (validatorNames.length === 0) {
    return props.runValidation({
      validators: [],
      form: props.form
    });
  }
  const dynamicValidator = {
    fn: props.event.async ? props.validators["onDynamicAsync"] : props.validators["onDynamic"],
    cause: "dynamic"
  };
  const validatorsToAdd = [];
  const modeToWatch = props.form.state.submissionAttempts === 0 ? mode : modeAfterSubmission;
  if ([modeToWatch, "submit"].includes(props.event.type)) {
    validatorsToAdd.push(dynamicValidator);
  }
  let defaultValidators = [];
  defaultValidationLogic(__spreadProps(__spreadValues({}, props), {
    runValidation: (vProps) => {
      defaultValidators = vProps.validators;
    }
  }));
  if (validatorsToAdd.length === 0) {
    return props.runValidation({
      validators: defaultValidators,
      form: props.form
    });
  }
  return props.runValidation({
    validators: [...defaultValidators, ...validatorsToAdd],
    form: props.form
  });
};
var defaultValidationLogic = (props) => {
  if (!props.validators) {
    return props.runValidation({
      validators: [],
      form: props.form
    });
  }
  const isAsync = props.event.async;
  const onMountValidator = isAsync ? void 0 : {
    fn: props.validators.onMount,
    cause: "mount"
  };
  const onChangeValidator = {
    fn: isAsync ? props.validators.onChangeAsync : props.validators.onChange,
    cause: "change"
  };
  const onBlurValidator = {
    fn: isAsync ? props.validators.onBlurAsync : props.validators.onBlur,
    cause: "blur"
  };
  const onSubmitValidator = {
    fn: isAsync ? props.validators.onSubmitAsync : props.validators.onSubmit,
    cause: "submit"
  };
  const onServerValidator = isAsync ? void 0 : {
    fn: () => void 0,
    cause: "server"
  };
  switch (props.event.type) {
    case "mount": {
      return props.runValidation({
        validators: [onMountValidator],
        form: props.form
      });
    }
    case "submit": {
      return props.runValidation({
        validators: [onChangeValidator, onBlurValidator, onSubmitValidator, onServerValidator],
        form: props.form
      });
    }
    case "server": {
      return props.runValidation({
        validators: [],
        form: props.form
      });
    }
    case "blur": {
      return props.runValidation({
        validators: [onBlurValidator, onServerValidator],
        form: props.form
      });
    }
    case "change": {
      return props.runValidation({
        validators: [onChangeValidator, onServerValidator],
        form: props.form
      });
    }
    default: {
      throw new Error(`Unknown validation event type: ${props.event.type}`);
    }
  }
};

// node_modules/@tanstack/form-core/dist/esm/standardSchemaValidator.js
function prefixSchemaToErrors(issues) {
  const schema = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const path = [...issue.path ?? []].map((segment) => {
      const normalizedSegment = typeof segment === "object" ? segment.key : segment;
      return typeof normalizedSegment === "number" ? `[${normalizedSegment}]` : normalizedSegment;
    }).join(".").replace(/\.\[/g, "[");
    schema.set(path, (schema.get(path) ?? []).concat(issue));
  }
  return Object.fromEntries(schema);
}
var transformFormIssues = (issues) => {
  const schemaErrors = prefixSchemaToErrors(issues);
  return {
    form: schemaErrors,
    fields: schemaErrors
  };
};
var standardSchemaValidators = {
  validate({
    value,
    validationSource
  }, schema) {
    const result = schema["~standard"].validate(value);
    if (result instanceof Promise) {
      throw new Error("async function passed to sync validator");
    }
    if (!result.issues) return;
    if (validationSource === "field") return result.issues;
    return transformFormIssues(result.issues);
  },
  validateAsync(_0, _1) {
    return __async(this, arguments, function* ({
      value,
      validationSource
    }, schema) {
      const result = yield schema["~standard"].validate(value);
      if (!result.issues) return;
      if (validationSource === "field") return result.issues;
      return transformFormIssues(result.issues);
    });
  }
};
var isStandardSchemaValidator = (validator) => !!validator && "~standard" in validator;

// node_modules/@tanstack/form-core/dist/esm/metaHelper.js
var defaultFieldMeta = {
  isValidating: false,
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isPristine: true,
  isValid: true,
  isDefaultValue: true,
  errors: [],
  errorMap: {},
  errorSourceMap: {}
};
function metaHelper(formApi) {
  function handleArrayFieldMetaShift(field, index, mode, secondIndex) {
    const affectedFields = getAffectedFields(field, index, mode, secondIndex);
    const handlers = {
      insert: () => handleInsertMode(affectedFields, field, index),
      remove: () => handleRemoveMode(affectedFields),
      swap: () => secondIndex !== void 0 && handleSwapMode(affectedFields, field, index, secondIndex),
      move: () => secondIndex !== void 0 && handleMoveMode(affectedFields, field, index, secondIndex)
    };
    handlers[mode]();
  }
  function getFieldPath(field, index) {
    return `${field}[${index}]`;
  }
  function getAffectedFields(field, index, mode, secondIndex) {
    const affectedFieldKeys = [getFieldPath(field, index)];
    if (mode === "swap") {
      affectedFieldKeys.push(getFieldPath(field, secondIndex));
    } else if (mode === "move") {
      const [startIndex, endIndex] = [Math.min(index, secondIndex), Math.max(index, secondIndex)];
      for (let i = startIndex; i <= endIndex; i++) {
        affectedFieldKeys.push(getFieldPath(field, i));
      }
    } else {
      const currentValue = formApi.getFieldValue(field);
      const fieldItems = Array.isArray(currentValue) ? currentValue.length : 0;
      for (let i = index + 1; i < fieldItems; i++) {
        affectedFieldKeys.push(getFieldPath(field, i));
      }
    }
    return Object.keys(formApi.fieldInfo).filter((fieldKey) => affectedFieldKeys.some((key) => fieldKey.startsWith(key)));
  }
  function updateIndex(fieldKey, direction) {
    return fieldKey.replace(/\[(\d+)\]/, (_, num) => {
      const currIndex = parseInt(num, 10);
      const newIndex = direction === "up" ? currIndex + 1 : Math.max(0, currIndex - 1);
      return `[${newIndex}]`;
    });
  }
  function shiftMeta(fields, direction) {
    const sortedFields = direction === "up" ? fields : [...fields].reverse();
    sortedFields.forEach((fieldKey) => {
      const nextFieldKey = updateIndex(fieldKey.toString(), direction);
      const nextFieldMeta = formApi.getFieldMeta(nextFieldKey);
      if (nextFieldMeta) {
        formApi.setFieldMeta(fieldKey, nextFieldMeta);
      } else {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  const getEmptyFieldMeta = () => defaultFieldMeta;
  const handleInsertMode = (fields, field, insertIndex) => {
    shiftMeta(fields, "down");
    fields.forEach((fieldKey) => {
      if (fieldKey.toString().startsWith(getFieldPath(field, insertIndex))) {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  };
  const handleRemoveMode = (fields) => {
    shiftMeta(fields, "up");
  };
  const handleMoveMode = (fields, field, fromIndex, toIndex) => {
    const fromFields = new Map(Object.keys(formApi.fieldInfo).filter((fieldKey) => fieldKey.startsWith(getFieldPath(field, fromIndex))).map((fieldKey) => [fieldKey, formApi.getFieldMeta(fieldKey)]));
    shiftMeta(fields, fromIndex < toIndex ? "up" : "down");
    Object.keys(formApi.fieldInfo).filter((fieldKey) => fieldKey.startsWith(getFieldPath(field, toIndex))).forEach((fieldKey) => {
      const fromKey = fieldKey.replace(getFieldPath(field, toIndex), getFieldPath(field, fromIndex));
      const fromMeta = fromFields.get(fromKey);
      if (fromMeta) {
        formApi.setFieldMeta(fieldKey, fromMeta);
      }
    });
  };
  const handleSwapMode = (fields, field, index, secondIndex) => {
    fields.forEach((fieldKey) => {
      if (!fieldKey.toString().startsWith(getFieldPath(field, index))) return;
      const swappedKey = fieldKey.toString().replace(getFieldPath(field, index), getFieldPath(field, secondIndex));
      const [meta1, meta2] = [formApi.getFieldMeta(fieldKey), formApi.getFieldMeta(swappedKey)];
      if (meta1) formApi.setFieldMeta(swappedKey, meta1);
      if (meta2) formApi.setFieldMeta(fieldKey, meta2);
    });
  };
  return {
    handleArrayFieldMetaShift
  };
}

// node_modules/@tanstack/form-core/dist/esm/FormApi.js
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errorMap: defaultState.errorMap ?? {},
    fieldMetaBase: defaultState.fieldMetaBase ?? {},
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0,
      onDynamic: void 0
    }
  };
}
var FormApi = class {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    this.options = {};
    this.fieldInfo = {};
    this.prevTransformArray = [];
    this.mount = () => {
      const cleanupFieldMetaDerived = this.fieldMetaDerived.mount();
      const cleanupStoreDerived = this.store.mount();
      const cleanup = () => {
        cleanupFieldMetaDerived();
        cleanupStoreDerived();
      };
      this.options.listeners?.onMount?.({
        formApi: this
      });
      const {
        onMount
      } = this.options.validators || {};
      if (!onMount) return cleanup;
      this.validateSync("mount");
      return cleanup;
    };
    this.update = (options) => {
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      const shouldUpdateReeval = !!options.transform?.deps?.some((val, i) => val !== this.prevTransformArray[i]);
      const shouldUpdateValues = options.defaultValues && !evaluate(options.defaultValues, oldOptions.defaultValues) && !this.state.isTouched;
      const shouldUpdateState = !evaluate(options.defaultState, oldOptions.defaultState) && !this.state.isTouched;
      if (!shouldUpdateValues && !shouldUpdateState && !shouldUpdateReeval) return;
      batch(() => {
        this.baseStore.setState(() => getDefaultFormState(Object.assign({}, this.state, shouldUpdateState ? options.defaultState : {}, shouldUpdateValues ? {
          values: options.defaultValues
        } : {}, shouldUpdateReeval ? {
          _force_re_eval: !this.state._force_re_eval
        } : {})));
      });
    };
    this.reset = (values, opts2) => {
      const {
        fieldMeta: currentFieldMeta
      } = this.state;
      const fieldMetaBase = this.resetFieldMeta(currentFieldMeta);
      if (values && !opts2?.keepDefaultValues) {
        this.options = __spreadProps(__spreadValues({}, this.options), {
          defaultValues: values
        });
      }
      this.baseStore.setState(() => getDefaultFormState(__spreadProps(__spreadValues({}, this.options.defaultState), {
        values: values ?? this.options.defaultValues ?? this.options.defaultState?.values,
        fieldMetaBase
      })));
    };
    this.validateAllFields = (cause) => __async(this, null, function* () {
      const fieldValidationPromises = [];
      batch(() => {
        void Object.values(this.fieldInfo).forEach((field) => {
          if (!field.instance) return;
          const fieldInstance = field.instance;
          fieldValidationPromises.push(
            // Remember, `validate` is either a sync operation or a promise
            Promise.resolve().then(() => fieldInstance.validate(cause, {
              skipFormValidation: true
            }))
          );
          if (!field.instance.state.meta.isTouched) {
            field.instance.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
              isTouched: true
            }));
          }
        });
      });
      const fieldErrorMapMap = yield Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    });
    this.validateArrayFieldsStartingFrom = (field, index, cause) => __async(this, null, function* () {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter((fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key)));
      const fieldValidationPromises = [];
      batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(Promise.resolve().then(() => this.validateField(nestedField, cause)));
        });
      });
      const fieldErrorMapMap = yield Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    });
    this.validateField = (field, cause) => {
      const fieldInstance = this.fieldInfo[field]?.instance;
      if (!fieldInstance) return [];
      if (!fieldInstance.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isTouched: true
        }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause) => {
      const validates = getSyncValidatorArray(cause, __spreadProps(__spreadValues({}, this.options), {
        form: this,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      }));
      let hasErrored = false;
      const currentValidationErrorMap = {};
      batch(() => {
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const {
            formError,
            fieldErrors
          } = normalizeError(rawError);
          const errorMapKey = getErrorMapKey(validateObj.cause);
          for (const field of Object.keys(this.state.fieldMeta)) {
            const fieldMeta = this.getFieldMeta(field);
            if (!fieldMeta) continue;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrors?.[field];
            const {
              newErrorValue,
              newSource
            } = determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                currentErrorMapSource?.[errorMapKey] === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap?.[errorMapKey]
            });
            if (newSource === "form") {
              currentValidationErrorMap[field] = __spreadProps(__spreadValues({}, currentValidationErrorMap[field]), {
                [errorMapKey]: newFormValidatorError
              });
            }
            if (
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              currentErrorMap?.[errorMapKey] !== newErrorValue
            ) {
              this.setFieldMeta(field, (prev) => __spreadProps(__spreadValues({}, prev), {
                errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
                  [errorMapKey]: newErrorValue
                }),
                errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
                  [errorMapKey]: newSource
                })
              }));
            }
          }
          if (this.state.errorMap?.[errorMapKey] !== formError) {
            this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
              errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
                [errorMapKey]: formError
              })
            }));
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
        const submitErrKey = getErrorMapKey("submit");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
        ) {
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
              [submitErrKey]: void 0
            })
          }));
        }
        const serverErrKey = getErrorMapKey("server");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[serverErrKey] && cause !== "server" && !hasErrored
        ) {
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
              [serverErrKey]: void 0
            })
          }));
        }
      });
      return {
        hasErrored,
        fieldsErrorMap: currentValidationErrorMap
      };
    };
    this.validateAsync = (cause) => __async(this, null, function* () {
      const validates = getAsyncValidatorArray(cause, __spreadProps(__spreadValues({}, this.options), {
        form: this,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      }));
      if (!this.state.isFormValidating) {
        this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
          isFormValidating: true
        }));
      }
      const promises = [];
      let fieldErrorsFromFormValidators;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(new Promise((resolve) => __async(this, null, function* () {
          let rawError;
          try {
            rawError = yield new Promise((rawResolve, rawReject) => {
              setTimeout(() => __async(this, null, function* () {
                if (controller.signal.aborted) return rawResolve(void 0);
                try {
                  rawResolve(yield this.runValidator({
                    validate: validateObj.validate,
                    value: {
                      value: this.state.values,
                      formApi: this,
                      validationSource: "form",
                      signal: controller.signal
                    },
                    type: "validateAsync"
                  }));
                } catch (e) {
                  rawReject(e);
                }
              }), validateObj.debounceMs);
            });
          } catch (e) {
            rawError = e;
          }
          const {
            formError,
            fieldErrors: fieldErrorsFromNormalizeError
          } = normalizeError(rawError);
          if (fieldErrorsFromNormalizeError) {
            fieldErrorsFromFormValidators = fieldErrorsFromFormValidators ? __spreadValues(__spreadValues({}, fieldErrorsFromFormValidators), fieldErrorsFromNormalizeError) : fieldErrorsFromNormalizeError;
          }
          const errorMapKey = getErrorMapKey(validateObj.cause);
          for (const field of Object.keys(this.state.fieldMeta)) {
            const fieldMeta = this.getFieldMeta(field);
            if (!fieldMeta) continue;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrorsFromFormValidators?.[field];
            const {
              newErrorValue,
              newSource
            } = determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                currentErrorMapSource?.[errorMapKey] === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap?.[errorMapKey]
            });
            if (
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              currentErrorMap?.[errorMapKey] !== newErrorValue
            ) {
              this.setFieldMeta(field, (prev) => __spreadProps(__spreadValues({}, prev), {
                errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
                  [errorMapKey]: newErrorValue
                }),
                errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
                  [errorMapKey]: newSource
                })
              }));
            }
          }
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
              [errorMapKey]: formError
            })
          }));
          resolve(fieldErrorsFromFormValidators ? {
            fieldErrors: fieldErrorsFromFormValidators,
            errorMapKey
          } : void 0);
        })));
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = yield Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult?.fieldErrors) {
            const {
              errorMapKey
            } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(fieldValidationResult.fieldErrors)) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = __spreadProps(__spreadValues({}, oldErrorMap), {
                [errorMapKey]: fieldError
              });
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
        isFormValidating: false
      }));
      return fieldsErrorMap;
    });
    this.validate = (cause) => {
      const {
        hasErrored,
        fieldsErrorMap
      } = this.validateSync(cause);
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause);
    };
    this.getFieldValue = (field) => getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFieldInfo = (field) => {
      return this.fieldInfo[field] ||= {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0,
          onDynamic: void 0
        }
      };
    };
    this.setFieldMeta = (field, updater) => {
      this.baseStore.setState((prev) => {
        return __spreadProps(__spreadValues({}, prev), {
          fieldMetaBase: __spreadProps(__spreadValues({}, prev.fieldMetaBase), {
            [field]: functionalUpdate(updater, prev.fieldMetaBase[field])
          })
        });
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce((acc, key) => {
        const fieldKey = key;
        acc[fieldKey] = defaultFieldMeta;
        return acc;
      }, {});
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = opts2?.dontUpdateMeta ?? false;
      batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => __spreadProps(__spreadValues({}, prev), {
            isTouched: true,
            isDirty: true,
            errorMap: __spreadProps(__spreadValues({}, prev?.errorMap), {
              onMount: void 0
            })
          }));
        }
        this.baseStore.setState((prev) => {
          return __spreadProps(__spreadValues({}, prev), {
            values: setBy(prev.values, field, updater)
          });
        });
      });
    };
    this.deleteField = (field) => {
      const subFieldsToDelete = Object.keys(this.fieldInfo).filter((f) => {
        const fieldStr = field.toString();
        return f !== fieldStr && f.startsWith(fieldStr);
      });
      const fieldsToDelete = [...subFieldsToDelete, field];
      this.baseStore.setState((prev) => {
        const newState = __spreadValues({}, prev);
        fieldsToDelete.forEach((f) => {
          newState.values = deleteBy(newState.values, f);
          delete this.fieldInfo[f];
          delete newState.fieldMetaBase[f];
        });
        return newState;
      });
    };
    this.pushFieldValue = (field, value, opts2) => {
      this.setFieldValue(field, (prev) => [...Array.isArray(prev) ? prev : [], value], opts2);
      this.validateField(field, "change");
    };
    this.insertFieldValue = (field, index, value, opts2) => __async(this, null, function* () {
      this.setFieldValue(field, (prev) => {
        return [...prev.slice(0, index), value, ...prev.slice(index)];
      }, opts2);
      yield this.validateField(field, "change");
      metaHelper(this).handleArrayFieldMetaShift(field, index, "insert");
      yield this.validateArrayFieldsStartingFrom(field, index, "change");
    });
    this.replaceFieldValue = (field, index, value, opts2) => __async(this, null, function* () {
      this.setFieldValue(field, (prev) => {
        return prev.map((d, i) => i === index ? value : d);
      }, opts2);
      yield this.validateField(field, "change");
      yield this.validateArrayFieldsStartingFrom(field, index, "change");
    });
    this.removeFieldValue = (field, index, opts2) => __async(this, null, function* () {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(field, (prev) => {
        return prev.filter((_d, i) => i !== index);
      }, opts2);
      metaHelper(this).handleArrayFieldMetaShift(field, index, "remove");
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        this.deleteField(start);
      }
      yield this.validateField(field, "change");
      yield this.validateArrayFieldsStartingFrom(field, index, "change");
    });
    this.swapFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(field, (prev) => {
        const prev1 = prev[index1];
        const prev2 = prev[index2];
        return setBy(setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
      }, opts2);
      metaHelper(this).handleArrayFieldMetaShift(field, index1, "swap", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.moveFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(field, (prev) => {
        const next = [...prev];
        next.splice(index2, 0, next.splice(index1, 1)[0]);
        return next;
      }, opts2);
      metaHelper(this).handleArrayFieldMetaShift(field, index1, "move", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.clearFieldValues = (field, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(field, [], opts2);
      if (lastIndex !== null) {
        for (let i = 0; i <= lastIndex; i++) {
          const fieldKey = `${field}[${i}]`;
          this.deleteField(fieldKey);
        }
      }
      this.validateField(field, "change");
    };
    this.resetField = (field) => {
      this.baseStore.setState((prev) => {
        return __spreadProps(__spreadValues({}, prev), {
          fieldMetaBase: __spreadProps(__spreadValues({}, prev.fieldMetaBase), {
            [field]: defaultFieldMeta
          }),
          values: this.options.defaultValues ? setBy(prev.values, field, getBy(this.options.defaultValues, field)) : prev.values
        });
      });
    };
    this.getAllErrors = () => {
      return {
        form: {
          errors: this.state.errors,
          errorMap: this.state.errorMap
        },
        fields: Object.entries(this.state.fieldMeta).reduce((acc, [fieldName, fieldMeta]) => {
          if (Object.keys(fieldMeta).length && fieldMeta.errors.length) {
            acc[fieldName] = {
              errors: fieldMeta.errors,
              errorMap: fieldMeta.errorMap
            };
          }
          return acc;
        }, {})
      };
    };
    this.parseValuesWithSchema = (schema) => {
      return standardSchemaValidators.validate({
        value: this.state.values,
        validationSource: "form"
      }, schema);
    };
    this.parseValuesWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync({
        value: this.state.values,
        validationSource: "form"
      }, schema);
    };
    this.baseStore = new Store(getDefaultFormState(__spreadProps(__spreadValues({}, opts?.defaultState), {
      values: opts?.defaultValues ?? opts?.defaultState?.values
    })));
    this.fieldMetaDerived = new Derived({
      deps: [this.baseStore],
      fn: ({
        prevDepVals,
        currDepVals,
        prevVal: _prevVal
      }) => {
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals?.[0];
        const currBaseStore = currDepVals[0];
        let originalMetaCount = 0;
        const fieldMeta = {};
        for (const fieldName of Object.keys(currBaseStore.fieldMetaBase)) {
          const currBaseMeta = currBaseStore.fieldMetaBase[fieldName];
          const prevBaseMeta = prevBaseStore?.fieldMetaBase[fieldName];
          const prevFieldInfo = prevVal?.[fieldName];
          const curFieldVal = getBy(currBaseStore.values, fieldName);
          let fieldErrors = prevFieldInfo?.errors;
          if (!prevBaseMeta || currBaseMeta.errorMap !== prevBaseMeta.errorMap) {
            fieldErrors = Object.values(currBaseMeta.errorMap ?? {}).filter((val) => val !== void 0);
            const fieldInstance = this.getFieldInfo(fieldName)?.instance;
            if (fieldInstance && !fieldInstance.options.disableErrorFlat) {
              fieldErrors = fieldErrors?.flat(1);
            }
          }
          const isFieldValid = !isNonEmptyArray(fieldErrors ?? []);
          const isFieldPristine = !currBaseMeta.isDirty;
          const isDefaultValue = evaluate(curFieldVal, getBy(this.options.defaultValues, fieldName)) || evaluate(
            curFieldVal,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.getFieldInfo(fieldName)?.instance?.options.defaultValue
          );
          if (prevFieldInfo && prevFieldInfo.isPristine === isFieldPristine && prevFieldInfo.isValid === isFieldValid && prevFieldInfo.isDefaultValue === isDefaultValue && prevFieldInfo.errors === fieldErrors && currBaseMeta === prevBaseMeta) {
            fieldMeta[fieldName] = prevFieldInfo;
            originalMetaCount++;
            continue;
          }
          fieldMeta[fieldName] = __spreadProps(__spreadValues({}, currBaseMeta), {
            errors: fieldErrors,
            isPristine: isFieldPristine,
            isValid: isFieldValid,
            isDefaultValue
          });
        }
        if (!Object.keys(currBaseStore.fieldMetaBase).length) return fieldMeta;
        if (prevVal && originalMetaCount === Object.keys(currBaseStore.fieldMetaBase).length) {
          return prevVal;
        }
        return fieldMeta;
      }
    });
    this.store = new Derived({
      deps: [this.baseStore, this.fieldMetaDerived],
      fn: ({
        prevDepVals,
        currDepVals,
        prevVal: _prevVal
      }) => {
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals?.[0];
        const currBaseStore = currDepVals[0];
        const currFieldMeta = currDepVals[1];
        const fieldMetaValues = Object.values(currFieldMeta).filter(Boolean);
        const isFieldsValidating = fieldMetaValues.some((field) => field.isValidating);
        const isFieldsValid = fieldMetaValues.every((field) => field.isValid);
        const isTouched = fieldMetaValues.some((field) => field.isTouched);
        const isBlurred = fieldMetaValues.some((field) => field.isBlurred);
        const isDefaultValue = fieldMetaValues.every((field) => field.isDefaultValue);
        const shouldInvalidateOnMount = (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isTouched && currBaseStore.errorMap?.onMount
        );
        const isDirty = fieldMetaValues.some((field) => field.isDirty);
        const isPristine = !isDirty;
        const hasOnMountError = Boolean(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          currBaseStore.errorMap?.onMount || // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          fieldMetaValues.some((f) => f?.errorMap?.onMount)
        );
        const isValidating = !!isFieldsValidating;
        let errors = prevVal?.errors ?? [];
        if (!prevBaseStore || currBaseStore.errorMap !== prevBaseStore.errorMap) {
          errors = Object.values(currBaseStore.errorMap).reduce((prev, curr) => {
            if (curr === void 0) return prev;
            if (curr && isGlobalFormValidationError(curr)) {
              prev.push(curr.form);
              return prev;
            }
            prev.push(curr);
            return prev;
          }, []);
        }
        const isFormValid = errors.length === 0;
        const isValid = isFieldsValid && isFormValid;
        const submitInvalid = this.options.canSubmitWhenInvalid ?? false;
        const canSubmit = currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError || !isValidating && !currBaseStore.isSubmitting && isValid || submitInvalid;
        let errorMap = currBaseStore.errorMap;
        if (shouldInvalidateOnMount) {
          errors = errors.filter((err) => err !== currBaseStore.errorMap.onMount);
          errorMap = Object.assign(errorMap, {
            onMount: void 0
          });
        }
        if (prevVal && prevBaseStore && prevVal.errorMap === errorMap && prevVal.fieldMeta === this.fieldMetaDerived.state && prevVal.errors === errors && prevVal.isFieldsValidating === isFieldsValidating && prevVal.isFieldsValid === isFieldsValid && prevVal.isFormValid === isFormValid && prevVal.isValid === isValid && prevVal.canSubmit === canSubmit && prevVal.isTouched === isTouched && prevVal.isBlurred === isBlurred && prevVal.isPristine === isPristine && prevVal.isDefaultValue === isDefaultValue && prevVal.isDirty === isDirty && evaluate(prevBaseStore, currBaseStore)) {
          return prevVal;
        }
        let state = __spreadProps(__spreadValues({}, currBaseStore), {
          errorMap,
          fieldMeta: this.fieldMetaDerived.state,
          errors,
          isFieldsValidating,
          isFieldsValid,
          isFormValid,
          isValid,
          canSubmit,
          isTouched,
          isBlurred,
          isPristine,
          isDefaultValue,
          isDirty
        });
        const transformArray = this.options.transform?.deps ?? [];
        const shouldTransform = transformArray.length !== this.prevTransformArray.length || transformArray.some((val, i) => val !== this.prevTransformArray[i]);
        if (shouldTransform) {
          const newObj = Object.assign({}, this, {
            state
          });
          this.options.transform?.fn(newObj);
          state = newObj.state;
          this.prevTransformArray = transformArray;
        }
        return state;
      }
    });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update(opts || {});
  }
  get state() {
    return this.store.state;
  }
  get formId() {
    return this.options.formId;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](props.value, props.validate);
    }
    return props.validate(props.value);
  }
  handleSubmit(submitMeta) {
    return __async(this, null, function* () {
      this.baseStore.setState((old) => __spreadProps(__spreadValues({}, old), {
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1,
        isSubmitSuccessful: false
        // Reset isSubmitSuccessful at the start of submission
      }));
      batch(() => {
        void Object.values(this.fieldInfo).forEach((field) => {
          if (!field.instance) return;
          if (!field.instance.state.meta.isTouched) {
            field.instance.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
              isTouched: true
            }));
          }
        });
      });
      if (!this.state.canSubmit) return;
      const submitMetaArg = submitMeta ?? this.options.onSubmitMeta;
      this.baseStore.setState((d) => __spreadProps(__spreadValues({}, d), {
        isSubmitting: true
      }));
      const done = () => {
        this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
          isSubmitting: false
        }));
      };
      yield this.validateAllFields("submit");
      if (!this.state.isFieldsValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        return;
      }
      yield this.validate("submit");
      if (!this.state.isValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        return;
      }
      batch(() => {
        void Object.values(this.fieldInfo).forEach((field) => {
          field.instance?.options.listeners?.onSubmit?.({
            value: field.instance.state.value,
            fieldApi: field.instance
          });
        });
      });
      this.options.listeners?.onSubmit?.({
        formApi: this,
        meta: submitMetaArg
      });
      try {
        yield this.options.onSubmit?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        batch(() => {
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            isSubmitted: true,
            isSubmitSuccessful: true
            // Set isSubmitSuccessful to true on successful submission
          }));
          done();
        });
      } catch (err) {
        this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
          isSubmitSuccessful: false
          // Ensure isSubmitSuccessful is false if an error occurs
        }));
        done();
        throw err;
      }
    });
  }
  /**
   * Updates the form's errorMap
   */
  setErrorMap(errorMap) {
    batch(() => {
      Object.entries(errorMap).forEach(([key, value]) => {
        const errorMapKey = key;
        if (isGlobalFormValidationError(value)) {
          const {
            formError,
            fieldErrors
          } = normalizeError(value);
          for (const fieldName of Object.keys(this.fieldInfo)) {
            const fieldMeta = this.getFieldMeta(fieldName);
            if (!fieldMeta) continue;
            this.setFieldMeta(fieldName, (prev) => __spreadProps(__spreadValues({}, prev), {
              errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
                [errorMapKey]: fieldErrors?.[fieldName]
              }),
              errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
                [errorMapKey]: "form"
              })
            }));
          }
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
              [errorMapKey]: formError
            })
          }));
        } else {
          this.baseStore.setState((prev) => __spreadProps(__spreadValues({}, prev), {
            errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
              [errorMapKey]: value
            })
          }));
        }
      });
    });
  }
};
function normalizeError(rawError) {
  if (rawError) {
    if (isGlobalFormValidationError(rawError)) {
      const formError = normalizeError(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return {
        formError,
        fieldErrors
      };
    }
    return {
      formError: rawError
    };
  }
  return {
    formError: void 0
  };
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}

// node_modules/@tanstack/form-core/dist/esm/FieldApi.js
var FieldApi = class {
  /**
   * Initializes a new `FieldApi` instance.
   */
  constructor(opts) {
    this.options = {};
    this.mount = () => {
      const cleanup = this.store.mount();
      if (this.options.defaultValue !== void 0) {
        this.form.setFieldValue(this.name, this.options.defaultValue, {
          dontUpdateMeta: true
        });
      }
      const info = this.getInfo();
      info.instance = this;
      this.update(this.options);
      const {
        onMount
      } = this.options.validators || {};
      if (onMount) {
        const error = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            fieldApi: this,
            validationSource: "field"
          },
          type: "validate"
        });
        if (error) {
          this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            errorMap: __spreadProps(__spreadValues({}, prev?.errorMap), {
              onMount: error
            }),
            errorSourceMap: __spreadProps(__spreadValues({}, prev?.errorSourceMap), {
              onMount: "field"
            })
          }));
        }
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        fieldApi: this
      });
      return cleanup;
    };
    this.update = (opts2) => {
      this.options = opts2;
      const nameHasChanged = this.name !== opts2.name;
      this.name = opts2.name;
      if (this.state.value === void 0) {
        const formDefault = getBy(opts2.form.options.defaultValues, opts2.name);
        const defaultValue = opts2.defaultValue ?? formDefault;
        if (nameHasChanged) {
          this.setValue((val) => val || defaultValue, {
            dontUpdateMeta: true
          });
        } else if (defaultValue !== void 0) {
          this.setValue(defaultValue, {
            dontUpdateMeta: true
          });
        }
      }
      if (this.form.getFieldMeta(this.name) === void 0) {
        this.setMeta(this.state.meta);
      }
    };
    this.getValue = () => {
      return this.form.getFieldValue(this.name);
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(this.name, updater, options);
      this.triggerOnChangeListener();
      this.validate("change");
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.form.getFieldInfo(this.name);
    this.pushValue = (value, opts2) => {
      this.form.pushFieldValue(this.name, value, opts2);
      this.triggerOnChangeListener();
    };
    this.insertValue = (index, value, opts2) => {
      this.form.insertFieldValue(this.name, index, value, opts2);
      this.triggerOnChangeListener();
    };
    this.replaceValue = (index, value, opts2) => {
      this.form.replaceFieldValue(this.name, index, value, opts2);
      this.triggerOnChangeListener();
    };
    this.removeValue = (index, opts2) => {
      this.form.removeFieldValue(this.name, index, opts2);
      this.triggerOnChangeListener();
    };
    this.swapValues = (aIndex, bIndex, opts2) => {
      this.form.swapFieldValues(this.name, aIndex, bIndex, opts2);
      this.triggerOnChangeListener();
    };
    this.moveValue = (aIndex, bIndex, opts2) => {
      this.form.moveFieldValues(this.name, aIndex, bIndex, opts2);
      this.triggerOnChangeListener();
    };
    this.clearValues = (opts2) => {
      this.form.clearFieldValues(this.name, opts2);
      this.triggerOnChangeListener();
    };
    this.getLinkedFields = (cause) => {
      const fields = Object.values(this.form.fieldInfo);
      const linkedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        const {
          onChangeListenTo,
          onBlurListenTo
        } = field.instance.options.validators || {};
        if (cause === "change" && onChangeListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
        if (cause === "blur" && onBlurListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
      }
      return linkedFields;
    };
    this.validateSync = (cause, errorFromForm) => {
      const validates = getSyncValidatorArray(cause, __spreadProps(__spreadValues({}, this.options), {
        form: this.form,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      }));
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce((acc, field) => {
        const fieldValidates = getSyncValidatorArray(cause, __spreadProps(__spreadValues({}, field.options), {
          form: field.form,
          validationLogic: field.form.options.validationLogic || defaultValidationLogic
        }));
        fieldValidates.forEach((validate) => {
          validate.field = field;
        });
        return acc.concat(fieldValidates);
      }, []);
      let hasErrored = false;
      batch(() => {
        const validateFieldFn = (field, validateObj) => {
          const errorMapKey = getErrorMapKey2(validateObj.cause);
          const fieldLevelError = validateObj.validate ? normalizeError2(field.runValidator({
            validate: validateObj.validate,
            value: {
              value: field.store.state.value,
              validationSource: "field",
              fieldApi: field
            },
            type: "validate"
          })) : void 0;
          const formLevelError = errorFromForm[errorMapKey];
          const {
            newErrorValue,
            newSource
          } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (field.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            field.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
              errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
                [errorMapKey]: newErrorValue
              }),
              errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
                [errorMapKey]: newSource
              })
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
        };
        for (const validateObj of validates) {
          validateFieldFn(this, validateObj);
        }
        for (const fieldValitateObj of linkedFieldValidates) {
          if (!fieldValitateObj.validate) continue;
          validateFieldFn(fieldValitateObj.field, fieldValitateObj);
        }
      });
      const submitErrKey = getErrorMapKey2("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.state.meta.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          errorMap: __spreadProps(__spreadValues({}, prev.errorMap), {
            [submitErrKey]: void 0
          }),
          errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
            [submitErrKey]: void 0
          })
        }));
      }
      return {
        hasErrored
      };
    };
    this.validateAsync = (cause, formValidationResultPromise) => __async(this, null, function* () {
      const validates = getAsyncValidatorArray(cause, __spreadProps(__spreadValues({}, this.options), {
        form: this.form,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      }));
      const asyncFormValidationResults = yield formValidationResultPromise;
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce((acc, field) => {
        const fieldValidates = getAsyncValidatorArray(cause, __spreadProps(__spreadValues({}, field.options), {
          form: field.form,
          validationLogic: field.form.options.validationLogic || defaultValidationLogic
        }));
        fieldValidates.forEach((validate) => {
          validate.field = field;
        });
        return acc.concat(fieldValidates);
      }, []);
      if (!this.state.meta.isValidating) {
        this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isValidating: true
        }));
      }
      for (const linkedField of linkedFields) {
        linkedField.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isValidating: true
        }));
      }
      const validatesPromises = [];
      const linkedPromises = [];
      const validateFieldAsyncFn = (field, validateObj, promises) => {
        const errorMapKey = getErrorMapKey2(validateObj.cause);
        const fieldValidatorMeta = field.getInfo().validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        this.getInfo().validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        promises.push(new Promise((resolve) => __async(this, null, function* () {
          let rawError;
          try {
            rawError = yield new Promise((rawResolve, rawReject) => {
              if (this.timeoutIds.validations[validateObj.cause]) {
                clearTimeout(this.timeoutIds.validations[validateObj.cause]);
              }
              this.timeoutIds.validations[validateObj.cause] = setTimeout(() => __async(this, null, function* () {
                if (controller.signal.aborted) return rawResolve(void 0);
                try {
                  rawResolve(yield this.runValidator({
                    validate: validateObj.validate,
                    value: {
                      value: field.store.state.value,
                      fieldApi: field,
                      signal: controller.signal,
                      validationSource: "field"
                    },
                    type: "validateAsync"
                  }));
                } catch (e) {
                  rawReject(e);
                }
              }), validateObj.debounceMs);
            });
          } catch (e) {
            rawError = e;
          }
          if (controller.signal.aborted) return resolve(void 0);
          const fieldLevelError = normalizeError2(rawError);
          const formLevelError = asyncFormValidationResults[this.name]?.[errorMapKey];
          const {
            newErrorValue,
            newSource
          } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          field.setMeta((prev) => {
            return __spreadProps(__spreadValues({}, prev), {
              errorMap: __spreadProps(__spreadValues({}, prev?.errorMap), {
                [errorMapKey]: newErrorValue
              }),
              errorSourceMap: __spreadProps(__spreadValues({}, prev.errorSourceMap), {
                [errorMapKey]: newSource
              })
            });
          });
          resolve(newErrorValue);
        })));
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of linkedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldAsyncFn(fieldValitateObj.field, fieldValitateObj, linkedPromises);
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = yield Promise.all(validatesPromises);
        yield Promise.all(linkedPromises);
      }
      this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
        isValidating: false
      }));
      for (const linkedField of linkedFields) {
        linkedField.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isValidating: false
        }));
      }
      return results.filter(Boolean);
    });
    this.validate = (cause, opts2) => {
      if (!this.state.meta.isTouched) return [];
      const {
        fieldsErrorMap
      } = opts2?.skipFormValidation ? {
        fieldsErrorMap: {}
      } : this.form.validateSync(cause);
      const {
        hasErrored
      } = this.validateSync(cause, fieldsErrorMap[this.name] ?? {});
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey2(cause)]?.lastAbortController.abort();
        return this.state.meta.errors;
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause);
      return this.validateAsync(cause, formValidationResultPromise);
    };
    this.handleChange = (updater) => {
      this.setValue(updater);
    };
    this.handleBlur = () => {
      const prevTouched = this.state.meta.isTouched;
      if (!prevTouched) {
        this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isTouched: true
        }));
      }
      if (!this.state.meta.isBlurred) {
        this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
          isBlurred: true
        }));
      }
      this.validate("blur");
      this.triggerOnBlurListener();
    };
    this.parseValueWithSchema = (schema) => {
      return standardSchemaValidators.validate({
        value: this.state.value,
        validationSource: "field"
      }, schema);
    };
    this.parseValueWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync({
        value: this.state.value,
        validationSource: "field"
      }, schema);
    };
    this.form = opts.form;
    this.name = opts.name;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.store = new Derived({
      deps: [this.form.store],
      fn: () => {
        const value = this.form.getFieldValue(this.name);
        const meta = this.form.getFieldMeta(this.name) ?? __spreadValues(__spreadValues({}, defaultFieldMeta), opts.defaultMeta);
        return {
          value,
          meta
        };
      }
    });
    this.options = opts;
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](props.value, props.validate);
    }
    return props.validate(props.value);
  }
  /**
   * Updates the field's errorMap
   */
  setErrorMap(errorMap) {
    this.setMeta((prev) => __spreadProps(__spreadValues({}, prev), {
      errorMap: __spreadValues(__spreadValues({}, prev.errorMap), errorMap)
    }));
  }
  triggerOnBlurListener() {
    const formDebounceMs = this.form.options.listeners?.onBlurDebounceMs;
    if (formDebounceMs && formDebounceMs > 0) {
      if (this.timeoutIds.formListeners.blur) {
        clearTimeout(this.timeoutIds.formListeners.blur);
      }
      this.timeoutIds.formListeners.blur = setTimeout(() => {
        this.form.options.listeners?.onBlur?.({
          formApi: this.form,
          fieldApi: this
        });
      }, formDebounceMs);
    } else {
      this.form.options.listeners?.onBlur?.({
        formApi: this.form,
        fieldApi: this
      });
    }
    const fieldDebounceMs = this.options.listeners?.onBlurDebounceMs;
    if (fieldDebounceMs && fieldDebounceMs > 0) {
      if (this.timeoutIds.listeners.blur) {
        clearTimeout(this.timeoutIds.listeners.blur);
      }
      this.timeoutIds.listeners.blur = setTimeout(() => {
        this.options.listeners?.onBlur?.({
          value: this.state.value,
          fieldApi: this
        });
      }, fieldDebounceMs);
    } else {
      this.options.listeners?.onBlur?.({
        value: this.state.value,
        fieldApi: this
      });
    }
  }
  triggerOnChangeListener() {
    const formDebounceMs = this.form.options.listeners?.onChangeDebounceMs;
    if (formDebounceMs && formDebounceMs > 0) {
      if (this.timeoutIds.formListeners.change) {
        clearTimeout(this.timeoutIds.formListeners.change);
      }
      this.timeoutIds.formListeners.change = setTimeout(() => {
        this.form.options.listeners?.onChange?.({
          formApi: this.form,
          fieldApi: this
        });
      }, formDebounceMs);
    } else {
      this.form.options.listeners?.onChange?.({
        formApi: this.form,
        fieldApi: this
      });
    }
    const fieldDebounceMs = this.options.listeners?.onChangeDebounceMs;
    if (fieldDebounceMs && fieldDebounceMs > 0) {
      if (this.timeoutIds.listeners.change) {
        clearTimeout(this.timeoutIds.listeners.change);
      }
      this.timeoutIds.listeners.change = setTimeout(() => {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          fieldApi: this
        });
      }, fieldDebounceMs);
    } else {
      this.options.listeners?.onChange?.({
        value: this.state.value,
        fieldApi: this
      });
    }
  }
};
function normalizeError2(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function getErrorMapKey2(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}

// node_modules/@tanstack/form-core/dist/esm/mergeForm.js
function isValidKey(key) {
  const dangerousProps = ["__proto__", "constructor", "prototype"];
  return !dangerousProps.includes(String(key));
}
function mutateMergeDeep(target, source) {
  if (target === null || target === void 0 || typeof target !== "object") return {};
  if (source === null || source === void 0 || typeof source !== "object") return target;
  const targetKeys = Object.keys(target);
  const sourceKeys = Object.keys(source);
  const keySet = /* @__PURE__ */ new Set([...targetKeys, ...sourceKeys]);
  for (const key of keySet) {
    if (!isValidKey(key)) continue;
    const targetKey = key;
    const sourceKey = key;
    if (!Object.hasOwn(source, sourceKey)) continue;
    const sourceValue = source[sourceKey];
    const targetValue = target[targetKey];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      Object.defineProperty(target, key, {
        value: [...sourceValue],
        enumerable: true,
        writable: true,
        configurable: true
      });
      continue;
    }
    const isTargetObj = typeof targetValue === "object" && targetValue !== null;
    const isSourceObj = typeof sourceValue === "object" && sourceValue !== null;
    const areObjects = isTargetObj && isSourceObj && !Array.isArray(targetValue) && !Array.isArray(sourceValue);
    if (areObjects) {
      mutateMergeDeep(targetValue, sourceValue);
      continue;
    }
    Object.defineProperty(target, key, {
      value: sourceValue,
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return target;
}
function mergeForm(baseForm, state) {
  mutateMergeDeep(baseForm.state, state);
  return baseForm;
}

// node_modules/@tanstack/form-core/dist/esm/formOptions.js
function formOptions(defaultOpts) {
  return defaultOpts;
}

// node_modules/@tanstack/form-core/dist/esm/FieldGroupApi.js
var FieldGroupApi = class _FieldGroupApi {
  /**
   * Constructs a new `FieldGroupApi` instance with the given form options.
   */
  constructor(opts) {
    this.getFormFieldName = (subfield) => {
      if (typeof this.fieldsMap === "string") {
        return concatenatePaths(this.fieldsMap, subfield);
      }
      const firstAccessor = makePathArray(subfield)[0];
      if (typeof firstAccessor !== "string") {
        return "";
      }
      const restOfPath = subfield.slice(firstAccessor.length);
      const formMappedPath = (
        // TFields is either a string or this. See guard above.
        this.fieldsMap[firstAccessor]
      );
      return concatenatePaths(formMappedPath, restOfPath);
    };
    this.mount = () => {
      const cleanup = this.store.mount();
      return cleanup;
    };
    this.validateArrayFieldsStartingFrom = (field, index, cause) => __async(this, null, function* () {
      return this.form.validateArrayFieldsStartingFrom(this.getFormFieldName(field), index, cause);
    });
    this.validateField = (field, cause) => {
      return this.form.validateField(this.getFormFieldName(field), cause);
    };
    this.getFieldValue = (field) => {
      return this.form.getFieldValue(this.getFormFieldName(field));
    };
    this.getFieldMeta = (field) => {
      return this.form.getFieldMeta(this.getFormFieldName(field));
    };
    this.setFieldMeta = (field, updater) => {
      return this.form.setFieldMeta(this.getFormFieldName(field), updater);
    };
    this.setFieldValue = (field, updater, opts2) => {
      return this.form.setFieldValue(this.getFormFieldName(field), updater, opts2);
    };
    this.deleteField = (field) => {
      return this.form.deleteField(this.getFormFieldName(field));
    };
    this.pushFieldValue = (field, value, opts2) => {
      return this.form.pushFieldValue(
        this.getFormFieldName(field),
        // since unknown doesn't extend an array, it types `value` as never.
        value,
        opts2
      );
    };
    this.insertFieldValue = (field, index, value, opts2) => __async(this, null, function* () {
      return this.form.insertFieldValue(
        this.getFormFieldName(field),
        index,
        // since unknown doesn't extend an array, it types `value` as never.
        value,
        opts2
      );
    });
    this.replaceFieldValue = (field, index, value, opts2) => __async(this, null, function* () {
      return this.form.replaceFieldValue(
        this.getFormFieldName(field),
        index,
        // since unknown doesn't extend an array, it types `value` as never.
        value,
        opts2
      );
    });
    this.removeFieldValue = (field, index, opts2) => __async(this, null, function* () {
      return this.form.removeFieldValue(this.getFormFieldName(field), index, opts2);
    });
    this.swapFieldValues = (field, index1, index2, opts2) => {
      return this.form.swapFieldValues(this.getFormFieldName(field), index1, index2, opts2);
    };
    this.moveFieldValues = (field, index1, index2, opts2) => {
      return this.form.moveFieldValues(this.getFormFieldName(field), index1, index2, opts2);
    };
    this.clearFieldValues = (field, opts2) => {
      return this.form.clearFieldValues(this.getFormFieldName(field), opts2);
    };
    this.resetField = (field) => {
      return this.form.resetField(this.getFormFieldName(field));
    };
    this.validateAllFields = (cause) => this.form.validateAllFields(cause);
    if (opts.form instanceof _FieldGroupApi) {
      const group = opts.form;
      this.form = group.form;
      if (typeof opts.fields === "string") {
        this.fieldsMap = group.getFormFieldName(opts.fields);
      } else {
        const fields = __spreadValues({}, opts.fields);
        for (const key in fields) {
          fields[key] = group.getFormFieldName(fields[key]);
        }
        this.fieldsMap = fields;
      }
    } else {
      this.form = opts.form;
      this.fieldsMap = opts.fields;
    }
    this.store = new Derived({
      deps: [this.form.store],
      fn: ({
        currDepVals
      }) => {
        const currFormStore = currDepVals[0];
        let values;
        if (typeof this.fieldsMap === "string") {
          values = getBy(currFormStore.values, this.fieldsMap);
        } else {
          values = {};
          const fields = this.fieldsMap;
          for (const key in fields) {
            values[key] = getBy(currFormStore.values, fields[key]);
          }
        }
        return {
          values
        };
      }
    });
  }
  get state() {
    return this.store.state;
  }
  handleSubmit(submitMeta) {
    return __async(this, null, function* () {
      return this.form.handleSubmit(submitMeta);
    });
  }
};

// node_modules/@tanstack/angular-form/node_modules/@tanstack/angular-store/dist/fesm2022/tanstack-angular-store.mjs
function injectStore(store, selector = (d) => d, options = {
  equal: shallow
}) {
  !options.injector && assertInInjectionContext(injectStore);
  if (!options.injector) {
    options.injector = inject(Injector);
  }
  return runInInjectionContext(options.injector, () => {
    const destroyRef = inject(DestroyRef);
    const slice = linkedSignal(() => selector(store.state), options);
    const unsubscribe = store.subscribe(() => {
      slice.set(selector(store.state));
    });
    destroyRef.onDestroy(() => {
      unsubscribe();
    });
    return slice.asReadonly();
  });
}
function shallow(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const v of objA) {
      if (!objB.has(v)) return false;
    }
    return true;
  }
  if (objA instanceof Date && objB instanceof Date) {
    if (objA.getTime() !== objB.getTime()) return false;
    return true;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}

// node_modules/@tanstack/angular-form/dist/fesm2022/tanstack-angular-form.mjs
var TanStackField = class _TanStackField {
  name = input.required(...ngDevMode ? [{
    debugName: "name"
  }] : []);
  defaultValue = input(...ngDevMode ? [void 0, {
    debugName: "defaultValue"
  }] : []);
  asyncDebounceMs = input(void 0, ...ngDevMode ? [{
    debugName: "asyncDebounceMs",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  asyncAlways = input(void 0, ...ngDevMode ? [{
    debugName: "asyncAlways",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  tanstackField = input.required(...ngDevMode ? [{
    debugName: "tanstackField"
  }] : []);
  validators = input(...ngDevMode ? [void 0, {
    debugName: "validators"
  }] : []);
  listeners = input(...ngDevMode ? [void 0, {
    debugName: "listeners"
  }] : []);
  defaultMeta = input(...ngDevMode ? [void 0, {
    debugName: "defaultMeta"
  }] : []);
  mode = input(...ngDevMode ? [void 0, {
    debugName: "mode"
  }] : []);
  disableErrorFlat = input(...ngDevMode ? [void 0, {
    debugName: "disableErrorFlat"
  }] : []);
  _api = computed(() => {
    return new FieldApi(untracked(this.options));
  }, ...ngDevMode ? [{
    debugName: "_api"
  }] : []);
  get api() {
    return this._api();
  }
  options = computed(() => ({
    defaultValue: this.defaultValue(),
    asyncDebounceMs: this.asyncDebounceMs(),
    asyncAlways: this.asyncAlways(),
    disableErrorFlat: this.disableErrorFlat(),
    validators: this.validators(),
    listeners: this.listeners(),
    defaultMeta: this.defaultMeta(),
    name: this.name(),
    form: this.tanstackField()
  }), ...ngDevMode ? [{
    debugName: "options"
  }] : []);
  injector = inject(Injector);
  constructor() {
    effect((onCleanup) => {
      const unmount = this._api().mount();
      onCleanup(() => {
        unmount();
      });
    });
    effect(() => {
      this._api().update(this.options());
    });
  }
  cd = inject(ChangeDetectorRef);
  ngOnInit() {
    const vals = injectStore(this._api().store, this.mode() === "array" ? (state) => {
      return [state.meta, Object.keys(state.value ?? []).length];
    } : void 0, {
      injector: this.injector
    });
    effect(() => {
      const _values = vals();
      this.cd.markForCheck();
    }, {
      injector: this.injector
    });
  }
  static ɵfac = function TanStackField_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TanStackField)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _TanStackField,
    selectors: [["", "tanstackField", ""]],
    inputs: {
      name: [1, "name"],
      defaultValue: [1, "defaultValue"],
      asyncDebounceMs: [1, "asyncDebounceMs"],
      asyncAlways: [1, "asyncAlways"],
      tanstackField: [1, "tanstackField"],
      validators: [1, "validators"],
      listeners: [1, "listeners"],
      defaultMeta: [1, "defaultMeta"],
      mode: [1, "mode"],
      disableErrorFlat: [1, "disableErrorFlat"]
    },
    exportAs: ["field"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TanStackField, [{
    type: Directive,
    args: [{
      selector: "[tanstackField]",
      standalone: true,
      exportAs: "field"
    }]
  }], () => [], null);
})();
var TanStackFieldInjectable = class _TanStackFieldInjectable {
  _api = signal(null, ...ngDevMode ? [{
    debugName: "_api"
  }] : []);
  get api() {
    return this._api();
  }
  static ɵfac = function TanStackFieldInjectable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TanStackFieldInjectable)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _TanStackFieldInjectable,
    factory: _TanStackFieldInjectable.ɵfac,
    providedIn: null
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TanStackFieldInjectable, [{
    type: Injectable,
    args: [{
      providedIn: null
    }]
  }], null, null);
})();
function injectField() {
  return inject(TanStackFieldInjectable);
}
var TanStackAppField = class _TanStackAppField extends TanStackField {
  base = inject(TanStackFieldInjectable);
  constructor() {
    super();
    effect(() => {
      this.base._api.set(this.api);
    });
  }
  static ɵfac = function TanStackAppField_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TanStackAppField)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _TanStackAppField,
    selectors: [["", "tanstack-app-field", ""]],
    features: [ɵɵProvidersFeature([TanStackFieldInjectable]), ɵɵInheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TanStackAppField, [{
    type: Directive,
    args: [{
      selector: "[tanstack-app-field]",
      standalone: true,
      providers: [TanStackFieldInjectable]
    }]
  }], () => [], null);
})();
function injectForm(opts) {
  const api = new FormApi(opts);
  injectStore(api.store, (state) => state.isSubmitting);
  return api;
}
function injectStore2(form, selector) {
  return injectStore(form.store, selector);
}
export {
  FieldApi,
  FieldGroupApi,
  FormApi,
  TanStackAppField,
  TanStackField,
  TanStackFieldInjectable,
  concatenatePaths,
  createFieldMap,
  defaultValidationLogic,
  deleteBy,
  determineFieldLevelErrorSourceAndValue,
  determineFormLevelErrorSourceAndValue,
  evaluate,
  formOptions,
  functionalUpdate,
  getAsyncValidatorArray,
  getBy,
  getSyncValidatorArray,
  injectField,
  injectForm,
  injectStore2 as injectStore,
  isGlobalFormValidationError,
  isNonEmptyArray,
  isStandardSchemaValidator,
  makePathArray,
  mergeForm,
  mutateMergeDeep,
  revalidateLogic,
  setBy,
  standardSchemaValidators
};
//# sourceMappingURL=@tanstack_angular-form.js.map
