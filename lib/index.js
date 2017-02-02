(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('moment')) :
	typeof define === 'function' && define.amd ? define(['exports', 'moment'], factory) :
	(factory((global.Dalmatiner = global.Dalmatiner || {}),global.moment));
}(this, (function (exports,moment) { 'use strict';

moment = 'default' in moment ? moment['default'] : moment;

/**
 * Miscellaneous utilities
 */

function clone(obj) {
  var proto = Object.getPrototypeOf(obj),
      c = Object.create(proto);
  Object.assign(c, obj);
  return c;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var Condition = function () {
  function Condition(op) {
    classCallCheck(this, Condition);

    this.op = op;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    this.args = args;
  }

  createClass(Condition, [{
    key: 'and',
    value: function and(other) {
      return new Condition('and', this, other);
    }
  }, {
    key: 'or',
    value: function or(other) {
      return new Condition('or', this, other);
    }
  }, {
    key: 'toString',
    value: function toString() {
      var tag, value, a, b;
      switch (this.op) {
        case 'eq':
          var _args = slicedToArray(this.args, 2);

          tag = _args[0];
          value = _args[1];

          return this._encodeTag(tag) + ' = \'' + value + '\'';
        case 'neq':
          var _args2 = slicedToArray(this.args, 2);

          tag = _args2[0];
          value = _args2[1];

          return this._encodeTag(tag) + ' != \'' + value + '\'';
        case 'present':
          var _args3 = slicedToArray(this.args, 1);

          tag = _args3[0];

          return this._encodeTag(tag);
        case 'and':
          var _args4 = slicedToArray(this.args, 2);

          a = _args4[0];
          b = _args4[1];

          return a + ' AND ' + b;
        case 'or':
          var _args5 = slicedToArray(this.args, 2);

          a = _args5[0];
          b = _args5[1];

          return a + ' OR ' + b;
      }
      return '';
    }
  }, {
    key: '_encodeTag',
    value: function _encodeTag(_ref) {
      var _ref2 = slicedToArray(_ref, 2),
          ns = _ref2[0],
          key = _ref2[1];

      return ns ? ns + ':\'' + key + '\'' : '\'' + key + '\'';
    }
  }]);
  return Condition;
}();

Condition.__schema = {
  proto: Condition.prototype,
  ref: {
    args: [function (context) {
      if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context.op !== void 0 && context.args !== void 0) return Condition.__schema;
      return null;
    }]
  }
};

var Timeshift = function () {
  function Timeshift(offset) {
    classCallCheck(this, Timeshift);

    this.offset = offset;
  }

  createClass(Timeshift, [{
    key: "toString",
    value: function toString() {
      return "SHIFT BY " + this.offset;
    }
  }]);
  return Timeshift;
}();

Timeshift.__schema = {
  proto: Timeshift.prototype
};

var ALL = {
  toString: function toString() {
    return 'ALL';
  }
};

function isKeyword(part) {
  return part === ALL;
}

var Selector = function () {
  function Selector(collection, metric) {
    classCallCheck(this, Selector);

    if (Array.isArray(metric)) {
      metric = metric.map(function (mpart) {
        if (isKeyword(mpart)) return mpart;
        return mpart.value ? mpart.value : mpart.toString();
      });
    } else if (typeof metric == 'string' && metric.toUpperCase() == 'ALL') {
      metric = [ALL];
    } else {
      throw new Error("Expected metric to be an Array, got '" + metric + "' instead");
    }
    this.collection = collection;
    this.metric = metric;
  }

  createClass(Selector, [{
    key: "where",
    value: function where(condition, operator) {
      if (!condition instanceof Condition) throw new Error("Invalid query condition");
      if (operator && this.condition) {
        condition = this.condition[operator](condition);
      }
      var selector = clone(this);
      selector.condition = condition;
      return selector;
    }
  }, {
    key: "andWhere",
    value: function andWhere(condition) {
      return this.where(condition, 'and');
    }
  }, {
    key: "orWhere",
    value: function orWhere(condition) {
      return this.where(condition, 'or');
    }
  }, {
    key: "shiftBy",
    value: function shiftBy(offset) {
      var selector = clone(this),
          timeshift = new Timeshift(offset);
      selector.timeshift = timeshift;
      return selector;
    }
  }, {
    key: "toString",
    value: function toString() {
      var metric = this._encodeMetric(),
          collection = this._encodeCollection(),
          str = metric + " FROM " + collection;
      if (this.condition) str += ' WHERE ' + this.condition;
      if (this.timeshift) str += ' ' + this.timeshift.toString();
      return str;
    }

    /**
     * Internal methods
     */

  }, {
    key: "_encodeCollection",
    value: function _encodeCollection() {
      return "'" + this.collection + "'";
    }
  }, {
    key: "_encodeMetric",
    value: function _encodeMetric() {
      return this.metric.map(function (part) {
        if (isKeyword(part)) return part;else return "'" + part + "'";
      }).join('.');
    }
  }]);
  return Selector;
}();

Selector.__schema = {
  proto: Selector.prototype,
  ref: {
    condition: Condition.__schema,
    timeshift: Timeshift.__schema
  }
};

var Alias = function () {
  function Alias(label) {
    classCallCheck(this, Alias);

    if (label !== void 0) this.label = label;
    this.tags = [];
  }

  createClass(Alias, [{
    key: 'useLabel',
    value: function useLabel(label) {
      var alias = clone(this);
      alias.label = label;
      return alias;
    }
  }, {
    key: 'prefixWith',
    value: function prefixWith(prefix) {
      var alias = clone(this);
      alias.prefix = prefix;
      return alias;
    }
  }, {
    key: 'annotateWith',
    value: function annotateWith() {
      for (var _len = arguments.length, tags = Array(_len), _key = 0; _key < _len; _key++) {
        tags[_key] = arguments[_key];
      }

      var alias = clone(this);
      tags = tags.map(normalizeTag);
      alias.tags = dedupTags(this.tags.concat(tags));
      return alias;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'AS ' + this._encode();
    }
  }, {
    key: '_encode',
    value: function _encode() {
      var sections = this.prefix || [];
      if (this.tags) sections = sections.concat(this.tags);
      if (this.label) sections = sections.concat(this.label);
      return sections.map(encodeSection).join('.');
    }
  }]);
  return Alias;
}();

Alias.__schema = {
  proto: Alias.prototype
};
function encodeName(name) {
  if (name[0] != '$' && (name[0] != '\'' || name[name.length - 1] != '\'')) {
    name = name.replace(/(['\\])/g, '\$1');
    return '\'' + name + '\'';
  }
  return name;
}

function encodeSection(section) {
  if (Array.isArray(section)) {
    var _section = slicedToArray(section, 2),
        ns = _section[0],
        name = _section[1];

    if (ns) return '$' + ns + ':' + encodeName(name);else return '$' + encodeName(name);
  }
  return encodeName(section);
}

function normalizeTag(tag) {
  if (typeof tag === 'string') {
    var m = tag.match(/^(([a-z]*):)?(.*)$/);
    if (!m) throw new Error("Invalid alias variable: " + tag);
    var ns = m[2],
        name = m[3];
    return [ns, name];
  }
  return tag;
}

function dedupTags(tags) {
  return tags;
}

var Function$1 = function () {
  function Function(fun, args) {
    classCallCheck(this, Function);

    this.fun = fun;
    this.args = args;
    this._encodeArg = this._encodeArg.bind(this);
  }

  createClass(Function, [{
    key: 'toString',
    value: function toString(vars) {
      var _this = this;

      var args = this.args.map(function (a) {
        return _this._encodeArg(a, vars);
      });
      return this.fun + '(' + args.join(', ') + ')';
    }
  }, {
    key: '_encodeArg',
    value: function _encodeArg(arg, vars) {
      if (typeof arg === 'string' && arg[0] === '$') {
        var varname = arg.slice(1);
        arg = vars[varname];
        if (arg === void 0) throw new Error('Variable ' + varname + ' is not declared');
        if (typeof arg.toString === 'function')
          // convert to string, but drop alias as we are in a nested query
          arg = arg.toString(vars, { includeAlias: false });
      } else if ((typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && typeof arg.toString == 'function') {
        arg = arg.toString(vars);
      }
      return '' + arg;
    }
  }]);
  return Function;
}();

Function$1.__schema = {
  proto: Function$1.prototype,
  ref: {
    args: [function (context) {
      if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context.fun !== void 0 && context.args !== void 0) return Function$1.__schema;
      return null;
    }]
  }
};

// Selector methods that are exposed on part level
var SELECTOR_METHODS = ['where', 'andWhere', 'orWhere', 'shiftBy'];

var Part = function () {
  function Part(collection, metric) {
    classCallCheck(this, Part);

    this.selector = new Selector(collection, metric);
  }

  createClass(Part, [{
    key: "apply",
    value: function apply(fun) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var part = clone(this),
          fargs = [this.fn || '$__selector'].concat(args),
          fn = new Function$1(fun, fargs);
      part.fn = fn;
      return part;
    }
  }, {
    key: "nameBy",
    value: function nameBy(name) {
      var part = clone(this);
      part.name = name;
      return part;
    }
  }, {
    key: "labelBy",
    value: function labelBy(label) {
      var part = clone(this),
          alias = part.alias ? part.alias.useLabel(label) : new Alias(label);
      part.alias = alias;
      return part;
    }
  }, {
    key: "prefixWith",
    value: function prefixWith(prefix) {
      var part = clone(this),
          alias = this.alias || new Alias();
      part.alias = alias.prefixWith(prefix);
      return part;
    }
  }, {
    key: "annotateWith",
    value: function annotateWith() {
      var part = clone(this),
          alias = this.alias || new Alias();
      part.alias = alias.annotateWith.apply(alias, arguments);
      return part;
    }
  }, {
    key: "exclude",
    value: function exclude() {
      if (this.excluded) return this;

      var part = clone(this);
      part.excluded = true;
      return part;
    }
  }, {
    key: "include",
    value: function include() {
      if (!this.hasOwnProperty('excluded')) return this;

      var part = clone(this);
      delete part.excluded;
      return part;
    }
  }, {
    key: "toString",
    value: function toString(vars) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { includeAlias: true };

      var str = '' + this.selector;
      if (this.fn) {
        vars = _extends({}, vars, { '__selector': this.selector });
        str = this.fn.toString(vars);
      }
      if (this.alias && options.includeAlias) str += ' ' + this.alias.toString();
      return str;
    }

    /**
     * Internal methods
     */

  }, {
    key: "_updateSelector",
    value: function _updateSelector(method) {
      var _selector;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var selector = (_selector = this.selector)[method].apply(_selector, args);
      this.selector = selector;
      return this;
    }
  }]);
  return Part;
}();

Part.__schema = {
  proto: Part.prototype,
  ref: {
    alias: Alias.__schema,
    selector: Selector.__schema,
    fn: Function$1.__schema
  }
};
SELECTOR_METHODS.forEach(function (method) {
  Part.prototype[method] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return this._updateSelector.apply(this, [method].concat(args));
  };
});

function overlayConfidence(v1, v2) {
  if (v1.length != v2.length) {
    throw new Error('All arrays must be the same length');
  }
  for (var i = 0; i < v1.length; i++) {
    v1[i] = v1[i] === void 0 ? v2[i] : Math.max(v1[i], v2[i]);
  }
}

var Decoder = function Decoder(query, options) {
  classCallCheck(this, Decoder);

  this.decode = function (r) {
    return decode(query, r, options);
  };
};

function decode(query, resp) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var s = resp.s,
      t = resp.t,
      d = resp.d,
      parts = query ? query.parts : [],
      start = moment(s * 1000),
      matched = {},
      confidenceOverlay,
      series;

  // First pass is to decode name and eventually match values and confidence channels

  Array.prototype.forEach.call(d, function (_ref) {
    var n = _ref.n,
        r = _ref.r,
        v = _ref.v;

    var sections = decodeN(n),
        idx = parseInt(sections.shift()),
        channel = 'v',
        increment = 0,
        keyPrefix,
        key;

    if (options.applyConfidence) {
      channel = sections.shift();
      idx *= 2; // Because confidence duplicated number of parts in a query
    }

    // Confidence and value channels are matched on combination of query index and
    // extra meta-data sections. On top of that we add increment, so we can match
    // in a situation that there is multiple series coming with the same meta data.
    // In that case they will be matched based on order of appearance.
    keyPrefix = [idx].concat(sections, '').join('.');
    key = keyPrefix + increment;
    while (matched[key] && matched[key][channel]) {
      increment += 1;
      key = keyPrefix + increment;
    }

    if (!matched[key]) {
      matched[key] = { sections: sections, r: r,
        qpart: parts[idx] };
    } else {
      if (matched[key].r != r) throw new Error("Values and confidence data came in different resolution");
    }

    if (options.applyConfidence == 'aligned' && channel === 'c') {
      if (!confidenceOverlay) confidenceOverlay = new Array(v.length);
      overlayConfidence(confidenceOverlay, v);
      v = confidenceOverlay;
    }

    matched[key][channel] = v;
  }, []);

  // Second pass is to do actual decoding
  series = Object.keys(matched).map(function (key) {
    var _matched$key = matched[key],
        sections = _matched$key.sections,
        qpart = _matched$key.qpart,
        r = _matched$key.r,
        v = _matched$key.v,
        c = _matched$key.c,
        tagDefinitions = qpart.alias && qpart.alias.tags || [],
        tags = {},
        name = void 0;


    if (!v) throw new Error("Missing data channel in response to: " + qpart);

    if (qpart.alias && qpart.alias.label) {
      name = qpart.alias.label;
    } else {
      name = qpart.selector.toString();
    }

    for (var i = 0; i < tagDefinitions.length; i++) {
      var tag = tagDefinitions[i];
      tags[tagKey(tag)] = sections[i];
    }

    return { qpart: qpart, name: name, tags: tags,
      points: decodePoints(v, c, start.valueOf(), r) };
  });
  return { start: start, series: series };
}

function decodePoints(values, confidence, start, increment) {
  return confidence ? decodeConfidencePoints(values, confidence, start, increment) : decodeContinousPoints(values, start, increment);
}

function decodeContinousPoints(values, start, increment) {
  var r = new Array(values.length);
  for (var i = 0; i < values.length; i++) {
    r[i] = [values[i], start + i * increment];
  }
  return r;
}

function decodeConfidencePoints(values, confidence, start, increment) {
  var r = new Array();
  for (var i = 0; i < values.length; i++) {
    if (confidence[i] > 0) {
      r.push([values[i], start + i * increment]);
    }
  }
  return r;
}

function decodeN(n) {
  return n.split('.').map(decodeNSection);
}

function decodeNSection(section) {
  if (section[0] == "'" && section[section.length - 1] == "'") {
    section = section.slice(1, -1).replace(/\\(.)/g, '$1');
  }
  return section;
}

function tagKey(tag) {
  if (Array.isArray(tag)) {
    if (tag[0]) return tag[0] + ':' + tag[1];
    return tag[1];
  }
  return tag;
}

function objToJSON(obj, options) {
  var schema = Object.getPrototypeOf(obj).constructor.__schema,
      r = {},
      n,
      j;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.getOwnPropertyNames(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      n = _step.value;

      if (schema && schema.ignore && schema.ignore.indexOf(n) >= 0) {
        continue;
      }
      j = anyToJSON(obj[n]);
      if (j !== void 0) r[n] = j;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return r;
}

function anyToJSON(obj) {
  switch (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) {
    case 'number':
    case 'string':
    case 'boolean':
      return obj;
    case 'function':
      return undefined;
    case 'object':
      if (obj === null) return undefined;
      if (typeof obj.toJSON === 'function') return obj.toJSON();
      if (Array.isArray(obj)) return obj.map(anyToJSON);
      return objToJSON(obj);
  }
  return undefined;
}

function objFromJSON(schema, json) {
  var proto = schema.proto,
      ref = schema.ref,
      obj = Object.create(proto),
      n,
      o;

  Object.assign(obj, json);

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.getOwnPropertyNames(obj)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      n = _step2.value;

      if (ref && ref[n]) o = objFromRefedJSON(ref[n], json[n]);else o = json[n];
      obj[n] = o;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  
  return obj;
}

// Ref can be a schema, an array of refs or a function returning ref, or a class
// identifier
function objFromRefedJSON(ref, json) {
  if (!ref) return json;

  if (typeof ref === 'function') return objFromRefedJSON(ref(json), json);

  if (Array.isArray(ref)) return Array.prototype.map.call(json, objFromRefedJSON.bind(null, ref[0]));

  if (ref === "moment") return moment(json);

  if (ref === "duration") return moment.duration(json);

  return objFromJSON(ref, json);
}

var Serializer = {
  toJSON: objToJSON,
  fromJSON: objFromJSON
};

// Part methods that are exposed to Query top level api
var PART_METHODS = ['where', 'andWhere', 'orWhere', 'apply', 'shiftBy', 'nameBy', 'labelBy', 'annotateWith', 'exclude', 'include'];

var AbortablePromise = function () {
  function AbortablePromise(promise, abort) {
    classCallCheck(this, AbortablePromise);

    this.promise = promise;
    if (abort) {
      this.abort = abort;
    } else if (promise.abort) {
      this.abort = promise.abort.bind(promise);
    } else {
      throw new Error("Tried to initialise abort-able promise without abort handler");
    }
  }

  createClass(AbortablePromise, [{
    key: "then",
    value: function then(onFulfilled, onRejected) {
      return new AbortablePromise(this.promise.then(onFulfilled, onRejected), this.abort);
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      return new AbortablePromise(this.promise.catch(onRejected), this.abort);
    }
  }]);
  return AbortablePromise;
}();

/**
 * DalmatinerDB Query builder.
 *
 * It provides chainable api to programatically assemble dalmatiner queries
 */


var Query = function () {
  function Query() {
    classCallCheck(this, Query);

    this.parts = [];
  }

  /**
   * Chain-able query generators
   *
   * Each one of them will generate new query
   */


  createClass(Query, [{
    key: "from",
    value: function from(c) {
      var query = clone(this);
      query.collection = c.value ? c.value : c.toString();
      return query;
    }
  }, {
    key: "select",
    value: function select(m) {
      if (!this.collection) throw new Error("You need to set collection (from statement) before selecting metric");

      var query = clone(this),
          part = new Part(this.collection, m);

      query.parts = query.parts.concat(part);
      return query;
    }
  }, {
    key: "selectAll",
    value: function selectAll() {
      return this.select('ALL');
    }
  }, {
    key: "beginningAt",
    value: function beginningAt(t) {
      var query = clone(this);
      query.beginning = moment(t);
      return query;
    }
  }, {
    key: "endingAt",
    value: function endingAt(t) {
      var query = clone(this);
      query.ending = moment(t);
      return query;
    }
  }, {
    key: "last",
    value: function last() {
      var query = clone(this);
      query.duration = moment.duration.apply(moment, arguments);
      query.beginning = null;
      query.ending = null;
      return query;
    }
  }, {
    key: "with",
    value: function _with(name, value) {
      if (!this.vars) this.vars = {};
      this.vars[name] = value;
      return this;
    }

    /**
     * Non chain-able utilities
     */

  }, {
    key: "request",
    value: function request() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var settings = { data: {} },
          query = clone(this),
          parts = query.parts,
          decoder = null;

      parts = parts.map(function (part, idx) {
        return part.prefixWith(['' + idx]);
      });
      if (options.applyConfidence) {
        parts = parts.reduce(function (acc, part) {
          var prefix = part.alias.prefix,
              vpart = part.prefixWith(prefix.concat('v')),
              cpart = part.prefixWith(prefix.concat('c')).apply('confidence');
          return acc.concat(vpart, cpart);
        }, []);
      }
      query.parts = parts;
      decoder = new Decoder(query, options), settings.data.q = query.toString();

      if (!options.url) settings.url = 'http://localhost:8080'; // Default url

      if (!(options.headers && options.headers.accept)) {
        if (!settings.headers) {
          settings.headers = {};
        }
        // TODO: add msgpack optional decoding, when msgpack-lite is reachable
        settings.headers.accept = 'application/json';
      }

      Object.assign(settings, options);
      return { settings: settings, decoder: decoder };
    }
  }, {
    key: "exec",
    value: function exec(ajax, options) {
      if (!ajax) throw new Error("Missing ajax function");

      var _request = this.request(options),
          settings = _request.settings,
          decoder = _request.decoder;

      return new AbortablePromise(ajax(settings)).then(decoder.decode);
    }

    /**
     * Reading methods
     */

  }, {
    key: "lastPart",
    value: function lastPart() {
      var len = this.parts.length;
      return this.parts[len - 1];
    }
  }, {
    key: "toString",
    value: function toString(vars) {
      var parts = this._encodeParts(vars).join(', '),
          range = this._encodeRange(),
          str = 'SELECT ' + parts;
      if (range) str += ' ' + range;
      return str;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return Serializer.toJSON(this);
    }

    /**
     * Internal methods
     */

  }, {
    key: "_updatePart",
    value: function _updatePart(method) {
      if (this.parts.length === -1) throw new Error("You need to select something before doing any futher operations");

      var parts = this.parts.concat(),
          lastIdx = parts.length - 1,
          last = parts[lastIdx],
          query = clone(this);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      parts[lastIdx] = last[method].apply(last, args);
      query.parts = parts;
      return query;
    }
  }, {
    key: "_encodeTime",
    value: function _encodeTime(m) {
      return m.utc().format('"YYYY-MM-DD HH:mm:ss"');
    }
  }, {
    key: "_encodeDuration",
    value: function _encodeDuration() {
      var inSecs = Math.max(Math.round(this.duration.asSeconds()), 1);

      return inSecs + 's';
    }
  }, {
    key: "_encodeRange",
    value: function _encodeRange() {
      if (this.ending && this.beginning) {
        var start = this._encodeTime(this.beginning),
            end = this._encodeTime(this.ending);
        return "BETWEEN " + start + " AND " + end;
      } else if (this.ending && this.duration) {
        var _end = this._encodeTime(this.ending),
            duration = this._encodeDuration();
        return "BEFORE " + _end + " FOR " + duration;
      } else if (this.beginning && this.duration) {
        var _start = this._encodeTime(this.beginning),
            _duration = this._encodeDuration();
        return "AFTER " + _start + " FOR " + _duration;
      } else if (this.duration) {
        return "LAST " + this._encodeDuration();
      }
      return '';
    }
  }, {
    key: "_encodeParts",
    value: function _encodeParts(vars) {
      var vs = this._defaultVars(),
          encoded = [];
      if (this.vars) Object.assign(vs, this.vars);
      if (vars) Object.assign(vs, vars);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var part = _step.value;

          if (!part.excluded) encoded.push(part.toString(vs));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      
      return encoded;
    }
  }, {
    key: "_defaultVars",
    value: function _defaultVars() {
      var vars = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.parts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var part = _step2.value;

          if (part.name) vars[part.name] = part;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return vars;
    }
  }]);
  return Query;
}();

Query.__schema = {
  proto: Query.prototype,
  ref: {
    parts: [Part.__schema],
    beginning: 'moment',
    ending: 'moment',
    duration: 'duration'
  },
  ignore: ['vars']
};


PART_METHODS.forEach(function (method) {
  Query.prototype[method] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return this._updatePart.apply(this, [method].concat(args));
  };
});

var query = new Query();

function or(a, b) {
  return new Condition('or', a, b);
}

function and(a, b) {
  return new Condition('and', a, b);
}

function equals(a, b) {
  return new Condition('eq', a, b);
}

function notEquals(a, b) {
  return new Condition('neq', a, b);
}

function present(a) {
  return new Condition('present', a);
}

function fromJSON(json) {
  return Serializer.fromJSON(Query.__schema, json);
}

exports.query = query;
exports.or = or;
exports.and = and;
exports.equals = equals;
exports.notEquals = notEquals;
exports.present = present;
exports.fromJSON = fromJSON;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
