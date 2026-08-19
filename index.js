var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/centra/model/CentraResponse.js
var require_CentraResponse = __commonJS({
  "node_modules/centra/model/CentraResponse.js"(exports2, module2) {
    module2.exports = class CentraResponse {
      constructor(res, resOptions) {
        this.coreRes = res;
        this.resOptions = resOptions;
        this.body = Buffer.alloc(0);
        this.headers = res.headers;
        this.statusCode = res.statusCode;
      }
      _addChunk(chunk) {
        this.body = Buffer.concat([this.body, chunk]);
      }
      async json() {
        return this.statusCode === 204 ? null : JSON.parse(this.body);
      }
      async text() {
        return this.body.toString();
      }
    };
  }
});

// node_modules/centra/model/CentraRequest.js
var require_CentraRequest = __commonJS({
  "node_modules/centra/model/CentraRequest.js"(exports2, module2) {
    var path2 = require("path");
    var http = require("http");
    var https = require("https");
    var qs = require("querystring");
    var zlib = require("zlib");
    var { URL: URL3 } = require("url");
    var CentraResponse = require_CentraResponse();
    var supportedCompressions = ["gzip", "deflate"];
    module2.exports = class CentraRequest {
      constructor(url, method = "GET") {
        this.url = typeof url === "string" ? new URL3(url) : url;
        this.method = method;
        this.data = null;
        this.sendDataAs = null;
        this.reqHeaders = {};
        this.streamEnabled = false;
        this.compressionEnabled = false;
        this.timeoutTime = null;
        this.coreOptions = {};
        this.resOptions = {
          "maxBuffer": 50 * 1e6
          // 50 MB
        };
        return this;
      }
      query(a1, a2) {
        if (typeof a1 === "object") {
          Object.keys(a1).forEach((queryKey) => {
            this.url.searchParams.append(queryKey, a1[queryKey]);
          });
        } else this.url.searchParams.append(a1, a2);
        return this;
      }
      path(relativePath) {
        this.url.pathname = path2.join(this.url.pathname, relativePath);
        return this;
      }
      body(data, sendAs) {
        this.sendDataAs = typeof data === "object" && !sendAs && !Buffer.isBuffer(data) ? "json" : sendAs ? sendAs.toLowerCase() : "buffer";
        this.data = this.sendDataAs === "form" ? qs.stringify(data) : this.sendDataAs === "json" ? JSON.stringify(data) : data;
        return this;
      }
      header(a1, a2) {
        if (typeof a1 === "object") {
          Object.keys(a1).forEach((headerName) => {
            this.reqHeaders[headerName.toLowerCase()] = a1[headerName];
          });
        } else this.reqHeaders[a1.toLowerCase()] = a2;
        return this;
      }
      timeout(timeout) {
        this.timeoutTime = timeout;
        return this;
      }
      option(name, value) {
        this.coreOptions[name] = value;
        return this;
      }
      stream() {
        this.streamEnabled = true;
        return this;
      }
      compress() {
        this.compressionEnabled = true;
        if (!this.reqHeaders["accept-encoding"]) this.reqHeaders["accept-encoding"] = supportedCompressions.join(", ");
        return this;
      }
      send() {
        return new Promise((resolve, reject) => {
          if (this.data) {
            if (!this.reqHeaders.hasOwnProperty("content-type")) {
              if (this.sendDataAs === "json") {
                this.reqHeaders["content-type"] = "application/json";
              } else if (this.sendDataAs === "form") {
                this.reqHeaders["content-type"] = "application/x-www-form-urlencoded";
              }
            }
            if (!this.reqHeaders.hasOwnProperty("content-length")) {
              this.reqHeaders["content-length"] = Buffer.byteLength(this.data);
            }
          }
          const options = Object.assign({
            "protocol": this.url.protocol,
            "host": this.url.hostname,
            "port": this.url.port,
            "path": this.url.pathname + (this.url.search === null ? "" : this.url.search),
            "method": this.method,
            "headers": this.reqHeaders
          }, this.coreOptions);
          let req;
          const resHandler = (res) => {
            let stream = res;
            if (this.compressionEnabled) {
              if (res.headers["content-encoding"] === "gzip") {
                stream = res.pipe(zlib.createGunzip());
              } else if (res.headers["content-encoding"] === "deflate") {
                stream = res.pipe(zlib.createInflate());
              }
            }
            let centraRes;
            if (this.streamEnabled) {
              resolve(stream);
            } else {
              centraRes = new CentraResponse(res, this.resOptions);
              stream.on("error", (err) => {
                reject(err);
              });
              stream.on("data", (chunk) => {
                centraRes._addChunk(chunk);
                if (this.resOptions.maxBuffer !== null && centraRes.body.length > this.resOptions.maxBuffer) {
                  stream.destroy();
                  reject("Received a response which was longer than acceptable when buffering. (" + this.body.length + " bytes)");
                }
              });
              stream.on("end", () => {
                resolve(centraRes);
              });
            }
          };
          if (this.url.protocol === "http:") {
            req = http.request(options, resHandler);
          } else if (this.url.protocol === "https:") {
            req = https.request(options, resHandler);
          } else throw new Error("Bad URL protocol: " + this.url.protocol);
          if (this.timeoutTime) {
            req.setTimeout(this.timeoutTime, () => {
              req.abort();
              if (!this.streamEnabled) {
                reject(new Error("Timeout reached"));
              }
            });
          }
          req.on("error", (err) => {
            reject(err);
          });
          if (this.data) req.write(this.data);
          req.end();
        });
      }
    };
  }
});

// node_modules/centra/createRequest.js
var require_createRequest = __commonJS({
  "node_modules/centra/createRequest.js"(exports2, module2) {
    var CentraRequest = require_CentraRequest();
    module2.exports = (url, method) => {
      return new CentraRequest(url, method);
    };
  }
});

// node_modules/phin/lib/phin.js
var require_phin = __commonJS({
  "node_modules/phin/lib/phin.js"(exports2, module2) {
    var { URL: URL3 } = require("url");
    var centra = require_createRequest();
    var phin = async (opts) => {
      if (typeof opts !== "string") {
        if (!opts.hasOwnProperty("url")) {
          throw new Error("Missing url option from options for request method.");
        }
      }
      const req = centra(typeof opts === "object" ? opts.url : opts, opts.method || "GET");
      if (opts.headers) req.header(opts.headers);
      if (opts.stream) req.stream();
      if (opts.timeout) req.timeout(opts.timeout);
      if (opts.data) req.body(opts.data);
      if (opts.form) req.body(opts.form, "form");
      if (opts.compression) req.compress();
      if (typeof opts.core === "object") {
        Object.keys(opts.core).forEach((optName) => {
          req.option(optName, opts.core[optName]);
        });
      }
      const res = await req.send();
      if (res.headers.hasOwnProperty("location") && opts.followRedirects) {
        opts.url = new URL3(res.headers["location"], opts.url).toString();
        return await phin(opts);
      }
      if (opts.stream) {
        res.stream = res;
        return res;
      } else {
        res.coreRes.body = res.body;
        if (opts.parse && opts.parse === "json") {
          res.coreRes.body = await res.json();
          return res.coreRes;
        } else return res.coreRes;
      }
    };
    phin.promisified = phin;
    phin.unpromisified = (opts, cb) => {
      phin(opts).then((data) => {
        if (cb) cb(null, data);
      }).catch((err) => {
        if (cb) cb(err, null);
      });
    };
    phin.defaults = (defaultOpts) => async (opts) => {
      const nops = typeof opts === "string" ? { "url": opts } : opts;
      Object.keys(defaultOpts).forEach((doK) => {
        if (!nops.hasOwnProperty(doK) || nops[doK] === null) {
          nops[doK] = defaultOpts[doK];
        }
      });
      return await phin(nops);
    };
    module2.exports = phin;
  }
});

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/@actions/core/lib/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toCommandProperties = exports2.toCommandValue = void 0;
    function toCommandValue(input) {
      if (input === null || input === void 0) {
        return "";
      } else if (typeof input === "string" || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    exports2.toCommandValue = toCommandValue;
    function toCommandProperties(annotationProperties) {
      if (!Object.keys(annotationProperties).length) {
        return {};
      }
      return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
      };
    }
    exports2.toCommandProperties = toCommandProperties;
  }
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/@actions/core/lib/command.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.issue = exports2.issueCommand = void 0;
    var os = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
    }
    exports2.issueCommand = issueCommand;
    function issue(name, message = "") {
      issueCommand(name, {}, message);
    }
    exports2.issue = issue;
    var CMD_STRING = "::";
    var Command = class {
      constructor(command, properties, message) {
        if (!command) {
          command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ",";
                }
                cmdStr += `${key}=${escapeProperty(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    function escapeProperty(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
    }
  }
});

// node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    import_crypto = __toESM(require("crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_crypto2, md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-node/md5.js"() {
    import_crypto2 = __toESM(require("crypto"));
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto3.default.createHash("sha1").update(bytes).digest();
}
var import_crypto3, sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    import_crypto3 = __toESM(require("crypto"));
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  "node_modules/@actions/core/lib/file-command.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.prepareKeyValueMessage = exports2.issueFileCommand = void 0;
    var fs2 = __importStar(require("fs"));
    var os = __importStar(require("os"));
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    var utils_1 = require_utils();
    function issueFileCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs2.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs2.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: "utf8"
      });
    }
    exports2.issueFileCommand = issueFileCommand;
    function prepareKeyValueMessage(key, value) {
      const delimiter = `ghadelimiter_${uuid_1.v4()}`;
      const convertedValue = utils_1.toCommandValue(value);
      if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
      }
      if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
      }
      return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
    }
    exports2.prepareKeyValueMessage = prepareKeyValueMessage;
  }
});

// node_modules/@actions/http-client/lib/proxy.js
var require_proxy = __commonJS({
  "node_modules/@actions/http-client/lib/proxy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.checkBypass = exports2.getProxyUrl = void 0;
    function getProxyUrl(reqUrl) {
      const usingSsl = reqUrl.protocol === "https:";
      if (checkBypass(reqUrl)) {
        return void 0;
      }
      const proxyVar = (() => {
        if (usingSsl) {
          return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
        } else {
          return process.env["http_proxy"] || process.env["HTTP_PROXY"];
        }
      })();
      if (proxyVar) {
        return new URL(proxyVar);
      } else {
        return void 0;
      }
    }
    exports2.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      const reqHost = reqUrl.hostname;
      if (isLoopbackAddress(reqHost)) {
        return true;
      }
      const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === "http:") {
        reqPort = 80;
      } else if (reqUrl.protocol === "https:") {
        reqPort = 443;
      }
      const upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === "number") {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
        if (upperNoProxyItem === "*" || upperReqHosts.some((x) => x === upperNoProxyItem || x.endsWith(`.${upperNoProxyItem}`) || upperNoProxyItem.startsWith(".") && x.endsWith(`${upperNoProxyItem}`))) {
          return true;
        }
      }
      return false;
    }
    exports2.checkBypass = checkBypass;
    function isLoopbackAddress(host) {
      const hostLower = host.toLowerCase();
      return hostLower === "localhost" || hostLower.startsWith("127.") || hostLower.startsWith("[::1]") || hostLower.startsWith("[0:0:0:0:0:0:0:1]");
    }
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  "node_modules/tunnel/lib/tunnel.js"(exports2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var http = require("http");
    var https = require("https");
    var events = require("events");
    var assert = require("assert");
    var util = require("util");
    exports2.httpOverHttp = httpOverHttp;
    exports2.httpsOverHttp = httpsOverHttp;
    exports2.httpOverHttps = httpOverHttps;
    exports2.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on("free", function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      });
    }
    util.inherits(TunnelingAgent, events.EventEmitter);
    TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
      var self = this;
      var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
      if (self.sockets.length >= this.maxSockets) {
        self.requests.push(options);
        return;
      }
      self.createSocket(options, function(socket) {
        socket.on("free", onFree);
        socket.on("close", onCloseOrRemove);
        socket.on("agentRemove", onCloseOrRemove);
        req.onSocket(socket);
        function onFree() {
          self.emit("free", socket, options);
        }
        function onCloseOrRemove(err) {
          self.removeSocket(socket);
          socket.removeListener("free", onFree);
          socket.removeListener("close", onCloseOrRemove);
          socket.removeListener("agentRemove", onCloseOrRemove);
        }
      });
    };
    TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
      var self = this;
      var placeholder = {};
      self.sockets.push(placeholder);
      var connectOptions = mergeOptions({}, self.proxyOptions, {
        method: "CONNECT",
        path: options.host + ":" + options.port,
        agent: false,
        headers: {
          host: options.host + ":" + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
      if (connectOptions.proxyAuth) {
        connectOptions.headers = connectOptions.headers || {};
        connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
      }
      debug("making CONNECT request");
      var connectReq = self.request(connectOptions);
      connectReq.useChunkedEncodingByDefault = false;
      connectReq.once("response", onResponse);
      connectReq.once("upgrade", onUpgrade);
      connectReq.once("connect", onConnect);
      connectReq.once("error", onError);
      connectReq.end();
      function onResponse(res) {
        res.upgrade = true;
      }
      function onUpgrade(res, socket, head) {
        process.nextTick(function() {
          onConnect(res, socket, head);
        });
      }
      function onConnect(res, socket, head) {
        connectReq.removeAllListeners();
        socket.removeAllListeners();
        if (res.statusCode !== 200) {
          debug(
            "tunneling socket could not be established, statusCode=%d",
            res.statusCode
          );
          socket.destroy();
          var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug("got illegal response body from proxy");
          socket.destroy();
          var error = new Error("got illegal response body from proxy");
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        debug("tunneling connection has established");
        self.sockets[self.sockets.indexOf(placeholder)] = socket;
        return cb(socket);
      }
      function onError(cause) {
        connectReq.removeAllListeners();
        debug(
          "tunneling socket could not be established, cause=%s\n",
          cause.message,
          cause.stack
        );
        var error = new Error("tunneling socket could not be established, cause=" + cause.message);
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self.removeSocket(placeholder);
      }
    };
    TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function(socket2) {
          pending.request.onSocket(socket2);
        });
      }
    };
    function createSecureSocket(options, cb) {
      var self = this;
      TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
        var hostHeader = options.request.getHeader("host");
        var tlsOptions = mergeOptions({}, self.options, {
          socket,
          servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
        });
        var secureSocket = tls.connect(0, tlsOptions);
        self.sockets[self.sockets.indexOf(socket)] = secureSocket;
        cb(secureSocket);
      });
    }
    function toOptions(host, port, localAddress) {
      if (typeof host === "string") {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === "object") {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    var debug;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string") {
          args[0] = "TUNNEL: " + args[0];
        } else {
          args.unshift("TUNNEL:");
        }
        console.error.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports2.debug = debug;
  }
});

// node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  "node_modules/tunnel/index.js"(exports2, module2) {
    module2.exports = require_tunnel();
  }
});

// node_modules/@actions/http-client/lib/index.js
var require_lib = __commonJS({
  "node_modules/@actions/http-client/lib/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HttpClient = exports2.isHttps = exports2.HttpClientResponse = exports2.HttpClientError = exports2.getProxyUrl = exports2.MediaTypes = exports2.Headers = exports2.HttpCodes = void 0;
    var http = __importStar(require("http"));
    var https = __importStar(require("https"));
    var pm = __importStar(require_proxy());
    var tunnel = __importStar(require_tunnel2());
    var HttpCodes;
    (function(HttpCodes2) {
      HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
      HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
      HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
      HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
      HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
      HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
      HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
      HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
      HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
      HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
      HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
    })(HttpCodes = exports2.HttpCodes || (exports2.HttpCodes = {}));
    var Headers;
    (function(Headers2) {
      Headers2["Accept"] = "accept";
      Headers2["ContentType"] = "content-type";
    })(Headers = exports2.Headers || (exports2.Headers = {}));
    var MediaTypes;
    (function(MediaTypes2) {
      MediaTypes2["ApplicationJson"] = "application/json";
    })(MediaTypes = exports2.MediaTypes || (exports2.MediaTypes = {}));
    function getProxyUrl(serverUrl) {
      const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : "";
    }
    exports2.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
    ];
    var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class _HttpClientError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.name = "HttpClientError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, _HttpClientError.prototype);
      }
    };
    exports2.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let output = Buffer.alloc(0);
            this.message.on("data", (chunk) => {
              output = Buffer.concat([output, chunk]);
            });
            this.message.on("end", () => {
              resolve(output.toString());
            });
          }));
        });
      }
    };
    exports2.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      const parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === "https:";
    }
    exports2.isHttps = isHttps;
    var HttpClient = class {
      constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
        });
      }
      get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("GET", requestUrl, null, additionalHeaders || {});
        });
      }
      del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("DELETE", requestUrl, null, additionalHeaders || {});
        });
      }
      post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("POST", requestUrl, data, additionalHeaders || {});
        });
      }
      patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PATCH", requestUrl, data, additionalHeaders || {});
        });
      }
      put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PUT", requestUrl, data, additionalHeaders || {});
        });
      }
      head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("HEAD", requestUrl, null, additionalHeaders || {});
        });
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request(verb, requestUrl, stream, additionalHeaders);
        });
      }
      /**
       * Gets a typed object from an endpoint
       * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
       */
      getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          const res = yield this.get(requestUrl, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.post(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.put(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.patch(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      /**
       * Makes a raw http request.
       * All other methods such as get, post, patch, and request ultimately call this.
       * Prefer get, del, post and patch
       */
      request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._disposed) {
            throw new Error("Client has already been disposed.");
          }
          const parsedUrl = new URL(requestUrl);
          let info = this._prepareRequest(verb, parsedUrl, headers);
          const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
          let numTries = 0;
          let response;
          do {
            response = yield this.requestRaw(info, data);
            if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
              let authenticationHandler;
              for (const handler of this.handlers) {
                if (handler.canHandleAuthentication(response)) {
                  authenticationHandler = handler;
                  break;
                }
              }
              if (authenticationHandler) {
                return authenticationHandler.handleAuthentication(this, info, data);
              } else {
                return response;
              }
            }
            let redirectsRemaining = this._maxRedirects;
            while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
              const redirectUrl = response.message.headers["location"];
              if (!redirectUrl) {
                break;
              }
              const parsedRedirectUrl = new URL(redirectUrl);
              if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
                throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
              }
              yield response.readBody();
              if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                for (const header in headers) {
                  if (header.toLowerCase() === "authorization") {
                    delete headers[header];
                  }
                }
              }
              info = this._prepareRequest(verb, parsedRedirectUrl, headers);
              response = yield this.requestRaw(info, data);
              redirectsRemaining--;
            }
            if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
              return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
              yield response.readBody();
              yield this._performExponentialBackoff(numTries);
            }
          } while (numTries < maxTries);
          return response;
        });
      }
      /**
       * Needs to be called if keepAlive is set to true in request options.
       */
      dispose() {
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      /**
       * Raw request.
       * @param info
       * @param data
       */
      requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function callbackForResult(err, res) {
              if (err) {
                reject(err);
              } else if (!res) {
                reject(new Error("Unknown error"));
              } else {
                resolve(res);
              }
            }
            this.requestRawWithCallback(info, data, callbackForResult);
          });
        });
      }
      /**
       * Raw request with callback.
       * @param info
       * @param data
       * @param onResult
       */
      requestRawWithCallback(info, data, onResult) {
        if (typeof data === "string") {
          if (!info.options.headers) {
            info.options.headers = {};
          }
          info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
        }
        let callbackCalled = false;
        function handleResult(err, res) {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        }
        const req = info.httpModule.request(info.options, (msg) => {
          const res = new HttpClientResponse(msg);
          handleResult(void 0, res);
        });
        let socket;
        req.on("socket", (sock) => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on("error", function(err) {
          handleResult(err);
        });
        if (data && typeof data === "string") {
          req.write(data, "utf8");
        }
        if (data && typeof data !== "string") {
          data.on("close", function() {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
      }
      /**
       * Gets an http agent. This function is useful when you need an http agent that handles
       * routing through a proxy server - depending upon the url and proxy environment variables.
       * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
       */
      getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === "https:";
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
        info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info.options.headers["user-agent"] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        if (this.handlers) {
          for (const handler of this.handlers) {
            handler.prepareRequest(info.options);
          }
        }
        return info;
      }
      _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === "https:";
        let maxSockets = 100;
        if (this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (proxyUrl && proxyUrl.hostname) {
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
              proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
            }), { host: proxyUrl.hostname, port: proxyUrl.port })
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === "https:";
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
          retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
          const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
          return new Promise((resolve) => setTimeout(() => resolve(), ms));
        });
      }
      _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const statusCode = res.message.statusCode || 0;
            const response = {
              statusCode,
              result: null,
              headers: {}
            };
            if (statusCode === HttpCodes.NotFound) {
              resolve(response);
            }
            function dateTimeDeserializer(key, value) {
              if (typeof value === "string") {
                const a = new Date(value);
                if (!isNaN(a.valueOf())) {
                  return a;
                }
              }
              return value;
            }
            let obj;
            let contents;
            try {
              contents = yield res.readBody();
              if (contents && contents.length > 0) {
                if (options && options.deserializeDates) {
                  obj = JSON.parse(contents, dateTimeDeserializer);
                } else {
                  obj = JSON.parse(contents);
                }
                response.result = obj;
              }
              response.headers = res.message.headers;
            } catch (err) {
            }
            if (statusCode > 299) {
              let msg;
              if (obj && obj.message) {
                msg = obj.message;
              } else if (contents && contents.length > 0) {
                msg = contents;
              } else {
                msg = `Failed request: (${statusCode})`;
              }
              const err = new HttpClientError(msg, statusCode);
              err.result = response.result;
              reject(err);
            } else {
              resolve(response);
            }
          }));
        });
      }
    };
    exports2.HttpClient = HttpClient;
    var lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
  }
});

// node_modules/@actions/http-client/lib/auth.js
var require_auth = __commonJS({
  "node_modules/@actions/http-client/lib/auth.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PersonalAccessTokenCredentialHandler = exports2.BearerCredentialHandler = exports2.BasicCredentialHandler = void 0;
    var BasicCredentialHandler = class {
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports2.BasicCredentialHandler = BasicCredentialHandler;
    var BearerCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Bearer ${this.token}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports2.BearerCredentialHandler = BearerCredentialHandler;
    var PersonalAccessTokenCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports2.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
  }
});

// node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = __commonJS({
  "node_modules/@actions/core/lib/oidc-utils.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OidcClient = void 0;
    var http_client_1 = require_lib();
    var auth_1 = require_auth();
    var core_1 = require_core();
    var OidcClient = class _OidcClient {
      static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
          allowRetries: allowRetry,
          maxRetries: maxRetry
        };
        return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(_OidcClient.getRequestToken())], requestOptions);
      }
      static getRequestToken() {
        const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
        if (!token) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
        }
        return token;
      }
      static getIDTokenUrl() {
        const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
        if (!runtimeUrl) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
        }
        return runtimeUrl;
      }
      static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const httpclient = _OidcClient.createHttpClient();
          const res = yield httpclient.getJson(id_token_url).catch((error) => {
            throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error.statusCode}
 
        Error Message: ${error.result.message}`);
          });
          const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
          if (!id_token) {
            throw new Error("Response json body do not have ID Token field");
          }
          return id_token;
        });
      }
      static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let id_token_url = _OidcClient.getIDTokenUrl();
            if (audience) {
              const encodedAudience = encodeURIComponent(audience);
              id_token_url = `${id_token_url}&audience=${encodedAudience}`;
            }
            core_1.debug(`ID token url is ${id_token_url}`);
            const id_token = yield _OidcClient.getCall(id_token_url);
            core_1.setSecret(id_token);
            return id_token;
          } catch (error) {
            throw new Error(`Error message: ${error.message}`);
          }
        });
      }
    };
    exports2.OidcClient = OidcClient;
  }
});

// node_modules/@actions/core/lib/summary.js
var require_summary = __commonJS({
  "node_modules/@actions/core/lib/summary.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.summary = exports2.markdownSummary = exports2.SUMMARY_DOCS_URL = exports2.SUMMARY_ENV_VAR = void 0;
    var os_1 = require("os");
    var fs_1 = require("fs");
    var { access, appendFile, writeFile } = fs_1.promises;
    exports2.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
    exports2.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
    var Summary = class {
      constructor() {
        this._buffer = "";
      }
      /**
       * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
       * Also checks r/w permissions.
       *
       * @returns step summary file path
       */
      filePath() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._filePath) {
            return this._filePath;
          }
          const pathFromEnv = process.env[exports2.SUMMARY_ENV_VAR];
          if (!pathFromEnv) {
            throw new Error(`Unable to find environment variable for $${exports2.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
          }
          try {
            yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
          } catch (_a) {
            throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
          }
          this._filePath = pathFromEnv;
          return this._filePath;
        });
      }
      /**
       * Wraps content in an HTML tag, adding any HTML attributes
       *
       * @param {string} tag HTML tag to wrap
       * @param {string | null} content content within the tag
       * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
       *
       * @returns {string} content wrapped in HTML element
       */
      wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
        if (!content) {
          return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
      }
      /**
       * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
       *
       * @param {SummaryWriteOptions} [options] (optional) options for write operation
       *
       * @returns {Promise<Summary>} summary instance
       */
      write(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
          const filePath = yield this.filePath();
          const writeFunc = overwrite ? writeFile : appendFile;
          yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          return this.emptyBuffer();
        });
      }
      /**
       * Clears the summary buffer and wipes the summary file
       *
       * @returns {Summary} summary instance
       */
      clear() {
        return __awaiter(this, void 0, void 0, function* () {
          return this.emptyBuffer().write({ overwrite: true });
        });
      }
      /**
       * Returns the current summary buffer as a string
       *
       * @returns {string} string of summary buffer
       */
      stringify() {
        return this._buffer;
      }
      /**
       * If the summary buffer is empty
       *
       * @returns {boolen} true if the buffer is empty
       */
      isEmptyBuffer() {
        return this._buffer.length === 0;
      }
      /**
       * Resets the summary buffer without writing to summary file
       *
       * @returns {Summary} summary instance
       */
      emptyBuffer() {
        this._buffer = "";
        return this;
      }
      /**
       * Adds raw text to the summary buffer
       *
       * @param {string} text content to add
       * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
       *
       * @returns {Summary} summary instance
       */
      addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
      }
      /**
       * Adds the operating system-specific end-of-line marker to the buffer
       *
       * @returns {Summary} summary instance
       */
      addEOL() {
        return this.addRaw(os_1.EOL);
      }
      /**
       * Adds an HTML codeblock to the summary buffer
       *
       * @param {string} code content to render within fenced code block
       * @param {string} lang (optional) language to syntax highlight code
       *
       * @returns {Summary} summary instance
       */
      addCodeBlock(code, lang) {
        const attrs = Object.assign({}, lang && { lang });
        const element = this.wrap("pre", this.wrap("code", code), attrs);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML list to the summary buffer
       *
       * @param {string[]} items list of items to render
       * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
       *
       * @returns {Summary} summary instance
       */
      addList(items, ordered = false) {
        const tag = ordered ? "ol" : "ul";
        const listItems = items.map((item) => this.wrap("li", item)).join("");
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML table to the summary buffer
       *
       * @param {SummaryTableCell[]} rows table rows
       *
       * @returns {Summary} summary instance
       */
      addTable(rows) {
        const tableBody = rows.map((row) => {
          const cells = row.map((cell) => {
            if (typeof cell === "string") {
              return this.wrap("td", cell);
            }
            const { header, data, colspan, rowspan } = cell;
            const tag = header ? "th" : "td";
            const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
            return this.wrap(tag, data, attrs);
          }).join("");
          return this.wrap("tr", cells);
        }).join("");
        const element = this.wrap("table", tableBody);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds a collapsable HTML details element to the summary buffer
       *
       * @param {string} label text for the closed state
       * @param {string} content collapsable content
       *
       * @returns {Summary} summary instance
       */
      addDetails(label, content) {
        const element = this.wrap("details", this.wrap("summary", label) + content);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML image tag to the summary buffer
       *
       * @param {string} src path to the image you to embed
       * @param {string} alt text description of the image
       * @param {SummaryImageOptions} options (optional) addition image attributes
       *
       * @returns {Summary} summary instance
       */
      addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
        const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML section heading element
       *
       * @param {string} text heading text
       * @param {number | string} [level=1] (optional) the heading level, default: 1
       *
       * @returns {Summary} summary instance
       */
      addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML thematic break (<hr>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addSeparator() {
        const element = this.wrap("hr", null);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML line break (<br>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addBreak() {
        const element = this.wrap("br", null);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML blockquote to the summary buffer
       *
       * @param {string} text quote text
       * @param {string} cite (optional) citation url
       *
       * @returns {Summary} summary instance
       */
      addQuote(text, cite) {
        const attrs = Object.assign({}, cite && { cite });
        const element = this.wrap("blockquote", text, attrs);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML anchor tag to the summary buffer
       *
       * @param {string} text link text/content
       * @param {string} href hyperlink
       *
       * @returns {Summary} summary instance
       */
      addLink(text, href) {
        const element = this.wrap("a", text, { href });
        return this.addRaw(element).addEOL();
      }
    };
    var _summary = new Summary();
    exports2.markdownSummary = _summary;
    exports2.summary = _summary;
  }
});

// node_modules/@actions/core/lib/path-utils.js
var require_path_utils = __commonJS({
  "node_modules/@actions/core/lib/path-utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toPlatformPath = exports2.toWin32Path = exports2.toPosixPath = void 0;
    var path2 = __importStar(require("path"));
    function toPosixPath(pth) {
      return pth.replace(/[\\]/g, "/");
    }
    exports2.toPosixPath = toPosixPath;
    function toWin32Path(pth) {
      return pth.replace(/[/]/g, "\\");
    }
    exports2.toWin32Path = toWin32Path;
    function toPlatformPath(pth) {
      return pth.replace(/[/\\]/g, path2.sep);
    }
    exports2.toPlatformPath = toPlatformPath;
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/@actions/core/lib/core.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getIDToken = exports2.getState = exports2.saveState = exports2.group = exports2.endGroup = exports2.startGroup = exports2.info = exports2.notice = exports2.warning = exports2.error = exports2.debug = exports2.isDebug = exports2.setFailed = exports2.setCommandEcho = exports2.setOutput = exports2.getBooleanInput = exports2.getMultilineInput = exports2.getInput = exports2.addPath = exports2.setSecret = exports2.exportVariable = exports2.ExitCode = void 0;
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os = __importStar(require("os"));
    var path2 = __importStar(require("path"));
    var oidc_utils_1 = require_oidc_utils();
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports2.ExitCode || (exports2.ExitCode = {}));
    function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("ENV", file_command_1.prepareKeyValueMessage(name, val));
      }
      command_1.issueCommand("set-env", { name }, convertedVal);
    }
    exports2.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    exports2.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueFileCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path2.delimiter}${process.env["PATH"]}`;
    }
    exports2.addPath = addPath;
    function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    exports2.getInput = getInput;
    function getMultilineInput(name, options) {
      const inputs = getInput(name, options).split("\n").filter((x) => x !== "");
      if (options && options.trimWhitespace === false) {
        return inputs;
      }
      return inputs.map((input) => input.trim());
    }
    exports2.getMultilineInput = getMultilineInput;
    function getBooleanInput(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    exports2.getBooleanInput = getBooleanInput;
    function setOutput(name, value) {
      const filePath = process.env["GITHUB_OUTPUT"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("OUTPUT", file_command_1.prepareKeyValueMessage(name, value));
      }
      process.stdout.write(os.EOL);
      command_1.issueCommand("set-output", { name }, utils_1.toCommandValue(value));
    }
    exports2.setOutput = setOutput;
    function setCommandEcho(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    exports2.setCommandEcho = setCommandEcho;
    function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports2.setFailed = setFailed;
    function isDebug() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    exports2.isDebug = isDebug;
    function debug(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports2.debug = debug;
    function error(message, properties = {}) {
      command_1.issueCommand("error", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.error = error;
    function warning(message, properties = {}) {
      command_1.issueCommand("warning", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.warning = warning;
    function notice(message, properties = {}) {
      command_1.issueCommand("notice", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports2.notice = notice;
    function info(message) {
      process.stdout.write(message + os.EOL);
    }
    exports2.info = info;
    function startGroup(name) {
      command_1.issue("group", name);
    }
    exports2.startGroup = startGroup;
    function endGroup() {
      command_1.issue("endgroup");
    }
    exports2.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup();
        }
        return result;
      });
    }
    exports2.group = group;
    function saveState(name, value) {
      const filePath = process.env["GITHUB_STATE"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("STATE", file_command_1.prepareKeyValueMessage(name, value));
      }
      command_1.issueCommand("save-state", { name }, utils_1.toCommandValue(value));
    }
    exports2.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    exports2.getState = getState;
    function getIDToken(aud) {
      return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
    }
    exports2.getIDToken = getIDToken;
    var summary_1 = require_summary();
    Object.defineProperty(exports2, "summary", { enumerable: true, get: function() {
      return summary_1.summary;
    } });
    var summary_2 = require_summary();
    Object.defineProperty(exports2, "markdownSummary", { enumerable: true, get: function() {
      return summary_2.markdownSummary;
    } });
    var path_utils_1 = require_path_utils();
    Object.defineProperty(exports2, "toPosixPath", { enumerable: true, get: function() {
      return path_utils_1.toPosixPath;
    } });
    Object.defineProperty(exports2, "toWin32Path", { enumerable: true, get: function() {
      return path_utils_1.toWin32Path;
    } });
    Object.defineProperty(exports2, "toPlatformPath", { enumerable: true, get: function() {
      return path_utils_1.toPlatformPath;
    } });
  }
});

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.4.7",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto4 = require("crypto");
    var packageJson = require_package();
    var version2 = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse2(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version2}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version2}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version2}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs2.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs2.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs2.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto4.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse: parse2,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// index.js
var p = require_phin();
var core = require_core();
var { execSync } = require("child_process");
var fs = require("fs");
var path = require("path");
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var createCatFile = ({ email, api_key }) => `cat >~/.netrc <<EOF
machine api.heroku.com
    login ${email}
    password ${api_key}
machine git.heroku.com
    login ${email}
    password ${api_key}
EOF`;
var addRemote = ({ app_name, dontautocreate, buildpack, region, team, stack }) => {
  try {
    execSync("heroku git:remote --app " + app_name);
    console.log("Added git remote heroku");
  } catch (err) {
    if (dontautocreate) throw err;
    execSync(
      "heroku create " + app_name + (buildpack ? " --buildpack " + buildpack : "") + (region ? " --region " + region : "") + (stack ? " --stack " + stack : "") + (team ? " --team " + team : "")
    );
  }
};
var addStack = ({ stack }) => {
  if (stack) {
    execSync("heroku stack:set " + stack);
    console.log("Changed stack to " + stack);
  }
};
var addConfig = ({ app_name, env_file, appdir }) => {
  let configVars = [];
  for (let key in process.env) {
    if (key.startsWith("HD_")) {
      configVars.push(key.substring(3) + "='" + process.env[key] + "'");
    }
  }
  if (env_file) {
    const env = fs.readFileSync(path.join(appdir, env_file), "utf8");
    const variables = require_main().parse(env);
    const newVars = [];
    for (let key in variables) {
      newVars.push(key + "=" + variables[key]);
    }
    configVars = [...configVars, ...newVars];
  }
  if (configVars.length !== 0) {
    execSync(`heroku config:set --app=${app_name} ${configVars.join(" ")}`);
  }
};
var createProcfile = ({ procfile, appdir }) => {
  if (procfile) {
    fs.writeFileSync(path.join(appdir, "Procfile"), procfile);
    execSync(`git add -A && git commit -m "Added Procfile"`);
    console.log("Written Procfile with custom configuration");
  }
};
var deploy = ({
  dontuseforce,
  app_name,
  branch,
  usedocker,
  dockerHerokuProcessType,
  dockerBuildArgs,
  appdir
}) => {
  const force = !dontuseforce ? "--force" : "";
  if (usedocker) {
    execSync(
      `heroku container:push ${dockerHerokuProcessType} --app ${app_name} ${dockerBuildArgs}`,
      appdir ? { cwd: appdir } : null
    );
    execSync(
      `heroku container:release ${dockerHerokuProcessType} --app ${app_name}`,
      appdir ? { cwd: appdir } : null
    );
  } else {
    let remote_branch = execSync(
      "git remote show heroku | grep 'HEAD' | cut -d':' -f2 | sed -e 's/^ *//g' -e 's/ *$//g'"
    ).toString().trim();
    if (remote_branch === "master") {
      execSync("heroku plugins:install heroku-repo");
      execSync("heroku repo:reset -a " + app_name);
    }
    if (appdir === "") {
      execSync(`git push heroku ${branch}:refs/heads/main ${force}`, {
        maxBuffer: 104857600
      });
    } else {
      execSync(
        `git push ${force} heroku \`git subtree split --prefix=${appdir} ${branch}\`:refs/heads/main`,
        { maxBuffer: 104857600 }
      );
    }
  }
};
var healthcheckFailed = ({
  rollbackonhealthcheckfailed,
  app_name,
  appdir
}) => {
  if (rollbackonhealthcheckfailed) {
    execSync(
      `heroku rollback --app ${app_name}`,
      appdir ? { cwd: appdir } : null
    );
    core.setFailed(
      "Health Check Failed. Error deploying Server. Deployment has been rolled back. Please check your logs on Heroku to try and diagnose the problem"
    );
  } else {
    core.setFailed(
      "Health Check Failed. Error deploying Server. Please check your logs on Heroku to try and diagnose the problem"
    );
  }
};
var heroku = {
  api_key: core.getInput("heroku_api_key"),
  email: core.getInput("heroku_email"),
  app_name: core.getInput("heroku_app_name"),
  buildpack: core.getInput("buildpack"),
  branch: core.getInput("branch"),
  dontuseforce: core.getInput("dontuseforce") === "false" ? false : true,
  dontautocreate: core.getInput("dontautocreate") === "false" ? false : true,
  usedocker: core.getInput("usedocker") === "false" ? false : true,
  dockerHerokuProcessType: core.getInput("docker_heroku_process_type"),
  dockerBuildArgs: core.getInput("docker_build_args"),
  appdir: core.getInput("appdir"),
  healthcheck: core.getInput("healthcheck"),
  checkstring: core.getInput("checkstring"),
  delay: parseInt(core.getInput("delay")),
  procfile: core.getInput("procfile"),
  rollbackonhealthcheckfailed: core.getInput("rollbackonhealthcheckfailed") === "false" ? false : true,
  env_file: core.getInput("env_file"),
  justlogin: core.getInput("justlogin") === "false" ? false : true,
  region: core.getInput("region"),
  stack: core.getInput("stack"),
  team: core.getInput("team")
};
if (heroku.appdir) {
  heroku.appdir = heroku.appdir[0] === "." && heroku.appdir[1] === "/" ? heroku.appdir.slice(2) : heroku.appdir[0] === "/" ? heroku.appdir.slice(1) : heroku.appdir;
}
if (heroku.dockerBuildArgs) {
  heroku.dockerBuildArgs = heroku.dockerBuildArgs.split("\n").map((arg) => `${arg}="${process.env[arg]}"`).join(",");
  heroku.dockerBuildArgs = heroku.dockerBuildArgs ? `--arg ${heroku.dockerBuildArgs}` : "";
}
(async () => {
  try {
    if (heroku.justlogin) {
      execSync(createCatFile(heroku));
      console.log("Created and wrote to ~/.netrc");
      return;
    }
    execSync(`git config user.name "Heroku-Deploy"`);
    execSync(`git config user.email "${heroku.email}"`);
    const status = execSync("git status --porcelain").toString().trim();
    if (status) {
      execSync(
        'git add -A && git commit -m "Commited changes from previous actions"'
      );
    }
    if (!heroku.usedocker) {
      const isShallow = execSync(
        "git rev-parse --is-shallow-repository"
      ).toString();
      if (isShallow === "true\n") {
        execSync("git fetch --prune --unshallow");
      }
    }
    execSync(createCatFile(heroku));
    console.log("Created and wrote to ~/.netrc");
    createProcfile(heroku);
    if (heroku.usedocker) {
      execSync("heroku container:login");
    }
    console.log("Successfully logged into heroku");
    addRemote(heroku);
    addConfig(heroku);
    addStack(heroku);
    try {
      deploy({ ...heroku, dontuseforce: true });
    } catch (err) {
      console.error(`
            Unable to push branch because the branch is behind the deployed branch. Using --force to deploy branch. 
            (If you want to avoid this, set dontuseforce to 1 in with: of .github/workflows/action.yml. 
            Specifically, the error was: ${err}
        `);
      deploy(heroku);
    }
    if (heroku.healthcheck) {
      if (typeof heroku.delay === "number" && heroku.delay !== NaN) {
        await sleep(heroku.delay * 1e3);
      }
      try {
        const res = await p(heroku.healthcheck);
        if (res.statusCode !== 200) {
          throw new Error(
            "Status code of network request is not 200: Status code - " + res.statusCode
          );
        }
        if (heroku.checkstring && heroku.checkstring !== res.body.toString()) {
          throw new Error("Failed to match the checkstring");
        }
        console.log(res.body.toString());
      } catch (err) {
        console.log(err.message);
        healthcheckFailed(heroku);
      }
    }
    core.setOutput(
      "status",
      "Successfully deployed heroku app from branch " + heroku.branch
    );
  } catch (err) {
    if (heroku.dontautocreate && err.toString().includes("Couldn't find that app")) {
      core.setOutput(
        "status",
        "Skipped deploy to heroku app from branch " + heroku.branch
      );
    } else {
      core.setFailed(err.toString());
    }
  }
})();
