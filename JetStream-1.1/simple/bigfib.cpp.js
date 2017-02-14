// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 134217728;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===
var __ZTVN10__cxxabiv117__class_type_infoE = 13216;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 13256;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(14083);
/* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } });


/* memory initializer */ allocate([70,105,98,32,91,0,0,0,93,32,61,32,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,108,108,0,0,0,0,0,116,104,0,0,0,0,0,0,115,111,109,101,0,0,0,0,114,97,110,100,0,0,0,0,56,0,0,0,0,0,0,0,184,0,0,0,1,0,0,0,2,0,0,0,200,255,255,255,200,255,255,255,184,0,0,0,3,0,0,0,4,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,208,51,0,0,112,0,0,0,8,13,0,0,0,0,0,0,56,0,0,0,0,0,0,0,8,13,0,0,5,0,0,0,6,0,0,0,200,255,255,255,200,255,255,255,8,13,0,0,7,0,0,0,8,0,0,0,0,0,0,0,120,1,0,0,9,0,0,0,10,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,208,51,0,0,48,1,0,0,0,12], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([16,6,0,0,11,0,0,0,12,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,5,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,3,0,0,0,6,0,0,0,4,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,208,51,0,0,240,5,0,0,64,12,0,0,0,0,0,0,0,0,0,0,120,6,0,0,13,0,0,0,14,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,9,0,0,0,6,0,0,0,5,0,0,0,10,0,0,0,11,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,208,51,0,0,96,6,0,0,64,12,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,0,0,0,0,16,7,0,0,15,0,0,0,16,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,3,0,0,0,12,0,0,0,2,0,0,0,2,0,0,0,13,0,0,0,4,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,208,51,0,0,240,6,0,0,0,12,0,0,0,0,0,0,0,0,0,0,120,7,0,0,17,0,0,0,18,0,0,0,5,0,0,0,1,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,14,0,0,0,15,0,0,0,9,0,0,0,3,0,0,0,10,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,208,51,0,0,96,7,0,0,0,12,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,168,51,0,0,136,7,0,0,0,0,0,0,240,7,0,0,19,0,0,0,20,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,88,8,0,0,21,0,0,0,22,0,0,0,17,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,208,51,0,0,224,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,8,0,0,19,0,0,0,23,0,0,0,16,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,208,51,0,0,24,8,0,0,240,7,0,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,208,51,0,0,64,8,0,0,0,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,0,0,0,0,160,8,0,0,24,0,0,0,25,0,0,0,17,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,208,51,0,0,136,8,0,0,88,8,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,168,51,0,0,176,8,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,208,51,0,0,216,8,0,0,208,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,0,0,0,0,0,12,0,0,26,0,0,0,27,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,13,0,0,0,4,0,0,0,7,0,0,0,3,0,0,0,10,0,0,0,0,0,0,0,64,12,0,0,28,0,0,0,29,0,0,0,6,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,9,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,8,0,0,0,3,0,0,0,7,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,120,12,0,0,30,0,0,0,31,0,0,0,248,255,255,255,248,255,255,255,120,12,0,0,32,0,0,0,33,0,0,0,8,0,0,0,0,0,0,0,192,12,0,0,34,0,0,0,35,0,0,0,248,255,255,255,248,255,255,255,192,12,0,0,36,0,0,0,37,0,0,0,4,0,0,0,0,0,0,0,8,13,0,0,5,0,0,0,6,0,0,0,252,255,255,255,252,255,255,255,8,13,0,0,7,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,80,13,0,0,38,0,0,0,39,0,0,0,252,255,255,255,252,255,255,255,80,13,0,0,40,0,0,0,41,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,11,0,0,42,0,0,0,43,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,64,11,0,0,44,0,0,0,45,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,208,51,0,0,248,10,0,0,160,8,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,168,51,0,0,40,11,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,208,51,0,0,72,11,0,0,64,11,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,208,51,0,0,136,11,0,0,64,11,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,168,51,0,0,200,11,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,168,51,0,0,8,12,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,48,52,0,0,72,12,0,0,0,0,0,0,1,0,0,0,120,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,48,52,0,0,144,12,0,0,0,0,0,0,1,0,0,0,184,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,48,52,0,0,216,12,0,0,0,0,0,0,1,0,0,0,120,11,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,48,52,0,0,32,13,0,0,0,0,0,0,1,0,0,0,184,11,0,0,3,244,255,255,0,0,0,0,176,13,0,0,46,0,0,0,47,0,0,0,18,0,0,0,1,0,0,0,9,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,208,51,0,0,144,13,0,0,240,8,0,0,0,0,0,0,0,0,0,0,216,27,0,0,48,0,0,0,49,0,0,0,50,0,0,0,1,0,0,0,4,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28,0,0,51,0,0,0,52,0,0,0,50,0,0,0,2,0,0,0,5,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,32,0,0,53,0,0,0,54,0,0,0,50,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,72,33,0,0,55,0,0,0,56,0,0,0,50,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,34,0,0,57,0,0,0,58,0,0,0,50,0,0,0,4,0,0,0,5,0,0,0,23,0,0,0,6,0,0,0,24,0,0,0,1,0,0,0,2,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,34,0,0,59,0,0,0,60,0,0,0,50,0,0,0,8,0,0,0,9,0,0,0,25,0,0,0,10,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,200,29,0,0,61,0,0,0,62,0,0,0,50,0,0,0,19,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,248,255,255,255,200,29,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,37,109,47,37,100,47,37,121,37,89,45,37,109,45,37,100,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,72,58,37,77,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,104,30,0,0,63,0,0,0,64,0,0,0,50,0,0,0,27,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,2,0,0,0,248,255,255,255,104,30,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,248,30,0,0,65,0,0,0,66,0,0,0,50,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,31,0,0,67,0,0,0,68,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,28,0,0,69,0,0,0,70,0,0,0,50,0,0,0,35,0,0,0,36,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,37,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,28,0,0,71,0,0,0,72,0,0,0,50,0,0,0,38,0,0,0,39,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,40,0,0,0,17,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,28,0,0,73,0,0,0,74,0,0,0,50,0,0,0,41,0,0,0,42,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,43,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,29,0,0,75,0,0,0,76,0,0,0,50,0,0,0,44,0,0,0,45,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,46,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,35,0,0,77,0,0,0,78,0,0,0,50,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,76,102,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,0,0,0,0,192,35,0,0,79,0,0,0,80,0,0,0,50,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,0,0,0,0,80,36,0,0,81,0,0,0,82,0,0,0,50,0,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,0,0,0,0,224,36,0,0,83,0,0,0,84,0,0,0,50,0,0,0,2,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,31,0,0,85,0,0,0,86,0,0,0,50,0,0,0,13,0,0,0,12,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,31,0,0,87,0,0,0,88,0,0,0,50,0,0,0,14,0,0,0,13,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,176,27,0,0,89,0,0,0,90,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,24,0,0,91,0,0,0,92,0,0,0,50,0,0,0,11,0,0,0,15,0,0,0,12,0,0,0,16,0,0,0,13,0,0,0,1,0,0,0,17,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,25,0,0,93,0,0,0,94,0,0,0,50,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,47,0,0,0,48,0,0,0,5,0,0,0,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,27,0,0,95,0,0,0,96,0,0,0,50,0,0,0,50,0,0,0,51,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,0,0,0,0,136,27,0,0,97,0,0,0,98,0,0,0,50,0,0,0,52,0,0,0,53,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,116,114,117,101,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,192,23,0,0,99,0,0,0,100,0,0,0,50,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,208,51,0,0,168,23,0,0,168,7,0,0,0,0,0,0,0,0,0,0,80,24,0,0,99,0,0,0,101,0,0,0,50,0,0,0,18,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,14,0,0,0,19,0,0,0,15,0,0,0,20,0,0,0,16,0,0,0,5,0,0,0,21,0,0,0,6,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,168,51,0,0,48,24,0,0,48,52,0,0,24,24,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,24,0,0,2,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,48,52,0,0,112,24,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,24,0,0,2,0,0,0,0,0,0,0,32,25,0,0,99,0,0,0,102,0,0,0,50,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,54,0,0,0,55,0,0,0,8,0,0,0,56,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,168,51,0,0,0,25,0,0,48,52,0,0,216,24,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,24,25,0,0,2,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,48,52,0,0,64,25,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,24,25,0,0,2,0,0,0,0,0,0,0,224,25,0,0,99,0,0,0,103,0,0,0,50,0,0,0,5,0,0,0,6,0,0,0,9,0,0,0,57,0,0,0,58,0,0,0,10,0,0,0,59,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,48,52,0,0,184,25,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,24,25,0,0,2,0,0,0,0,0,0,0,88,26,0,0,99,0,0,0,104,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,60,0,0,0,61,0,0,0,12,0,0,0,62,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,48,52,0,0,48,26,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,24,25,0,0,2,0,0,0,0,0,0,0,208,26,0,0,99,0,0,0,105,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,60,0,0,0,61,0,0,0,12,0,0,0,62,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,208,51,0,0,168,26,0,0,88,26,0,0,0,0,0,0,0,0,0,0,56,27,0,0,99,0,0,0,106,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,60,0,0,0,61,0,0,0,12,0,0,0,62,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,208,51,0,0,16,27,0,0,88,26,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,208,51,0,0,72,27,0,0,192,23,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,208,51,0,0,112,27,0,0,192,23,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,208,51,0,0,152,27,0,0,192,23,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,208,51,0,0,192,27,0,0,192,23,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,208,51,0,0,232,27,0,0,192,23,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,168,51,0,0,48,28,0,0,48,52,0,0,16,28,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,48,52,0,0,112,28,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,48,52,0,0,176,28,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,28,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,48,52,0,0,240,28,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,28,0,0,2,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,168,51,0,0,120,29,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,168,51,0,0,152,29,0,0,48,52,0,0,48,29,0,0,0,0,0,0,3,0,0,0,192,23,0,0,2,0,0,0,144,29,0,0,2,0,0,0,192,29,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,168,51,0,0,56,30,0,0,48,52,0,0,240,29,0,0,0,0,0,0,3,0,0,0,192,23,0,0,2,0,0,0,144,29,0,0,2,0,0,0,96,30,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,168,51,0,0,216,30,0,0,48,52,0,0,144,30,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,240,30,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,48,52,0,0,24,31,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,240,30,0,0,0,8,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,168,51,0,0,152,31,0,0,48,52,0,0,128,31,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,176,31,0,0,2,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,48,52,0,0,216,31,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,176,31,0,0,2,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,168,51,0,0,112,32,0,0,48,52,0,0,88,32,0,0,0,0,0,0,1,0,0,0,144,32,0,0,0,0,0,0,48,52,0,0,16,32,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,152,32,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,48,52,0,0,24,33,0,0,0,0,0,0,1,0,0,0,144,32,0,0,0,0,0,0,48,52,0,0,208,32,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,48,33,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,168,51,0,0,200,33,0,0,48,52,0,0,176,33,0,0,0,0,0,0,1,0,0,0,232,33,0,0,0,0,0,0,48,52,0,0,104,33,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,240,33,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,48,52,0,0,112,34,0,0,0,0,0,0,1,0,0,0,232,33,0,0,0,0,0,0,48,52,0,0,40,34,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,136,34,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,168,51,0,0,8,35,0,0,48,52,0,0,192,34,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,40,35,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,168,51,0,0,152,35,0,0,48,52,0,0,80,35,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,184,35,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,168,51,0,0,40,36,0,0,48,52,0,0,224,35,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,72,36,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,168,51,0,0,184,36,0,0,48,52,0,0,112,36,0,0,0,0,0,0,2,0,0,0,192,23,0,0,2,0,0,0,216,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+1452);
/* memory initializer */ allocate([74,97,110,117,97,114,121,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,65,112,114,105,108,0,0,0,77,97,121,0,0,0,0,0,74,117,110,101,0,0,0,0,74,117,108,121,0,0,0,0,65,117,103,117,115,116,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,74,97,110,0,0,0,0,0,70,101,98,0,0,0,0,0,77,97,114,0,0,0,0,0,65,112,114,0,0,0,0,0,74,117,110,0,0,0,0,0,74,117,108,0,0,0,0,0,65,117,103,0,0,0,0,0,83,101,112,0,0,0,0,0,79,99,116,0,0,0,0,0,78,111,118,0,0,0,0,0,68,101,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,117,110,100,97,121,0,0,77,111,110,100,97,121,0,0,84,117,101,115,100,97,121,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,77,111,110,0,0,0,0,0,84,117,101,0,0,0,0,0,87,101,100,0,0,0,0,0,84,104,117,0,0,0,0,0,70,114,105,0,0,0,0,0,83,97,116,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,51,0,0,107,0,0,0,108,0,0,0,63,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,168,51,0,0,248,50,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,208,51,0,0,16,51,0,0,0,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,208,51,0,0,48,51,0,0,8,51,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,208,51,0,0,104,51,0,0,88,51,0,0,0,0,0,0,0,0,0,0,144,51,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,14,0,0,0,1,0,0,0,6,0,0,0,0,0,0,0,24,52,0,0,109,0,0,0,113,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,15,0,0,0,2,0,0,0,7,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,208,51,0,0,240,51,0,0,144,51,0,0,0,0,0,0,0,0,0,0,120,52,0,0,109,0,0,0,114,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,16,0,0,0,3,0,0,0,8,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,208,51,0,0,80,52,0,0,144,51,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,54,0,0,115,0,0,0,116,0,0,0,64,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,208,51,0,0,168,54,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+11712);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

  
   
  Module["_rand_r"] = _rand_r;
  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC); 
  Module["_rand"] = _rand;

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

   
  Module["_i64Subtract"] = _i64Subtract;

   
  Module["_i64Add"] = _i64Add;

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function _pthread_mutex_lock() {}

  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }

  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }function _strtoull_l(str, endptr, base) {
      return _strtoull(str, endptr, base); // no locale support yet
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }

  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }function _strtoll_l(str, endptr, base) {
      return _strtoll(str, endptr, base); // no locale support yet
    }



  function _pthread_cond_broadcast() {
      return 0;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  
  
  function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }

  function _pthread_mutex_unlock() {}

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }function _isxdigit_l(chr) {
      return _isxdigit(chr); // no locale support yet
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }

  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

   
  Module["_memmove"] = _memmove;

  function ___errno_location() {
      return ___errno_state;
    }

  var _BItoD=true;

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  
  
  
  function _free() {
  }
  Module["_free"] = _free;function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr - ___cxa_exception_header_size);
      } catch(e) { // XXX FIXME
      }
    }
  
  var ___cxa_caught_exceptions=[];function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = ___cxa_caught_exceptions.pop();
      if (ptr) {
        header = ptr - ___cxa_exception_header_size;
        var destructor = HEAP32[(((header)+(4))>>2)];
        if (destructor) {
          Runtime.dynCall('vi', destructor, [ptr]);
          HEAP32[(((header)+(4))>>2)]=0;
        }
        ___cxa_free_exception(ptr);
        ___cxa_last_thrown_exception = 0;
      }
    }function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      var ptr = ___cxa_caught_exceptions.pop();
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function _abort() {
      Module['abort']();
    }

  function _fmod(x, y) {
      return x % y;
    }

  function ___cxa_guard_release() {}

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  function _uselocale(locale) {
      return 0;
    }

  
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  
  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }



  
  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }

  var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  var ___cxa_atexit=_atexit;

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;


  function _pthread_cond_wait() {
      return 0;
    }

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }function _isdigit_l(chr) {
      return _isdigit(chr); // no locale support yet
    }

  var _fabs=Math_abs;

  function _llvm_lifetime_start() {}

  var _getc=_fgetc;

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function _freelocale(locale) {
      _free(locale);
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  var _fmodl=_fmod;

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

  
  
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;


  function __ZNSt9exceptionD2Ev() {}

  var _copysignl=_copysign;

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);

  var ___dso_handle=allocate(1, "i32*", ALLOC_STATIC);



FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.___rand_seed|0;var p=env.__ZTISt9exception|0;var q=env.___dso_handle|0;var r=env._stderr|0;var s=env._stdin|0;var t=env._stdout|0;var u=0;var v=0;var w=0;var x=0;var y=+env.NaN,z=+env.Infinity;var A=0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0.0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=global.Math.floor;var U=global.Math.abs;var V=global.Math.sqrt;var W=global.Math.pow;var X=global.Math.cos;var Y=global.Math.sin;var Z=global.Math.tan;var _=global.Math.acos;var $=global.Math.asin;var aa=global.Math.atan;var ba=global.Math.atan2;var ca=global.Math.exp;var da=global.Math.log;var ea=global.Math.ceil;var fa=global.Math.imul;var ga=env.abort;var ha=env.assert;var ia=env.asmPrintInt;var ja=env.asmPrintFloat;var ka=env.min;var la=env.invoke_iiii;var ma=env.invoke_viiiiiii;var na=env.invoke_viiiii;var oa=env.invoke_vi;var pa=env.invoke_vii;var qa=env.invoke_viiiiiiiii;var ra=env.invoke_ii;var sa=env.invoke_viiiiiid;var ta=env.invoke_viii;var ua=env.invoke_viiiiid;var va=env.invoke_v;var wa=env.invoke_iiiiiiiii;var xa=env.invoke_iiiii;var ya=env.invoke_viiiiiiii;var za=env.invoke_viiiiii;var Aa=env.invoke_iii;var Ba=env.invoke_iiiiii;var Ca=env.invoke_viiii;var Da=env._fabs;var Ea=env._vsscanf;var Fa=env.__ZSt9terminatev;var Ga=env.___cxa_guard_acquire;var Ha=env.__reallyNegative;var Ia=env.__ZSt18uncaught_exceptionv;var Ja=env.___ctype_toupper_loc;var Ka=env.__addDays;var La=env._sbrk;var Ma=env.___cxa_begin_catch;var Na=env._emscripten_memcpy_big;var Oa=env._sysconf;var Pa=env._fileno;var Qa=env._fread;var Ra=env._write;var Sa=env.__isLeapYear;var Ta=env.__ZNSt9exceptionD2Ev;var Ua=env.___cxa_does_inherit;var Va=env.__exit;var Wa=env.___cxa_rethrow;var Xa=env._catclose;var Ya=env._llvm_lifetime_end;var Za=env._send;var _a=env.___cxa_is_number_type;var $a=env.___cxa_free_exception;var ab=env.___cxa_find_matching_catch;var bb=env._isxdigit_l;var cb=env.___cxa_guard_release;var db=env._strtol;var eb=env.___setErrNo;var fb=env._newlocale;var gb=env._isdigit_l;var hb=env.___resumeException;var ib=env._freelocale;var jb=env._sprintf;var kb=env._vasprintf;var lb=env._vsnprintf;var mb=env._strtoull_l;var nb=env._read;var ob=env._fwrite;var pb=env._time;var qb=env._pthread_mutex_lock;var rb=env._catopen;var sb=env._exit;var tb=env.___ctype_b_loc;var ub=env._fmod;var vb=env.___cxa_allocate_exception;var wb=env._atoi;var xb=env._strtoll;var yb=env._pwrite;var zb=env._uselocale;var Ab=env._snprintf;var Bb=env.__scanString;var Cb=env.___cxa_end_catch;var Db=env._strtoull;var Eb=env._strftime;var Fb=env._isxdigit;var Gb=env.__parseInt;var Hb=env._pthread_cond_broadcast;var Ib=env._recv;var Jb=env._fgetc;var Kb=env.__parseInt64;var Lb=env.__getFloat;var Mb=env._abort;var Nb=env._isspace;var Ob=env._pthread_cond_wait;var Pb=env._llvm_lifetime_start;var Qb=env._ungetc;var Rb=env._fflush;var Sb=env._strftime_l;var Tb=env._sscanf;var Ub=env._catgets;var Vb=env._asprintf;var Wb=env._strtoll_l;var Xb=env.__arraySum;var Yb=env.___ctype_tolower_loc;var Zb=env._pthread_mutex_unlock;var _b=env._pread;var $b=env._mkport;var ac=env.___errno_location;var bc=env._copysign;var cc=env.___cxa_throw;var dc=env._isdigit;var ec=env._strerror;var fc=env.__formatString;var gc=env._atexit;var hc=env._strerror_r;var ic=0.0;
// EMSCRIPTEN_START_FUNCS
function Yg(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;fh(n,g,v,l,m);g=o;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(o,10,0);if((a[g]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=pc[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=pc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[g]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}ye(o,P<<1,0);if((a[g]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}ye(o,Q,0);if((a[g]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{U=c[I>>2]|0}if((gh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){pc[c[(c[E>>2]|0)+40>>2]&127](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);h[k>>3]=+Ol(M,c[p>>2]|0,j);mj(n,w,c[r>>2]|0,j);do{if((E|0)==0){W=0;X=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Y=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Y=c[r>>2]|0}if(!((Y|0)==-1)){W=E;X=0;break}c[A>>2]=0;W=0;X=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){Z=pc[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{Z=c[A>>2]|0}if((Z|0)==-1){c[e>>2]=0;H=57;break}if(!X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);do{if((H|0)==57){if(X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}function Zg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];_g(a,0,k,j,f,g,h);i=b;return}function _g(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;fh(n,g,v,l,m);g=o;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(o,10,0);if((a[g]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=pc[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=pc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[g]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}ye(o,P<<1,0);if((a[g]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}ye(o,Q,0);if((a[g]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{U=c[I>>2]|0}if((gh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){pc[c[(c[E>>2]|0)+40>>2]&127](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);h[k>>3]=+Nl(M,c[p>>2]|0,j);mj(n,w,c[r>>2]|0,j);do{if((E|0)==0){W=0;X=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Y=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Y=c[r>>2]|0}if(!((Y|0)==-1)){W=E;X=0;break}c[A>>2]=0;W=0;X=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){Z=pc[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{Z=c[A>>2]|0}if((Z|0)==-1){c[e>>2]=0;H=57;break}if(!X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);do{if((H|0)==57){if(X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}function $g(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0;d=i;i=i+8|0;k=d;l=i;i=i+16|0;m=i;i=i+104|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+160|0;r=n;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Qe(o,g);g=o;o=c[g>>2]|0;if(!((c[1280]|0)==-1)){c[l>>2]=5120;c[l+4>>2]=118;c[l+8>>2]=0;qe(5120,l,119)}l=(c[5124>>2]|0)+ -1|0;s=c[o+8>>2]|0;if(!((c[o+12>>2]|0)-s>>2>>>0>l>>>0)){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}o=c[s+(l<<2)>>2]|0;if((o|0)==0){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}t=m;vc[c[(c[o>>2]|0)+48>>2]&7](o,3672,3698|0,t)|0;Yd(c[g>>2]|0)|0;g=p;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(p,10,0);if((a[g]&1)==0){o=p+1|0;v=o;w=p+8|0;x=o}else{o=p+8|0;v=p+1|0;w=o;x=c[o>>2]|0}o=e;e=f;f=p;u=p+4|0;l=m+96|0;s=m+100|0;y=q;z=m+104|0;A=m;m=n+4|0;B=c[o>>2]|0;C=x;D=q;q=0;E=x;a:while(1){do{if((B|0)==0){F=0;G=1}else{x=c[B+12>>2]|0;if((x|0)==(c[B+16>>2]|0)){H=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{H=c[x>>2]|0}if(!((H|0)==-1)){F=B;G=0;break}c[o>>2]=0;F=0;G=1}}while(0);x=c[e>>2]|0;do{if((x|0)==0){I=22}else{J=c[x+12>>2]|0;if((J|0)==(c[x+16>>2]|0)){K=pc[c[(c[x>>2]|0)+36>>2]&127](x)|0}else{K=c[J>>2]|0}if((K|0)==-1){c[e>>2]=0;I=22;break}else{if(G){break}else{L=E;break a}}}}while(0);if((I|0)==22){I=0;if(G){L=E;break}}x=a[g]|0;J=(x&1)==0;if(J){M=(x&255)>>>1}else{M=c[u>>2]|0}if((C-E|0)==(M|0)){if(J){N=(x&255)>>>1;O=(x&255)>>>1}else{x=c[u>>2]|0;N=x;O=x}ye(p,O<<1,0);if((a[g]&1)==0){P=10}else{P=(c[f>>2]&-2)+ -1|0}ye(p,P,0);if((a[g]&1)==0){Q=v}else{Q=c[w>>2]|0}R=Q+N|0;S=Q}else{R=C;S=E}x=c[F+12>>2]|0;if((x|0)==(c[F+16>>2]|0)){T=pc[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{T=c[x>>2]|0}x=(R|0)==(S|0);do{if(x){J=(c[l>>2]|0)==(T|0);if(!J){if((c[s>>2]|0)!=(T|0)){I=43;break}}a[R]=J?43:45;U=R+1|0;V=D;W=0}else{I=43}}while(0);do{if((I|0)==43){I=0;J=a[r]|0;if((J&1)==0){X=(J&255)>>>1}else{X=c[m>>2]|0}if((X|0)!=0&(T|0)==0){if((D-y|0)>=160){U=R;V=D;W=q;break}c[D>>2]=q;U=R;V=D+4|0;W=0;break}else{Y=t}while(1){J=Y+4|0;if((c[Y>>2]|0)==(T|0)){Z=Y;break}if((J|0)==(z|0)){Z=z;break}else{Y=J}}J=Z-A|0;_=J>>2;if((J|0)>92){L=S;break a}if((J|0)<88){a[R]=a[3672+_|0]|0;U=R+1|0;V=D;W=q+1|0;break}if(x){L=R;break a}if((R-S|0)>=3){L=S;break a}if((a[R+ -1|0]|0)!=48){L=S;break a}a[R]=a[3672+_|0]|0;U=R+1|0;V=D;W=0}}while(0);x=c[o>>2]|0;_=x+12|0;J=c[_>>2]|0;if((J|0)==(c[x+16>>2]|0)){pc[c[(c[x>>2]|0)+40>>2]&127](x)|0;B=x;C=U;D=V;q=W;E=S;continue}else{c[_>>2]=J+4;B=x;C=U;D=V;q=W;E=S;continue}}a[L+3|0]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);S=c[1254]|0;c[k>>2]=j;if((Eg(L,S,3712,k)|0)!=1){c[h>>2]=4}k=c[o>>2]|0;do{if((k|0)==0){$=0;aa=1}else{S=c[k+12>>2]|0;if((S|0)==(c[k+16>>2]|0)){ba=pc[c[(c[k>>2]|0)+36>>2]&127](k)|0}else{ba=c[S>>2]|0}if(!((ba|0)==-1)){$=k;aa=0;break}c[o>>2]=0;$=0;aa=1}}while(0);o=c[e>>2]|0;do{if((o|0)==0){I=78}else{k=c[o+12>>2]|0;if((k|0)==(c[o+16>>2]|0)){ca=pc[c[(c[o>>2]|0)+36>>2]&127](o)|0}else{ca=c[k>>2]|0}if((ca|0)==-1){c[e>>2]=0;I=78;break}if(!aa){break}da=b;c[da>>2]=$;ve(p);ve(n);i=d;return}}while(0);do{if((I|0)==78){if(aa){break}da=b;c[da>>2]=$;ve(p);ve(n);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;da=b;c[da>>2]=$;ve(p);ve(n);i=d;return}function ah(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(c[m+96>>2]|0)==(b|0);if(!q){if((c[m+100>>2]|0)!=(b|0)){break}}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&(b|0)==(h|0)){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+104|0;h=m;while(1){l=h+4|0;if((c[h>>2]|0)==(b|0)){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;m=h>>2;if((h|0)>92){r=-1;i=n;return r|0}do{if((d|0)==10|(d|0)==8){if((m|0)<(d|0)){break}else{r=-1}i=n;return r|0}else if((d|0)==16){if((h|0)<88){break}if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;t=a[3672+m|0]|0;c[f>>2]=o+1;a[o]=t;r=0;i=n;return r|0}}while(0);e=a[3672+m|0]|0;c[f>>2]=o+1;a[o]=e;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function bh(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+40|0;h=g;j=g+16|0;k=g+32|0;Qe(k,d);d=k;k=c[d>>2]|0;if(!((c[1282]|0)==-1)){c[j>>2]=5128;c[j+4>>2]=118;c[j+8>>2]=0;qe(5128,j,119)}j=(c[5132>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>j>>>0)){m=vb(4)|0;n=m;pm(n);cc(m|0,13088,107)}k=c[l+(j<<2)>>2]|0;if((k|0)==0){m=vb(4)|0;n=m;pm(n);cc(m|0,13088,107)}vc[c[(c[k>>2]|0)+32>>2]&7](k,3672,3698|0,e)|0;e=c[d>>2]|0;if(!((c[1318]|0)==-1)){c[h>>2]=5272;c[h+4>>2]=118;c[h+8>>2]=0;qe(5272,h,119)}h=(c[5276>>2]|0)+ -1|0;k=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-k>>2>>>0>h>>>0)){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}e=c[k+(h<<2)>>2]|0;if((e|0)==0){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}else{o=e;a[f]=pc[c[(c[e>>2]|0)+16>>2]&127](o)|0;nc[c[(c[e>>2]|0)+20>>2]&63](b,o);Yd(c[d>>2]|0)|0;i=g;return}}function ch(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;i=i+40|0;j=h;k=h+16|0;l=h+32|0;Qe(l,d);d=l;l=c[d>>2]|0;if(!((c[1282]|0)==-1)){c[k>>2]=5128;c[k+4>>2]=118;c[k+8>>2]=0;qe(5128,k,119)}k=(c[5132>>2]|0)+ -1|0;m=c[l+8>>2]|0;if(!((c[l+12>>2]|0)-m>>2>>>0>k>>>0)){n=vb(4)|0;o=n;pm(o);cc(n|0,13088,107)}l=c[m+(k<<2)>>2]|0;if((l|0)==0){n=vb(4)|0;o=n;pm(o);cc(n|0,13088,107)}vc[c[(c[l>>2]|0)+32>>2]&7](l,3672,3704|0,e)|0;e=c[d>>2]|0;if(!((c[1318]|0)==-1)){c[j>>2]=5272;c[j+4>>2]=118;c[j+8>>2]=0;qe(5272,j,119)}j=(c[5276>>2]|0)+ -1|0;l=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-l>>2>>>0>j>>>0)){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}e=c[l+(j<<2)>>2]|0;if((e|0)==0){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}else{p=e;q=e;a[f]=pc[c[(c[q>>2]|0)+12>>2]&127](p)|0;a[g]=pc[c[(c[q>>2]|0)+16>>2]&127](p)|0;nc[c[(c[e>>2]|0)+20>>2]&63](b,p);Yd(c[d>>2]|0)|0;i=h;return}}function dh(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if(b<<24>>24==h<<24>>24){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}do{if(b<<24>>24==j<<24>>24){h=a[k]|0;if((h&1)==0){s=(h&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){break}if((a[d]|0)==0){q=-1;i=p;return q|0}h=c[m>>2]|0;if((h-l|0)>=160){q=0;i=p;return q|0}r=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=r;c[n>>2]=0;q=0;i=p;return q|0}}while(0);s=o+32|0;j=o;while(1){r=j+1|0;if((a[j]|0)==b<<24>>24){t=j;break}if((r|0)==(s|0)){t=s;break}else{j=r}}j=t-o|0;if((j|0)>31){q=-1;i=p;return q|0}o=a[3672+j|0]|0;if((j|0)==24|(j|0)==25){t=c[g>>2]|0;do{if((t|0)!=(f|0)){if((a[t+ -1|0]&95|0)==(a[e]&127|0)){break}else{q=-1}i=p;return q|0}}while(0);c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else if((j|0)==23|(j|0)==22){a[e]=80;t=c[g>>2]|0;c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else{t=o&95;do{if((t|0)==(a[e]|0)){a[e]=t|128;if((a[d]|0)==0){break}a[d]=0;f=a[k]|0;if((f&1)==0){u=(f&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)==0){break}f=c[m>>2]|0;if((f-l|0)>=160){break}s=c[n>>2]|0;c[m>>2]=f+4;c[f>>2]=s}}while(0);m=c[g>>2]|0;c[g>>2]=m+1;a[m]=o;if((j|0)>21){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}return 0}function eh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+40|0;g=f;h=f+16|0;j=f+32|0;Qe(j,b);b=j;j=c[b>>2]|0;if(!((c[1280]|0)==-1)){c[h>>2]=5120;c[h+4>>2]=118;c[h+8>>2]=0;qe(5120,h,119)}h=(c[5124>>2]|0)+ -1|0;k=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-k>>2>>>0>h>>>0)){l=vb(4)|0;m=l;pm(m);cc(l|0,13088,107)}j=c[k+(h<<2)>>2]|0;if((j|0)==0){l=vb(4)|0;m=l;pm(m);cc(l|0,13088,107)}vc[c[(c[j>>2]|0)+48>>2]&7](j,3672,3698|0,d)|0;d=c[b>>2]|0;if(!((c[1320]|0)==-1)){c[g>>2]=5280;c[g+4>>2]=118;c[g+8>>2]=0;qe(5280,g,119)}g=(c[5284>>2]|0)+ -1|0;j=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-j>>2>>>0>g>>>0)){n=vb(4)|0;o=n;pm(o);cc(n|0,13088,107)}d=c[j+(g<<2)>>2]|0;if((d|0)==0){n=vb(4)|0;o=n;pm(o);cc(n|0,13088,107)}else{n=d;c[e>>2]=pc[c[(c[d>>2]|0)+16>>2]&127](n)|0;nc[c[(c[d>>2]|0)+20>>2]&63](a,n);Yd(c[b>>2]|0)|0;i=f;return}}function fh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+40|0;h=g;j=g+16|0;k=g+32|0;Qe(k,b);b=k;k=c[b>>2]|0;if(!((c[1280]|0)==-1)){c[j>>2]=5120;c[j+4>>2]=118;c[j+8>>2]=0;qe(5120,j,119)}j=(c[5124>>2]|0)+ -1|0;l=c[k+8>>2]|0;if(!((c[k+12>>2]|0)-l>>2>>>0>j>>>0)){m=vb(4)|0;n=m;pm(n);cc(m|0,13088,107)}k=c[l+(j<<2)>>2]|0;if((k|0)==0){m=vb(4)|0;n=m;pm(n);cc(m|0,13088,107)}vc[c[(c[k>>2]|0)+48>>2]&7](k,3672,3704|0,d)|0;d=c[b>>2]|0;if(!((c[1320]|0)==-1)){c[h>>2]=5280;c[h+4>>2]=118;c[h+8>>2]=0;qe(5280,h,119)}h=(c[5284>>2]|0)+ -1|0;k=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-k>>2>>>0>h>>>0)){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}d=c[k+(h<<2)>>2]|0;if((d|0)==0){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}else{o=d;p=d;c[e>>2]=pc[c[(c[p>>2]|0)+12>>2]&127](o)|0;c[f>>2]=pc[c[(c[p>>2]|0)+16>>2]&127](o)|0;nc[c[(c[d>>2]|0)+20>>2]&63](a,o);Yd(c[b>>2]|0)|0;i=g;return}}function gh(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if((b|0)==(h|0)){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}do{if((b|0)==(j|0)){h=a[k]|0;if((h&1)==0){s=(h&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)==0){break}if((a[d]|0)==0){q=-1;i=p;return q|0}h=c[m>>2]|0;if((h-l|0)>=160){q=0;i=p;return q|0}r=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=r;c[n>>2]=0;q=0;i=p;return q|0}}while(0);s=o+128|0;j=o;while(1){r=j+4|0;if((c[j>>2]|0)==(b|0)){t=j;break}if((r|0)==(s|0)){t=s;break}else{j=r}}j=t-o|0;o=j>>2;if((j|0)>124){q=-1;i=p;return q|0}t=a[3672+o|0]|0;do{if((o|0)==24|(o|0)==25){s=c[g>>2]|0;do{if((s|0)!=(f|0)){if((a[s+ -1|0]&95|0)==(a[e]&127|0)){break}else{q=-1}i=p;return q|0}}while(0);c[g>>2]=s+1;a[s]=t;q=0;i=p;return q|0}else if((o|0)==23|(o|0)==22){a[e]=80}else{b=t&95;if((b|0)!=(a[e]|0)){break}a[e]=b|128;if((a[d]|0)==0){break}a[d]=0;b=a[k]|0;if((b&1)==0){u=(b&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)==0){break}b=c[m>>2]|0;if((b-l|0)>=160){break}r=c[n>>2]|0;c[m>>2]=b+4;c[b>>2]=r}}while(0);m=c[g>>2]|0;c[g>>2]=m+1;a[m]=t;if((j|0)>84){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}function hh(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function ih(a){a=a|0;i=i;return}function jh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;j=i;i=i+56|0;k=j;l=j+8|0;m=j+24|0;n=j+32|0;o=j+40|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];q=h&1;r=k;s=m;c[r+0>>2]=c[s+0>>2];xc[p&31](b,d,k,f,g,q);i=j;return}Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1318]|0)==-1)){c[l>>2]=5272;c[l+4>>2]=118;c[l+8>>2]=0;qe(5272,l,119)}l=(c[5276>>2]|0)+ -1|0;q=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-q>>2>>>0>l>>>0)){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}n=c[q+(l<<2)>>2]|0;if((n|0)==0){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}t=n;Yd(c[f>>2]|0)|0;f=c[n>>2]|0;if(h){nc[c[f+24>>2]&63](o,t)}else{nc[c[f+28>>2]&63](o,t)}t=o;f=a[t]|0;if((f&1)==0){h=o+1|0;v=h;w=h;x=o+8|0}else{h=o+8|0;v=c[h>>2]|0;w=o+1|0;x=h}h=e;e=o+4|0;n=f;f=v;while(1){if((n&1)==0){y=w;z=(n&255)>>>1}else{y=c[x>>2]|0;z=c[e>>2]|0}if((f|0)==(y+z|0)){break}v=a[f]|0;u=c[h>>2]|0;do{if((u|0)!=0){l=u+24|0;q=c[l>>2]|0;if((q|0)!=(c[u+28>>2]|0)){c[l>>2]=q+1;a[q]=v;break}if(!((yc[c[(c[u>>2]|0)+52>>2]&31](u,v&255)|0)==-1)){break}c[h>>2]=0}}while(0);n=a[t]|0;f=f+1|0}c[b>>2]=c[h>>2];ve(o);i=j;return}function kh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+24|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3920|0]|0;a[s+1|0]=a[3921|0]|0;a[s+2|0]=a[3922|0]|0;a[s+3|0]=a[3923|0]|0;a[s+4|0]=a[3924|0]|0;a[s+5|0]=a[3925|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=100}}while(0);w=m;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);v=c[1254]|0;c[k>>2]=h;h=lh(w,12,v,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;Qe(q,f);mh(w,y,k,z,o,p,q);Yd(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];ad(b,j,z,e,o,f,g);i=d;return}function lh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;i=i+16|0;h=g;c[h>>2]=f;f=zb(d|0)|0;d=lb(a|0,b|0,e|0,h|0)|0;if((f|0)==0){i=g;return d|0}zb(f|0)|0;i=g;return d|0}function mh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}q=j;r=c[o>>2]|0;if(!((c[1318]|0)==-1)){c[l>>2]=5272;c[l+4>>2]=118;c[l+8>>2]=0;qe(5272,l,119)}l=(c[5276>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}s=r;nc[c[(c[r>>2]|0)+20>>2]&63](n,s);t=n;l=a[t]|0;if((l&1)==0){u=(l&255)>>>1}else{u=c[n+4>>2]|0}do{if((u|0)==0){vc[c[(c[j>>2]|0)+32>>2]&7](q,b,e,f)|0;c[h>>2]=f+(e-b)}else{c[h>>2]=f;l=a[b]|0;if(l<<24>>24==43|l<<24>>24==45){o=yc[c[(c[j>>2]|0)+28>>2]&31](q,l)|0;l=c[h>>2]|0;c[h>>2]=l+1;a[l]=o;v=b+1|0}else{v=b}do{if((e-v|0)>1){if((a[v]|0)!=48){w=v;break}o=v+1|0;l=a[o]|0;if(!(l<<24>>24==88|l<<24>>24==120)){w=v;break}l=j;m=yc[c[(c[l>>2]|0)+28>>2]&31](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=m;m=yc[c[(c[l>>2]|0)+28>>2]&31](q,a[o]|0)|0;o=c[h>>2]|0;c[h>>2]=o+1;a[o]=m;w=v+2|0}else{w=v}}while(0);do{if((w|0)!=(e|0)){m=e+ -1|0;if(m>>>0>w>>>0){x=w;y=m}else{break}do{m=a[x]|0;a[x]=a[y]|0;a[y]=m;x=x+1|0;y=y+ -1|0;}while(x>>>0<y>>>0)}}while(0);m=pc[c[(c[r>>2]|0)+16>>2]&127](s)|0;if(w>>>0<e>>>0){o=n+1|0;l=j;p=n+4|0;z=n+8|0;A=0;B=0;C=w;while(1){D=(a[t]&1)==0;do{if((a[(D?o:c[z>>2]|0)+B|0]|0)==0){E=A;F=B}else{if((A|0)!=(a[(D?o:c[z>>2]|0)+B|0]|0)){E=A;F=B;break}G=c[h>>2]|0;c[h>>2]=G+1;a[G]=m;G=a[t]|0;if((G&1)==0){H=(G&255)>>>1}else{H=c[p>>2]|0}E=0;F=(B>>>0<(H+ -1|0)>>>0)+B|0}}while(0);D=yc[c[(c[l>>2]|0)+28>>2]&31](q,a[C]|0)|0;G=c[h>>2]|0;c[h>>2]=G+1;a[G]=D;D=C+1|0;if(D>>>0<e>>>0){A=E+1|0;B=F;C=D}else{break}}}C=f+(w-b)|0;B=c[h>>2]|0;if((C|0)==(B|0)){break}A=B+ -1|0;if(A>>>0>C>>>0){I=C;J=A}else{break}do{A=a[I]|0;a[I]=a[J]|0;a[J]=A;I=I+1|0;J=J+ -1|0;}while(I>>>0<J>>>0)}}while(0);if((d|0)==(e|0)){K=c[h>>2]|0;c[g>>2]=K;ve(n);i=k;return}else{K=f+(d-b)|0;c[g>>2]=K;ve(n);i=k;return}}function nh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+48|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=100}}while(0);w=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);x=c[1254]|0;v=l;c[v>>2]=h;c[v+4>>2]=j;j=lh(w,22,x,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==32){y=l}else if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=o;Qe(r,f);mh(w,y,l,z,p,q,r);Yd(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];ad(b,k,z,e,p,f,g);i=d;return}function oh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+24|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3920|0]|0;a[s+1|0]=a[3921|0]|0;a[s+2|0]=a[3922|0]|0;a[s+3|0]=a[3923|0]|0;a[s+4|0]=a[3924|0]|0;a[s+5|0]=a[3925|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=117}}while(0);w=m;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);v=c[1254]|0;c[k>>2]=h;h=lh(w,12,v,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else if((s|0)==32){y=k}else{z=20}}while(0);if((z|0)==20){y=w}z=n;Qe(q,f);mh(w,y,k,z,o,p,q);Yd(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];ad(b,j,z,e,o,f,g);i=d;return}function ph(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+48|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=117}}while(0);w=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);x=c[1254]|0;v=l;c[v>>2]=h;c[v+4>>2]=j;j=lh(w,23,x,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==32){y=l}else if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=o;Qe(r,f);mh(w,y,l,z,p,q,r);Yd(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];ad(b,k,z,e,p,f,g);i=d;return}function qh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+24|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+64|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){if((q&1|0)==0){a[D]=97;E=0;break}else{a[D]=65;E=0;break}}else{a[D]=46;B=D+2|0;a[D+1|0]=42;if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=lh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=lh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5024]|0)==0;if(E){do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=rh(s,r,z,n)|0}else{do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;c[m>>2]=c[f+8>>2];r=m+4|0;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=rh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}Wm()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==32){K=F}else if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Km(J<<1)|0;if((L|0)!=0){M=H;N=L;O=L;break}Wm()}}while(0);Qe(w,f);sh(M,K,F,O,u,v,w);Yd(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];ad(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Lm(N)}if((I|0)==0){i=d;return}Lm(I);i=d;return}function rh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=zb(b|0)|0;b=kb(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}zb(e|0)|0;i=f;return b|0}function sh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}q=j;r=c[o>>2]|0;if(!((c[1318]|0)==-1)){c[l>>2]=5272;c[l+4>>2]=118;c[l+8>>2]=0;qe(5272,l,119)}l=(c[5276>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}s=r;nc[c[(c[r>>2]|0)+20>>2]&63](n,s);c[h>>2]=f;t=a[b]|0;if(t<<24>>24==43|t<<24>>24==45){l=yc[c[(c[j>>2]|0)+28>>2]&31](q,t)|0;t=c[h>>2]|0;c[h>>2]=t+1;a[t]=l;u=b+1|0}else{u=b}l=e;a:do{if((l-u|0)>1){if((a[u]|0)!=48){v=14;break}t=u+1|0;o=a[t]|0;if(!(o<<24>>24==88|o<<24>>24==120)){v=14;break}o=j;m=yc[c[(c[o>>2]|0)+28>>2]&31](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=m;m=u+2|0;p=yc[c[(c[o>>2]|0)+28>>2]&31](q,a[t]|0)|0;t=c[h>>2]|0;c[h>>2]=t+1;a[t]=p;if(m>>>0<e>>>0){w=m}else{x=m;y=m;break}while(1){p=a[w]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);t=w+1|0;if((bb(p<<24>>24|0,c[1254]|0)|0)==0){x=m;y=w;break a}if(t>>>0<e>>>0){w=t}else{x=m;y=t;break}}}else{v=14}}while(0);b:do{if((v|0)==14){if(u>>>0<e>>>0){z=u}else{x=u;y=u;break}while(1){w=a[z]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);p=z+1|0;if((gb(w<<24>>24|0,c[1254]|0)|0)==0){x=u;y=z;break b}if(p>>>0<e>>>0){z=p}else{x=u;y=p;break}}}}while(0);u=n;z=a[u]|0;if((z&1)==0){A=(z&255)>>>1}else{A=c[n+4>>2]|0}do{if((A|0)==0){vc[c[(c[j>>2]|0)+32>>2]&7](q,x,y,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(y-x)}else{do{if((x|0)!=(y|0)){z=y+ -1|0;if(z>>>0>x>>>0){B=x;C=z}else{break}do{z=a[B]|0;a[B]=a[C]|0;a[C]=z;B=B+1|0;C=C+ -1|0;}while(B>>>0<C>>>0)}}while(0);w=pc[c[(c[r>>2]|0)+16>>2]&127](s)|0;if(x>>>0<y>>>0){z=n+1|0;v=n+4|0;p=n+8|0;m=j;t=0;o=0;D=x;while(1){E=(a[u]&1)==0;do{if((a[(E?z:c[p>>2]|0)+o|0]|0)>0){if((t|0)!=(a[(E?z:c[p>>2]|0)+o|0]|0)){F=t;G=o;break}H=c[h>>2]|0;c[h>>2]=H+1;a[H]=w;H=a[u]|0;if((H&1)==0){I=(H&255)>>>1}else{I=c[v>>2]|0}F=0;G=(o>>>0<(I+ -1|0)>>>0)+o|0}else{F=t;G=o}}while(0);E=yc[c[(c[m>>2]|0)+28>>2]&31](q,a[D]|0)|0;H=c[h>>2]|0;c[h>>2]=H+1;a[H]=E;E=D+1|0;if(E>>>0<y>>>0){t=F+1|0;o=G;D=E}else{break}}}D=f+(x-b)|0;o=c[h>>2]|0;if((D|0)==(o|0)){break}t=o+ -1|0;if(t>>>0>D>>>0){J=D;K=t}else{break}do{t=a[J]|0;a[J]=a[K]|0;a[K]=t;J=J+1|0;K=K+ -1|0;}while(J>>>0<K>>>0)}}while(0);c:do{if(y>>>0<e>>>0){K=j;J=y;while(1){x=a[J]|0;if(x<<24>>24==46){break}G=yc[c[(c[K>>2]|0)+28>>2]&31](q,x)|0;x=c[h>>2]|0;c[h>>2]=x+1;a[x]=G;G=J+1|0;if(G>>>0<e>>>0){J=G}else{L=G;break c}}K=pc[c[(c[r>>2]|0)+12>>2]&127](s)|0;G=c[h>>2]|0;c[h>>2]=G+1;a[G]=K;L=J+1|0}else{L=y}}while(0);vc[c[(c[j>>2]|0)+32>>2]&7](q,L,e,c[h>>2]|0)|0;q=(c[h>>2]|0)+(l-L)|0;c[h>>2]=q;if((d|0)==(e|0)){M=q;c[g>>2]=M;ve(n);i=k;return}M=f+(d-b)|0;c[g>>2]=M;ve(n);i=k;return}function th(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+64|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){a[D]=76;B=D+1|0;if((q&1|0)==0){a[B]=97;E=0;break}else{a[B]=65;E=0;break}}else{a[D]=46;a[D+1|0]=42;a[D+2|0]=76;B=D+3|0;if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=lh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=lh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5024]|0)==0;if(E){do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=rh(s,r,z,n)|0}else{do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;r=m;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=rh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}Wm()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else if((s|0)==32){K=F}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Km(J<<1)|0;if((L|0)!=0){M=H;N=L;O=L;break}Wm()}}while(0);Qe(w,f);sh(M,K,F,O,u,v,w);Yd(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];ad(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Lm(N)}if((I|0)==0){i=d;return}Lm(I);i=d;return}function uh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+16|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+40|0;p=i;i=i+8|0;q=i;i=i+8|0;r=m;a[r+0|0]=a[3928|0]|0;a[r+1|0]=a[3929|0]|0;a[r+2|0]=a[3930|0]|0;a[r+3|0]=a[3931|0]|0;a[r+4|0]=a[3932|0]|0;a[r+5|0]=a[3933|0]|0;m=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);s=c[1254]|0;c[k>>2]=h;h=lh(m,20,s,r,k)|0;k=n+h|0;r=c[f+4>>2]&176;do{if((r|0)==32){t=k}else if((r|0)==16){s=a[m]|0;if(s<<24>>24==43|s<<24>>24==45){t=n+1|0;break}if(!((h|0)>1&s<<24>>24==48)){u=10;break}s=a[n+1|0]|0;if(!(s<<24>>24==88|s<<24>>24==120)){u=10;break}t=n+2|0}else{u=10}}while(0);if((u|0)==10){t=m}u=o;Qe(p,f);r=p;p=c[r>>2]|0;if(!((c[1282]|0)==-1)){c[l>>2]=5128;c[l+4>>2]=118;c[l+8>>2]=0;qe(5128,l,119)}l=(c[5132>>2]|0)+ -1|0;s=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-s>>2>>>0>l>>>0)){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}p=c[s+(l<<2)>>2]|0;if((p|0)==0){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}Yd(c[r>>2]|0)|0;vc[c[(c[p>>2]|0)+32>>2]&7](p,m,k,u)|0;m=o+h|0;if((t|0)==(k|0)){x=m;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];ad(b,j,u,x,m,f,g);E=j;i=d;return}x=o+(t-n)|0;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];ad(b,j,u,x,m,f,g);E=j;i=d;return}function vh(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function wh(a){a=a|0;i=i;return}function xh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;j=i;i=i+56|0;k=j;l=j+8|0;m=j+24|0;n=j+32|0;o=j+40|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[m>>2]=c[e>>2];q=h&1;r=k;s=m;c[r+0>>2]=c[s+0>>2];xc[p&31](b,d,k,f,g,q);i=j;return}Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1320]|0)==-1)){c[l>>2]=5280;c[l+4>>2]=118;c[l+8>>2]=0;qe(5280,l,119)}l=(c[5284>>2]|0)+ -1|0;q=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-q>>2>>>0>l>>>0)){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}n=c[q+(l<<2)>>2]|0;if((n|0)==0){t=vb(4)|0;u=t;pm(u);cc(t|0,13088,107)}t=n;Yd(c[f>>2]|0)|0;f=c[n>>2]|0;if(h){nc[c[f+24>>2]&63](o,t)}else{nc[c[f+28>>2]&63](o,t)}t=o;f=a[t]|0;if((f&1)==0){h=o+4|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=c[h>>2]|0;w=h;x=o+4|0}h=e;e=f;f=v;while(1){if((e&1)==0){y=x;z=(e&255)>>>1}else{y=c[w>>2]|0;z=c[x>>2]|0}if((f|0)==(y+(z<<2)|0)){break}v=c[f>>2]|0;n=c[h>>2]|0;do{if((n|0)!=0){u=n+24|0;l=c[u>>2]|0;if((l|0)==(c[n+28>>2]|0)){A=yc[c[(c[n>>2]|0)+52>>2]&31](n,v)|0}else{c[u>>2]=l+4;c[l>>2]=v;A=v}if(!((A|0)==-1)){break}c[h>>2]=0}}while(0);e=a[t]|0;f=f+4|0}c[b>>2]=c[h>>2];He(o);i=j;return}function yh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+88|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3920|0]|0;a[s+1|0]=a[3921|0]|0;a[s+2|0]=a[3922|0]|0;a[s+3|0]=a[3923|0]|0;a[s+4|0]=a[3924|0]|0;a[s+5|0]=a[3925|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=100}}while(0);w=m;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);x=c[1254]|0;c[k>>2]=h;h=lh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==32){y=k}else if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=n;Qe(q,f);zh(w,y,k,z,o,p,q);Yd(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];Ah(b,j,z,e,o,f,g);i=d;return}function zh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1280]|0)==-1)){c[m>>2]=5120;c[m+4>>2]=118;c[m+8>>2]=0;qe(5120,m,119)}m=(c[5124>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}q=j;r=c[o>>2]|0;if(!((c[1320]|0)==-1)){c[l>>2]=5280;c[l+4>>2]=118;c[l+8>>2]=0;qe(5280,l,119)}l=(c[5284>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}s=r;nc[c[(c[r>>2]|0)+20>>2]&63](n,s);t=n;l=a[t]|0;if((l&1)==0){u=(l&255)>>>1}else{u=c[n+4>>2]|0}do{if((u|0)==0){vc[c[(c[j>>2]|0)+48>>2]&7](q,b,e,f)|0;l=f+(e-b<<2)|0;c[h>>2]=l;v=l}else{c[h>>2]=f;l=a[b]|0;if(l<<24>>24==43|l<<24>>24==45){o=yc[c[(c[j>>2]|0)+44>>2]&31](q,l)|0;l=c[h>>2]|0;c[h>>2]=l+4;c[l>>2]=o;w=b+1|0}else{w=b}do{if((e-w|0)>1){if((a[w]|0)!=48){x=w;break}o=w+1|0;l=a[o]|0;if(!(l<<24>>24==88|l<<24>>24==120)){x=w;break}l=j;m=yc[c[(c[l>>2]|0)+44>>2]&31](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=m;m=yc[c[(c[l>>2]|0)+44>>2]&31](q,a[o]|0)|0;o=c[h>>2]|0;c[h>>2]=o+4;c[o>>2]=m;x=w+2|0}else{x=w}}while(0);do{if((x|0)!=(e|0)){m=e+ -1|0;if(m>>>0>x>>>0){y=x;z=m}else{break}do{m=a[y]|0;a[y]=a[z]|0;a[z]=m;y=y+1|0;z=z+ -1|0;}while(y>>>0<z>>>0)}}while(0);m=pc[c[(c[r>>2]|0)+16>>2]&127](s)|0;if(x>>>0<e>>>0){o=n+1|0;l=j;p=n+4|0;A=n+8|0;B=0;C=0;D=x;while(1){E=(a[t]&1)==0;do{if((a[(E?o:c[A>>2]|0)+C|0]|0)==0){F=B;G=C}else{if((B|0)!=(a[(E?o:c[A>>2]|0)+C|0]|0)){F=B;G=C;break}H=c[h>>2]|0;c[h>>2]=H+4;c[H>>2]=m;H=a[t]|0;if((H&1)==0){I=(H&255)>>>1}else{I=c[p>>2]|0}F=0;G=(C>>>0<(I+ -1|0)>>>0)+C|0}}while(0);E=yc[c[(c[l>>2]|0)+44>>2]&31](q,a[D]|0)|0;H=c[h>>2]|0;J=H+4|0;c[h>>2]=J;c[H>>2]=E;E=D+1|0;if(E>>>0<e>>>0){B=F+1|0;C=G;D=E}else{K=J;break}}}else{K=c[h>>2]|0}D=f+(x-b<<2)|0;if((D|0)==(K|0)){v=K;break}C=K+ -4|0;if(C>>>0>D>>>0){L=D;M=C}else{v=K;break}while(1){C=c[L>>2]|0;c[L>>2]=c[M>>2];c[M>>2]=C;C=L+4|0;D=M+ -4|0;if(C>>>0<D>>>0){M=D;L=C}else{v=K;break}}}}while(0);if((d|0)==(e|0)){N=v;c[g>>2]=N;ve(n);i=k;return}N=f+(d-b<<2)|0;c[g>>2]=N;ve(n);i=k;return}function Ah(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=k;m=d;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;do{if((h|0)>0){if((jc[c[(c[d>>2]|0)+48>>2]&31](d,e,g)|0)==(g|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){Ge(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((jc[c[(c[d>>2]|0)+48>>2]&31](d,r,q)|0)==(q|0)){He(l);break}c[m>>2]=0;c[b>>2]=0;He(l);i=k;return}}while(0);l=n-o|0;o=l>>2;do{if((l|0)>0){if((jc[c[(c[d>>2]|0)+48>>2]&31](d,f,o)|0)==(o|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function Bh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+168|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=100}}while(0);w=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);v=c[1254]|0;x=l;c[x>>2]=h;c[x+4>>2]=j;j=lh(w,22,v,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==32){y=l}else if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=o;Qe(r,f);zh(w,y,l,z,p,q,r);Yd(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];Ah(b,k,z,e,p,f,g);i=d;return}function Ch(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+8|0;m=i;i=i+16|0;n=i;i=i+88|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=l;a[s+0|0]=a[3920|0]|0;a[s+1|0]=a[3921|0]|0;a[s+2|0]=a[3922|0]|0;a[s+3|0]=a[3923|0]|0;a[s+4|0]=a[3924|0]|0;a[s+5|0]=a[3925|0]|0;t=l+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=t}else{a[t]=43;w=l+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}a[x]=108;w=x+1|0;x=v&74;do{if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else if((x|0)==64){a[w]=111}else{a[w]=117}}while(0);w=m;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);x=c[1254]|0;c[k>>2]=h;h=lh(w,12,x,s,k)|0;k=m+h|0;s=c[u>>2]&176;do{if((s|0)==32){y=k}else if((s|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=m+1|0;break}if(!((h|0)>1&u<<24>>24==48)){z=20;break}u=a[m+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=m+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=n;Qe(q,f);zh(w,y,k,z,o,p,q);Yd(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;p=j;q=r;c[p+0>>2]=c[q+0>>2];Ah(b,j,z,e,o,f,g);i=d;return}function Dh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+16|0;k=d;l=d+8|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+176|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=m;c[t>>2]=37;c[t+4>>2]=0;t=m;m=t+1|0;u=f+4|0;v=c[u>>2]|0;if((v&2048|0)==0){w=m}else{a[m]=43;w=t+2|0}if((v&512|0)==0){x=w}else{a[w]=35;x=w+1|0}w=x+2|0;a[x]=108;a[x+1|0]=108;x=v&74;do{if((x|0)==64){a[w]=111}else if((x|0)==8){if((v&16384|0)==0){a[w]=120;break}else{a[w]=88;break}}else{a[w]=117}}while(0);w=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);v=c[1254]|0;x=l;c[x>>2]=h;c[x+4>>2]=j;j=lh(w,23,v,t,l)|0;l=n+j|0;t=c[u>>2]&176;do{if((t|0)==32){y=l}else if((t|0)==16){u=a[w]|0;if(u<<24>>24==43|u<<24>>24==45){y=n+1|0;break}if(!((j|0)>1&u<<24>>24==48)){z=20;break}u=a[n+1|0]|0;if(!(u<<24>>24==88|u<<24>>24==120)){z=20;break}y=n+2|0}else{z=20}}while(0);if((z|0)==20){y=w}z=o;Qe(r,f);zh(w,y,l,z,p,q,r);Yd(c[r>>2]|0)|0;c[s>>2]=c[e>>2];e=c[p>>2]|0;p=c[q>>2]|0;q=k;r=s;c[q+0>>2]=c[r+0>>2];Ah(b,k,z,e,p,f,g);i=d;return}function Eh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+24|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+232|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){if((q&1|0)==0){a[D]=97;E=0;break}else{a[D]=65;E=0;break}}else{a[D]=46;B=D+2|0;a[D+1|0]=42;if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=lh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=lh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5024]|0)==0;if(E){do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=rh(s,r,z,n)|0}else{do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;c[m>>2]=c[f+8>>2];r=m+4|0;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=rh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}Wm()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==32){K=F}else if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Km(J<<3)|0;s=L;if((L|0)!=0){M=H;N=s;O=s;break}Wm()}}while(0);Qe(w,f);Fh(M,K,F,O,u,v,w);Yd(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];Ah(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Lm(N)}if((I|0)==0){i=d;return}Lm(I);i=d;return}function Fh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;k=i;i=i+48|0;l=k;m=k+16|0;n=k+32|0;o=j;j=c[o>>2]|0;if(!((c[1280]|0)==-1)){c[m>>2]=5120;c[m+4>>2]=118;c[m+8>>2]=0;qe(5120,m,119)}m=(c[5124>>2]|0)+ -1|0;p=c[j+8>>2]|0;if(!((c[j+12>>2]|0)-p>>2>>>0>m>>>0)){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}j=c[p+(m<<2)>>2]|0;if((j|0)==0){q=vb(4)|0;r=q;pm(r);cc(q|0,13088,107)}q=j;r=c[o>>2]|0;if(!((c[1320]|0)==-1)){c[l>>2]=5280;c[l+4>>2]=118;c[l+8>>2]=0;qe(5280,l,119)}l=(c[5284>>2]|0)+ -1|0;o=c[r+8>>2]|0;if(!((c[r+12>>2]|0)-o>>2>>>0>l>>>0)){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}r=c[o+(l<<2)>>2]|0;if((r|0)==0){s=vb(4)|0;t=s;pm(t);cc(s|0,13088,107)}s=r;nc[c[(c[r>>2]|0)+20>>2]&63](n,s);c[h>>2]=f;t=a[b]|0;if(t<<24>>24==43|t<<24>>24==45){l=yc[c[(c[j>>2]|0)+44>>2]&31](q,t)|0;t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=l;u=b+1|0}else{u=b}l=e;a:do{if((l-u|0)>1){if((a[u]|0)!=48){v=14;break}t=u+1|0;o=a[t]|0;if(!(o<<24>>24==88|o<<24>>24==120)){v=14;break}o=j;m=yc[c[(c[o>>2]|0)+44>>2]&31](q,48)|0;p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=m;m=u+2|0;p=yc[c[(c[o>>2]|0)+44>>2]&31](q,a[t]|0)|0;t=c[h>>2]|0;c[h>>2]=t+4;c[t>>2]=p;if(m>>>0<e>>>0){w=m}else{x=m;y=m;break}while(1){p=a[w]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);t=w+1|0;if((bb(p<<24>>24|0,c[1254]|0)|0)==0){x=m;y=w;break a}if(t>>>0<e>>>0){w=t}else{x=m;y=t;break}}}else{v=14}}while(0);b:do{if((v|0)==14){if(u>>>0<e>>>0){z=u}else{x=u;y=u;break}while(1){w=a[z]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);p=z+1|0;if((gb(w<<24>>24|0,c[1254]|0)|0)==0){x=u;y=z;break b}if(p>>>0<e>>>0){z=p}else{x=u;y=p;break}}}}while(0);u=n;z=a[u]|0;if((z&1)==0){A=(z&255)>>>1}else{A=c[n+4>>2]|0}do{if((A|0)==0){vc[c[(c[j>>2]|0)+48>>2]&7](q,x,y,c[h>>2]|0)|0;z=(c[h>>2]|0)+(y-x<<2)|0;c[h>>2]=z;B=z}else{do{if((x|0)!=(y|0)){z=y+ -1|0;if(z>>>0>x>>>0){C=x;D=z}else{break}do{z=a[C]|0;a[C]=a[D]|0;a[D]=z;C=C+1|0;D=D+ -1|0;}while(C>>>0<D>>>0)}}while(0);w=pc[c[(c[r>>2]|0)+16>>2]&127](s)|0;if(x>>>0<y>>>0){z=n+1|0;v=n+4|0;p=n+8|0;m=j;t=0;o=0;E=x;while(1){F=(a[u]&1)==0;do{if((a[(F?z:c[p>>2]|0)+o|0]|0)>0){if((t|0)!=(a[(F?z:c[p>>2]|0)+o|0]|0)){G=t;H=o;break}I=c[h>>2]|0;c[h>>2]=I+4;c[I>>2]=w;I=a[u]|0;if((I&1)==0){J=(I&255)>>>1}else{J=c[v>>2]|0}G=0;H=(o>>>0<(J+ -1|0)>>>0)+o|0}else{G=t;H=o}}while(0);F=yc[c[(c[m>>2]|0)+44>>2]&31](q,a[E]|0)|0;I=c[h>>2]|0;K=I+4|0;c[h>>2]=K;c[I>>2]=F;F=E+1|0;if(F>>>0<y>>>0){t=G+1|0;o=H;E=F}else{L=K;break}}}else{L=c[h>>2]|0}E=f+(x-b<<2)|0;if((E|0)==(L|0)){B=L;break}o=L+ -4|0;if(o>>>0>E>>>0){M=E;N=o}else{B=L;break}while(1){o=c[M>>2]|0;c[M>>2]=c[N>>2];c[N>>2]=o;o=M+4|0;E=N+ -4|0;if(o>>>0<E>>>0){N=E;M=o}else{B=L;break}}}}while(0);c:do{if(y>>>0<e>>>0){L=j;M=y;while(1){N=a[M]|0;if(N<<24>>24==46){break}x=yc[c[(c[L>>2]|0)+44>>2]&31](q,N)|0;N=c[h>>2]|0;H=N+4|0;c[h>>2]=H;c[N>>2]=x;x=M+1|0;if(x>>>0<e>>>0){M=x}else{O=H;P=x;break c}}L=pc[c[(c[r>>2]|0)+12>>2]&127](s)|0;x=c[h>>2]|0;H=x+4|0;c[h>>2]=H;c[x>>2]=L;O=H;P=M+1|0}else{O=B;P=y}}while(0);vc[c[(c[j>>2]|0)+48>>2]&7](q,P,e,O)|0;O=(c[h>>2]|0)+(l-P<<2)|0;c[h>>2]=O;if((d|0)==(e|0)){Q=O;c[g>>2]=Q;ve(n);i=k;return}Q=f+(d-b<<2)|0;c[g>>2]=Q;ve(n);i=k;return}function Gh(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+8|0;r=i;i=i+32|0;s=i;i=i+8|0;t=i;i=i+232|0;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;z=q;c[z>>2]=37;c[z+4>>2]=0;z=q;q=z+1|0;A=f+4|0;B=c[A>>2]|0;if((B&2048|0)==0){C=q}else{a[q]=43;C=z+2|0}if((B&1024|0)==0){D=C}else{a[C]=35;D=C+1|0}C=B&260;q=B>>>14;do{if((C|0)==260){a[D]=76;B=D+1|0;if((q&1|0)==0){a[B]=97;E=0;break}else{a[B]=65;E=0;break}}else{a[D]=46;a[D+1|0]=42;a[D+2|0]=76;B=D+3|0;if((C|0)==256){if((q&1|0)==0){a[B]=101;E=1;break}else{a[B]=69;E=1;break}}else if((C|0)==4){if((q&1|0)==0){a[B]=102;E=1;break}else{a[B]=70;E=1;break}}else{if((q&1|0)==0){a[B]=103;E=1;break}else{a[B]=71;E=1;break}}}}while(0);q=r;c[s>>2]=q;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;if(E){c[p>>2]=c[f+8>>2];C=p+4|0;h[k>>3]=j;c[C>>2]=c[k>>2];c[C+4>>2]=c[k+4>>2];F=lh(q,30,r,z,p)|0}else{p=o;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];F=lh(q,30,r,z,o)|0}do{if((F|0)>29){o=(a[5024]|0)==0;if(E){do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);r=c[1254]|0;c[n>>2]=c[f+8>>2];p=n+4|0;h[k>>3]=j;c[p>>2]=c[k>>2];c[p+4>>2]=c[k+4>>2];G=rh(s,r,z,n)|0}else{do{if(o){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;r=m;h[k>>3]=j;c[r>>2]=c[k>>2];c[r+4>>2]=c[k+4>>2];G=rh(s,o,z,m)|0}o=c[s>>2]|0;if((o|0)!=0){H=o;I=o;J=G;break}Wm()}else{H=c[s>>2]|0;I=0;J=F}}while(0);F=H+J|0;s=c[A>>2]&176;do{if((s|0)==16){A=a[H]|0;if(A<<24>>24==43|A<<24>>24==45){K=H+1|0;break}if(!((J|0)>1&A<<24>>24==48)){L=44;break}A=a[H+1|0]|0;if(!(A<<24>>24==88|A<<24>>24==120)){L=44;break}K=H+2|0}else if((s|0)==32){K=F}else{L=44}}while(0);if((L|0)==44){K=H}do{if((H|0)==(q|0)){M=q;N=0;O=t}else{L=Km(J<<3)|0;s=L;if((L|0)!=0){M=H;N=s;O=s;break}Wm()}}while(0);Qe(w,f);Fh(M,K,F,O,u,v,w);Yd(c[w>>2]|0)|0;w=e;c[y>>2]=c[w>>2];e=c[u>>2]|0;u=c[v>>2]|0;v=l;F=y;c[v+0>>2]=c[F+0>>2];Ah(x,l,O,e,u,f,g);g=c[x>>2]|0;c[w>>2]=g;c[b>>2]=g;if((N|0)!=0){Lm(N)}if((I|0)==0){i=d;return}Lm(I);i=d;return}function Hh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+16|0;j=d;k=d+8|0;l=i;i=i+16|0;m=i;i=i+8|0;n=i;i=i+24|0;o=i;i=i+152|0;p=i;i=i+8|0;q=i;i=i+8|0;r=m;a[r+0|0]=a[3928|0]|0;a[r+1|0]=a[3929|0]|0;a[r+2|0]=a[3930|0]|0;a[r+3|0]=a[3931|0]|0;a[r+4|0]=a[3932|0]|0;a[r+5|0]=a[3933|0]|0;m=n;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);s=c[1254]|0;c[k>>2]=h;h=lh(m,20,s,r,k)|0;k=n+h|0;r=c[f+4>>2]&176;do{if((r|0)==16){s=a[m]|0;if(s<<24>>24==43|s<<24>>24==45){t=n+1|0;break}if(!((h|0)>1&s<<24>>24==48)){u=10;break}s=a[n+1|0]|0;if(!(s<<24>>24==88|s<<24>>24==120)){u=10;break}t=n+2|0}else if((r|0)==32){t=k}else{u=10}}while(0);if((u|0)==10){t=m}Qe(p,f);u=p;p=c[u>>2]|0;if(!((c[1280]|0)==-1)){c[l>>2]=5120;c[l+4>>2]=118;c[l+8>>2]=0;qe(5120,l,119)}l=(c[5124>>2]|0)+ -1|0;r=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-r>>2>>>0>l>>>0)){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}p=c[r+(l<<2)>>2]|0;if((p|0)==0){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}Yd(c[u>>2]|0)|0;u=o;vc[c[(c[p>>2]|0)+48>>2]&7](p,m,k,u)|0;m=o+(h<<2)|0;if((t|0)==(k|0)){x=m;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];Ah(b,j,u,x,m,f,g);E=j;i=d;return}x=o+(t-n<<2)|0;y=e;z=c[y>>2]|0;A=q;c[A>>2]=z;B=j;C=j;D=q;c[C+0>>2]=c[D+0>>2];Ah(b,j,u,x,m,f,g);E=j;i=d;return}function Ih(e,f,g,h,j,k,l,m,n){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0;o=i;i=i+64|0;p=o;q=o+8|0;r=o+16|0;s=o+32|0;t=o+40|0;u=o+48|0;v=o+56|0;Qe(s,j);w=s;s=c[w>>2]|0;if(!((c[1282]|0)==-1)){c[r>>2]=5128;c[r+4>>2]=118;c[r+8>>2]=0;qe(5128,r,119)}r=(c[5132>>2]|0)+ -1|0;x=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-x>>2>>>0>r>>>0)){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}s=c[x+(r<<2)>>2]|0;if((s|0)==0){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}y=s;Yd(c[w>>2]|0)|0;c[k>>2]=0;w=g;a:do{if((m|0)==(n|0)){A=65}else{z=h;r=s;x=s+8|0;B=s;C=f;D=u;E=v;F=t;G=m;H=0;b:while(1){I=H;while(1){if((I|0)!=0){A=65;break a}J=c[w>>2]|0;do{if((J|0)==0){K=0}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){K=J;break}if(!((pc[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1)){K=J;break}c[w>>2]=0;K=0}}while(0);J=(K|0)==0;L=c[z>>2]|0;c:do{if((L|0)==0){A=19}else{do{if((c[L+12>>2]|0)==(c[L+16>>2]|0)){if(!((pc[c[(c[L>>2]|0)+36>>2]&127](L)|0)==-1)){break}c[z>>2]=0;A=19;break c}}while(0);if(J){M=L}else{A=20;break b}}}while(0);if((A|0)==19){A=0;if(J){A=20;break b}else{M=0}}if((jc[c[(c[r>>2]|0)+36>>2]&31](y,a[G]|0,0)|0)<<24>>24==37){A=22;break}L=a[G]|0;if(L<<24>>24>-1){N=c[x>>2]|0;if(!((b[N+(L<<24>>24<<1)>>1]&8192)==0)){O=G;A=33;break}}P=K+12|0;L=c[P>>2]|0;Q=K+16|0;if((L|0)==(c[Q>>2]|0)){R=pc[c[(c[K>>2]|0)+36>>2]&127](K)|0}else{R=d[L]|0}L=yc[c[(c[B>>2]|0)+12>>2]&31](y,R&255)|0;if(L<<24>>24==(yc[c[(c[B>>2]|0)+12>>2]&31](y,a[G]|0)|0)<<24>>24){A=60;break}c[k>>2]=4;I=4}d:do{if((A|0)==22){A=0;I=G+1|0;if((I|0)==(n|0)){A=23;break b}L=jc[c[(c[r>>2]|0)+36>>2]&31](y,a[I]|0,0)|0;if(L<<24>>24==48|L<<24>>24==69){S=G+2|0;if((S|0)==(n|0)){A=26;break b}T=S;U=jc[c[(c[r>>2]|0)+36>>2]&31](y,a[S]|0,0)|0;V=L}else{T=I;U=L;V=0}L=c[(c[C>>2]|0)+36>>2]|0;c[D>>2]=K;c[E>>2]=M;I=q;S=u;c[I+0>>2]=c[S+0>>2];S=p;I=v;c[S+0>>2]=c[I+0>>2];oc[L&3](t,f,q,p,j,k,l,U,V);c[w>>2]=c[F>>2];W=T+1|0}else if((A|0)==33){while(1){A=0;L=O+1|0;if((L|0)==(n|0)){X=n;break}I=a[L]|0;if(!(I<<24>>24>-1)){X=L;break}if((b[N+(I<<24>>24<<1)>>1]&8192)==0){X=L;break}else{O=L;A=33}}J=K;L=M;I=M;while(1){do{if((J|0)==0){Y=0}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){Y=J;break}if(!((pc[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1)){Y=J;break}c[w>>2]=0;Y=0}}while(0);S=(Y|0)==0;do{if((I|0)==0){Z=L;A=46}else{if((c[I+12>>2]|0)!=(c[I+16>>2]|0)){if(S){_=L;$=I;break}else{W=X;break d}}if((pc[c[(c[I>>2]|0)+36>>2]&127](I)|0)==-1){c[z>>2]=0;Z=0;A=46;break}else{if(S^(L|0)==0){_=L;$=L;break}else{W=X;break d}}}}while(0);if((A|0)==46){A=0;if(S){W=X;break d}else{_=Z;$=0}}aa=Y+12|0;ba=c[aa>>2]|0;ca=Y+16|0;if((ba|0)==(c[ca>>2]|0)){da=pc[c[(c[Y>>2]|0)+36>>2]&127](Y)|0}else{da=d[ba]|0}if(!((da&255)<<24>>24>-1)){W=X;break d}if((b[(c[x>>2]|0)+(da<<24>>24<<1)>>1]&8192)==0){W=X;break d}ba=c[aa>>2]|0;if((ba|0)==(c[ca>>2]|0)){pc[c[(c[Y>>2]|0)+40>>2]&127](Y)|0;J=Y;L=_;I=$;continue}else{c[aa>>2]=ba+1;J=Y;L=_;I=$;continue}}}else if((A|0)==60){A=0;I=c[P>>2]|0;if((I|0)==(c[Q>>2]|0)){pc[c[(c[K>>2]|0)+40>>2]&127](K)|0}else{c[P>>2]=I+1}W=G+1|0}}while(0);if((W|0)==(n|0)){A=65;break a}G=W;H=c[k>>2]|0}if((A|0)==20){c[k>>2]=4;ea=K;break}else if((A|0)==23){c[k>>2]=4;ea=K;break}else if((A|0)==26){c[k>>2]=4;ea=K;break}}}while(0);if((A|0)==65){ea=c[w>>2]|0}w=g;do{if((ea|0)==0){fa=0}else{if((c[ea+12>>2]|0)!=(c[ea+16>>2]|0)){fa=ea;break}if(!((pc[c[(c[ea>>2]|0)+36>>2]&127](ea)|0)==-1)){fa=ea;break}c[w>>2]=0;fa=0}}while(0);w=(fa|0)==0;ea=h;h=c[ea>>2]|0;e:do{if((h|0)==0){A=75}else{do{if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if(!((pc[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1)){break}c[ea>>2]=0;A=75;break e}}while(0);if(!w){break}ga=e;c[ga>>2]=fa;i=o;return}}while(0);do{if((A|0)==75){if(w){break}ga=e;c[ga>>2]=fa;i=o;return}}while(0);c[k>>2]=c[k>>2]|2;ga=e;c[ga>>2]=fa;i=o;return}function Jh(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Kh(a){a=a|0;i=i;return}function Lh(a){a=a|0;i=i;return 2}function Mh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=j;l=j+8|0;m=j+16|0;n=j+24|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=l;d=m;c[e+0>>2]=c[d+0>>2];d=k;e=n;c[d+0>>2]=c[e+0>>2];Ih(a,b,l,k,f,g,h,4032,4040|0);i=j;return}function Nh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+32|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=d+8|0;q=pc[c[(c[p>>2]|0)+20>>2]&127](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+1|0;s=q+1|0;t=(f&255)>>>1}else{f=c[q+8>>2]|0;r=f;s=f;t=c[q+4>>2]|0}q=r+t|0;t=m;r=n;c[t+0>>2]=c[r+0>>2];r=l;t=o;c[r+0>>2]=c[t+0>>2];Ih(b,d,m,l,g,h,j,s,q);i=k;return}function Oh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}p=n;Yd(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=pc[c[c[e>>2]>>2]&127](e)|0;c[l>>2]=f;f=b+168|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=jg(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=168){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+24>>2]=((g|0)/12|0|0)%7|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function Ph(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}p=n;Yd(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=pc[c[(c[e>>2]|0)+4>>2]&127](e)|0;c[l>>2]=f;f=b+288|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=jg(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=288){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+16>>2]=((g|0)/12|0|0)%12|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function Qh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+40|0;j=b;k=b+8|0;l=b+16|0;m=b+32|0;Qe(m,f);f=m;m=c[f>>2]|0;if(!((c[1282]|0)==-1)){c[l>>2]=5128;c[l+4>>2]=118;c[l+8>>2]=0;qe(5128,l,119)}l=(c[5132>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>l>>>0)){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}m=c[n+(l<<2)>>2]|0;if((m|0)==0){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}o=m;Yd(c[f>>2]|0)|0;f=h+20|0;c[k>>2]=c[e>>2];e=j;h=k;c[e+0>>2]=c[h+0>>2];h=Uh(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}if((h|0)<69){t=h+2e3|0}else{t=(h+ -69|0)>>>0<31?h+1900|0:h}c[f>>2]=t+ -1900;q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}function Rh(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0;l=i;i=i+576|0;m=l;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;_=l+320|0;$=l+328|0;aa=l+336|0;ba=l+344|0;ca=l+352|0;da=l+368|0;ea=l+376|0;fa=l+384|0;ga=l+392|0;ha=l+400|0;ia=l+408|0;ja=l+416|0;ka=l+424|0;la=l+432|0;ma=l+440|0;na=l+448|0;oa=l+456|0;pa=l+464|0;qa=l+472|0;ra=l+480|0;sa=l+488|0;ta=l+496|0;ua=l+504|0;va=l+512|0;wa=l+520|0;xa=l+528|0;ya=l+536|0;za=l+544|0;Aa=l+552|0;Ba=l+560|0;Ca=l+568|0;c[h>>2]=0;Qe(da,g);Da=da;da=c[Da>>2]|0;if(!((c[1282]|0)==-1)){c[ca>>2]=5128;c[ca+4>>2]=118;c[ca+8>>2]=0;qe(5128,ca,119)}ca=(c[5132>>2]|0)+ -1|0;Ea=c[da+8>>2]|0;if(!((c[da+12>>2]|0)-Ea>>2>>>0>ca>>>0)){Fa=vb(4)|0;Ga=Fa;pm(Ga);cc(Fa|0,13088,107)}da=c[Ea+(ca<<2)>>2]|0;if((da|0)==0){Fa=vb(4)|0;Ga=Fa;pm(Ga);cc(Fa|0,13088,107)}Fa=da;Yd(c[Da>>2]|0)|0;a:do{switch(k<<24>>24|0){case 106:{c[Y>>2]=c[f>>2];c[F+0>>2]=c[Y+0>>2];Da=Uh(e,F,h,Fa,3)|0;da=c[h>>2]|0;if((da&4|0)==0&(Da|0)<366){c[j+28>>2]=Da;break a}else{c[h>>2]=da|4;break a}break};case 104:case 66:case 98:{da=c[f>>2]|0;Da=d+8|0;Ga=pc[c[(c[Da>>2]|0)+4>>2]&127](Da)|0;c[aa>>2]=da;c[P+0>>2]=c[aa+0>>2];da=(jg(e,P,Ga,Ga+288|0,Fa,h,0)|0)-Ga|0;if((da|0)>=288){break a}c[j+16>>2]=((da|0)/12|0|0)%12|0;break};case 65:case 97:{da=c[f>>2]|0;Ga=d+8|0;Da=pc[c[c[Ga>>2]>>2]&127](Ga)|0;c[ba>>2]=da;c[Q+0>>2]=c[ba+0>>2];da=(jg(e,Q,Da,Da+168|0,Fa,h,0)|0)-Da|0;if((da|0)>=168){break a}c[j+24>>2]=((da|0)/12|0|0)%7|0;break};case 73:{da=j+8|0;c[Z>>2]=c[f>>2];c[G+0>>2]=c[Z+0>>2];Da=Uh(e,G,h,Fa,2)|0;Ga=c[h>>2]|0;do{if((Ga&4|0)==0){if(!((Da+ -1|0)>>>0<12)){break}c[da>>2]=Da;break a}}while(0);c[h>>2]=Ga|4;break};case 99:{Da=d+8|0;da=pc[c[(c[Da>>2]|0)+12>>2]&127](Da)|0;Da=e;c[fa>>2]=c[Da>>2];c[ga>>2]=c[f>>2];ca=a[da]|0;if((ca&1)==0){Ha=da+1|0;Ia=da+1|0;Ja=(ca&255)>>>1}else{ca=c[da+8>>2]|0;Ha=ca;Ia=ca;Ja=c[da+4>>2]|0}c[O+0>>2]=c[fa+0>>2];c[N+0>>2]=c[ga+0>>2];Ih(ea,d,O,N,g,h,j,Ia,Ha+Ja|0);c[Da>>2]=c[ea>>2];break};case 70:{Da=e;c[la>>2]=c[Da>>2];c[ma>>2]=c[f>>2];c[J+0>>2]=c[la+0>>2];c[I+0>>2]=c[ma+0>>2];Ih(ka,d,J,I,g,h,j,4048,4056|0);c[Da>>2]=c[ka>>2];break};case 68:{Da=e;c[ia>>2]=c[Da>>2];c[ja>>2]=c[f>>2];c[L+0>>2]=c[ia+0>>2];c[K+0>>2]=c[ja+0>>2];Ih(ha,d,L,K,g,h,j,4040,4048|0);c[Da>>2]=c[ha>>2];break};case 101:case 100:{Da=j+12|0;c[$>>2]=c[f>>2];c[M+0>>2]=c[$+0>>2];da=Uh(e,M,h,Fa,2)|0;ca=c[h>>2]|0;do{if((ca&4|0)==0){if(!((da+ -1|0)>>>0<31)){break}c[Da>>2]=da;break a}}while(0);c[h>>2]=ca|4;break};case 72:{c[_>>2]=c[f>>2];c[H+0>>2]=c[_+0>>2];da=Uh(e,H,h,Fa,2)|0;Da=c[h>>2]|0;if((Da&4|0)==0&(da|0)<24){c[j+8>>2]=da;break a}else{c[h>>2]=Da|4;break a}break};case 109:{c[X>>2]=c[f>>2];c[E+0>>2]=c[X+0>>2];Da=Uh(e,E,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Da|0)<13){c[j+16>>2]=Da+ -1;break a}else{c[h>>2]=da|4;break a}break};case 77:{c[W>>2]=c[f>>2];c[D+0>>2]=c[W+0>>2];da=Uh(e,D,h,Fa,2)|0;Da=c[h>>2]|0;if((Da&4|0)==0&(da|0)<60){c[j+4>>2]=da;break a}else{c[h>>2]=Da|4;break a}break};case 116:case 110:{c[na>>2]=c[f>>2];c[C+0>>2]=c[na+0>>2];Sh(0,e,C,h,Fa);break};case 112:{Da=j+8|0;da=c[f>>2]|0;Ga=d+8|0;Ea=pc[c[(c[Ga>>2]|0)+8>>2]&127](Ga)|0;Ga=a[Ea]|0;if((Ga&1)==0){Ka=(Ga&255)>>>1}else{Ka=c[Ea+4>>2]|0}Ga=a[Ea+12|0]|0;if((Ga&1)==0){La=(Ga&255)>>>1}else{La=c[Ea+16>>2]|0}if((Ka|0)==(0-La|0)){c[h>>2]=c[h>>2]|4;break a}c[V>>2]=da;c[B+0>>2]=c[V+0>>2];da=jg(e,B,Ea,Ea+24|0,Fa,h,0)|0;Ga=da-Ea|0;do{if((da|0)==(Ea|0)){if((c[Da>>2]|0)!=12){break}c[Da>>2]=0;break a}}while(0);if((Ga|0)!=12){break a}Ea=c[Da>>2]|0;if((Ea|0)>=12){break a}c[Da>>2]=Ea+12;break};case 114:{Ea=e;c[pa>>2]=c[Ea>>2];c[qa>>2]=c[f>>2];c[A+0>>2]=c[pa+0>>2];c[z+0>>2]=c[qa+0>>2];Ih(oa,d,A,z,g,h,j,4056,4067|0);c[Ea>>2]=c[oa>>2];break};case 82:{Ea=e;c[sa>>2]=c[Ea>>2];c[ta>>2]=c[f>>2];c[y+0>>2]=c[sa+0>>2];c[x+0>>2]=c[ta+0>>2];Ih(ra,d,y,x,g,h,j,4072,4077|0);c[Ea>>2]=c[ra>>2];break};case 83:{c[U>>2]=c[f>>2];c[w+0>>2]=c[U+0>>2];Ea=Uh(e,w,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(Ea|0)<61){c[j>>2]=Ea;break a}else{c[h>>2]=da|4;break a}break};case 84:{da=e;c[va>>2]=c[da>>2];c[wa>>2]=c[f>>2];c[v+0>>2]=c[va+0>>2];c[u+0>>2]=c[wa+0>>2];Ih(ua,d,v,u,g,h,j,4080,4088|0);c[da>>2]=c[ua>>2];break};case 119:{c[T>>2]=c[f>>2];c[t+0>>2]=c[T+0>>2];da=Uh(e,t,h,Fa,1)|0;Ea=c[h>>2]|0;if((Ea&4|0)==0&(da|0)<7){c[j+24>>2]=da;break a}else{c[h>>2]=Ea|4;break a}break};case 120:{Ea=c[(c[d>>2]|0)+20>>2]|0;c[xa>>2]=c[e>>2];c[ya>>2]=c[f>>2];c[s+0>>2]=c[xa+0>>2];c[r+0>>2]=c[ya+0>>2];kc[Ea&63](b,d,s,r,g,h,j);i=l;return};case 88:{Ea=d+8|0;da=pc[c[(c[Ea>>2]|0)+24>>2]&127](Ea)|0;Ea=e;c[Aa>>2]=c[Ea>>2];c[Ba>>2]=c[f>>2];ca=a[da]|0;if((ca&1)==0){Ma=da+1|0;Na=da+1|0;Oa=(ca&255)>>>1}else{ca=c[da+8>>2]|0;Ma=ca;Na=ca;Oa=c[da+4>>2]|0}c[q+0>>2]=c[Aa+0>>2];c[p+0>>2]=c[Ba+0>>2];Ih(za,d,q,p,g,h,j,Na,Ma+Oa|0);c[Ea>>2]=c[za>>2];break};case 121:{c[S>>2]=c[f>>2];c[o+0>>2]=c[S+0>>2];Ea=Uh(e,o,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}if((Ea|0)<69){Pa=Ea+2e3|0}else{Pa=(Ea+ -69|0)>>>0<31?Ea+1900|0:Ea}c[j+20>>2]=Pa+ -1900;break};case 89:{c[R>>2]=c[f>>2];c[n+0>>2]=c[R+0>>2];Ea=Uh(e,n,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=Ea+ -1900;break};case 37:{c[Ca>>2]=c[f>>2];c[m+0>>2]=c[Ca+0>>2];Th(0,e,m,h,Fa);break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}function Sh(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;j=e;e=f;f=h+8|0;a:while(1){h=c[j>>2]|0;do{if((h|0)==0){k=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){k=h;break}if((pc[c[(c[h>>2]|0)+36>>2]&127](h)|0)==-1){c[j>>2]=0;k=0;break}else{k=c[j>>2]|0;break}}}while(0);h=(k|0)==0;l=c[e>>2]|0;do{if((l|0)==0){m=12}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(h){n=l;break}else{o=l;break a}}if((pc[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1){c[e>>2]=0;m=12;break}else{if(h){n=l;break}else{o=l;break a}}}}while(0);if((m|0)==12){m=0;if(h){o=0;break}else{n=0}}l=c[j>>2]|0;p=c[l+12>>2]|0;if((p|0)==(c[l+16>>2]|0)){q=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{q=d[p]|0}if(!((q&255)<<24>>24>-1)){o=n;break}if((b[(c[f>>2]|0)+(q<<24>>24<<1)>>1]&8192)==0){o=n;break}p=c[j>>2]|0;l=p+12|0;r=c[l>>2]|0;if((r|0)==(c[p+16>>2]|0)){pc[c[(c[p>>2]|0)+40>>2]&127](p)|0;continue}else{c[l>>2]=r+1;continue}}n=c[j>>2]|0;do{if((n|0)==0){s=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){s=n;break}if((pc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1){c[j>>2]=0;s=0;break}else{s=c[j>>2]|0;break}}}while(0);j=(s|0)==0;b:do{if((o|0)==0){m=32}else{do{if((c[o+12>>2]|0)==(c[o+16>>2]|0)){if(!((pc[c[(c[o>>2]|0)+36>>2]&127](o)|0)==-1)){break}c[e>>2]=0;m=32;break b}}while(0);if(!j){break}i=a;return}}while(0);do{if((m|0)==32){if(j){break}i=a;return}}while(0);c[g>>2]=c[g>>2]|2;i=a;return}function Th(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;a=i;h=b;b=c[h>>2]|0;do{if((b|0)==0){j=0}else{if((c[b+12>>2]|0)!=(c[b+16>>2]|0)){j=b;break}if((pc[c[(c[b>>2]|0)+36>>2]&127](b)|0)==-1){c[h>>2]=0;j=0;break}else{j=c[h>>2]|0;break}}}while(0);b=(j|0)==0;j=e;e=c[j>>2]|0;a:do{if((e|0)==0){k=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if(!((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1)){break}c[j>>2]=0;k=11;break a}}while(0);if(b){l=e}else{k=12}}}while(0);if((k|0)==11){if(b){k=12}else{l=0}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=a;return}b=c[h>>2]|0;e=c[b+12>>2]|0;if((e|0)==(c[b+16>>2]|0)){m=pc[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{m=d[e]|0}if(!((jc[c[(c[g>>2]|0)+36>>2]&31](g,m&255,0)|0)<<24>>24==37)){c[f>>2]=c[f>>2]|4;i=a;return}m=c[h>>2]|0;g=m+12|0;e=c[g>>2]|0;if((e|0)==(c[m+16>>2]|0)){pc[c[(c[m>>2]|0)+40>>2]&127](m)|0}else{c[g>>2]=e+1}e=c[h>>2]|0;do{if((e|0)==0){n=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){n=e;break}if((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1){c[h>>2]=0;n=0;break}else{n=c[h>>2]|0;break}}}while(0);h=(n|0)==0;b:do{if((l|0)==0){k=31}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if(!((pc[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1)){break}c[j>>2]=0;k=31;break b}}while(0);if(!h){break}i=a;return}}while(0);do{if((k|0)==31){if(h){break}i=a;return}}while(0);c[f>>2]=c[f>>2]|2;i=a;return}function Uh(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;j=i;k=a;a=c[k>>2]|0;do{if((a|0)==0){l=0}else{if((c[a+12>>2]|0)!=(c[a+16>>2]|0)){l=a;break}if((pc[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){c[k>>2]=0;l=0;break}else{l=c[k>>2]|0;break}}}while(0);a=(l|0)==0;l=e;e=c[l>>2]|0;a:do{if((e|0)==0){m=11}else{do{if((c[e+12>>2]|0)==(c[e+16>>2]|0)){if(!((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1)){break}c[l>>2]=0;m=11;break a}}while(0);if(a){n=e}else{m=12}}}while(0);if((m|0)==11){if(a){m=12}else{n=0}}if((m|0)==12){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}a=c[k>>2]|0;e=c[a+12>>2]|0;if((e|0)==(c[a+16>>2]|0)){p=pc[c[(c[a>>2]|0)+36>>2]&127](a)|0}else{p=d[e]|0}e=p&255;do{if(e<<24>>24>-1){a=g+8|0;if((b[(c[a>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0){break}q=g;r=(jc[c[(c[q>>2]|0)+36>>2]&31](g,e,0)|0)<<24>>24;s=c[k>>2]|0;t=s+12|0;u=c[t>>2]|0;if((u|0)==(c[s+16>>2]|0)){pc[c[(c[s>>2]|0)+40>>2]&127](s)|0;v=h;w=n;x=n;y=r}else{c[t>>2]=u+1;v=h;w=n;x=n;y=r}while(1){z=y+ -48|0;r=v+ -1|0;u=c[k>>2]|0;do{if((u|0)==0){A=0}else{if((c[u+12>>2]|0)!=(c[u+16>>2]|0)){A=u;break}if((pc[c[(c[u>>2]|0)+36>>2]&127](u)|0)==-1){c[k>>2]=0;A=0;break}else{A=c[k>>2]|0;break}}}while(0);u=(A|0)==0;do{if((x|0)==0){B=w;C=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){B=w;C=x;break}if(!((pc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1)){B=w;C=w;break}c[l>>2]=0;B=0;C=0}}while(0);D=c[k>>2]|0;if(!((u^(C|0)==0)&(r|0)>0)){m=40;break}t=c[D+12>>2]|0;if((t|0)==(c[D+16>>2]|0)){E=pc[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{E=d[t]|0}t=E&255;if(!(t<<24>>24>-1)){o=z;m=52;break}if((b[(c[a>>2]|0)+(E<<24>>24<<1)>>1]&2048)==0){o=z;m=52;break}s=((jc[c[(c[q>>2]|0)+36>>2]&31](g,t,0)|0)<<24>>24)+(z*10|0)|0;t=c[k>>2]|0;F=t+12|0;G=c[F>>2]|0;if((G|0)==(c[t+16>>2]|0)){pc[c[(c[t>>2]|0)+40>>2]&127](t)|0;H=r;w=B;x=C;y=s;v=H;continue}else{c[F>>2]=G+1;H=r;w=B;x=C;y=s;v=H;continue}}if((m|0)==40){do{if((D|0)==0){I=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){I=D;break}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[k>>2]=0;I=0;break}else{I=c[k>>2]|0;break}}}while(0);q=(I|0)==0;b:do{if((B|0)==0){m=50}else{do{if((c[B+12>>2]|0)==(c[B+16>>2]|0)){if(!((pc[c[(c[B>>2]|0)+36>>2]&127](B)|0)==-1)){break}c[l>>2]=0;m=50;break b}}while(0);if(q){o=z}else{break}i=j;return o|0}}while(0);do{if((m|0)==50){if(q){break}else{o=z}i=j;return o|0}}while(0);c[f>>2]=c[f>>2]|2;o=z;i=j;return o|0}else if((m|0)==52){i=j;return o|0}}}while(0);c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function Vh(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;l=i;i=i+64|0;m=l;n=l+8|0;o=l+16|0;p=l+32|0;q=l+40|0;r=l+48|0;s=l+56|0;Qe(p,f);t=p;p=c[t>>2]|0;if(!((c[1280]|0)==-1)){c[o>>2]=5120;c[o+4>>2]=118;c[o+8>>2]=0;qe(5120,o,119)}o=(c[5124>>2]|0)+ -1|0;u=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-u>>2>>>0>o>>>0)){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}p=c[u+(o<<2)>>2]|0;if((p|0)==0){v=vb(4)|0;w=v;pm(w);cc(v|0,13088,107)}v=p;Yd(c[t>>2]|0)|0;c[g>>2]=0;t=d;a:do{if((j|0)==(k|0)){x=69}else{w=e;o=p;u=p;y=p;z=b;A=r;B=s;C=q;D=j;E=0;b:while(1){F=E;while(1){if((F|0)!=0){x=69;break a}G=c[t>>2]|0;do{if((G|0)==0){H=0;I=1}else{J=c[G+12>>2]|0;if((J|0)==(c[G+16>>2]|0)){K=pc[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{K=c[J>>2]|0}if(!((K|0)==-1)){H=G;I=0;break}c[t>>2]=0;H=0;I=1}}while(0);G=c[w>>2]|0;do{if((G|0)==0){x=22}else{J=c[G+12>>2]|0;if((J|0)==(c[G+16>>2]|0)){L=pc[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{L=c[J>>2]|0}if((L|0)==-1){c[w>>2]=0;x=22;break}else{if(I){M=G;break}else{x=24;break b}}}}while(0);if((x|0)==22){x=0;if(I){x=24;break b}else{M=0}}if((jc[c[(c[o>>2]|0)+52>>2]&31](v,c[D>>2]|0,0)|0)<<24>>24==37){x=26;break}if(jc[c[(c[u>>2]|0)+12>>2]&31](v,8192,c[D>>2]|0)|0){N=D;x=36;break}O=H+12|0;G=c[O>>2]|0;P=H+16|0;if((G|0)==(c[P>>2]|0)){Q=pc[c[(c[H>>2]|0)+36>>2]&127](H)|0}else{Q=c[G>>2]|0}G=yc[c[(c[y>>2]|0)+28>>2]&31](v,Q)|0;if((G|0)==(yc[c[(c[y>>2]|0)+28>>2]&31](v,c[D>>2]|0)|0)){x=64;break}c[g>>2]=4;F=4}c:do{if((x|0)==26){x=0;F=D+4|0;if((F|0)==(k|0)){x=27;break b}G=jc[c[(c[o>>2]|0)+52>>2]&31](v,c[F>>2]|0,0)|0;if(G<<24>>24==48|G<<24>>24==69){J=D+8|0;if((J|0)==(k|0)){x=30;break b}R=J;S=jc[c[(c[o>>2]|0)+52>>2]&31](v,c[J>>2]|0,0)|0;T=G}else{R=F;S=G;T=0}G=c[(c[z>>2]|0)+36>>2]|0;c[A>>2]=H;c[B>>2]=M;F=n;J=r;c[F+0>>2]=c[J+0>>2];J=m;F=s;c[J+0>>2]=c[F+0>>2];oc[G&3](q,b,n,m,f,g,h,S,T);c[t>>2]=c[C>>2];U=R+4|0}else if((x|0)==36){while(1){x=0;G=N+4|0;if((G|0)==(k|0)){V=k;break}if(jc[c[(c[u>>2]|0)+12>>2]&31](v,8192,c[G>>2]|0)|0){N=G;x=36}else{V=G;break}}G=H;F=M;J=M;while(1){do{if((G|0)==0){W=0;X=1}else{Y=c[G+12>>2]|0;if((Y|0)==(c[G+16>>2]|0)){Z=pc[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{Z=c[Y>>2]|0}if(!((Z|0)==-1)){W=G;X=0;break}c[t>>2]=0;W=0;X=1}}while(0);do{if((J|0)==0){_=F;x=51}else{Y=c[J+12>>2]|0;if((Y|0)==(c[J+16>>2]|0)){$=pc[c[(c[J>>2]|0)+36>>2]&127](J)|0}else{$=c[Y>>2]|0}if(($|0)==-1){c[w>>2]=0;_=0;x=51;break}else{if(X^(F|0)==0){aa=F;ba=F;break}else{U=V;break c}}}}while(0);if((x|0)==51){x=0;if(X){U=V;break c}else{aa=_;ba=0}}Y=W+12|0;ca=c[Y>>2]|0;da=W+16|0;if((ca|0)==(c[da>>2]|0)){ea=pc[c[(c[W>>2]|0)+36>>2]&127](W)|0}else{ea=c[ca>>2]|0}if(!(jc[c[(c[u>>2]|0)+12>>2]&31](v,8192,ea)|0)){U=V;break c}ca=c[Y>>2]|0;if((ca|0)==(c[da>>2]|0)){pc[c[(c[W>>2]|0)+40>>2]&127](W)|0;G=W;F=aa;J=ba;continue}else{c[Y>>2]=ca+4;G=W;F=aa;J=ba;continue}}}else if((x|0)==64){x=0;J=c[O>>2]|0;if((J|0)==(c[P>>2]|0)){pc[c[(c[H>>2]|0)+40>>2]&127](H)|0}else{c[O>>2]=J+4}U=D+4|0}}while(0);if((U|0)==(k|0)){x=69;break a}D=U;E=c[g>>2]|0}if((x|0)==24){c[g>>2]=4;fa=H;break}else if((x|0)==27){c[g>>2]=4;fa=H;break}else if((x|0)==30){c[g>>2]=4;fa=H;break}}}while(0);if((x|0)==69){fa=c[t>>2]|0}t=d;do{if((fa|0)==0){ga=0;ha=1}else{d=c[fa+12>>2]|0;if((d|0)==(c[fa+16>>2]|0)){ia=pc[c[(c[fa>>2]|0)+36>>2]&127](fa)|0}else{ia=c[d>>2]|0}if(!((ia|0)==-1)){ga=fa;ha=0;break}c[t>>2]=0;ga=0;ha=1}}while(0);t=e;e=c[t>>2]|0;do{if((e|0)==0){x=82}else{fa=c[e+12>>2]|0;if((fa|0)==(c[e+16>>2]|0)){ja=pc[c[(c[e>>2]|0)+36>>2]&127](e)|0}else{ja=c[fa>>2]|0}if((ja|0)==-1){c[t>>2]=0;x=82;break}if(!ha){break}ka=a;c[ka>>2]=ga;i=l;return}}while(0);do{if((x|0)==82){if(ha){break}ka=a;c[ka>>2]=ga;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;ka=a;c[ka>>2]=ga;i=l;return}function Wh(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Xh(a){a=a|0;i=i;return}function Yh(a){a=a|0;i=i;return 2}function Zh(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=j;l=j+8|0;m=j+16|0;n=j+24|0;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];e=l;d=m;c[e+0>>2]=c[d+0>>2];d=k;e=n;c[d+0>>2]=c[e+0>>2];Vh(a,b,l,k,f,g,h,4184,4216|0);i=j;return}function _h(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+32|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=d+8|0;q=pc[c[(c[p>>2]|0)+20>>2]&127](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+4|0;s=q+4|0;t=(f&255)>>>1}else{f=c[q+8>>2]|0;r=f;s=f;t=c[q+4>>2]|0}q=r+(t<<2)|0;t=m;r=n;c[t+0>>2]=c[r+0>>2];r=l;t=o;c[r+0>>2]=c[t+0>>2];Vh(b,d,m,l,g,h,j,s,q);i=k;return}function $h(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1280]|0)==-1)){c[m>>2]=5120;c[m+4>>2]=118;c[m+8>>2]=0;qe(5120,m,119)}m=(c[5124>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}p=n;Yd(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=pc[c[c[e>>2]>>2]&127](e)|0;c[l>>2]=f;f=b+168|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=Ig(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=168){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+24>>2]=((g|0)/12|0|0)%7|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function ai(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;i=i+40|0;k=j;l=j+8|0;m=j+16|0;n=j+32|0;Qe(n,f);f=n;n=c[f>>2]|0;if(!((c[1280]|0)==-1)){c[m>>2]=5120;c[m+4>>2]=118;c[m+8>>2]=0;qe(5120,m,119)}m=(c[5124>>2]|0)+ -1|0;o=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-o>>2>>>0>m>>>0)){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}n=c[o+(m<<2)>>2]|0;if((n|0)==0){p=vb(4)|0;q=p;pm(q);cc(p|0,13088,107)}p=n;Yd(c[f>>2]|0)|0;f=c[e>>2]|0;e=b+8|0;b=pc[c[(c[e>>2]|0)+4>>2]&127](e)|0;c[l>>2]=f;f=b+288|0;e=k;n=l;c[e+0>>2]=c[n+0>>2];n=Ig(d,k,b,f,p,g,0)|0;g=n-b|0;if((g|0)>=288){r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}c[h+16>>2]=((g|0)/12|0|0)%12|0;r=d;s=c[r>>2]|0;t=a;c[t>>2]=s;i=j;return}function bi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+40|0;j=b;k=b+8|0;l=b+16|0;m=b+32|0;Qe(m,f);f=m;m=c[f>>2]|0;if(!((c[1280]|0)==-1)){c[l>>2]=5120;c[l+4>>2]=118;c[l+8>>2]=0;qe(5120,l,119)}l=(c[5124>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>l>>>0)){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}m=c[n+(l<<2)>>2]|0;if((m|0)==0){o=vb(4)|0;p=o;pm(p);cc(o|0,13088,107)}o=m;Yd(c[f>>2]|0)|0;f=h+20|0;c[k>>2]=c[e>>2];e=j;h=k;c[e+0>>2]=c[h+0>>2];h=fi(d,j,g,o,4)|0;if((c[g>>2]&4|0)!=0){q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}if((h|0)<69){t=h+2e3|0}else{t=(h+ -69|0)>>>0<31?h+1900|0:h}c[f>>2]=t+ -1900;q=d;r=c[q>>2]|0;s=a;c[s>>2]=r;i=b;return}function ci(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0;l=i;i=i+576|0;m=l;n=l+8|0;o=l+16|0;p=l+24|0;q=l+32|0;r=l+40|0;s=l+48|0;t=l+56|0;u=l+64|0;v=l+72|0;w=l+80|0;x=l+88|0;y=l+96|0;z=l+104|0;A=l+112|0;B=l+120|0;C=l+128|0;D=l+136|0;E=l+144|0;F=l+152|0;G=l+160|0;H=l+168|0;I=l+176|0;J=l+184|0;K=l+192|0;L=l+200|0;M=l+208|0;N=l+216|0;O=l+224|0;P=l+232|0;Q=l+240|0;R=l+248|0;S=l+256|0;T=l+264|0;U=l+272|0;V=l+280|0;W=l+288|0;X=l+296|0;Y=l+304|0;Z=l+312|0;_=l+320|0;$=l+328|0;aa=l+336|0;ba=l+344|0;ca=l+352|0;da=l+368|0;ea=l+376|0;fa=l+384|0;ga=l+392|0;ha=l+400|0;ia=l+408|0;ja=l+416|0;ka=l+424|0;la=l+432|0;ma=l+440|0;na=l+448|0;oa=l+456|0;pa=l+464|0;qa=l+472|0;ra=l+480|0;sa=l+488|0;ta=l+496|0;ua=l+504|0;va=l+512|0;wa=l+520|0;xa=l+528|0;ya=l+536|0;za=l+544|0;Aa=l+552|0;Ba=l+560|0;Ca=l+568|0;c[h>>2]=0;Qe(da,g);Da=da;da=c[Da>>2]|0;if(!((c[1280]|0)==-1)){c[ca>>2]=5120;c[ca+4>>2]=118;c[ca+8>>2]=0;qe(5120,ca,119)}ca=(c[5124>>2]|0)+ -1|0;Ea=c[da+8>>2]|0;if(!((c[da+12>>2]|0)-Ea>>2>>>0>ca>>>0)){Fa=vb(4)|0;Ga=Fa;pm(Ga);cc(Fa|0,13088,107)}da=c[Ea+(ca<<2)>>2]|0;if((da|0)==0){Fa=vb(4)|0;Ga=Fa;pm(Ga);cc(Fa|0,13088,107)}Fa=da;Yd(c[Da>>2]|0)|0;a:do{switch(k<<24>>24|0){case 89:{c[R>>2]=c[f>>2];c[n+0>>2]=c[R+0>>2];Da=fi(e,n,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=Da+ -1900;break};case 121:{c[S>>2]=c[f>>2];c[o+0>>2]=c[S+0>>2];Da=fi(e,o,h,Fa,4)|0;if((c[h>>2]&4|0)!=0){break a}if((Da|0)<69){Ha=Da+2e3|0}else{Ha=(Da+ -69|0)>>>0<31?Da+1900|0:Da}c[j+20>>2]=Ha+ -1900;break};case 88:{Da=d+8|0;da=pc[c[(c[Da>>2]|0)+24>>2]&127](Da)|0;Da=e;c[Aa>>2]=c[Da>>2];c[Ba>>2]=c[f>>2];Ga=a[da]|0;if((Ga&1)==0){Ia=da+4|0;Ja=da+4|0;Ka=(Ga&255)>>>1}else{Ga=c[da+8>>2]|0;Ia=Ga;Ja=Ga;Ka=c[da+4>>2]|0}c[q+0>>2]=c[Aa+0>>2];c[p+0>>2]=c[Ba+0>>2];Vh(za,d,q,p,g,h,j,Ja,Ia+(Ka<<2)|0);c[Da>>2]=c[za>>2];break};case 37:{c[Ca>>2]=c[f>>2];c[m+0>>2]=c[Ca+0>>2];ei(0,e,m,h,Fa);break};case 84:{Da=e;c[va>>2]=c[Da>>2];c[wa>>2]=c[f>>2];c[v+0>>2]=c[va+0>>2];c[u+0>>2]=c[wa+0>>2];Vh(ua,d,v,u,g,h,j,4352,4384|0);c[Da>>2]=c[ua>>2];break};case 120:{Da=c[(c[d>>2]|0)+20>>2]|0;c[xa>>2]=c[e>>2];c[ya>>2]=c[f>>2];c[s+0>>2]=c[xa+0>>2];c[r+0>>2]=c[ya+0>>2];kc[Da&63](b,d,s,r,g,h,j);i=l;return};case 116:case 110:{c[na>>2]=c[f>>2];c[C+0>>2]=c[na+0>>2];di(0,e,C,h,Fa);break};case 112:{Da=j+8|0;da=c[f>>2]|0;Ga=d+8|0;ca=pc[c[(c[Ga>>2]|0)+8>>2]&127](Ga)|0;Ga=a[ca]|0;if((Ga&1)==0){La=(Ga&255)>>>1}else{La=c[ca+4>>2]|0}Ga=a[ca+12|0]|0;if((Ga&1)==0){Ma=(Ga&255)>>>1}else{Ma=c[ca+16>>2]|0}if((La|0)==(0-Ma|0)){c[h>>2]=c[h>>2]|4;break a}c[V>>2]=da;c[B+0>>2]=c[V+0>>2];da=Ig(e,B,ca,ca+24|0,Fa,h,0)|0;Ga=da-ca|0;do{if((da|0)==(ca|0)){if((c[Da>>2]|0)!=12){break}c[Da>>2]=0;break a}}while(0);if((Ga|0)!=12){break a}ca=c[Da>>2]|0;if((ca|0)>=12){break a}c[Da>>2]=ca+12;break};case 77:{c[W>>2]=c[f>>2];c[D+0>>2]=c[W+0>>2];ca=fi(e,D,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(ca|0)<60){c[j+4>>2]=ca;break a}else{c[h>>2]=da|4;break a}break};case 101:case 100:{da=j+12|0;c[$>>2]=c[f>>2];c[M+0>>2]=c[$+0>>2];ca=fi(e,M,h,Fa,2)|0;Ea=c[h>>2]|0;do{if((Ea&4|0)==0){if(!((ca+ -1|0)>>>0<31)){break}c[da>>2]=ca;break a}}while(0);c[h>>2]=Ea|4;break};case 68:{ca=e;c[ia>>2]=c[ca>>2];c[ja>>2]=c[f>>2];c[L+0>>2]=c[ia+0>>2];c[K+0>>2]=c[ja+0>>2];Vh(ha,d,L,K,g,h,j,4216,4248|0);c[ca>>2]=c[ha>>2];break};case 70:{ca=e;c[la>>2]=c[ca>>2];c[ma>>2]=c[f>>2];c[J+0>>2]=c[la+0>>2];c[I+0>>2]=c[ma+0>>2];Vh(ka,d,J,I,g,h,j,4248,4280|0);c[ca>>2]=c[ka>>2];break};case 72:{c[_>>2]=c[f>>2];c[H+0>>2]=c[_+0>>2];ca=fi(e,H,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(ca|0)<24){c[j+8>>2]=ca;break a}else{c[h>>2]=da|4;break a}break};case 73:{da=j+8|0;c[Z>>2]=c[f>>2];c[G+0>>2]=c[Z+0>>2];ca=fi(e,G,h,Fa,2)|0;Da=c[h>>2]|0;do{if((Da&4|0)==0){if(!((ca+ -1|0)>>>0<12)){break}c[da>>2]=ca;break a}}while(0);c[h>>2]=Da|4;break};case 106:{c[Y>>2]=c[f>>2];c[F+0>>2]=c[Y+0>>2];ca=fi(e,F,h,Fa,3)|0;da=c[h>>2]|0;if((da&4|0)==0&(ca|0)<366){c[j+28>>2]=ca;break a}else{c[h>>2]=da|4;break a}break};case 109:{c[X>>2]=c[f>>2];c[E+0>>2]=c[X+0>>2];da=fi(e,E,h,Fa,2)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(da|0)<13){c[j+16>>2]=da+ -1;break a}else{c[h>>2]=ca|4;break a}break};case 65:case 97:{ca=c[f>>2]|0;da=d+8|0;Ea=pc[c[c[da>>2]>>2]&127](da)|0;c[ba>>2]=ca;c[Q+0>>2]=c[ba+0>>2];ca=(Ig(e,Q,Ea,Ea+168|0,Fa,h,0)|0)-Ea|0;if((ca|0)>=168){break a}c[j+24>>2]=((ca|0)/12|0|0)%7|0;break};case 104:case 66:case 98:{ca=c[f>>2]|0;Ea=d+8|0;da=pc[c[(c[Ea>>2]|0)+4>>2]&127](Ea)|0;c[aa>>2]=ca;c[P+0>>2]=c[aa+0>>2];ca=(Ig(e,P,da,da+288|0,Fa,h,0)|0)-da|0;if((ca|0)>=288){break a}c[j+16>>2]=((ca|0)/12|0|0)%12|0;break};case 99:{ca=d+8|0;da=pc[c[(c[ca>>2]|0)+12>>2]&127](ca)|0;ca=e;c[fa>>2]=c[ca>>2];c[ga>>2]=c[f>>2];Ea=a[da]|0;if((Ea&1)==0){Na=da+4|0;Oa=da+4|0;Pa=(Ea&255)>>>1}else{Ea=c[da+8>>2]|0;Na=Ea;Oa=Ea;Pa=c[da+4>>2]|0}c[O+0>>2]=c[fa+0>>2];c[N+0>>2]=c[ga+0>>2];Vh(ea,d,O,N,g,h,j,Oa,Na+(Pa<<2)|0);c[ca>>2]=c[ea>>2];break};case 114:{ca=e;c[pa>>2]=c[ca>>2];c[qa>>2]=c[f>>2];c[A+0>>2]=c[pa+0>>2];c[z+0>>2]=c[qa+0>>2];Vh(oa,d,A,z,g,h,j,4280,4324|0);c[ca>>2]=c[oa>>2];break};case 82:{ca=e;c[sa>>2]=c[ca>>2];c[ta>>2]=c[f>>2];c[y+0>>2]=c[sa+0>>2];c[x+0>>2]=c[ta+0>>2];Vh(ra,d,y,x,g,h,j,4328,4348|0);c[ca>>2]=c[ra>>2];break};case 83:{c[U>>2]=c[f>>2];c[w+0>>2]=c[U+0>>2];ca=fi(e,w,h,Fa,2)|0;da=c[h>>2]|0;if((da&4|0)==0&(ca|0)<61){c[j>>2]=ca;break a}else{c[h>>2]=da|4;break a}break};case 119:{c[T>>2]=c[f>>2];c[t+0>>2]=c[T+0>>2];da=fi(e,t,h,Fa,1)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(da|0)<7){c[j+24>>2]=da;break a}else{c[h>>2]=ca|4;break a}break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}function di(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;a=i;g=b;b=d;d=f;a:while(1){h=c[g>>2]|0;do{if((h|0)==0){j=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){l=pc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[g>>2]=0;j=1;break}else{j=(c[g>>2]|0)==0;break}}}while(0);h=c[b>>2]|0;do{if((h|0)==0){m=15}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){n=pc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{n=c[k>>2]|0}if((n|0)==-1){c[b>>2]=0;m=15;break}else{if(j){o=h;break}else{p=h;break a}}}}while(0);if((m|0)==15){m=0;if(j){p=0;break}else{o=0}}h=c[g>>2]|0;k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){q=pc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{q=c[k>>2]|0}if(!(jc[c[(c[d>>2]|0)+12>>2]&31](f,8192,q)|0)){p=o;break}k=c[g>>2]|0;h=k+12|0;r=c[h>>2]|0;if((r|0)==(c[k+16>>2]|0)){pc[c[(c[k>>2]|0)+40>>2]&127](k)|0;continue}else{c[h>>2]=r+4;continue}}o=c[g>>2]|0;do{if((o|0)==0){s=1}else{q=c[o+12>>2]|0;if((q|0)==(c[o+16>>2]|0)){t=pc[c[(c[o>>2]|0)+36>>2]&127](o)|0}else{t=c[q>>2]|0}if((t|0)==-1){c[g>>2]=0;s=1;break}else{s=(c[g>>2]|0)==0;break}}}while(0);do{if((p|0)==0){m=37}else{g=c[p+12>>2]|0;if((g|0)==(c[p+16>>2]|0)){u=pc[c[(c[p>>2]|0)+36>>2]&127](p)|0}else{u=c[g>>2]|0}if((u|0)==-1){c[b>>2]=0;m=37;break}if(!s){break}i=a;return}}while(0);do{if((m|0)==37){if(s){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function ei(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;g=b;b=c[g>>2]|0;do{if((b|0)==0){h=1}else{j=c[b+12>>2]|0;if((j|0)==(c[b+16>>2]|0)){k=pc[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[g>>2]=0;h=1;break}else{h=(c[g>>2]|0)==0;break}}}while(0);k=d;d=c[k>>2]|0;do{if((d|0)==0){l=14}else{b=c[d+12>>2]|0;if((b|0)==(c[d+16>>2]|0)){m=pc[c[(c[d>>2]|0)+36>>2]&127](d)|0}else{m=c[b>>2]|0}if((m|0)==-1){c[k>>2]=0;l=14;break}else{if(h){n=d;break}else{l=16;break}}}}while(0);if((l|0)==14){if(h){l=16}else{n=0}}if((l|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}h=c[g>>2]|0;d=c[h+12>>2]|0;if((d|0)==(c[h+16>>2]|0)){o=pc[c[(c[h>>2]|0)+36>>2]&127](h)|0}else{o=c[d>>2]|0}if(!((jc[c[(c[f>>2]|0)+52>>2]&31](f,o,0)|0)<<24>>24==37)){c[e>>2]=c[e>>2]|4;i=a;return}o=c[g>>2]|0;f=o+12|0;d=c[f>>2]|0;if((d|0)==(c[o+16>>2]|0)){pc[c[(c[o>>2]|0)+40>>2]&127](o)|0}else{c[f>>2]=d+4}d=c[g>>2]|0;do{if((d|0)==0){p=1}else{f=c[d+12>>2]|0;if((f|0)==(c[d+16>>2]|0)){q=pc[c[(c[d>>2]|0)+36>>2]&127](d)|0}else{q=c[f>>2]|0}if((q|0)==-1){c[g>>2]=0;p=1;break}else{p=(c[g>>2]|0)==0;break}}}while(0);do{if((n|0)==0){l=38}else{g=c[n+12>>2]|0;if((g|0)==(c[n+16>>2]|0)){r=pc[c[(c[n>>2]|0)+36>>2]&127](n)|0}else{r=c[g>>2]|0}if((r|0)==-1){c[k>>2]=0;l=38;break}if(!p){break}i=a;return}}while(0);do{if((l|0)==38){if(p){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function fi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;g=i;h=a;a=c[h>>2]|0;do{if((a|0)==0){j=1}else{k=c[a+12>>2]|0;if((k|0)==(c[a+16>>2]|0)){l=pc[c[(c[a>>2]|0)+36>>2]&127](a)|0}else{l=c[k>>2]|0}if((l|0)==-1){c[h>>2]=0;j=1;break}else{j=(c[h>>2]|0)==0;break}}}while(0);l=b;b=c[l>>2]|0;do{if((b|0)==0){m=14}else{a=c[b+12>>2]|0;if((a|0)==(c[b+16>>2]|0)){n=pc[c[(c[b>>2]|0)+36>>2]&127](b)|0}else{n=c[a>>2]|0}if((n|0)==-1){c[l>>2]=0;m=14;break}else{if(j){o=b;break}else{m=16;break}}}}while(0);if((m|0)==14){if(j){m=16}else{o=0}}if((m|0)==16){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[h>>2]|0;b=c[j+12>>2]|0;if((b|0)==(c[j+16>>2]|0)){q=pc[c[(c[j>>2]|0)+36>>2]&127](j)|0}else{q=c[b>>2]|0}b=e;if(!(jc[c[(c[b>>2]|0)+12>>2]&31](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}j=e;n=(jc[c[(c[j>>2]|0)+52>>2]&31](e,q,0)|0)<<24>>24;q=c[h>>2]|0;a=q+12|0;k=c[a>>2]|0;if((k|0)==(c[q+16>>2]|0)){pc[c[(c[q>>2]|0)+40>>2]&127](q)|0;r=f;s=o;t=o;u=n}else{c[a>>2]=k+4;r=f;s=o;t=o;u=n}while(1){v=u+ -48|0;n=r+ -1|0;o=c[h>>2]|0;do{if((o|0)==0){w=1}else{f=c[o+12>>2]|0;if((f|0)==(c[o+16>>2]|0)){x=pc[c[(c[o>>2]|0)+36>>2]&127](o)|0}else{x=c[f>>2]|0}if((x|0)==-1){c[h>>2]=0;w=1;break}else{w=(c[h>>2]|0)==0;break}}}while(0);do{if((t|0)==0){y=s;z=0;A=1}else{o=c[t+12>>2]|0;if((o|0)==(c[t+16>>2]|0)){B=pc[c[(c[t>>2]|0)+36>>2]&127](t)|0}else{B=c[o>>2]|0}if((B|0)==-1){c[l>>2]=0;y=0;z=0;A=1;break}else{y=s;z=s;A=(s|0)==0;break}}}while(0);C=c[h>>2]|0;if(!((w^A)&(n|0)>0)){break}o=c[C+12>>2]|0;if((o|0)==(c[C+16>>2]|0)){D=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{D=c[o>>2]|0}if(!(jc[c[(c[b>>2]|0)+12>>2]&31](e,2048,D)|0)){p=v;m=63;break}o=((jc[c[(c[j>>2]|0)+52>>2]&31](e,D,0)|0)<<24>>24)+(v*10|0)|0;f=c[h>>2]|0;k=f+12|0;a=c[k>>2]|0;if((a|0)==(c[f+16>>2]|0)){pc[c[(c[f>>2]|0)+40>>2]&127](f)|0;E=n;s=y;t=z;u=o;r=E;continue}else{c[k>>2]=a+4;E=n;s=y;t=z;u=o;r=E;continue}}if((m|0)==63){i=g;return p|0}do{if((C|0)==0){F=1}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){G=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{G=c[E>>2]|0}if((G|0)==-1){c[h>>2]=0;F=1;break}else{F=(c[h>>2]|0)==0;break}}}while(0);do{if((y|0)==0){m=60}else{h=c[y+12>>2]|0;if((h|0)==(c[y+16>>2]|0)){H=pc[c[(c[y>>2]|0)+36>>2]&127](y)|0}else{H=c[h>>2]|0}if((H|0)==-1){c[l>>2]=0;m=60;break}if(F){p=v}else{break}i=g;return p|0}}while(0);do{if((m|0)==60){if(F){break}else{p=v}i=g;return p|0}}while(0);c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function gi(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b+8|0;f=c[e>>2]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);if((f|0)==(c[1254]|0)){g=b;Rm(g);i=d;return}ib(c[e>>2]|0);g=b;Rm(g);i=d;return}function hi(b){b=b|0;var d=0,e=0;d=i;e=b+8|0;b=c[e>>2]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);if((b|0)==(c[1254]|0)){i=d;return}ib(c[e>>2]|0);i=d;return}function ii(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+112|0;f=g;l=g+8|0;m=l;n=f;a[n]=37;o=f+1|0;a[o]=j;p=f+2|0;a[p]=k;a[f+3|0]=0;if(!(k<<24>>24==0)){a[o]=k;a[p]=j}j=Sb(m|0,100,n|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;l=c[e>>2]|0;if((j|0)==0){q=l;r=b;c[r>>2]=q;i=g;return}else{s=m;t=l;u=l}while(1){l=a[s]|0;do{if((u|0)==0){v=t;w=0}else{m=u+24|0;j=c[m>>2]|0;if((j|0)==(c[u+28>>2]|0)){e=(yc[c[(c[u>>2]|0)+52>>2]&31](u,l&255)|0)==-1;v=e?0:t;w=e?0:u;break}else{c[m>>2]=j+1;a[j]=l;v=t;w=u;break}}}while(0);l=s+1|0;if((l|0)==(d|0)){q=v;break}else{s=l;t=v;u=w}}r=b;c[r>>2]=q;i=g;return}function ji(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b+8|0;f=c[e>>2]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);if((f|0)==(c[1254]|0)){g=b;Rm(g);i=d;return}ib(c[e>>2]|0);g=b;Rm(g);i=d;return}function ki(b){b=b|0;var d=0,e=0;d=i;e=b+8|0;b=c[e>>2]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);if((b|0)==(c[1254]|0)){i=d;return}ib(c[e>>2]|0);i=d;return}function li(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+408|0;e=f;k=f+400|0;l=e;c[k>>2]=e+400;mi(b+8|0,l,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((l|0)==(j|0)){m=k;n=a;c[n>>2]=m;i=f;return}else{o=l;p=k;q=k}while(1){k=c[o>>2]|0;if((p|0)==0){r=q;s=0}else{l=p+24|0;d=c[l>>2]|0;if((d|0)==(c[p+28>>2]|0)){t=yc[c[(c[p>>2]|0)+52>>2]&31](p,k)|0}else{c[l>>2]=d+4;c[d>>2]=k;t=k}k=(t|0)==-1;r=k?0:q;s=k?0:p}k=o+4|0;if((k|0)==(j|0)){m=r;break}else{o=k;p=s;q=r}}n=a;c[n>>2]=m;i=f;return}function mi(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;k=j;l=j+112|0;m=i;i=i+8|0;n=j+8|0;o=k;a[o]=37;p=k+1|0;a[p]=g;q=k+2|0;a[q]=h;a[k+3|0]=0;if(!(h<<24>>24==0)){a[p]=h;a[q]=g}g=b;Sb(n|0,100,o|0,f|0,c[g>>2]|0)|0;f=l;c[f>>2]=0;c[f+4>>2]=0;c[m>>2]=n;n=(c[e>>2]|0)-d>>2;f=zb(c[g>>2]|0)|0;g=fm(d,m,n,l)|0;if((f|0)!=0){zb(f|0)|0}if((g|0)==-1){ij(6008)}else{c[e>>2]=d+(g<<2);i=j;return}}function ni(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function oi(a){a=a|0;i=i;return}function pi(a){a=a|0;i=i;return 127}function qi(a){a=a|0;i=i;return 127}function ri(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function si(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function ti(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function ui(a,b){a=a|0;b=b|0;b=i;ue(a,1,45);i=b;return}function vi(a){a=a|0;i=i;return 0}function wi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function xi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function yi(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function zi(a){a=a|0;i=i;return}function Ai(a){a=a|0;i=i;return 127}function Bi(a){a=a|0;i=i;return 127}function Ci(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Di(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Ei(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Fi(a,b){a=a|0;b=b|0;b=i;ue(a,1,45);i=b;return}function Gi(a){a=a|0;i=i;return 0}function Hi(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ii(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ji(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Ki(a){a=a|0;i=i;return}function Li(a){a=a|0;i=i;return 2147483647}function Mi(a){a=a|0;i=i;return 2147483647}function Ni(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Oi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Pi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Qi(a,b){a=a|0;b=b|0;b=i;Ge(a,1,45);i=b;return}function Ri(a){a=a|0;i=i;return 0}function Si(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ti(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function Ui(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Vi(a){a=a|0;i=i;return}function Wi(a){a=a|0;i=i;return 2147483647}function Xi(a){a=a|0;i=i;return 2147483647}function Yi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function Zi(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function _i(a,b){a=a|0;b=b|0;var d=0;b=i;d=a;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=b;return}function $i(a,b){a=a|0;b=b|0;b=i;Ge(a,1,45);i=b;return}function aj(a){a=a|0;i=i;return 0}function bj(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function cj(b,c){b=b|0;c=c|0;c=b;a[c]=67109634;a[c+1|0]=262147;a[c+2|0]=1024;a[c+3|0]=4;i=i;return}function dj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function ej(a){a=a|0;i=i;return}function fj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+104|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=i;i=i+8|0;u=i;i=i+16|0;v=i;i=i+104|0;w=p;c[w>>2]=o;x=p+4|0;c[x>>2]=120;y=o+100|0;Qe(r,h);o=r;z=c[o>>2]|0;if(!((c[1282]|0)==-1)){c[n>>2]=5128;c[n+4>>2]=118;c[n+8>>2]=0;qe(5128,n,119)}n=(c[5132>>2]|0)+ -1|0;A=c[z+8>>2]|0;if(!((c[z+12>>2]|0)-A>>2>>>0>n>>>0)){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}z=c[A+(n<<2)>>2]|0;if((z|0)==0){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}B=z;a[s]=0;C=f;c[t>>2]=c[C>>2];f=c[h+4>>2]|0;h=l;n=t;c[h+0>>2]=c[n+0>>2];n=hj(e,l,g,r,f,j,s,B,p,q,y)|0;do{if(n){y=u;vc[c[(c[z>>2]|0)+32>>2]&7](B,4744,4754|0,y)|0;p=v;f=c[q>>2]|0;r=c[w>>2]|0;g=f-r|0;do{if((g|0)>98){l=Km(g+2|0)|0;if((l|0)!=0){D=l;E=l;break}Wm()}else{D=0;E=p}}while(0);if((a[s]|0)==0){F=E}else{a[E]=45;F=E+1|0}if(r>>>0<f>>>0){g=u+10|0;l=u;h=F;t=r;while(1){A=a[t]|0;G=y;while(1){H=G+1|0;if((a[G]|0)==A<<24>>24){I=G;break}if((H|0)==(g|0)){I=g;break}else{G=H}}a[h]=a[4744+(I-l)|0]|0;G=t+1|0;A=h+1|0;if(G>>>0<(c[q>>2]|0)>>>0){h=A;t=G}else{J=A;break}}}else{J=F}a[J]=0;c[m>>2]=k;if((Tb(p|0,4760,m|0)|0)!=1){t=vb(8)|0;ce(t,4768);cc(t|0,2136,21)}if((D|0)==0){break}Lm(D)}}while(0);D=e;e=c[D>>2]|0;do{if((e|0)==0){K=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){K=e;break}if(!((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1)){K=e;break}c[D>>2]=0;K=0}}while(0);D=(K|0)==0;e=c[C>>2]|0;do{if((e|0)==0){L=31}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){if(D){break}else{L=33;break}}if((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1){c[C>>2]=0;L=31;break}else{if(D){break}else{L=33;break}}}}while(0);if((L|0)==31){if(D){L=33}}if((L|0)==33){c[j>>2]=c[j>>2]|2}c[b>>2]=K;Yd(c[o>>2]|0)|0;o=c[w>>2]|0;c[w>>2]=0;if((o|0)==0){i=d;return}mc[c[x>>2]&255](o);i=d;return}function gj(a){a=a|0;i=i;return}function hj(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,nc=0,oc=0,qc=0,rc=0,sc=0,tc=0,uc=0;q=i;i=i+408|0;r=q;s=q+400|0;t=s;u=i;i=i+8|0;v=i;i=i+8|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+8|0;D=r;c[s>>2]=0;E=w;c[E+0>>2]=0;c[E+4>>2]=0;c[E+8>>2]=0;F=x;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;G=y;c[G+0>>2]=0;c[G+4>>2]=0;c[G+8>>2]=0;H=z;c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;I=A;c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;lj(g,h,t,u,v,w,x,y,z,B);t=n;c[o>>2]=c[t>>2];h=e;e=f;f=s;s=m+8|0;m=z+1|0;g=z+4|0;J=z+8|0;K=y+1|0;L=y+4|0;M=y+8|0;N=(j&512|0)!=0;j=x+1|0;O=x+8|0;P=x+4|0;Q=A;R=Q+1|0;S=A+8|0;T=A+4|0;U=f+3|0;V=n+4|0;n=w+4|0;W=r+400|0;r=D;X=D;D=p;p=0;Y=0;Z=120;a:while(1){_=c[h>>2]|0;do{if((_|0)==0){$=0}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){$=_;break}if((pc[c[(c[_>>2]|0)+36>>2]&127](_)|0)==-1){c[h>>2]=0;$=0;break}else{$=c[h>>2]|0;break}}}while(0);_=($|0)==0;aa=c[e>>2]|0;do{if((aa|0)==0){ba=12}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(_){ca=aa;break}else{da=X;ea=r;fa=Y;ga=Z;ba=269;break a}}if((pc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)==-1){c[e>>2]=0;ba=12;break}else{if(_){ca=aa;break}else{da=X;ea=r;fa=Y;ga=Z;ba=269;break a}}}}while(0);if((ba|0)==12){ba=0;if(_){da=X;ea=r;fa=Y;ga=Z;ba=269;break}else{ca=0}}b:do{switch(a[f+p|0]|0){case 1:{if((p|0)==3){da=X;ea=r;fa=Y;ga=Z;ba=269;break a}aa=c[h>>2]|0;ha=c[aa+12>>2]|0;if((ha|0)==(c[aa+16>>2]|0)){ia=pc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0}else{ia=d[ha]|0}if(!((ia&255)<<24>>24>-1)){ba=25;break a}if((b[(c[s>>2]|0)+(ia<<24>>24<<1)>>1]&8192)==0){ba=25;break a}ha=c[h>>2]|0;aa=ha+12|0;ja=c[aa>>2]|0;if((ja|0)==(c[ha+16>>2]|0)){ka=pc[c[(c[ha>>2]|0)+40>>2]&127](ha)|0}else{c[aa>>2]=ja+1;ka=d[ja]|0}Be(A,ka&255);ba=26;break};case 0:{ba=26;break};case 3:{ja=a[G]|0;aa=(ja&1)==0;if(aa){la=(ja&255)>>>1}else{la=c[L>>2]|0}ha=a[H]|0;ma=(ha&1)==0;if(ma){na=(ha&255)>>>1}else{na=c[g>>2]|0}if((la|0)==(0-na|0)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}if(aa){ua=(ja&255)>>>1}else{ua=c[L>>2]|0}do{if((ua|0)!=0){if(ma){va=(ha&255)>>>1}else{va=c[g>>2]|0}if((va|0)==0){break}wa=c[h>>2]|0;xa=c[wa+12>>2]|0;ya=c[wa+16>>2]|0;if((xa|0)==(ya|0)){za=pc[c[(c[wa>>2]|0)+36>>2]&127](wa)|0;Aa=c[h>>2]|0;Ba=za;Ca=c[Aa+16>>2]|0;Da=c[Aa+12>>2]|0;Ea=Aa;Fa=a[G]|0}else{Ba=d[xa]|0;Ca=ya;Da=xa;Ea=wa;Fa=ja}wa=Ea+12|0;xa=(Da|0)==(Ca|0);if((Ba&255)<<24>>24==(a[(Fa&1)==0?K:c[M>>2]|0]|0)){if(xa){pc[c[(c[Ea>>2]|0)+40>>2]&127](Ea)|0}else{c[wa>>2]=Da+1}wa=a[G]|0;if((wa&1)==0){Ga=(wa&255)>>>1}else{Ga=c[L>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ga>>>0>1?y:Y;ta=Z;break b}if(xa){Ha=pc[c[(c[Ea>>2]|0)+36>>2]&127](Ea)|0}else{Ha=d[Da]|0}if(!((Ha&255)<<24>>24==(a[(a[H]&1)==0?m:c[J>>2]|0]|0))){ba=112;break a}xa=c[h>>2]|0;wa=xa+12|0;ya=c[wa>>2]|0;if((ya|0)==(c[xa+16>>2]|0)){pc[c[(c[xa>>2]|0)+40>>2]&127](xa)|0}else{c[wa>>2]=ya+1}a[l]=1;ya=a[H]|0;if((ya&1)==0){Ia=(ya&255)>>>1}else{Ia=c[g>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ia>>>0>1?z:Y;ta=Z;break b}}while(0);if(aa){Ja=(ja&255)>>>1}else{Ja=c[L>>2]|0}ma=c[h>>2]|0;ya=c[ma+12>>2]|0;wa=(ya|0)==(c[ma+16>>2]|0);if((Ja|0)==0){if(wa){xa=pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0;Ka=xa;La=a[H]|0}else{Ka=d[ya]|0;La=ha}if(!((Ka&255)<<24>>24==(a[(La&1)==0?m:c[J>>2]|0]|0))){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}xa=c[h>>2]|0;Aa=xa+12|0;za=c[Aa>>2]|0;if((za|0)==(c[xa+16>>2]|0)){pc[c[(c[xa>>2]|0)+40>>2]&127](xa)|0}else{c[Aa>>2]=za+1}a[l]=1;za=a[H]|0;if((za&1)==0){Ma=(za&255)>>>1}else{Ma=c[g>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Ma>>>0>1?z:Y;ta=Z;break b}if(wa){wa=pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0;Na=wa;Oa=a[G]|0}else{Na=d[ya]|0;Oa=ja}if(!((Na&255)<<24>>24==(a[(Oa&1)==0?K:c[M>>2]|0]|0))){a[l]=1;oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}ya=c[h>>2]|0;wa=ya+12|0;ma=c[wa>>2]|0;if((ma|0)==(c[ya+16>>2]|0)){pc[c[(c[ya>>2]|0)+40>>2]&127](ya)|0}else{c[wa>>2]=ma+1}ma=a[G]|0;if((ma&1)==0){Pa=(ma&255)>>>1}else{Pa=c[L>>2]|0}oa=D;pa=X;qa=r;ra=W;sa=Pa>>>0>1?y:Y;ta=Z;break};case 2:{if(!((Y|0)!=0|p>>>0<2)){if((p|0)==2){Qa=(a[U]|0)!=0}else{Qa=0}if(!(N|Qa)){oa=D;pa=X;qa=r;ra=W;sa=0;ta=Z;break b}}ma=a[F]|0;wa=(ma&1)==0;ya=wa?j:c[O>>2]|0;c:do{if((p|0)==0){Ra=ca;Sa=ca;Ta=ma;Ua=ya}else{if((d[f+(p+ -1)|0]|0)>=2){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break}za=ya+(wa?(ma&255)>>>1:c[P>>2]|0)|0;Aa=ya;while(1){if((Aa|0)==(za|0)){Va=za;break}xa=a[Aa]|0;if(!(xa<<24>>24>-1)){Va=Aa;break}if((b[(c[s>>2]|0)+(xa<<24>>24<<1)>>1]&8192)==0){Va=Aa;break}else{Aa=Aa+1|0}}Aa=Va-ya|0;za=a[I]|0;xa=(za&1)==0;if(xa){Wa=(za&255)>>>1}else{Wa=c[T>>2]|0}if(Aa>>>0>Wa>>>0){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break}if(xa){xa=(za&255)>>>1;Xa=Q+(xa-Aa)+1|0;Ya=R;Za=xa}else{xa=c[S>>2]|0;za=c[T>>2]|0;Xa=xa+(za-Aa)|0;Ya=xa;Za=za}za=Ya+Za|0;if((Xa|0)==(za|0)){Ra=ca;Sa=ca;Ta=ma;Ua=Va;break}else{_a=ya;$a=Xa}while(1){if((a[$a]|0)!=(a[_a]|0)){Ra=ca;Sa=ca;Ta=ma;Ua=ya;break c}xa=$a+1|0;if((xa|0)==(za|0)){Ra=ca;Sa=ca;Ta=ma;Ua=Va;break}else{_a=_a+1|0;$a=xa}}}}while(0);d:while(1){if((Ta&1)==0){ab=j;bb=(Ta&255)>>>1}else{ab=c[O>>2]|0;bb=c[P>>2]|0}if((Ua|0)==(ab+bb|0)){break}ma=c[h>>2]|0;do{if((ma|0)==0){cb=0}else{if((c[ma+12>>2]|0)!=(c[ma+16>>2]|0)){cb=ma;break}if((pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0)==-1){c[h>>2]=0;cb=0;break}else{cb=c[h>>2]|0;break}}}while(0);ma=(cb|0)==0;do{if((Sa|0)==0){db=Ra;ba=147}else{if((c[Sa+12>>2]|0)!=(c[Sa+16>>2]|0)){if(ma){eb=Ra;fb=Sa;break}else{break d}}if((pc[c[(c[Sa>>2]|0)+36>>2]&127](Sa)|0)==-1){c[e>>2]=0;db=0;ba=147;break}else{if(ma^(Ra|0)==0){eb=Ra;fb=Ra;break}else{break d}}}}while(0);if((ba|0)==147){ba=0;if(ma){break}else{eb=db;fb=0}}ya=c[h>>2]|0;wa=c[ya+12>>2]|0;if((wa|0)==(c[ya+16>>2]|0)){gb=pc[c[(c[ya>>2]|0)+36>>2]&127](ya)|0}else{gb=d[wa]|0}if(!((gb&255)<<24>>24==(a[Ua]|0))){break}wa=c[h>>2]|0;ya=wa+12|0;ja=c[ya>>2]|0;if((ja|0)==(c[wa+16>>2]|0)){pc[c[(c[wa>>2]|0)+40>>2]&127](wa)|0}else{c[ya>>2]=ja+1}Ra=eb;Sa=fb;Ta=a[F]|0;Ua=Ua+1|0}if(!N){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break b}ja=a[F]|0;if((ja&1)==0){hb=j;ib=(ja&255)>>>1}else{hb=c[O>>2]|0;ib=c[P>>2]|0}if((Ua|0)==(hb+ib|0)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z}else{ba=162;break a}break};case 4:{ja=D;ya=X;wa=r;ha=W;aa=0;za=Z;e:while(1){xa=c[h>>2]|0;do{if((xa|0)==0){jb=0}else{if((c[xa+12>>2]|0)!=(c[xa+16>>2]|0)){jb=xa;break}if((pc[c[(c[xa>>2]|0)+36>>2]&127](xa)|0)==-1){c[h>>2]=0;jb=0;break}else{jb=c[h>>2]|0;break}}}while(0);xa=(jb|0)==0;ma=c[e>>2]|0;do{if((ma|0)==0){ba=173}else{if((c[ma+12>>2]|0)!=(c[ma+16>>2]|0)){if(xa){break}else{break e}}if((pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0)==-1){c[e>>2]=0;ba=173;break}else{if(xa){break}else{break e}}}}while(0);if((ba|0)==173){ba=0;if(xa){break}}ma=c[h>>2]|0;Aa=c[ma+12>>2]|0;if((Aa|0)==(c[ma+16>>2]|0)){kb=pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0}else{kb=d[Aa]|0}Aa=kb&255;do{if(Aa<<24>>24>-1){if((b[(c[s>>2]|0)+(kb<<24>>24<<1)>>1]&2048)==0){ba=189;break}ma=c[o>>2]|0;if((ma|0)==(ja|0)){lb=(c[V>>2]|0)!=120;mb=c[t>>2]|0;nb=ja-mb|0;ob=nb>>>0<2147483647?nb<<1:-1;pb=Mm(lb?mb:0,ob)|0;if((pb|0)==0){ba=182;break a}do{if(lb){c[t>>2]=pb;qb=pb}else{mb=c[t>>2]|0;c[t>>2]=pb;if((mb|0)==0){qb=pb;break}mc[c[V>>2]&255](mb);qb=c[t>>2]|0}}while(0);c[V>>2]=121;pb=qb+nb|0;c[o>>2]=pb;rb=pb;sb=(c[t>>2]|0)+ob|0}else{rb=ma;sb=ja}c[o>>2]=rb+1;a[rb]=Aa;tb=sb;ub=ya;vb=wa;wb=ha;xb=aa+1|0;yb=za}else{ba=189}}while(0);if((ba|0)==189){ba=0;xa=a[E]|0;if((xa&1)==0){zb=(xa&255)>>>1}else{zb=c[n>>2]|0}if((zb|0)==0|(aa|0)==0){break}if(!(Aa<<24>>24==(a[v]|0))){break}if((wa|0)==(ha|0)){xa=wa-ya|0;pb=xa>>>0<2147483647?xa<<1:-1;if((za|0)==120){Ab=0}else{Ab=ya}lb=Mm(Ab,pb)|0;mb=lb;if((lb|0)==0){ba=198;break a}Bb=mb;Cb=mb+(xa>>2<<2)|0;Db=mb+(pb>>>2<<2)|0;Eb=121}else{Bb=ya;Cb=wa;Db=ha;Eb=za}c[Cb>>2]=aa;tb=ja;ub=Bb;vb=Cb+4|0;wb=Db;xb=0;yb=Eb}pb=c[h>>2]|0;mb=pb+12|0;xa=c[mb>>2]|0;if((xa|0)==(c[pb+16>>2]|0)){pc[c[(c[pb>>2]|0)+40>>2]&127](pb)|0;ja=tb;ya=ub;wa=vb;ha=wb;aa=xb;za=yb;continue}else{c[mb>>2]=xa+1;ja=tb;ya=ub;wa=vb;ha=wb;aa=xb;za=yb;continue}}if((ya|0)==(wa|0)|(aa|0)==0){Fb=ya;Gb=wa;Hb=ha;Ib=za}else{if((wa|0)==(ha|0)){xa=wa-ya|0;mb=xa>>>0<2147483647?xa<<1:-1;if((za|0)==120){Jb=0}else{Jb=ya}pb=Mm(Jb,mb)|0;lb=pb;if((pb|0)==0){ba=209;break a}Kb=lb;Lb=lb+(xa>>2<<2)|0;Mb=lb+(mb>>>2<<2)|0;Nb=121}else{Kb=ya;Lb=wa;Mb=ha;Nb=za}c[Lb>>2]=aa;Fb=Kb;Gb=Lb+4|0;Hb=Mb;Ib=Nb}mb=c[B>>2]|0;if((mb|0)>0){lb=c[h>>2]|0;do{if((lb|0)==0){Ob=0}else{if((c[lb+12>>2]|0)!=(c[lb+16>>2]|0)){Ob=lb;break}if((pc[c[(c[lb>>2]|0)+36>>2]&127](lb)|0)==-1){c[h>>2]=0;Ob=0;break}else{Ob=c[h>>2]|0;break}}}while(0);lb=(Ob|0)==0;aa=c[e>>2]|0;do{if((aa|0)==0){ba=223}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){if(lb){Pb=aa;break}else{ba=229;break a}}if((pc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0)==-1){c[e>>2]=0;ba=223;break}else{if(lb){Pb=aa;break}else{ba=229;break a}}}}while(0);if((ba|0)==223){ba=0;if(lb){ba=229;break a}else{Pb=0}}aa=c[h>>2]|0;za=c[aa+12>>2]|0;if((za|0)==(c[aa+16>>2]|0)){Qb=pc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0}else{Qb=d[za]|0}if(!((Qb&255)<<24>>24==(a[u]|0))){ba=229;break a}za=c[h>>2]|0;aa=za+12|0;ha=c[aa>>2]|0;if((ha|0)==(c[za+16>>2]|0)){pc[c[(c[za>>2]|0)+40>>2]&127](za)|0;Rb=Pb;Sb=mb;Tb=Pb;Ub=ja}else{c[aa>>2]=ha+1;Rb=Pb;Sb=mb;Tb=Pb;Ub=ja}while(1){ha=c[h>>2]|0;do{if((ha|0)==0){Vb=0}else{if((c[ha+12>>2]|0)!=(c[ha+16>>2]|0)){Vb=ha;break}if((pc[c[(c[ha>>2]|0)+36>>2]&127](ha)|0)==-1){c[h>>2]=0;Vb=0;break}else{Vb=c[h>>2]|0;break}}}while(0);ha=(Vb|0)==0;do{if((Tb|0)==0){Wb=Rb;ba=243}else{if((c[Tb+12>>2]|0)!=(c[Tb+16>>2]|0)){if(ha){Xb=Rb;Yb=Tb;break}else{ba=250;break a}}if((pc[c[(c[Tb>>2]|0)+36>>2]&127](Tb)|0)==-1){c[e>>2]=0;Wb=0;ba=243;break}else{if(ha^(Rb|0)==0){Xb=Rb;Yb=Rb;break}else{ba=250;break a}}}}while(0);if((ba|0)==243){ba=0;if(ha){ba=250;break a}else{Xb=Wb;Yb=0}}Aa=c[h>>2]|0;aa=c[Aa+12>>2]|0;if((aa|0)==(c[Aa+16>>2]|0)){Zb=pc[c[(c[Aa>>2]|0)+36>>2]&127](Aa)|0}else{Zb=d[aa]|0}if(!((Zb&255)<<24>>24>-1)){ba=250;break a}if((b[(c[s>>2]|0)+(Zb<<24>>24<<1)>>1]&2048)==0){ba=250;break a}aa=c[o>>2]|0;if((aa|0)==(Ub|0)){Aa=(c[V>>2]|0)!=120;za=c[t>>2]|0;wa=Ub-za|0;ya=wa>>>0<2147483647?wa<<1:-1;xa=Mm(Aa?za:0,ya)|0;if((xa|0)==0){ba=253;break a}do{if(Aa){c[t>>2]=xa;_b=xa}else{za=c[t>>2]|0;c[t>>2]=xa;if((za|0)==0){_b=xa;break}mc[c[V>>2]&255](za);_b=c[t>>2]|0}}while(0);c[V>>2]=121;xa=_b+wa|0;c[o>>2]=xa;$b=xa;ac=(c[t>>2]|0)+ya|0}else{$b=aa;ac=Ub}xa=c[h>>2]|0;Aa=c[xa+12>>2]|0;if((Aa|0)==(c[xa+16>>2]|0)){ha=pc[c[(c[xa>>2]|0)+36>>2]&127](xa)|0;bc=ha;cc=c[o>>2]|0}else{bc=d[Aa]|0;cc=$b}c[o>>2]=cc+1;a[cc]=bc;Aa=Sb+ -1|0;c[B>>2]=Aa;ha=c[h>>2]|0;xa=ha+12|0;za=c[xa>>2]|0;if((za|0)==(c[ha+16>>2]|0)){pc[c[(c[ha>>2]|0)+40>>2]&127](ha)|0}else{c[xa>>2]=za+1}if((Aa|0)>0){Rb=Xb;Sb=Aa;Tb=Yb;Ub=ac}else{dc=ac;break}}}else{dc=ja}if((c[o>>2]|0)==(c[t>>2]|0)){ba=267;break a}else{oa=dc;pa=Fb;qa=Gb;ra=Hb;sa=Y;ta=Ib}break};default:{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z}}}while(0);f:do{if((ba|0)==26){ba=0;if((p|0)==3){da=X;ea=r;fa=Y;ga=Z;ba=269;break a}else{ec=ca;fc=ca}while(1){_=c[h>>2]|0;do{if((_|0)==0){gc=0}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){gc=_;break}if((pc[c[(c[_>>2]|0)+36>>2]&127](_)|0)==-1){c[h>>2]=0;gc=0;break}else{gc=c[h>>2]|0;break}}}while(0);_=(gc|0)==0;do{if((fc|0)==0){hc=ec;ba=37}else{if((c[fc+12>>2]|0)!=(c[fc+16>>2]|0)){if(_){ic=ec;jc=fc;break}else{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}}if((pc[c[(c[fc>>2]|0)+36>>2]&127](fc)|0)==-1){c[e>>2]=0;hc=0;ba=37;break}else{if(_^(ec|0)==0){ic=ec;jc=ec;break}else{oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}}}}while(0);if((ba|0)==37){ba=0;if(_){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}else{ic=hc;jc=0}}aa=c[h>>2]|0;ya=c[aa+12>>2]|0;if((ya|0)==(c[aa+16>>2]|0)){kc=pc[c[(c[aa>>2]|0)+36>>2]&127](aa)|0}else{kc=d[ya]|0}if(!((kc&255)<<24>>24>-1)){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}if((b[(c[s>>2]|0)+(kc<<24>>24<<1)>>1]&8192)==0){oa=D;pa=X;qa=r;ra=W;sa=Y;ta=Z;break f}ya=c[h>>2]|0;aa=ya+12|0;wa=c[aa>>2]|0;if((wa|0)==(c[ya+16>>2]|0)){lc=pc[c[(c[ya>>2]|0)+40>>2]&127](ya)|0}else{c[aa>>2]=wa+1;lc=d[wa]|0}Be(A,lc&255);ec=ic;fc=jc}}}while(0);ja=p+1|0;if(ja>>>0<4){W=ra;r=qa;X=pa;D=oa;p=ja;Y=sa;Z=ta}else{da=pa;ea=qa;fa=sa;ga=ta;ba=269;break}}g:do{if((ba|0)==25){c[k>>2]=c[k>>2]|4;nc=0;oc=X;qc=Z}else if((ba|0)==112){c[k>>2]=c[k>>2]|4;nc=0;oc=X;qc=Z}else if((ba|0)==162){c[k>>2]=c[k>>2]|4;nc=0;oc=X;qc=Z}else if((ba|0)==182){Wm()}else if((ba|0)==198){Wm()}else if((ba|0)==209){Wm()}else if((ba|0)==229){c[k>>2]=c[k>>2]|4;nc=0;oc=Fb;qc=Ib}else if((ba|0)==250){c[k>>2]=c[k>>2]|4;nc=0;oc=Fb;qc=Ib}else if((ba|0)==253){Wm()}else if((ba|0)==267){c[k>>2]=c[k>>2]|4;nc=0;oc=Fb;qc=Ib}else if((ba|0)==269){h:do{if((fa|0)!=0){ta=fa;sa=fa+1|0;qa=fa+8|0;pa=fa+4|0;Y=1;i:while(1){p=a[ta]|0;if((p&1)==0){rc=(p&255)>>>1}else{rc=c[pa>>2]|0}if(!(Y>>>0<rc>>>0)){break h}p=c[h>>2]|0;do{if((p|0)==0){sc=0}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){sc=p;break}if((pc[c[(c[p>>2]|0)+36>>2]&127](p)|0)==-1){c[h>>2]=0;sc=0;break}else{sc=c[h>>2]|0;break}}}while(0);p=(sc|0)==0;_=c[e>>2]|0;do{if((_|0)==0){ba=285}else{if((c[_+12>>2]|0)!=(c[_+16>>2]|0)){if(p){break}else{break i}}if((pc[c[(c[_>>2]|0)+36>>2]&127](_)|0)==-1){c[e>>2]=0;ba=285;break}else{if(p){break}else{break i}}}}while(0);if((ba|0)==285){ba=0;if(p){break}}_=c[h>>2]|0;oa=c[_+12>>2]|0;if((oa|0)==(c[_+16>>2]|0)){tc=pc[c[(c[_>>2]|0)+36>>2]&127](_)|0}else{tc=d[oa]|0}if((a[ta]&1)==0){uc=sa}else{uc=c[qa>>2]|0}if(!((tc&255)<<24>>24==(a[uc+Y|0]|0))){break}oa=Y+1|0;_=c[h>>2]|0;D=_+12|0;r=c[D>>2]|0;if((r|0)==(c[_+16>>2]|0)){pc[c[(c[_>>2]|0)+40>>2]&127](_)|0;Y=oa;continue}else{c[D>>2]=r+1;Y=oa;continue}}c[k>>2]=c[k>>2]|4;nc=0;oc=da;qc=ga;break g}}while(0);if((da|0)==(ea|0)){nc=1;oc=ea;qc=ga;break}c[C>>2]=0;mj(w,da,ea,C);if((c[C>>2]|0)==0){nc=1;oc=da;qc=ga;break}c[k>>2]=c[k>>2]|4;nc=0;oc=da;qc=ga}}while(0);ve(A);ve(z);ve(y);ve(x);ve(w);if((oc|0)==0){i=q;return nc|0}mc[qc&255](oc);i=q;return nc|0}function ij(a){a=a|0;var b=0;b=vb(8)|0;ce(b,a);cc(b|0,2136,21)}function jj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;i=i+168|0;l=d;m=d+8|0;n=d+24|0;o=d+128|0;p=d+136|0;q=d+144|0;r=d+152|0;s=d+160|0;t=o;c[t>>2]=n;u=o+4|0;c[u>>2]=120;v=n+100|0;Qe(q,h);n=q;w=c[n>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;x=c[w+8>>2]|0;if(!((c[w+12>>2]|0)-x>>2>>>0>m>>>0)){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}w=c[x+(m<<2)>>2]|0;if((w|0)==0){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}y=w;a[r]=0;z=f;f=c[z>>2]|0;c[s>>2]=f;m=c[h+4>>2]|0;h=l;x=s;c[h+0>>2]=c[x+0>>2];x=hj(e,l,g,q,m,j,r,y,o,p,v)|0;if(x){x=k;if((a[x]&1)==0){a[k+1|0]=0;a[x]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}x=w;if((a[r]|0)!=0){Be(k,yc[c[(c[x>>2]|0)+28>>2]&31](y,45)|0)}r=yc[c[(c[x>>2]|0)+28>>2]&31](y,48)|0;y=c[t>>2]|0;x=c[p>>2]|0;p=x+ -1|0;a:do{if(y>>>0<p>>>0){w=y;while(1){v=w+1|0;if(!((a[w]|0)==r<<24>>24)){A=w;break a}if(v>>>0<p>>>0){w=v}else{A=v;break}}}else{A=y}}while(0);kj(k,A,x)|0}x=e;e=c[x>>2]|0;do{if((e|0)==0){B=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){B=e;break}if(!((pc[c[(c[e>>2]|0)+36>>2]&127](e)|0)==-1)){B=e;break}c[x>>2]=0;B=0}}while(0);x=(B|0)==0;do{if((f|0)==0){C=25}else{if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(x){break}else{C=27;break}}if((pc[c[(c[f>>2]|0)+36>>2]&127](f)|0)==-1){c[z>>2]=0;C=25;break}else{if(x^(f|0)==0){break}else{C=27;break}}}}while(0);if((C|0)==25){if(x){C=27}}if((C|0)==27){c[j>>2]=c[j>>2]|2}c[b>>2]=B;Yd(c[n>>2]|0)|0;n=c[t>>2]|0;c[t>>2]=0;if((n|0)==0){i=d;return}mc[c[u>>2]&255](n);i=d;return}function kj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b;h=d;j=a[g]|0;if((j&1)==0){k=(j&255)>>>1;l=j;m=10}else{j=c[b>>2]|0;k=c[b+4>>2]|0;l=j&255;m=(j&-2)+ -1|0}j=e-h|0;if((e|0)==(d|0)){i=f;return b|0}if((m-k|0)>>>0<j>>>0){Ee(b,m,k+j-m|0,k,k,0,0);n=a[g]|0}else{n=l}if((n&1)==0){o=b+1|0}else{o=c[b+8>>2]|0}n=e+(k-h)|0;h=d;d=o+k|0;while(1){a[d]=a[h]|0;l=h+1|0;if((l|0)==(e|0)){break}else{d=d+1|0;h=l}}a[o+n|0]=0;n=k+j|0;if((a[g]&1)==0){a[g]=n<<1;i=f;return b|0}else{c[b+4>>2]=n;i=f;return b|0}return 0}function lj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+176|0;o=n;p=n+16|0;q=n+32|0;r=n+40|0;s=n+56|0;t=n+72|0;u=n+88|0;v=n+104|0;w=n+112|0;x=n+128|0;y=n+144|0;z=n+160|0;if(b){b=c[d>>2]|0;if(!((c[1142]|0)==-1)){c[p>>2]=4568;c[p+4>>2]=118;c[p+8>>2]=0;qe(4568,p,119)}p=(c[4572>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>p>>>0)){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}b=c[A+(p<<2)>>2]|0;if((b|0)==0){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}B=b;nc[c[(c[b>>2]|0)+44>>2]&63](q,B);C=e;p=c[q>>2]|0;a[C]=p;a[C+1|0]=p>>8;a[C+2|0]=p>>16;a[C+3|0]=p>>24;p=b;nc[c[(c[p>>2]|0)+32>>2]&63](r,B);C=l;if((a[C]&1)==0){a[l+1|0]=0;a[C]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);q=r;c[C+0>>2]=c[q+0>>2];c[C+4>>2]=c[q+4>>2];c[C+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;ve(r);nc[c[(c[p>>2]|0)+28>>2]&63](s,B);r=k;if((a[r]&1)==0){a[k+1|0]=0;a[r]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ae(k,0);q=s;c[r+0>>2]=c[q+0>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;ve(s);s=b;a[f]=pc[c[(c[s>>2]|0)+12>>2]&127](B)|0;a[g]=pc[c[(c[s>>2]|0)+16>>2]&127](B)|0;nc[c[(c[p>>2]|0)+20>>2]&63](t,B);s=h;if((a[s]&1)==0){a[h+1|0]=0;a[s]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ae(h,0);q=t;c[s+0>>2]=c[q+0>>2];c[s+4>>2]=c[q+4>>2];c[s+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;ve(t);nc[c[(c[p>>2]|0)+24>>2]&63](u,B);p=j;if((a[p]&1)==0){a[j+1|0]=0;a[p]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);t=u;c[p+0>>2]=c[t+0>>2];c[p+4>>2]=c[t+4>>2];c[p+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;ve(u);D=pc[c[(c[b>>2]|0)+36>>2]&127](B)|0;c[m>>2]=D;i=n;return}else{B=c[d>>2]|0;if(!((c[1126]|0)==-1)){c[o>>2]=4504;c[o+4>>2]=118;c[o+8>>2]=0;qe(4504,o,119)}o=(c[4508>>2]|0)+ -1|0;d=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-d>>2>>>0>o>>>0)){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}B=c[d+(o<<2)>>2]|0;if((B|0)==0){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}E=B;nc[c[(c[B>>2]|0)+44>>2]&63](v,E);F=e;e=c[v>>2]|0;a[F]=e;a[F+1|0]=e>>8;a[F+2|0]=e>>16;a[F+3|0]=e>>24;e=B;nc[c[(c[e>>2]|0)+32>>2]&63](w,E);F=l;if((a[F]&1)==0){a[l+1|0]=0;a[F]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);l=w;c[F+0>>2]=c[l+0>>2];c[F+4>>2]=c[l+4>>2];c[F+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;ve(w);nc[c[(c[e>>2]|0)+28>>2]&63](x,E);w=k;if((a[w]&1)==0){a[k+1|0]=0;a[w]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ae(k,0);k=x;c[w+0>>2]=c[k+0>>2];c[w+4>>2]=c[k+4>>2];c[w+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;ve(x);x=B;a[f]=pc[c[(c[x>>2]|0)+12>>2]&127](E)|0;a[g]=pc[c[(c[x>>2]|0)+16>>2]&127](E)|0;nc[c[(c[e>>2]|0)+20>>2]&63](y,E);x=h;if((a[x]&1)==0){a[h+1|0]=0;a[x]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ae(h,0);h=y;c[x+0>>2]=c[h+0>>2];c[x+4>>2]=c[h+4>>2];c[x+8>>2]=c[h+8>>2];c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ve(y);nc[c[(c[e>>2]|0)+24>>2]&63](z,E);e=j;if((a[e]&1)==0){a[j+1|0]=0;a[e]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);j=z;c[e+0>>2]=c[j+0>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ve(z);D=pc[c[(c[B>>2]|0)+36>>2]&127](E)|0;c[m>>2]=D;i=n;return}}function mj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;h=b;j=a[h]|0;if((j&1)==0){k=(j&255)>>>1}else{k=c[b+4>>2]|0}if((k|0)==0){i=g;return}do{if((d|0)==(e|0)){l=j}else{k=e+ -4|0;if(k>>>0>d>>>0){m=d;n=k}else{l=j;break}do{k=c[m>>2]|0;c[m>>2]=c[n>>2];c[n>>2]=k;m=m+4|0;n=n+ -4|0;}while(m>>>0<n>>>0);l=a[h]|0}}while(0);if((l&1)==0){o=b+1|0;p=(l&255)>>>1}else{o=c[b+8>>2]|0;p=c[b+4>>2]|0}b=e+ -4|0;e=a[o]|0;l=e<<24>>24<1|e<<24>>24==127;a:do{if(b>>>0>d>>>0){h=o+p|0;n=e;m=o;j=d;k=l;while(1){if(!k){if((n<<24>>24|0)!=(c[j>>2]|0)){break}}q=(h-m|0)>1?m+1|0:m;r=j+4|0;s=a[q]|0;t=s<<24>>24<1|s<<24>>24==127;if(r>>>0<b>>>0){n=s;m=q;j=r;k=t}else{u=s;v=t;break a}}c[f>>2]=4;i=g;return}else{u=e;v=l}}while(0);if(v){i=g;return}v=c[b>>2]|0;if(!(u<<24>>24>>>0<v>>>0|(v|0)==0)){i=g;return}c[f>>2]=4;i=g;return}function nj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function oj(a){a=a|0;i=i;return}function pj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;i=i+16|0;l=d;m=d+8|0;n=i;i=i+16|0;o=i;i=i+400|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=i;i=i+8|0;u=i;i=i+40|0;v=i;i=i+104|0;w=p;c[w>>2]=o;x=p+4|0;c[x>>2]=120;y=o+400|0;Qe(r,h);o=r;z=c[o>>2]|0;if(!((c[1280]|0)==-1)){c[n>>2]=5120;c[n+4>>2]=118;c[n+8>>2]=0;qe(5120,n,119)}n=(c[5124>>2]|0)+ -1|0;A=c[z+8>>2]|0;if(!((c[z+12>>2]|0)-A>>2>>>0>n>>>0)){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}z=c[A+(n<<2)>>2]|0;if((z|0)==0){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}B=z;a[s]=0;C=f;c[t>>2]=c[C>>2];f=c[h+4>>2]|0;h=l;n=t;c[h+0>>2]=c[n+0>>2];n=qj(e,l,g,r,f,j,s,B,p,q,y)|0;do{if(n){y=u;vc[c[(c[z>>2]|0)+48>>2]&7](B,4824,4834|0,y)|0;p=v;f=c[q>>2]|0;r=c[w>>2]|0;g=f-r|0;do{if((g|0)>392){l=Km((g>>2)+2|0)|0;if((l|0)!=0){D=l;E=l;break}Wm()}else{D=0;E=p}}while(0);if((a[s]|0)==0){F=E}else{a[E]=45;F=E+1|0}if(r>>>0<f>>>0){g=u+40|0;l=u;h=F;t=r;while(1){A=c[t>>2]|0;G=y;while(1){H=G+4|0;if((c[G>>2]|0)==(A|0)){I=G;break}if((H|0)==(g|0)){I=g;break}else{G=H}}a[h]=a[4824+(I-l>>2)|0]|0;G=t+4|0;A=h+1|0;if(G>>>0<(c[q>>2]|0)>>>0){h=A;t=G}else{J=A;break}}}else{J=F}a[J]=0;c[m>>2]=k;if((Tb(p|0,4760,m|0)|0)!=1){t=vb(8)|0;ce(t,4768);cc(t|0,2136,21)}if((D|0)==0){break}Lm(D)}}while(0);D=e;e=c[D>>2]|0;do{if((e|0)==0){K=1}else{m=c[e+12>>2]|0;if((m|0)==(c[e+16>>2]|0)){L=pc[c[(c[e>>2]|0)+36>>2]&127](e)|0}else{L=c[m>>2]|0}if((L|0)==-1){c[D>>2]=0;K=1;break}else{K=(c[D>>2]|0)==0;break}}}while(0);L=c[C>>2]|0;do{if((L|0)==0){M=35}else{e=c[L+12>>2]|0;if((e|0)==(c[L+16>>2]|0)){N=pc[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{N=c[e>>2]|0}if((N|0)==-1){c[C>>2]=0;M=35;break}else{if(K){break}else{M=37;break}}}}while(0);if((M|0)==35){if(K){M=37}}if((M|0)==37){c[j>>2]=c[j>>2]|2}c[b>>2]=c[D>>2];Yd(c[o>>2]|0)|0;o=c[w>>2]|0;c[w>>2]=0;if((o|0)==0){i=d;return}mc[c[x>>2]&255](o);i=d;return}



function Bc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Cc(){return i|0}function Dc(a){a=a|0;i=a}function Ec(a,b){a=a|0;b=b|0;if((u|0)==0){u=a;v=b}}function Fc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Gc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Hc(a){a=a|0;J=a}function Ic(a){a=a|0;K=a}function Jc(a){a=a|0;L=a}function Kc(a){a=a|0;M=a}function Lc(a){a=a|0;N=a}function Mc(a){a=a|0;O=a}function Nc(a){a=a|0;P=a}function Oc(a){a=a|0;Q=a}function Pc(a){a=a|0;R=a}function Qc(a){a=a|0;S=a}function Rc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;e=i;i=i+96|0;f=e;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=b;Sc(m,d+1|0);n=b+4|0;o=b;p=c[o>>2]|0;q=((c[n>>2]|0)-p|0)/12|0;if(q>>>0>d>>>0){r=p;s=a;t=r+(d*12|0)|0;od(s,t);i=e;return}p=b+8|0;u=j;v=l;w=k;x=k+4|0;y=l+4|0;z=j+4|0;A=f;B=f+4|0;C=f+8|0;D=g;E=g+4|0;F=g+8|0;G=h;H=h+4|0;I=h+8|0;J=q;a:do{do{if((J|0)==0){c[A>>2]=0;c[B>>2]=0;c[C>>2]=0;q=Pm(4)|0;K=q;L=q+4|0;if((q|0)!=0){c[K>>2]=0}c[A>>2]=K;c[B>>2]=L;c[C>>2]=L;M=c[n>>2]|0;if((M|0)==(c[p>>2]|0)){nd(m,f);N=c[A>>2]|0}else{if((M|0)==0){O=0}else{P=M;c[P>>2]=0;Q=M+4|0;c[Q>>2]=0;R=M+8|0;c[R>>2]=0;M=Pm(4)|0;S=M;c[Q>>2]=S;c[P>>2]=S;c[R>>2]=M+4;M=q+(0-q)|0;q=K;R=S;while(1){if((R|0)!=0){c[R>>2]=c[q>>2]}P=q+4|0;if((P|0)==(L|0)){break}else{q=P;R=R+4|0}}c[Q>>2]=S+((M>>>2)+1<<2);O=c[n>>2]|0}c[n>>2]=O+12;N=K}if((N|0)==0){break}R=c[B>>2]|0;if((R|0)!=(N|0)){c[B>>2]=R+(~((R+ -4+(0-N)|0)>>>2)<<2)}Rm(N)}else if((J|0)==1){R=c[o>>2]|0;do{if((R|0)==(c[n>>2]|0)){c[D>>2]=0;c[E>>2]=0;c[F>>2]=0;q=Pm(4)|0;L=q;P=q+4|0;if((q|0)!=0){c[L>>2]=0}c[D>>2]=L;c[E>>2]=P;c[F>>2]=P;if((R|0)==(c[p>>2]|0)){nd(m,g);T=c[D>>2]|0}else{if((R|0)==0){U=0}else{V=R;c[V>>2]=0;W=R+4|0;c[W>>2]=0;X=R+8|0;c[X>>2]=0;Y=Pm(4)|0;Z=Y;c[W>>2]=Z;c[V>>2]=Z;c[X>>2]=Y+4;Y=q+(0-q)|0;q=L;X=Z;while(1){if((X|0)!=0){c[X>>2]=c[q>>2]}V=q+4|0;if((V|0)==(P|0)){break}else{q=V;X=X+4|0}}c[W>>2]=Z+((Y>>>2)+1<<2);U=c[n>>2]|0}c[n>>2]=U+12;T=L}if((T|0)==0){break}X=c[E>>2]|0;if((X|0)!=(T|0)){c[E>>2]=X+(~((X+ -4+(0-T)|0)>>>2)<<2)}Rm(T)}}while(0);c[G>>2]=0;c[H>>2]=0;c[I>>2]=0;R=Pm(4)|0;K=R;M=R+4|0;if((R|0)!=0){c[K>>2]=1}c[G>>2]=K;c[H>>2]=M;c[I>>2]=M;S=c[n>>2]|0;if((S|0)==(c[p>>2]|0)){nd(m,h);_=c[G>>2]|0}else{if((S|0)==0){$=0}else{Q=S;c[Q>>2]=0;X=S+4|0;c[X>>2]=0;q=S+8|0;c[q>>2]=0;S=Pm(4)|0;P=S;c[X>>2]=P;c[Q>>2]=P;c[q>>2]=S+4;S=R+(0-R)|0;R=K;q=P;while(1){if((q|0)!=0){c[q>>2]=c[R>>2]}Q=R+4|0;if((Q|0)==(M|0)){break}else{R=Q;q=q+4|0}}c[X>>2]=P+((S>>>2)+1<<2);$=c[n>>2]|0}c[n>>2]=$+12;_=K}if((_|0)==0){break}q=c[H>>2]|0;if((q|0)!=(_|0)){c[H>>2]=q+(~((q+ -4+(0-_)|0)>>>2)<<2)}Rm(_)}else{Rc(k,b,J+ -2|0);Rc(l,b,J+ -1|0);pd(j,k,l);q=c[n>>2]|0;if((q|0)==(c[p>>2]|0)){nd(m,j)}else{if((q|0)==0){aa=0}else{R=q;c[R>>2]=0;M=q+4|0;c[M>>2]=0;Q=q+8|0;c[Q>>2]=0;q=(c[z>>2]|0)-(c[u>>2]|0)|0;V=q>>2;do{if((V|0)!=0){if(V>>>0>1073741823){ba=54;break a}ca=Pm(q)|0;c[M>>2]=ca;c[R>>2]=ca;c[Q>>2]=ca+(V<<2);da=c[u>>2]|0;ea=c[z>>2]|0;if((da|0)==(ea|0)){break}fa=ea+ -4+(0-da)|0;ga=da;da=ca;while(1){if((da|0)!=0){c[da>>2]=c[ga>>2]}ha=ga+4|0;if((ha|0)==(ea|0)){break}else{ga=ha;da=da+4|0}}c[M>>2]=ca+((fa>>>2)+1<<2)}}while(0);aa=c[n>>2]|0}c[n>>2]=aa+12}M=c[u>>2]|0;if((M|0)!=0){V=c[z>>2]|0;if((V|0)!=(M|0)){c[z>>2]=V+(~((V+ -4+(0-M)|0)>>>2)<<2)}Rm(M)}M=c[v>>2]|0;if((M|0)!=0){V=c[y>>2]|0;if((V|0)!=(M|0)){c[y>>2]=V+(~((V+ -4+(0-M)|0)>>>2)<<2)}Rm(M)}M=c[w>>2]|0;if((M|0)==0){break}V=c[x>>2]|0;if((V|0)!=(M|0)){c[x>>2]=V+(~((V+ -4+(0-M)|0)>>>2)<<2)}Rm(M)}}while(0);J=J+1|0;}while(!(J>>>0>d>>>0));if((ba|0)==54){Rj(0)}r=c[o>>2]|0;s=a;t=r+(d*12|0)|0;od(s,t);i=e;return}function Sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;e=a+8|0;f=a;g=c[f>>2]|0;h=g;if(!((((c[e>>2]|0)-h|0)/12|0)>>>0<b>>>0)){i=d;return}j=a+4|0;a=c[j>>2]|0;if((b|0)==0){k=0}else{k=Pm(b*12|0)|0}l=k+(((a-h|0)/12|0)*12|0)|0;h=k+(b*12|0)|0;do{if((a|0)==(g|0)){c[f>>2]=l;c[j>>2]=l;c[e>>2]=h;m=g}else{b=a;k=l;do{b=b+ -12|0;od(k+ -12|0,b);k=k+ -12|0;}while((b|0)!=(g|0));b=c[f>>2]|0;n=c[j>>2]|0;c[f>>2]=k;c[j>>2]=l;c[e>>2]=h;if((n|0)==(b|0)){m=b;break}else{o=n}while(1){n=o+ -12|0;p=c[n>>2]|0;if((p|0)!=0){q=o+ -8|0;r=c[q>>2]|0;if((r|0)!=(p|0)){c[q>>2]=r+(~((r+ -4+(0-p)|0)>>>2)<<2)}Rm(p)}if((n|0)==(b|0)){m=b;break}else{o=n}}}}while(0);if((m|0)==0){i=d;return}Rm(m);i=d;return}function Tc(a){a=a|0;Ma(a|0)|0;Fa()}function Uc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+168|0;e=d;f=d+16|0;g=d+152|0;h=f;j=f+4|0;c[h>>2]=212;k=f+56|0;c[k>>2]=232;l=f+56|0;Re(l,j);c[f+128>>2]=0;c[f+132>>2]=-1;c[h>>2]=84;c[f+56>>2]=104;m=e;n=j;c[n>>2]=2400;o=f+8|0;Xj(o);p=f+12|0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[p+12>>2]=0;c[p+16>>2]=0;c[p+20>>2]=0;c[n>>2]=248;n=f+36|0;p=f+52|0;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[n+12>>2]=0;c[p>>2]=16;c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;md(j,e);if(!((a[m]&1)==0)){Rm(c[e+8>>2]|0)}e=b+4|0;m=b;if((c[e>>2]|0)!=(c[m>>2]|0)){b=f;p=0;do{q=Vc(Jf(Vc(b,8)|0,p)|0,16)|0;r=c[m>>2]|0;s=r+(p*12|0)|0;t=c[s>>2]|0;u=((c[r+(p*12|0)+4>>2]|0)-t>>2)+ -1|0;if((u|0)==0){v=t}else{r=t;t=u;while(1){u=Kf(q,c[r+(t<<2)>>2]|0)|0;w=u;x=u;c[x+((c[(c[w>>2]|0)+ -12>>2]|0)+12)>>2]=9;c[x+((c[(c[w>>2]|0)+ -12>>2]|0)+76)>>2]=48;w=t+ -1|0;x=c[s>>2]|0;if((w|0)==0){v=x;break}else{t=w;r=x}}}Vc(Kf(q,c[v>>2]|0)|0,24)|0;p=p+1|0;}while(p>>>0<(((c[e>>2]|0)-(c[m>>2]|0)|0)/12|0)>>>0)}bd(g,j);Wc(480,g)|0;if(!((a[g]&1)==0)){Rm(c[g+8>>2]|0)}c[h>>2]=84;c[k>>2]=104;k=f+4|0;c[k>>2]=248;if((a[n]&1)==0){c[k>>2]=2400;Zj(o);Pe(l);i=d;return}Rm(c[f+44>>2]|0);c[k>>2]=2400;Zj(o);Pe(l);i=d;return}function Vc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+40|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)+ -12>>2]|0;o=b;if((c[o+(n+16)>>2]|0)!=0){If(h);i=e;return b|0}p=c[o+(n+72)>>2]|0;if((p|0)==0){q=n}else{xf(p)|0;q=c[(c[m>>2]|0)+ -12>>2]|0}a[l]=1;l=on(d|0)|0;c[j>>2]=c[o+(q+24)>>2];if((c[o+(q+4)>>2]&176|0)==32){r=d+l|0}else{r=d}p=o+q|0;n=o+(q+76)|0;q=c[n>>2]|0;if((q|0)==-1){s=p;Qe(g,s);t=_j(g,5128)|0;u=yc[c[(c[t>>2]|0)+28>>2]&31](t,32)|0;Zj(g);g=u<<24>>24;c[n>>2]=g;v=s;w=g}else{v=p;w=q}q=w&255;w=d+l|0;l=f;p=j;c[l+0>>2]=c[p+0>>2];ad(k,f,d,r,w,v,q);if((c[k>>2]|0)!=0){If(h);i=e;return b|0}k=c[(c[m>>2]|0)+ -12>>2]|0;Oe(o+k|0,c[o+(k+16)>>2]|5);If(h);i=e;return b|0}function Wc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+40|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=h;a[l]=0;c[h+4>>2]=b;m=b;n=c[(c[m>>2]|0)+ -12>>2]|0;o=b;if((c[o+(n+16)>>2]|0)!=0){If(h);i=e;return b|0}p=c[o+(n+72)>>2]|0;if((p|0)!=0){xf(p)|0}a[l]=1;l=a[d]|0;p=(l&1)==0;if(p){q=(l&255)>>>1}else{q=c[d+4>>2]|0}l=c[(c[m>>2]|0)+ -12>>2]|0;c[j>>2]=c[o+(l+24)>>2];if(p){p=d;if((c[o+(l+4)>>2]&176|0)==32){r=p+q+1|0}else{r=p+1|0}s=r;t=d+1|0;u=d+1|0}else{r=c[d+8>>2]|0;if((c[o+(l+4)>>2]&176|0)==32){v=r+q|0}else{v=r}s=v;t=c[d+8>>2]|0;u=c[d+8>>2]|0}d=o+l|0;v=o+(l+76)|0;l=c[v>>2]|0;if((l|0)==-1){r=d;Qe(g,r);p=_j(g,5128)|0;n=yc[c[(c[p>>2]|0)+28>>2]&31](p,32)|0;Zj(g);g=n<<24>>24;c[v>>2]=g;w=r;x=g}else{w=d;x=l}l=x&255;x=u+q|0;q=f;u=j;c[q+0>>2]=c[u+0>>2];ad(k,f,t,s,x,w,l);if((c[k>>2]|0)!=0){If(h);i=e;return b|0}k=c[(c[m>>2]|0)+ -12>>2]|0;Oe(o+k|0,c[o+(k+16)>>2]|5);If(h);i=e;return b|0}function Xc(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=84;c[b+56>>2]=104;e=b+4|0;c[e>>2]=248;if(!((a[b+36|0]&1)==0)){Rm(c[b+44>>2]|0)}c[e>>2]=2400;Zj(b+8|0);Pe(b+56|0);i=d;return}function Yc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;i=i+184|0;f=e;g=e+16|0;h=e+152|0;j=e+168|0;k=g;l=g+4|0;c[k>>2]=212;m=g+56|0;c[m>>2]=232;n=g+56|0;Re(n,l);c[g+128>>2]=0;c[g+132>>2]=-1;c[k>>2]=84;c[g+56>>2]=104;o=f;p=l;c[p>>2]=2400;q=g+8|0;Xj(q);r=g+12|0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[r+12>>2]=0;c[r+16>>2]=0;c[r+20>>2]=0;c[p>>2]=248;p=g+36|0;r=g+52|0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[p+12>>2]=0;c[r>>2]=16;c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;md(l,f);if(!((a[o]&1)==0)){Rm(c[f+8>>2]|0)}f=b;do{if(!((((c[b+4>>2]|0)-(c[f>>2]|0)|0)/12|0)>>>0>d>>>0)){Rc(h,b,d);o=c[h>>2]|0;if((o|0)==0){break}r=h+4|0;s=c[r>>2]|0;if((s|0)!=(o|0)){c[r>>2]=s+(~((s+ -4+(0-o)|0)>>>2)<<2)}Rm(o)}}while(0);h=Vc(Kf(Vc(g,8)|0,d)|0,16)|0;b=c[f>>2]|0;f=b+(d*12|0)|0;o=c[f>>2]|0;s=((c[b+(d*12|0)+4>>2]|0)-o>>2)+ -1|0;if((s|0)==0){t=o}else{d=o;o=s;while(1){s=Kf(h,c[d+(o<<2)>>2]|0)|0;b=s;r=s;c[r+((c[(c[b>>2]|0)+ -12>>2]|0)+12)>>2]=9;c[r+((c[(c[b>>2]|0)+ -12>>2]|0)+76)>>2]=48;b=o+ -1|0;r=c[f>>2]|0;if((b|0)==0){t=r;break}else{o=b;d=r}}}Vc(Kf(h,c[t>>2]|0)|0,24)|0;bd(j,l);Wc(480,j)|0;if(!((a[j]&1)==0)){Rm(c[j+8>>2]|0)}c[k>>2]=84;c[m>>2]=104;m=g+4|0;c[m>>2]=248;if((a[p]&1)==0){c[m>>2]=2400;Zj(q);Pe(n);i=e;return}Rm(c[g+44>>2]|0);c[m>>2]=2400;Zj(q);Pe(n);i=e;return}function Zc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=i;i=i+16|0;g=f;if((d|0)<3){d=b;c[d+0>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;i=f;return}d=c[e+4>>2]|0;e=on(d|0)|0;if(e>>>0>4294967279){re(0)}if(e>>>0<11){h=e<<1&255;j=g;a[j]=h;k=j;l=h;m=g+1|0}else{h=e+16&-16;j=Pm(h)|0;c[g+8>>2]=j;n=h|1;c[g>>2]=n;c[g+4>>2]=e;k=g;l=n&255;m=j}mn(m|0,d|0,e|0)|0;a[m+e|0]=0;if((l&1)==0){o=(l&255)>>>1;p=g+1|0}else{o=c[g+4>>2]|0;p=c[g+8>>2]|0}e=o>>>0>3;if((en(p,40,e?3:o)|0)==0){if(o>>>0>2&(e^1)){q=28}else{q=13}}else{q=13}do{if((q|0)==13){if((l&1)==0){r=(l&255)>>>1;s=g+1|0}else{r=c[g+4>>2]|0;s=c[g+8>>2]|0}e=r>>>0>2;if((en(s,48,e?2:r)|0)==0){if(r>>>0>1&(e^1)){q=28;break}}if((l&1)==0){t=(l&255)>>>1;u=g+1|0}else{t=c[g+4>>2]|0;u=c[g+8>>2]|0}e=t>>>0>4;if((en(u,56,e?4:t)|0)==0){if(t>>>0>3&(e^1)){q=28;break}}if((l&1)==0){v=(l&255)>>>1;w=g+1|0}else{v=c[g+4>>2]|0;w=c[g+8>>2]|0}e=v>>>0>4;if((en(w,64,e?4:v)|0)==0){if(v>>>0>3&(e^1)){q=28;break}}e=b;c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0}}while(0);do{if((q|0)==28){if((l&1)==0){v=b;c[v+0>>2]=c[k+0>>2];c[v+4>>2]=c[k+4>>2];c[v+8>>2]=c[k+8>>2];break}v=c[g+8>>2]|0;w=c[g+4>>2]|0;if(w>>>0>4294967279){re(0)}if(w>>>0<11){a[b]=w<<1;x=b+1|0}else{t=w+16&-16;u=Pm(t)|0;c[b+8>>2]=u;c[b>>2]=t|1;c[b+4>>2]=w;x=u}mn(x|0,v|0,w|0)|0;a[x+w|0]=0}}while(0);if((l&1)==0){i=f;return}Rm(c[g+8>>2]|0);i=f;return}function _c(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+80|0;f=e;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;Zc(f,b,d);l=f;m=a[l]|0;if((m&1)==0){n=(m&255)>>>1}else{n=c[f+4>>2]|0}if((n|0)==0){xe(f,48)|0;o=a[l]|0;p=5e4}else{o=m;p=wb(c[d+8>>2]|0)|0}if((o&1)==0){q=(o&255)>>>1;r=f+1|0}else{q=c[f+4>>2]|0;r=c[f+8>>2]|0}o=q>>>0>3;do{if((en(r,40,o?3:q)|0)==0){if(!(q>>>0>2&(o^1))){break}$c(g,p);Uc(g);m=g;n=c[m>>2]|0;if((n|0)==0){break}s=g+4|0;t=c[s>>2]|0;if((t|0)==(n|0)){u=n}else{v=t;while(1){t=v+ -12|0;c[s>>2]=t;w=c[t>>2]|0;if((w|0)==0){x=t}else{t=v+ -8|0;y=c[t>>2]|0;if((y|0)!=(w|0)){c[t>>2]=y+(~((y+ -4+(0-w)|0)>>>2)<<2)}Rm(w);x=c[s>>2]|0}if((x|0)==(n|0)){break}else{v=x}}u=c[m>>2]|0}Rm(u)}}while(0);u=a[l]|0;if((u&1)==0){z=(u&255)>>>1;A=f+1|0}else{z=c[f+4>>2]|0;A=c[f+8>>2]|0}u=z>>>0>2;do{if((en(A,48,u?2:z)|0)==0){if(!(z>>>0>1&(u^1))){break}$c(h,p);x=h;g=c[x>>2]|0;if((g|0)==0){break}o=h+4|0;q=c[o>>2]|0;if((q|0)==(g|0)){B=g}else{r=q;while(1){q=r+ -12|0;c[o>>2]=q;v=c[q>>2]|0;if((v|0)==0){C=q}else{q=r+ -8|0;n=c[q>>2]|0;if((n|0)!=(v|0)){c[q>>2]=n+(~((n+ -4+(0-v)|0)>>>2)<<2)}Rm(v);C=c[o>>2]|0}if((C|0)==(g|0)){break}else{r=C}}B=c[x>>2]|0}Rm(B)}}while(0);B=a[l]|0;if((B&1)==0){D=(B&255)>>>1;E=f+1|0}else{D=c[f+4>>2]|0;E=c[f+8>>2]|0}B=D>>>0>4;do{if((en(E,56,B?4:D)|0)==0){if(!(D>>>0>3&(B^1))){break}$c(j,0);if((b|0)>2){C=2;do{Yc(j,wb(c[d+(C<<2)>>2]|0)|0);C=C+1|0;}while((C|0)<(b|0))}C=j;x=c[C>>2]|0;if((x|0)==0){break}h=j+4|0;u=c[h>>2]|0;if((u|0)==(x|0)){F=x}else{z=u;while(1){u=z+ -12|0;c[h>>2]=u;A=c[u>>2]|0;if((A|0)==0){G=u}else{u=z+ -8|0;r=c[u>>2]|0;if((r|0)!=(A|0)){c[u>>2]=r+(~((r+ -4+(0-A)|0)>>>2)<<2)}Rm(A);G=c[h>>2]|0}if((G|0)==(x|0)){break}else{z=G}}F=c[C>>2]|0}Rm(F)}}while(0);F=a[l]|0;if((F&1)==0){H=(F&255)>>>1;I=f+1|0}else{H=c[f+4>>2]|0;I=c[f+8>>2]|0}F=H>>>0>4;do{if((en(I,64,F?4:H)|0)==0){if(!(H>>>0>3&(F^1))){break}if((b|0)==3){J=25e3}else{J=wb(c[d+12>>2]|0)|0}$c(k,0);if((p|0)!=0){G=0;do{Yc(k,(hn()|0)%(J|0)|0);G=G+1|0;}while(G>>>0<p>>>0)}G=k;C=c[G>>2]|0;if((C|0)==0){break}j=k+4|0;B=c[j>>2]|0;if((B|0)==(C|0)){K=C}else{D=B;while(1){B=D+ -12|0;c[j>>2]=B;E=c[B>>2]|0;if((E|0)==0){L=B}else{B=D+ -8|0;z=c[B>>2]|0;if((z|0)!=(E|0)){c[B>>2]=z+(~((z+ -4+(0-E)|0)>>>2)<<2)}Rm(E);L=c[j>>2]|0}if((L|0)==(C|0)){break}else{D=L}}K=c[G>>2]|0}Rm(K)}}while(0);if((a[l]&1)==0){i=e;return 0}Rm(c[f+8>>2]|0);i=e;return 0}function $c(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;Rc(e,a,b);b=c[e>>2]|0;if((b|0)==0){i=d;return}a=e+4|0;e=c[a>>2]|0;if((e|0)!=(b|0)){c[a>>2]=e+(~((e+ -4+(0-b)|0)>>>2)<<2)}Rm(b);i=d;return}function ad(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+16|0;l=k;m=d;d=c[m>>2]|0;if((d|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;do{if((h|0)>0){if((jc[c[(c[d>>2]|0)+48>>2]&31](d,e,h)|0)==(h|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((q|0)>0){if(q>>>0<11){h=q<<1&255;e=l;a[e]=h;r=e;s=h;t=l+1|0}else{h=q+16&-16;e=Pm(h)|0;c[l+8>>2]=e;g=h|1;c[l>>2]=g;c[l+4>>2]=q;r=l;s=g&255;t=e}jn(t|0,j|0,q|0)|0;a[t+q|0]=0;if((s&1)==0){u=l+1|0}else{u=c[l+8>>2]|0}if((jc[c[(c[d>>2]|0)+48>>2]&31](d,u,q)|0)==(q|0)){if((a[r]&1)==0){break}Rm(c[l+8>>2]|0);break}c[m>>2]=0;c[b>>2]=0;if((a[r]&1)==0){i=k;return}Rm(c[l+8>>2]|0);i=k;return}}while(0);l=n-o|0;do{if((l|0)>0){if((jc[c[(c[d>>2]|0)+48>>2]&31](d,f,l)|0)==(l|0)){break}c[m>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[p>>2]=0;c[b>>2]=d;i=k;return}function bd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;f=c[d+48>>2]|0;if((f&16|0)!=0){g=d+44|0;h=c[g>>2]|0;j=c[d+24>>2]|0;if(h>>>0<j>>>0){c[g>>2]=j;k=j}else{k=h}h=c[d+20>>2]|0;j=h;g=k-j|0;if(g>>>0>4294967279){re(0)}if(g>>>0<11){a[b]=g<<1;l=b+1|0}else{m=g+16&-16;n=Pm(m)|0;c[b+8>>2]=n;c[b>>2]=m|1;c[b+4>>2]=g;l=n}if((h|0)==(k|0)){o=l}else{n=h;h=l;while(1){a[h]=a[n]|0;g=n+1|0;if((g|0)==(k|0)){break}else{h=h+1|0;n=g}}o=l+(k+(0-j))|0}a[o]=0;i=e;return}if((f&8|0)==0){f=b;c[f+0>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;i=e;return}f=c[d+8>>2]|0;o=c[d+16>>2]|0;d=f;j=o-d|0;if(j>>>0>4294967279){re(0)}if(j>>>0<11){a[b]=j<<1;p=b+1|0}else{k=j+16&-16;l=Pm(k)|0;c[b+8>>2]=l;c[b>>2]=k|1;c[b+4>>2]=j;p=l}if((f|0)==(o|0)){q=p}else{l=f;f=p;while(1){a[f]=a[l]|0;j=l+1|0;if((j|0)==(o|0)){break}else{f=f+1|0;l=j}}q=p+(o+(0-d))|0}a[q]=0;i=e;return}function cd(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=84;c[b+56>>2]=104;e=b+4|0;c[e>>2]=248;if(!((a[b+36|0]&1)==0)){Rm(c[b+44>>2]|0)}c[e>>2]=2400;Zj(b+8|0);Pe(b+56|0);Rm(b);i=d;return}function dd(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;e=b;f=c[(c[b>>2]|0)+ -12>>2]|0;c[e+f>>2]=84;b=e+(f+56)|0;c[b>>2]=104;g=e+(f+4)|0;c[g>>2]=248;if(!((a[e+(f+36)|0]&1)==0)){Rm(c[e+(f+44)>>2]|0)}c[g>>2]=2400;Zj(e+(f+8)|0);Pe(b);i=d;return}function ed(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=b;f=c[(c[b>>2]|0)+ -12>>2]|0;b=e+f|0;c[b>>2]=84;g=e+(f+56)|0;c[g>>2]=104;h=e+(f+4)|0;c[h>>2]=248;if(!((a[e+(f+36)|0]&1)==0)){Rm(c[e+(f+44)>>2]|0)}c[h>>2]=2400;Zj(e+(f+8)|0);Pe(g);Rm(b);i=d;return}function fd(b){b=b|0;var d=0,e=0;d=i;e=b;c[e>>2]=248;if(!((a[b+32|0]&1)==0)){Rm(c[b+40>>2]|0)}c[e>>2]=2400;Zj(b+4|0);i=d;return}function gd(b){b=b|0;var d=0,e=0;d=i;e=b;c[e>>2]=248;if(!((a[b+32|0]&1)==0)){Rm(c[b+40>>2]|0)}c[e>>2]=2400;Zj(b+4|0);Rm(b);i=d;return}function hd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;k=d+44|0;l=c[k>>2]|0;m=d+24|0;n=c[m>>2]|0;if(l>>>0<n>>>0){c[k>>2]=n;o=n}else{o=l}l=h&24;do{if((l|0)==24){if((g|0)==2){p=11;break}else if((g|0)==0){q=0;r=0;break}else if((g|0)!=1){p=15;break}k=b;c[k>>2]=0;c[k+4>>2]=0;k=b+8|0;c[k>>2]=-1;c[k+4>>2]=-1;i=j;return}else if((l|0)==0){k=b;c[k>>2]=0;c[k+4>>2]=0;k=b+8|0;c[k>>2]=-1;c[k+4>>2]=-1;i=j;return}else{if((g|0)==2){p=11;break}else if((g|0)==0){q=0;r=0;break}else if((g|0)!=1){p=15;break}if((h&8|0)==0){k=n-(c[d+20>>2]|0)|0;q=k;r=((k|0)<0)<<31>>31;break}else{k=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;q=k;r=((k|0)<0)<<31>>31;break}}}while(0);if((p|0)==15){g=b;c[g>>2]=0;c[g+4>>2]=0;g=b+8|0;c[g>>2]=-1;c[g+4>>2]=-1;i=j;return}if((p|0)==11){p=d+32|0;if((a[p]&1)==0){s=p+1|0}else{s=c[d+40>>2]|0}p=o-s|0;q=p;r=((p|0)<0)<<31>>31}p=ln(q|0,r|0,e|0,f|0)|0;f=J;do{if(!((f|0)<0|(f|0)==0&p>>>0<0)){e=d+32|0;if((a[e]&1)==0){t=e+1|0}else{t=c[d+40>>2]|0}e=o-t|0;r=((e|0)<0)<<31>>31;if((r|0)<(f|0)|(r|0)==(f|0)&e>>>0<p>>>0){break}e=h&8;do{if(!((p|0)==0&(f|0)==0)){do{if((e|0)!=0){if((c[d+12>>2]|0)!=0){break}r=b;c[r>>2]=0;c[r+4>>2]=0;r=b+8|0;c[r>>2]=-1;c[r+4>>2]=-1;i=j;return}}while(0);if(!((h&16|0)!=0&(n|0)==0)){break}r=b;c[r>>2]=0;c[r+4>>2]=0;r=b+8|0;c[r>>2]=-1;c[r+4>>2]=-1;i=j;return}}while(0);if((e|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+p;c[d+16>>2]=o}if((h&16|0)!=0){c[m>>2]=(c[d+20>>2]|0)+p}r=b;c[r>>2]=0;c[r+4>>2]=0;r=b+8|0;c[r>>2]=p;c[r+4>>2]=f;i=j;return}}while(0);f=b;c[f>>2]=0;c[f+4>>2]=0;f=b+8|0;c[f>>2]=-1;c[f+4>>2]=-1;i=j;return}function id(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d+8|0;xc[c[(c[b>>2]|0)+16>>2]&31](a,b,c[g>>2]|0,c[g+4>>2]|0,0,e);i=f;return}function jd(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;e=a+44|0;f=c[e>>2]|0;g=c[a+24>>2]|0;if(f>>>0<g>>>0){c[e>>2]=g;h=g}else{h=f}if((c[a+48>>2]&8|0)==0){j=-1;i=b;return j|0}f=a+16|0;g=c[f>>2]|0;e=c[a+12>>2]|0;if(g>>>0<h>>>0){c[f>>2]=h;k=h}else{k=g}if(!(e>>>0<k>>>0)){j=-1;i=b;return j|0}j=d[e]|0;i=b;return j|0}function kd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=b+44|0;g=c[f>>2]|0;h=c[b+24>>2]|0;if(g>>>0<h>>>0){c[f>>2]=h;j=h}else{j=g}g=b+8|0;h=c[g>>2]|0;f=b+12|0;k=c[f>>2]|0;if(!(h>>>0<k>>>0)){l=-1;i=e;return l|0}if((d|0)==-1){c[g>>2]=h;c[f>>2]=k+ -1;c[b+16>>2]=j;l=0;i=e;return l|0}do{if((c[b+48>>2]&16|0)==0){m=d&255;n=k+ -1|0;if(m<<24>>24==(a[n]|0)){o=m;p=n;break}else{l=-1}i=e;return l|0}else{o=d&255;p=k+ -1|0}}while(0);c[g>>2]=h;c[f>>2]=p;c[b+16>>2]=j;a[p]=o;l=d;i=e;return l|0}function ld(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;e=i;if((d|0)==-1){f=0;i=e;return f|0}g=b;h=b+12|0;j=b+8|0;k=(c[h>>2]|0)-(c[j>>2]|0)|0;l=b+24|0;m=c[l>>2]|0;n=b+28|0;o=c[n>>2]|0;if((m|0)==(o|0)){p=b+48|0;if((c[p>>2]&16|0)==0){f=-1;i=e;return f|0}q=b+20|0;r=c[q>>2]|0;s=m-r|0;t=b+44|0;u=(c[t>>2]|0)-r|0;r=b+32|0;v=r;w=a[v]|0;x=(w&1)!=0;if(x){y=(c[r>>2]&-2)+ -1|0;z=c[b+36>>2]|0}else{y=10;z=(w&255)>>>1}if((z|0)==(y|0)){Ee(r,y,1,y,y,0,0);if((a[v]&1)==0){A=11}else{A=12}}else{if(x){A=12}else{A=11}}if((A|0)==11){a[v]=(z<<1)+2;B=r+1|0;C=z+1|0}else if((A|0)==12){A=c[b+40>>2]|0;x=z+1|0;c[b+36>>2]=x;B=A;C=x}a[B+z|0]=0;a[B+C|0]=0;C=a[v]|0;if((C&1)==0){D=C;E=10}else{C=c[r>>2]|0;D=C&255;E=(C&-2)+ -1|0}C=(D&1)==0;if(C){F=(D&255)>>>1}else{F=c[b+36>>2]|0}do{if(F>>>0<E>>>0){ze(r,E-F|0,0)|0}else{if(C){a[r+E+1|0]=0;a[v]=E<<1;break}else{a[(c[b+40>>2]|0)+E|0]=0;c[b+36>>2]=E;break}}}while(0);E=a[v]|0;if((E&1)==0){G=r+1|0;H=(E&255)>>>1}else{G=c[b+40>>2]|0;H=c[b+36>>2]|0}E=G+H|0;c[q>>2]=G;c[n>>2]=E;n=G+s|0;c[l>>2]=n;s=G+u|0;c[t>>2]=s;I=p;J=s;K=E;L=n}else{I=b+48|0;J=c[b+44>>2]|0;K=o;L=m}m=L+1|0;o=m>>>0<J>>>0?J:m;c[b+44>>2]=o;if((c[I>>2]&8|0)!=0){I=b+32|0;if((a[I]&1)==0){M=I+1|0}else{M=c[b+40>>2]|0}c[j>>2]=M;c[h>>2]=M+k;c[b+16>>2]=o}if((L|0)==(K|0)){f=yc[c[(c[b>>2]|0)+52>>2]&31](g,d&255)|0;i=e;return f|0}else{c[l>>2]=m;a[L]=d;f=d&255;i=e;return f|0}return 0}function md(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=i;f=b+32|0;we(f,d)|0;d=b+44|0;c[d>>2]=0;g=b+48|0;h=c[g>>2]|0;if((h&8|0)!=0){j=a[f]|0;if((j&1)==0){k=f+((j&255)>>>1)+1|0;c[d>>2]=k;l=f+1|0;m=k;n=f+1|0}else{k=(c[b+40>>2]|0)+(c[b+36>>2]|0)|0;c[d>>2]=k;j=c[b+40>>2]|0;l=j;m=k;n=j}c[b+8>>2]=l;c[b+12>>2]=n;c[b+16>>2]=m}if((h&16|0)==0){i=e;return}h=f;m=a[h]|0;if((m&1)==0){n=(m&255)>>>1;c[d>>2]=f+n+1;o=n;p=m;q=10}else{m=c[b+36>>2]|0;c[d>>2]=(c[b+40>>2]|0)+m;d=c[f>>2]|0;o=m;p=d&255;q=(d&-2)+ -1|0}d=(p&1)==0;if(d){r=(p&255)>>>1}else{r=c[b+36>>2]|0}do{if(r>>>0<q>>>0){ze(f,q-r|0,0)|0}else{if(d){a[f+q+1|0]=0;a[h]=q<<1;break}else{a[(c[b+40>>2]|0)+q|0]=0;c[b+36>>2]=q;break}}}while(0);q=a[h]|0;if((q&1)==0){s=f+1|0;t=f+1|0;u=(q&255)>>>1}else{q=c[b+40>>2]|0;s=q;t=q;u=c[b+36>>2]|0}q=b+24|0;c[q>>2]=t;c[b+20>>2]=t;c[b+28>>2]=s+u;if((c[g>>2]&3|0)==0){i=e;return}c[q>>2]=t+o;i=e;return}function nd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;e=a+4|0;f=c[e>>2]|0;g=a;h=c[g>>2]|0;j=h;k=(f-j|0)/12|0;l=k+1|0;if(l>>>0>357913941){Rj(0)}m=a+8|0;a=((c[m>>2]|0)-j|0)/12|0;if(a>>>0<178956970){j=a<<1;a=j>>>0<l>>>0?l:j;if((a|0)==0){n=0;o=0}else{p=a;q=5}}else{p=357913941;q=5}if((q|0)==5){n=p;o=Pm(p*12|0)|0}p=o+(k*12|0)|0;k=o+(n*12|0)|0;if((p|0)==0){r=f;s=h}else{od(p,b);r=c[e>>2]|0;s=c[g>>2]|0}b=o+(l*12|0)|0;do{if((r|0)==(s|0)){c[g>>2]=p;c[e>>2]=b;c[m>>2]=k;t=r}else{l=r;o=p;do{l=l+ -12|0;od(o+ -12|0,l);o=o+ -12|0;}while((l|0)!=(s|0));l=c[g>>2]|0;h=c[e>>2]|0;c[g>>2]=o;c[e>>2]=b;c[m>>2]=k;if((h|0)==(l|0)){t=l;break}else{u=h}while(1){h=u+ -12|0;f=c[h>>2]|0;if((f|0)!=0){n=u+ -8|0;q=c[n>>2]|0;if((q|0)!=(f|0)){c[n>>2]=q+(~((q+ -4+(0-f)|0)>>>2)<<2)}Rm(f)}if((h|0)==(l|0)){t=l;break}else{u=h}}}}while(0);if((t|0)==0){i=d;return}Rm(t);i=d;return}function od(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;e=a;c[e>>2]=0;f=a+4|0;c[f>>2]=0;g=a+8|0;c[g>>2]=0;a=b+4|0;h=b;b=(c[a>>2]|0)-(c[h>>2]|0)|0;j=b>>2;if((j|0)==0){i=d;return}if(j>>>0>1073741823){Rj(0)}k=Pm(b)|0;c[f>>2]=k;c[e>>2]=k;c[g>>2]=k+(j<<2);j=c[h>>2]|0;h=c[a>>2]|0;if((j|0)==(h|0)){i=d;return}a=(h+ -4+(0-j)|0)>>>2;g=j;j=k;while(1){if((j|0)!=0){c[j>>2]=c[g>>2]}e=g+4|0;if((e|0)==(h|0)){break}else{g=e;j=j+4|0}}c[f>>2]=k+(a+1<<2);i=d;return}function pd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+16|0;f=e;g=a;h=a;c[h>>2]=0;j=a+4|0;c[j>>2]=0;k=a+8|0;c[k>>2]=0;a=b+4|0;l=b;m=(c[a>>2]|0)-(c[l>>2]|0)>>2;n=d+4|0;o=d;p=(c[n>>2]|0)-(c[o>>2]|0)>>2;q=m>>>0>p>>>0?m:p;if(m>>>0<q>>>0){qd(b,q-m|0)}m=c[n>>2]|0;b=c[o>>2]|0;p=m-b>>2;do{if(p>>>0<q>>>0){qd(d,q-p|0)}else{if(!(p>>>0>q>>>0)){break}r=b+(q<<2)|0;if((m|0)==(r|0)){break}c[n>>2]=m+(~((m+ -4+(0-r)|0)>>>2)<<2)}}while(0);m=c[j>>2]|0;n=c[h>>2]|0;b=m-n>>2;do{if(b>>>0<q>>>0){qd(g,q-b|0);s=c[h>>2]|0}else{if(!(b>>>0>q>>>0)){s=n;break}p=n+(q<<2)|0;if((m|0)==(p|0)){s=n;break}c[j>>2]=m+(~((m+ -4+(0-p)|0)>>>2)<<2);s=n}}while(0);c[8]=0;n=c[l>>2]|0;l=c[a>>2]|0;a=c[o>>2]|0;od(f,g);if((n|0)!=(l|0)){g=n;n=s;s=a;while(1){a=(c[s>>2]|0)+(c[g>>2]|0)+(c[8]|0)|0;c[8]=(a>>>0)/1e9|0;c[n>>2]=(a>>>0)%1e9|0;a=g+4|0;if((a|0)==(l|0)){break}else{s=s+4|0;n=n+4|0;g=a}}}g=c[f>>2]|0;if((g|0)!=0){n=f+4|0;f=c[n>>2]|0;if((f|0)!=(g|0)){c[n>>2]=f+(~((f+ -4+(0-g)|0)>>>2)<<2)}Rm(g)}g=c[8]|0;if((g|0)==0){i=e;return}f=c[j>>2]|0;if((f|0)!=(c[k>>2]|0)){if((f|0)!=0){c[f>>2]=g}c[j>>2]=f+4;i=e;return}n=c[h>>2]|0;s=f-n|0;f=s>>2;l=f+1|0;if(l>>>0>1073741823){Rj(0)}if(f>>>0<536870911){a=s>>1;o=a>>>0<l>>>0?l:a;if((o|0)==0){t=0;u=0}else{v=o;w=28}}else{v=1073741823;w=28}if((w|0)==28){t=v;u=Pm(v<<2)|0}v=u+(f<<2)|0;if((v|0)!=0){c[v>>2]=g}g=n;mn(u|0,g|0,s|0)|0;c[h>>2]=u;c[j>>2]=u+(l<<2);c[k>>2]=u+(t<<2);if((n|0)==0){i=e;return}Rm(g);i=e;return}function qd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;e=a+8|0;f=a+4|0;g=c[f>>2]|0;h=c[e>>2]|0;j=g;if(!(h-j>>2>>>0<b>>>0)){k=b;l=g;while(1){if((l|0)!=0){c[l>>2]=0}m=k+ -1|0;if((m|0)==0){break}else{k=m;l=l+4|0}}c[f>>2]=g+(b<<2);i=d;return}g=a;a=c[g>>2]|0;l=a;k=j-l|0;j=k>>2;m=j+b|0;if(m>>>0>1073741823){Rj(0)}n=h-l|0;if(n>>2>>>0<536870911){l=n>>1;n=l>>>0<m>>>0?m:l;if((n|0)==0){o=0;p=0}else{q=n;r=10}}else{q=1073741823;r=10}if((r|0)==10){o=q;p=Pm(q<<2)|0}q=b;b=p+(j<<2)|0;while(1){if((b|0)!=0){c[b>>2]=0}j=q+ -1|0;if((j|0)==0){break}else{q=j;b=b+4|0}}b=a;mn(p|0,b|0,k|0)|0;c[g>>2]=p;c[f>>2]=p+(m<<2);c[e>>2]=p+(o<<2);if((a|0)==0){i=d;return}Rm(b);i=d;return}function rd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b;e=b+8|0;f=b+16|0;g=b+24|0;h=c[s>>2]|0;Nd(1104,h,1160);c[98]=2532;c[400>>2]=2552;c[396>>2]=0;Re(400|0,1104);c[472>>2]=0;c[476>>2]=-1;j=c[t>>2]|0;c[302]=2400;Xj(1212|0);c[1216>>2]=0;c[1220>>2]=0;c[1224>>2]=0;c[1228>>2]=0;c[1232>>2]=0;c[1236>>2]=0;c[302]=1720;c[1240>>2]=j;Yj(g,1212|0);k=_j(g,5192)|0;l=k;Zj(g);c[1244>>2]=l;c[1248>>2]=1168;a[1252|0]=(pc[c[(c[k>>2]|0)+28>>2]&127](l)|0)&1;c[120]=2612;c[484>>2]=2632;Re(484|0,1208);c[556>>2]=0;c[560>>2]=-1;l=c[r>>2]|0;c[314]=2400;Xj(1260|0);c[1264>>2]=0;c[1268>>2]=0;c[1272>>2]=0;c[1276>>2]=0;c[1280>>2]=0;c[1284>>2]=0;c[314]=1720;c[1288>>2]=l;Yj(f,1260|0);k=_j(f,5192)|0;g=k;Zj(f);c[1292>>2]=g;c[1296>>2]=1176;a[1300|0]=(pc[c[(c[k>>2]|0)+28>>2]&127](g)|0)&1;c[142]=2612;c[572>>2]=2632;Re(572|0,1256);c[644>>2]=0;c[648>>2]=-1;g=c[(c[(c[142]|0)+ -12>>2]|0)+592>>2]|0;c[164]=2612;c[660>>2]=2632;Re(660|0,g);c[732>>2]=0;c[736>>2]=-1;c[(c[(c[98]|0)+ -12>>2]|0)+464>>2]=480;g=(c[(c[142]|0)+ -12>>2]|0)+572|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[142]|0)+ -12>>2]|0)+640>>2]=480;zd(1304,h,1184|0);c[186]=2572;c[752>>2]=2592;c[748>>2]=0;Re(752|0,1304);c[824>>2]=0;c[828>>2]=-1;c[340]=2464;Xj(1364|0);c[1368>>2]=0;c[1372>>2]=0;c[1376>>2]=0;c[1380>>2]=0;c[1384>>2]=0;c[1388>>2]=0;c[340]=1464;c[1392>>2]=j;Yj(e,1364|0);j=_j(e,5200)|0;h=j;Zj(e);c[1396>>2]=h;c[1400>>2]=1192;a[1404|0]=(pc[c[(c[j>>2]|0)+28>>2]&127](h)|0)&1;c[208]=2652;c[836>>2]=2672;Re(836|0,1360);c[908>>2]=0;c[912>>2]=-1;c[352]=2464;Xj(1412|0);c[1416>>2]=0;c[1420>>2]=0;c[1424>>2]=0;c[1428>>2]=0;c[1432>>2]=0;c[1436>>2]=0;c[352]=1464;c[1440>>2]=l;Yj(d,1412|0);l=_j(d,5200)|0;h=l;Zj(d);c[1444>>2]=h;c[1448>>2]=1200;a[1452|0]=(pc[c[(c[l>>2]|0)+28>>2]&127](h)|0)&1;c[230]=2652;c[924>>2]=2672;Re(924|0,1408);c[996>>2]=0;c[1e3>>2]=-1;h=c[(c[(c[230]|0)+ -12>>2]|0)+944>>2]|0;c[252]=2652;c[1012>>2]=2672;Re(1012|0,h);c[1084>>2]=0;c[1088>>2]=-1;c[(c[(c[186]|0)+ -12>>2]|0)+816>>2]=832;h=(c[(c[230]|0)+ -12>>2]|0)+924|0;c[h>>2]=c[h>>2]|8192;c[(c[(c[230]|0)+ -12>>2]|0)+992>>2]=832;i=b;return}function sd(a){a=a|0;a=i;xf(480)|0;xf(656)|0;Df(832)|0;Df(1008)|0;i=a;return}function td(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);i=b;return}function ud(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);Rm(a);i=b;return}function vd(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;pc[c[(c[b>>2]|0)+24>>2]&127](b)|0;f=_j(d,5200)|0;d=f;c[b+36>>2]=d;a[b+44|0]=(pc[c[(c[f>>2]|0)+28>>2]&127](d)|0)&1;i=e;return}function wd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b;e=b+8|0;f=a+36|0;g=a+40|0;h=d;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=zc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((ob(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Rb(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function xd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;if((a[b+44|0]|0)!=0){g=ob(d|0,4,e|0,c[b+32>>2]|0)|0;i=f;return g|0}h=b;if((e|0)>0){j=d;k=0}else{g=0;i=f;return g|0}while(1){if((yc[c[(c[h>>2]|0)+52>>2]&31](b,c[j>>2]|0)|0)==-1){g=k;l=6;break}d=k+1|0;if((d|0)<(e|0)){j=j+4|0;k=d}else{g=d;l=6;break}}if((l|0)==6){i=f;return g|0}return 0}function yd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;a:do{if(!k){c[g>>2]=d;if((a[b+44|0]|0)!=0){if((ob(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f;c[h>>2]=m;n=g+4|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=uc[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=12;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(!(v>>>0<2)){l=-1;w=12;break}v=(c[h>>2]|0)-r|0;if((ob(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=12;break}if(u){t=u?c[j>>2]|0:t}else{break a}}if((w|0)==7){if((ob(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function zd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+8|0;g=f;h=b;c[h>>2]=2464;j=b+4|0;Xj(j);k=b+8|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[h>>2]=1576;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Yj(g,j);j=_j(g,5200)|0;e=j;d=b+36|0;c[d>>2]=e;h=b+44|0;c[h>>2]=pc[c[(c[j>>2]|0)+24>>2]&127](e)|0;e=c[d>>2]|0;a[b+53|0]=(pc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[h>>2]|0)>8){ij(1672)}else{Zj(g);i=f;return}}function Ad(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);i=b;return}function Bd(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);Rm(a);i=b;return}function Cd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=_j(d,5200)|0;d=f;g=b+36|0;c[g>>2]=d;h=b+44|0;c[h>>2]=pc[c[(c[f>>2]|0)+24>>2]&127](d)|0;d=c[g>>2]|0;a[b+53|0]=(pc[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[h>>2]|0)>8){ij(1672)}else{i=e;return}}function Dd(a){a=a|0;var b=0,c=0;b=i;c=Gd(a,0)|0;i=b;return c|0}function Ed(a){a=a|0;var b=0,c=0;b=i;c=Gd(a,1)|0;i=b;return c|0}function Fd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=f;q=uc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+4|0,j,p,f+8|0,g)|0;if((q|0)==1|(q|0)==2){m=-1;i=e;return m|0}else if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}q=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>p>>>0)){break a}r=o+ -1|0;c[g>>2]=r;if((Qb(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Gd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;if((a[k]|0)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;a:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=Jb(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o;l=l+1|0;if((l|0)>=(k|0)){break a}}i=e;return n|0}}while(0);b:do{if((a[b+53|0]|0)==0){l=b+40|0;m=b+36|0;o=f;p=g+4|0;q=b+32|0;r=k;while(1){s=c[l>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[m>>2]|0;w=f+r|0;x=uc[c[(c[t>>2]|0)+16>>2]&15](t,s,o,w,h,g,p,j)|0;if((x|0)==3){y=14;break}else if((x|0)==2){n=-1;y=22;break}else if((x|0)!=1){z=r;break b}x=c[l>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){n=-1;y=22;break}v=Jb(c[q>>2]|0)|0;if((v|0)==-1){n=-1;y=22;break}a[w]=v;r=r+1|0}if((y|0)==14){c[g>>2]=a[o]|0;z=r;break}else if((y|0)==22){i=e;return n|0}}else{c[g>>2]=a[f]|0;z=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=z;while(1){if((b|0)<=0){break}z=b+ -1|0;if((Qb(a[f+z|0]|0,c[d>>2]|0)|0)==-1){n=-1;y=22;break}else{b=z}}if((y|0)==22){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function Hd(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);i=b;return}function Id(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);Rm(a);i=b;return}function Jd(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;pc[c[(c[b>>2]|0)+24>>2]&127](b)|0;f=_j(d,5192)|0;d=f;c[b+36>>2]=d;a[b+44|0]=(pc[c[(c[f>>2]|0)+28>>2]&127](d)|0)&1;i=e;return}function Kd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b;e=b+8|0;f=a+36|0;g=a+40|0;h=d;j=d+8|0;k=d;d=a+32|0;while(1){a=c[f>>2]|0;l=zc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,h,j,e)|0;a=(c[e>>2]|0)-k|0;if((ob(h|0,1,a|0,c[d>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Rb(c[d>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function Ld(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;if((a[b+44|0]|0)!=0){h=ob(e|0,1,f|0,c[b+32>>2]|0)|0;i=g;return h|0}j=b;if((f|0)>0){k=e;l=0}else{h=0;i=g;return h|0}while(1){if((yc[c[(c[j>>2]|0)+52>>2]&31](b,d[k]|0)|0)==-1){h=l;m=6;break}e=l+1|0;if((e|0)<(f|0)){k=k+1|0;l=e}else{h=e;m=6;break}}if((m|0)==6){i=g;return h|0}return 0}function Md(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=(d|0)==-1;a:do{if(!k){a[g]=d;if((a[b+44|0]|0)!=0){if((ob(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}m=f;c[h>>2]=m;n=g+1|0;o=b+36|0;p=b+40|0;q=f+8|0;r=f;s=b+32|0;t=g;while(1){u=c[o>>2]|0;v=uc[c[(c[u>>2]|0)+12>>2]&15](u,c[p>>2]|0,t,n,j,m,q,h)|0;if((c[j>>2]|0)==(t|0)){l=-1;w=12;break}if((v|0)==3){w=7;break}u=(v|0)==1;if(!(v>>>0<2)){l=-1;w=12;break}v=(c[h>>2]|0)-r|0;if((ob(m|0,1,v|0,c[s>>2]|0)|0)!=(v|0)){l=-1;w=12;break}if(u){t=u?c[j>>2]|0:t}else{break a}}if((w|0)==7){if((ob(t|0,1,1,c[s>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((w|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function Nd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+8|0;g=f;h=b;c[h>>2]=2400;j=b+4|0;Xj(j);k=b+8|0;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;c[h>>2]=1832;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Yj(g,j);j=_j(g,5192)|0;e=j;d=b+36|0;c[d>>2]=e;h=b+44|0;c[h>>2]=pc[c[(c[j>>2]|0)+24>>2]&127](e)|0;e=c[d>>2]|0;a[b+53|0]=(pc[c[(c[e>>2]|0)+28>>2]&127](e)|0)&1;if((c[h>>2]|0)>8){ij(1672)}else{Zj(g);i=f;return}}function Od(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);i=b;return}function Pd(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);Rm(a);i=b;return}function Qd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;f=_j(d,5192)|0;d=f;g=b+36|0;c[g>>2]=d;h=b+44|0;c[h>>2]=pc[c[(c[f>>2]|0)+24>>2]&127](d)|0;d=c[g>>2]|0;a[b+53|0]=(pc[c[(c[d>>2]|0)+28>>2]&127](d)|0)&1;if((c[h>>2]|0)>8){ij(1672)}else{i=e;return}}function Rd(a){a=a|0;var b=0,c=0;b=i;c=Ud(a,0)|0;i=b;return c|0}function Sd(a){a=a|0;var b=0,c=0;b=i;c=Ud(a,1)|0;i=b;return c|0}function Td(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){a[h]=c[n>>2];o=c[b+36>>2]|0;p=f;q=uc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+1|0,j,p,f+8|0,g)|0;if((q|0)==1|(q|0)==2){m=-1;i=e;return m|0}else if((q|0)==3){a[p]=c[n>>2];c[g>>2]=f+1}q=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>p>>>0)){break a}r=o+ -1|0;c[g>>2]=r;if((Qb(a[r]|0,c[q>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Ud(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+32|0;g=f;h=f+8|0;j=f+16|0;k=f+24|0;l=b+52|0;if((a[l]|0)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;a:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=Jb(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p;m=m+1|0;if((m|0)>=(l|0)){break a}}i=f;return o|0}}while(0);b:do{if((a[b+53|0]|0)==0){m=b+40|0;n=b+36|0;p=g;q=h+1|0;r=b+32|0;s=l;while(1){t=c[m>>2]|0;u=t;v=c[u>>2]|0;w=c[u+4>>2]|0;u=c[n>>2]|0;x=g+s|0;y=uc[c[(c[u>>2]|0)+16>>2]&15](u,t,p,x,j,h,q,k)|0;if((y|0)==3){z=14;break}else if((y|0)==2){o=-1;z=23;break}else if((y|0)!=1){A=s;break b}y=c[m>>2]|0;c[y>>2]=v;c[y+4>>2]=w;if((s|0)==8){o=-1;z=23;break}w=Jb(c[r>>2]|0)|0;if((w|0)==-1){o=-1;z=23;break}a[x]=w;s=s+1|0}if((z|0)==14){a[h]=a[p]|0;A=s;break}else if((z|0)==23){i=f;return o|0}}else{a[h]=a[g]|0;A=l}}while(0);do{if(e){l=a[h]|0;c[b+48>>2]=l&255;B=l}else{l=b+32|0;k=A;while(1){if((k|0)<=0){z=21;break}j=k+ -1|0;if((Qb(d[g+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;z=23;break}else{k=j}}if((z|0)==21){B=a[h]|0;break}else if((z|0)==23){i=f;return o|0}}}while(0);o=B&255;i=f;return o|0}function Vd(){var a=0;a=i;rd(0);gc(117,1096,q|0)|0;i=a;return}function Wd(a){a=a|0;i=i;return}function Xd(a){a=a|0;var b=0;b=a+4|0;c[b>>2]=(c[b>>2]|0)+1;i=i;return}function Yd(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;e=c[d>>2]|0;c[d>>2]=e+ -1;if((e|0)!=0){f=0;i=b;return f|0}mc[c[(c[a>>2]|0)+8>>2]&255](a);f=1;i=b;return f|0}function Zd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=1976;e=on(b|0)|0;f=Qm(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;mn(g|0,b|0,e+1|0)|0;i=d;return}function _d(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1976;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Sm((c[d>>2]|0)+ -12|0)}Ta(a|0);Rm(a);i=b;return}function $d(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=1976;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){g=a;Ta(g|0);i=b;return}Sm((c[d>>2]|0)+ -12|0);g=a;Ta(g|0);i=b;return}function ae(a){a=a|0;i=i;return c[a+4>>2]|0}function be(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;c[b>>2]=2e3;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=on(f|0)|0;g=Qm(d+13|0)|0;c[g+4>>2]=d;c[g>>2]=d;h=g+12|0;c[b+4>>2]=h;c[g+8>>2]=0;mn(h|0,f|0,d+1|0)|0;i=e;return}function ce(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=2e3;e=on(b|0)|0;f=Qm(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;mn(g|0,b|0,e+1|0)|0;i=d;return}function de(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=2e3;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Sm((c[d>>2]|0)+ -12|0)}Ta(a|0);Rm(a);i=b;return}function ee(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=2e3;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){g=a;Ta(g|0);i=b;return}Sm((c[d>>2]|0)+ -12|0);g=a;Ta(g|0);i=b;return}function fe(a){a=a|0;i=i;return c[a+4>>2]|0}function ge(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=1976;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Sm((c[d>>2]|0)+ -12|0)}Ta(a|0);Rm(a);i=b;return}function he(a){a=a|0;i=i;return}function ie(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;i=i;return}function je(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e;rc[c[(c[a>>2]|0)+12>>2]&3](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function ke(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;if((c[b+4>>2]|0)!=(a|0)){f=0;i=e;return f|0}f=(c[b>>2]|0)==(d|0);i=e;return f|0}function le(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;d=i;f=ec(e|0)|0;e=on(f|0)|0;if(e>>>0>4294967279){re(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0;mn(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}else{j=e+16&-16;k=Pm(j)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=e;g=k;mn(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}}function me(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;i=i+16|0;g=f;h=d;j=c[h>>2]|0;k=e;do{if((j|0)!=0){l=a[k]|0;if((l&1)==0){m=(l&255)>>>1}else{m=c[e+4>>2]|0}if((m|0)==0){n=j}else{Ce(e,2152,2)|0;n=c[h>>2]|0}l=c[d+4>>2]|0;rc[c[(c[l>>2]|0)+24>>2]&3](g,l,n);l=g;o=a[l]|0;if((o&1)==0){p=g+1|0;q=(o&255)>>>1}else{p=c[g+8>>2]|0;q=c[g+4>>2]|0}Ce(e,p,q)|0;if((a[l]&1)==0){break}Rm(c[g+8>>2]|0)}}while(0);g=b;c[g+0>>2]=c[k+0>>2];c[g+4>>2]=c[k+4>>2];c[g+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;i=f;return}function ne(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+32|0;g=f;h=f+16|0;j=on(e|0)|0;if(j>>>0>4294967279){re(0)}if(j>>>0<11){a[h]=j<<1;k=h+1|0}else{l=j+16&-16;m=Pm(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}mn(k|0,e|0,j|0)|0;a[k+j|0]=0;me(g,d,h);be(b,g);if(!((a[g]&1)==0)){Rm(c[g+8>>2]|0)}if(!((a[h]&1)==0)){Rm(c[h+8>>2]|0)}c[b>>2]=2168;h=d;d=c[h+4>>2]|0;g=b+8|0;c[g>>2]=c[h>>2];c[g+4>>2]=d;i=f;return}function oe(a){a=a|0;var b=0;b=i;ee(a);Rm(a);i=b;return}function pe(a){a=a|0;var b=0;b=i;ee(a);i=b;return}function qe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;qb(2304)|0;if((c[a>>2]|0)==1){do{Ob(2328,2304)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)==0){c[a>>2]=1;Zb(2304)|0;mc[d&255](b);qb(2304)|0;c[a>>2]=-1;Zb(2304)|0;Hb(2328)|0;i=e;return}else{Zb(2304)|0;i=e;return}}function re(a){a=a|0;a=vb(8)|0;Zd(a,2376);c[a>>2]=2056;cc(a|0,2096,19)}function se(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d;if((a[f]&1)==0){g=b;c[g+0>>2]=c[f+0>>2];c[g+4>>2]=c[f+4>>2];c[g+8>>2]=c[f+8>>2];i=e;return}f=c[d+8>>2]|0;g=c[d+4>>2]|0;if(g>>>0>4294967279){re(0)}if(g>>>0<11){a[b]=g<<1;h=b+1|0}else{d=g+16&-16;j=Pm(d)|0;c[b+8>>2]=j;c[b>>2]=d|1;c[b+4>>2]=g;h=j}mn(h|0,f|0,g|0)|0;a[h+g|0]=0;i=e;return}function te(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(e>>>0>4294967279){re(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0}else{h=e+16&-16;j=Pm(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=e;g=j}mn(g|0,d|0,e|0)|0;a[g+e|0]=0;i=f;return}function ue(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(d>>>0>4294967279){re(0)}if(d>>>0<11){a[b]=d<<1;g=b+1|0}else{h=d+16&-16;j=Pm(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=d;g=j}jn(g|0,e|0,d|0)|0;a[g+d|0]=0;i=f;return}function ve(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Rm(c[b+8>>2]|0);i=d;return}function we(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;if((b|0)==(d|0)){i=e;return b|0}f=a[d]|0;if((f&1)==0){g=d+1|0;h=(f&255)>>>1}else{g=c[d+8>>2]|0;h=c[d+4>>2]|0}d=b;f=a[d]|0;if((f&1)==0){j=f;k=10}else{f=c[b>>2]|0;j=f&255;k=(f&-2)+ -1|0}f=(j&1)==0;if(k>>>0<h>>>0){if(f){l=(j&255)>>>1}else{l=c[b+4>>2]|0}De(b,k,h-k|0,l,0,l,h,g);i=e;return b|0}if(f){m=b+1|0}else{m=c[b+8>>2]|0}nn(m|0,g|0,h|0)|0;a[m+h|0]=0;if((a[d]&1)==0){a[d]=h<<1;i=e;return b|0}else{c[b+4>>2]=h;i=e;return b|0}return 0}function xe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;f=on(d|0)|0;g=b;h=a[g]|0;if((h&1)==0){j=h;k=10}else{h=c[b>>2]|0;j=h&255;k=(h&-2)+ -1|0}h=(j&1)==0;if(k>>>0<f>>>0){if(h){l=(j&255)>>>1}else{l=c[b+4>>2]|0}De(b,k,f-k|0,l,0,l,f,d);i=e;return b|0}if(h){m=b+1|0}else{m=c[b+8>>2]|0}nn(m|0,d|0,f|0)|0;a[m+f|0]=0;if((a[g]&1)==0){a[g]=f<<1;i=e;return b|0}else{c[b+4>>2]=f;i=e;return b|0}return 0}function ye(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=b;h=a[g]|0;j=(h&1)==0;if(j){k=(h&255)>>>1}else{k=c[b+4>>2]|0}if(k>>>0<d>>>0){ze(b,d-k|0,e)|0;i=f;return}if(j){a[b+d+1|0]=0;a[g]=d<<1;i=f;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;i=f;return}}function ze(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;if((d|0)==0){i=f;return b|0}g=b;h=a[g]|0;if((h&1)==0){j=h;k=10}else{h=c[b>>2]|0;j=h&255;k=(h&-2)+ -1|0}if((j&1)==0){l=(j&255)>>>1}else{l=c[b+4>>2]|0}if((k-l|0)>>>0<d>>>0){Ee(b,k,d-k+l|0,l,l,0,0);m=a[g]|0}else{m=j}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}jn(n+l|0,e|0,d|0)|0;e=l+d|0;if((a[g]&1)==0){a[g]=e<<1}else{c[b+4>>2]=e}a[n+e|0]=0;i=f;return b|0}function Ae(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;if(d>>>0>4294967279){re(0)}f=b;g=a[f]|0;if((g&1)==0){h=g;j=10}else{g=c[b>>2]|0;h=g&255;j=(g&-2)+ -1|0}if((h&1)==0){k=(h&255)>>>1}else{k=c[b+4>>2]|0}g=k>>>0>d>>>0?k:d;if(g>>>0<11){l=10}else{l=(g+16&-16)+ -1|0}if((l|0)==(j|0)){i=e;return}do{if((l|0)==10){m=b+1|0;n=0;o=c[b+8>>2]|0;p=1}else{g=l+1|0;if(l>>>0>j>>>0){q=Pm(g)|0}else{q=Pm(g)|0}if((h&1)==0){m=q;n=1;o=b+1|0;p=0;break}else{m=q;n=1;o=c[b+8>>2]|0;p=1;break}}}while(0);if((h&1)==0){r=(h&255)>>>1}else{r=c[b+4>>2]|0}mn(m|0,o|0,r+1|0)|0;if(p){Rm(o)}if(n){c[b>>2]=l+1|1;c[b+4>>2]=k;c[b+8>>2]=m;i=e;return}else{a[f]=k<<1;i=e;return}}function Be(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=b;g=a[f]|0;h=(g&1)!=0;if(h){j=(c[b>>2]&-2)+ -1|0;k=c[b+4>>2]|0}else{j=10;k=(g&255)>>>1}if((k|0)==(j|0)){Ee(b,j,1,j,j,0,0);if((a[f]&1)==0){l=7}else{l=8}}else{if(h){l=8}else{l=7}}if((l|0)==7){a[f]=(k<<1)+2;m=b+1|0;n=k+1|0;o=m+k|0;a[o]=d;p=m+n|0;a[p]=0;i=e;return}else if((l|0)==8){l=c[b+8>>2]|0;f=k+1|0;c[b+4>>2]=f;m=l;n=f;o=m+k|0;a[o]=d;p=m+n|0;a[p]=0;i=e;return}}function Ce(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=b;h=a[g]|0;if((h&1)==0){j=10;k=h}else{h=c[b>>2]|0;j=(h&-2)+ -1|0;k=h&255}if((k&1)==0){l=(k&255)>>>1}else{l=c[b+4>>2]|0}if((j-l|0)>>>0<e>>>0){De(b,j,e-j+l|0,l,l,0,e,d);i=f;return b|0}if((e|0)==0){i=f;return b|0}if((k&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}mn(m+l|0,d|0,e|0)|0;d=l+e|0;if((a[g]&1)==0){a[g]=d<<1}else{c[b+4>>2]=d}a[m+d|0]=0;i=f;return b|0}function De(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;l=i;if((-18-d|0)>>>0<e>>>0){re(0)}if((a[b]&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}do{if(d>>>0<2147483623){n=e+d|0;o=d<<1;p=n>>>0<o>>>0?o:n;if(p>>>0<11){q=11;break}q=p+16&-16}else{q=-17}}while(0);e=Pm(q)|0;if((g|0)!=0){mn(e|0,m|0,g|0)|0}if((j|0)!=0){mn(e+g|0,k|0,j|0)|0}k=f-h|0;if((k|0)!=(g|0)){mn(e+(j+g)|0,m+(h+g)|0,k-g|0)|0}if((d|0)==10){r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+u|0;a[w]=0;i=l;return}Rm(m);r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+u|0;a[w]=0;i=l;return}function Ee(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;if((-17-d|0)>>>0<e>>>0){re(0)}if((a[b]&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}do{if(d>>>0<2147483623){m=e+d|0;n=d<<1;o=m>>>0<n>>>0?n:m;if(o>>>0<11){p=11;break}p=o+16&-16}else{p=-17}}while(0);e=Pm(p)|0;if((g|0)!=0){mn(e|0,l|0,g|0)|0}o=f-h|0;if((o|0)!=(g|0)){mn(e+(j+g)|0,l+(h+g)|0,o-g|0)|0}if((d|0)==10){q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}Rm(l);q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}function Fe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if(e>>>0>1073741807){re(0)}if(e>>>0<2){a[b]=e<<1;g=b+4|0;lm(g,d,e)|0;h=g+(e<<2)|0;c[h>>2]=0;i=f;return}else{j=e+4&-4;k=Pm(j<<2)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=e;g=k;lm(g,d,e)|0;h=g+(e<<2)|0;c[h>>2]=0;i=f;return}}function Ge(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;if(d>>>0>1073741807){re(0)}if(d>>>0<2){a[b]=d<<1;g=b+4|0;nm(g,e,d)|0;h=g+(d<<2)|0;c[h>>2]=0;i=f;return}else{j=d+4&-4;k=Pm(j<<2)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=d;g=k;nm(g,e,d)|0;h=g+(d<<2)|0;c[h>>2]=0;i=f;return}}function He(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Rm(c[b+8>>2]|0);i=d;return}function Ie(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;d=Je(a,b,km(b)|0)|0;i=c;return d|0}function Je(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;g=b;h=a[g]|0;if((h&1)==0){j=1;k=h}else{h=c[b>>2]|0;j=(h&-2)+ -1|0;k=h&255}h=(k&1)==0;if(j>>>0<e>>>0){if(h){l=(k&255)>>>1}else{l=c[b+4>>2]|0}Me(b,j,e-j|0,l,0,l,e,d);i=f;return b|0}if(h){m=b+4|0}else{m=c[b+8>>2]|0}mm(m,d,e)|0;c[m+(e<<2)>>2]=0;if((a[g]&1)==0){a[g]=e<<1;i=f;return b|0}else{c[b+4>>2]=e;i=f;return b|0}return 0}function Ke(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;if(d>>>0>1073741807){re(0)}f=b;g=a[f]|0;if((g&1)==0){h=g;j=1}else{g=c[b>>2]|0;h=g&255;j=(g&-2)+ -1|0}if((h&1)==0){k=(h&255)>>>1}else{k=c[b+4>>2]|0}g=k>>>0>d>>>0?k:d;if(g>>>0<2){l=1}else{l=(g+4&-4)+ -1|0}if((l|0)==(j|0)){i=e;return}do{if((l|0)==1){m=b+4|0;n=0;o=c[b+8>>2]|0;p=1}else{g=(l<<2)+4|0;if(l>>>0>j>>>0){q=Pm(g)|0}else{q=Pm(g)|0}g=q;if((h&1)==0){m=g;n=1;o=b+4|0;p=0;break}else{m=g;n=1;o=c[b+8>>2]|0;p=1;break}}}while(0);if((h&1)==0){r=(h&255)>>>1}else{r=c[b+4>>2]|0}lm(m,o,r+1|0)|0;if(p){Rm(o)}if(n){c[b>>2]=l+1|1;c[b+4>>2]=k;c[b+8>>2]=m;i=e;return}else{a[f]=k<<1;i=e;return}}function Le(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;f=b;g=a[f]|0;h=(g&1)!=0;if(h){j=(c[b>>2]&-2)+ -1|0;k=c[b+4>>2]|0}else{j=1;k=(g&255)>>>1}if((k|0)==(j|0)){Ne(b,j,1,j,j,0,0);if((a[f]&1)==0){l=7}else{l=8}}else{if(h){l=8}else{l=7}}if((l|0)==7){a[f]=(k<<1)+2;m=b+4|0;n=k+1|0;o=m+(k<<2)|0;c[o>>2]=d;p=m+(n<<2)|0;c[p>>2]=0;i=e;return}else if((l|0)==8){l=c[b+8>>2]|0;f=k+1|0;c[b+4>>2]=f;m=l;n=f;o=m+(k<<2)|0;c[o>>2]=d;p=m+(n<<2)|0;c[p>>2]=0;i=e;return}}function Me(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;l=i;if((1073741806-d|0)>>>0<e>>>0){re(0)}if((a[b]&1)==0){m=b+4|0}else{m=c[b+8>>2]|0}do{if(d>>>0<536870887){n=e+d|0;o=d<<1;p=n>>>0<o>>>0?o:n;if(p>>>0<2){q=2;break}q=p+4&-4}else{q=1073741807}}while(0);e=Pm(q<<2)|0;if((g|0)!=0){lm(e,m,g)|0}if((j|0)!=0){lm(e+(g<<2)|0,k,j)|0}k=f-h|0;if((k|0)!=(g|0)){lm(e+(j+g<<2)|0,m+(h+g<<2)|0,k-g|0)|0}if((d|0)==1){r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+(u<<2)|0;c[w>>2]=0;i=l;return}Rm(m);r=b+8|0;c[r>>2]=e;s=q|1;t=b;c[t>>2]=s;u=k+j|0;v=b+4|0;c[v>>2]=u;w=e+(u<<2)|0;c[w>>2]=0;i=l;return}function Ne(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;k=i;if((1073741807-d|0)>>>0<e>>>0){re(0)}if((a[b]&1)==0){l=b+4|0}else{l=c[b+8>>2]|0}do{if(d>>>0<536870887){m=e+d|0;n=d<<1;o=m>>>0<n>>>0?n:m;if(o>>>0<2){p=2;break}p=o+4&-4}else{p=1073741807}}while(0);e=Pm(p<<2)|0;if((g|0)!=0){lm(e,l,g)|0}o=f-h|0;if((o|0)!=(g|0)){lm(e+(j+g<<2)|0,l+(h+g<<2)|0,o-g|0)|0}if((d|0)==1){q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}Rm(l);q=b+8|0;c[q>>2]=e;r=p|1;s=b;c[s>>2]=r;i=k;return}function Oe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e;g=e+8|0;h=(c[b+24>>2]|0)==0;if(h){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((h&1|d)&c[b+20>>2]|0)==0){i=e;return}e=vb(16)|0;do{if((a[2744]|0)==0){if((Ga(2744)|0)==0){break}c[684]=3440;gc(46,2736,q|0)|0;cb(2744)}}while(0);b=e;d=g;c[d>>2]=1;c[d+4>>2]=2736;d=f;h=g;c[d+0>>2]=c[h+0>>2];c[d+4>>2]=c[h+4>>2];ne(b,f,2792);c[e>>2]=2760;cc(e|0,2840,42)}function Pe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=2784;d=c[a+40>>2]|0;e=a+32|0;f=a+36|0;if((d|0)!=0){g=d;do{g=g+ -1|0;rc[c[(c[e>>2]|0)+(g<<2)>>2]&3](0,a,c[(c[f>>2]|0)+(g<<2)>>2]|0);}while((g|0)!=0)}Zj(a+28|0);Lm(c[e>>2]|0);Lm(c[f>>2]|0);Lm(c[a+48>>2]|0);Lm(c[a+60>>2]|0);i=b;return}function Qe(a,b){a=a|0;b=b|0;var c=0;c=i;Yj(a,b+28|0);i=c;return}function Re(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;e=a+32|0;a=e+40|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(a|0));Xj(b);i=d;return}function Se(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);Rm(a);i=b;return}function Te(a){a=a|0;var b=0;b=i;c[a>>2]=2400;Zj(a+4|0);i=b;return}function Ue(a,b){a=a|0;b=b|0;i=i;return}function Ve(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return a|0}function We(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;i=i;return}function Xe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;i=i;return}function Ye(a){a=a|0;i=i;return 0}function Ze(a){a=a|0;i=i;return 0}function _e(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=b;if((e|0)<=0){h=0;i=f;return h|0}j=b+12|0;k=b+16|0;l=d;d=0;while(1){m=c[j>>2]|0;if(m>>>0<(c[k>>2]|0)>>>0){c[j>>2]=m+1;n=a[m]|0}else{m=pc[c[(c[g>>2]|0)+40>>2]&127](b)|0;if((m|0)==-1){h=d;o=8;break}n=m&255}a[l]=n;m=d+1|0;if((m|0)<(e|0)){l=l+1|0;d=m}else{h=m;o=8;break}}if((o|0)==8){i=f;return h|0}return 0}function $e(a){a=a|0;i=i;return-1}function af(a){a=a|0;var b=0,e=0,f=0;b=i;if((pc[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){e=-1;i=b;return e|0}f=a+12|0;a=c[f>>2]|0;c[f>>2]=a+1;e=d[a]|0;i=b;return e|0}function bf(a,b){a=a|0;b=b|0;i=i;return-1}function cf(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=b;if((f|0)<=0){j=0;i=g;return j|0}k=b+24|0;l=b+28|0;m=e;e=0;while(1){n=c[k>>2]|0;if(n>>>0<(c[l>>2]|0)>>>0){o=a[m]|0;c[k>>2]=n+1;a[n]=o}else{if((yc[c[(c[h>>2]|0)+52>>2]&31](b,d[m]|0)|0)==-1){j=e;p=7;break}}o=e+1|0;if((o|0)<(f|0)){m=m+1|0;e=o}else{j=o;p=7;break}}if((p|0)==7){i=g;return j|0}return 0}function df(a,b){a=a|0;b=b|0;i=i;return-1}function ef(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);Rm(a);i=b;return}function ff(a){a=a|0;var b=0;b=i;c[a>>2]=2464;Zj(a+4|0);i=b;return}function gf(a,b){a=a|0;b=b|0;i=i;return}function hf(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return a|0}function jf(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;i=i;return}function kf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;i=i;return}function lf(a){a=a|0;i=i;return 0}function mf(a){a=a|0;i=i;return 0}function nf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=a;if((d|0)<=0){g=0;i=e;return g|0}h=a+12|0;j=a+16|0;k=b;b=0;while(1){l=c[h>>2]|0;if(l>>>0<(c[j>>2]|0)>>>0){c[h>>2]=l+4;m=c[l>>2]|0}else{l=pc[c[(c[f>>2]|0)+40>>2]&127](a)|0;if((l|0)==-1){g=b;n=8;break}else{m=l}}c[k>>2]=m;l=b+1|0;if((l|0)>=(d|0)){g=l;n=8;break}k=k+4|0;b=l}if((n|0)==8){i=e;return g|0}return 0}function of(a){a=a|0;i=i;return-1}function pf(a){a=a|0;var b=0,d=0,e=0;b=i;if((pc[c[(c[a>>2]|0)+36>>2]&127](a)|0)==-1){d=-1;i=b;return d|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+4;d=c[a>>2]|0;i=b;return d|0}function qf(a,b){a=a|0;b=b|0;i=i;return-1}function rf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=a;if((d|0)<=0){g=0;i=e;return g|0}h=a+24|0;j=a+28|0;k=b;b=0;while(1){l=c[h>>2]|0;if(l>>>0<(c[j>>2]|0)>>>0){m=c[k>>2]|0;c[h>>2]=l+4;c[l>>2]=m}else{if((yc[c[(c[f>>2]|0)+52>>2]&31](a,c[k>>2]|0)|0)==-1){g=b;n=8;break}}m=b+1|0;if((m|0)>=(d|0)){g=m;n=8;break}k=k+4|0;b=m}if((n|0)==8){i=e;return g|0}return 0}function sf(a,b){a=a|0;b=b|0;i=i;return-1}function tf(a){a=a|0;var b=0;b=i;Pe(a+8|0);Rm(a);i=b;return}function uf(a){a=a|0;var b=0;b=i;Pe(a+8|0);i=b;return}function vf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Pe(d+(e+8)|0);Rm(d+e|0);i=b;return}function wf(a){a=a|0;var b=0;b=i;Pe(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function xf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d;f=b;g=c[(c[f>>2]|0)+ -12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)==0){l=g}else{xf(k)|0;l=c[(c[f>>2]|0)+ -12>>2]|0}a[j]=1;k=c[h+(l+24)>>2]|0;if(!((pc[c[(c[k>>2]|0)+24>>2]&127](k)|0)==-1)){break}k=c[(c[f>>2]|0)+ -12>>2]|0;Oe(h+k|0,c[h+(k+16)>>2]|1)}}while(0);If(e);i=d;return b|0}function yf(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){i=i;return}else{Wa()}}function zf(a){a=a|0;var b=0;b=i;Pe(a+8|0);Rm(a);i=b;return}function Af(a){a=a|0;var b=0;b=i;Pe(a+8|0);i=b;return}function Bf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Pe(d+(e+8)|0);Rm(d+e|0);i=b;return}function Cf(a){a=a|0;var b=0;b=i;Pe(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function Df(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+8|0;e=d;f=b;g=c[(c[f>>2]|0)+ -12>>2]|0;h=b;if((c[h+(g+24)>>2]|0)==0){i=d;return b|0}j=e;a[j]=0;c[e+4>>2]=b;do{if((c[h+(g+16)>>2]|0)==0){k=c[h+(g+72)>>2]|0;if((k|0)==0){l=g}else{Df(k)|0;l=c[(c[f>>2]|0)+ -12>>2]|0}a[j]=1;k=c[h+(l+24)>>2]|0;if(!((pc[c[(c[k>>2]|0)+24>>2]&127](k)|0)==-1)){break}k=c[(c[f>>2]|0)+ -12>>2]|0;Oe(h+k|0,c[h+(k+16)>>2]|1)}}while(0);Pf(e);i=d;return b|0}function Ef(a){a=a|0;var b=0;b=i;Pe(a+4|0);Rm(a);i=b;return}function Ff(a){a=a|0;var b=0;b=i;Pe(a+4|0);i=b;return}function Gf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Pe(d+(e+4)|0);Rm(d+e|0);i=b;return}function Hf(a){a=a|0;var b=0;b=i;Pe(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function If(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;f=a;if((c[f+(e+24)>>2]|0)==0){i=b;return}if((c[f+(e+16)>>2]|0)!=0){i=b;return}if((c[f+(e+4)>>2]&8192|0)==0){i=b;return}if(Ia()|0){i=b;return}e=c[d>>2]|0;f=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((pc[c[(c[f>>2]|0)+24>>2]&127](f)|0)==-1)){i=b;return}f=c[d>>2]|0;d=c[(c[f>>2]|0)+ -12>>2]|0;e=f;Oe(e+d|0,c[e+(d+16)>>2]|1);i=b;return}function Jf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+48|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=j;a[m]=0;c[j+4>>2]=b;n=b;o=c[(c[n>>2]|0)+ -12>>2]|0;p=b;if((c[p+(o+16)>>2]|0)!=0){If(j);i=e;return b|0}q=c[p+(o+72)>>2]|0;if((q|0)==0){r=o}else{xf(q)|0;r=c[(c[n>>2]|0)+ -12>>2]|0}a[m]=1;Yj(k,p+(r+28)|0);r=_j(k,3848)|0;m=r;Zj(k);k=c[(c[n>>2]|0)+ -12>>2]|0;q=c[p+(k+24)>>2]|0;o=p+(k+76)|0;s=c[o>>2]|0;if((s|0)==-1){Yj(h,p+(k+28)|0);t=_j(h,5128)|0;u=yc[c[(c[t>>2]|0)+28>>2]&31](t,32)|0;Zj(h);h=u<<24>>24;c[o>>2]=h;v=h}else{v=s}s=v&255;v=p+k|0;k=c[(c[r>>2]|0)+24>>2]|0;c[g>>2]=q;q=f;r=g;c[q+0>>2]=c[r+0>>2];xc[k&31](l,m,f,v,s,d);if((c[l>>2]|0)!=0){If(j);i=e;return b|0}l=c[(c[n>>2]|0)+ -12>>2]|0;Oe(p+l|0,c[p+(l+16)>>2]|5);If(j);i=e;return b|0}function Kf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+48|0;f=e;g=e+8|0;h=e+16|0;j=e+24|0;k=e+32|0;l=e+40|0;m=j;a[m]=0;c[j+4>>2]=b;n=b;o=c[(c[n>>2]|0)+ -12>>2]|0;p=b;if((c[p+(o+16)>>2]|0)!=0){If(j);i=e;return b|0}q=c[p+(o+72)>>2]|0;if((q|0)==0){r=o}else{xf(q)|0;r=c[(c[n>>2]|0)+ -12>>2]|0}a[m]=1;Yj(k,p+(r+28)|0);r=_j(k,3848)|0;m=r;Zj(k);k=c[(c[n>>2]|0)+ -12>>2]|0;q=c[p+(k+24)>>2]|0;o=p+(k+76)|0;s=c[o>>2]|0;if((s|0)==-1){Yj(h,p+(k+28)|0);t=_j(h,5128)|0;u=yc[c[(c[t>>2]|0)+28>>2]&31](t,32)|0;Zj(h);h=u<<24>>24;c[o>>2]=h;v=h}else{v=s}s=v&255;v=p+k|0;k=c[(c[r>>2]|0)+24>>2]|0;c[g>>2]=q;q=f;r=g;c[q+0>>2]=c[r+0>>2];xc[k&31](l,m,f,v,s,d);if((c[l>>2]|0)!=0){If(j);i=e;return b|0}l=c[(c[n>>2]|0)+ -12>>2]|0;Oe(p+l|0,c[p+(l+16)>>2]|5);If(j);i=e;return b|0}function Lf(a){a=a|0;var b=0;b=i;Pe(a+4|0);Rm(a);i=b;return}function Mf(a){a=a|0;var b=0;b=i;Pe(a+4|0);i=b;return}function Nf(a){a=a|0;var b=0,d=0,e=0;b=i;d=a;e=c[(c[a>>2]|0)+ -12>>2]|0;Pe(d+(e+4)|0);Rm(d+e|0);i=b;return}function Of(a){a=a|0;var b=0;b=i;Pe(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function Pf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;f=a;if((c[f+(e+24)>>2]|0)==0){i=b;return}if((c[f+(e+16)>>2]|0)!=0){i=b;return}if((c[f+(e+4)>>2]&8192|0)==0){i=b;return}if(Ia()|0){i=b;return}e=c[d>>2]|0;f=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((pc[c[(c[f>>2]|0)+24>>2]&127](f)|0)==-1)){i=b;return}f=c[d>>2]|0;d=c[(c[f>>2]|0)+ -12>>2]|0;e=f;Oe(e+d|0,c[e+(d+16)>>2]|1);i=b;return}function Qf(a){a=a|0;i=i;return 2680}function Rf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;if((c|0)==1){te(a,2696,35);i=d;return}else{le(a,b,c);i=d;return}}function Sf(a){a=a|0;i=i;return}function Tf(a){a=a|0;var b=0;b=i;pe(a);Rm(a);i=b;return}function Uf(a){a=a|0;var b=0;b=i;pe(a);i=b;return}function Vf(a){a=a|0;var b=0;b=i;Pe(a);Rm(a);i=b;return}function Wf(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Xf(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Yf(a){a=a|0;i=i;return}function Zf(a){a=a|0;i=i;return}function _f(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;a:do{if((e|0)==(f|0)){g=c;h=6}else{j=e;k=c;while(1){if((k|0)==(d|0)){l=-1;break a}m=a[k]|0;n=a[j]|0;if(m<<24>>24<n<<24>>24){l=-1;break a}if(n<<24>>24<m<<24>>24){l=1;break a}m=k+1|0;n=j+1|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=b;return l|0}function $f(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;g=e;h=f-g|0;if(h>>>0>4294967279){re(b)}if(h>>>0<11){a[b]=h<<1;j=b+1|0}else{k=h+16&-16;l=Pm(k)|0;c[b+8>>2]=l;c[b>>2]=k|1;c[b+4>>2]=h;j=l}if((e|0)==(f|0)){m=j;a[m]=0;i=d;return}else{n=e;o=j}while(1){a[o]=a[n]|0;e=n+1|0;if((e|0)==(f|0)){break}else{o=o+1|0;n=e}}m=j+(f+(0-g))|0;a[m]=0;i=d;return}function ag(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;b=i;if((c|0)==(d|0)){e=0;i=b;return e|0}else{f=0;g=c}while(1){c=(a[g]|0)+(f<<4)|0;h=c&-268435456;j=(h>>>24|h)^c;c=g+1|0;if((c|0)==(d|0)){e=j;break}else{g=c;f=j}}i=b;return e|0}function bg(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function cg(a){a=a|0;i=i;return}function dg(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;a=i;a:do{if((e|0)==(f|0)){g=b;h=6}else{j=e;k=b;while(1){if((k|0)==(d|0)){l=-1;break a}m=c[k>>2]|0;n=c[j>>2]|0;if((m|0)<(n|0)){l=-1;break a}if((n|0)<(m|0)){l=1;break a}m=k+4|0;n=j+4|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=a;return l|0}function eg(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;d=i;g=e;h=f-g|0;j=h>>2;if(j>>>0>1073741807){re(b)}if(j>>>0<2){a[b]=h>>>1;k=b+4|0}else{h=j+4&-4;l=Pm(h<<2)|0;c[b+8>>2]=l;c[b>>2]=h|1;c[b+4>>2]=j;k=l}if((e|0)==(f|0)){m=k;c[m>>2]=0;i=d;return}l=f+ -4+(0-g)|0;g=e;e=k;while(1){c[e>>2]=c[g>>2];j=g+4|0;if((j|0)==(f|0)){break}else{e=e+4|0;g=j}}m=k+((l>>>2)+1<<2)|0;c[m>>2]=0;i=d;return}function fg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;a=i;if((b|0)==(d|0)){e=0;i=a;return e|0}else{f=0;g=b}while(1){b=(c[g>>2]|0)+(f<<4)|0;h=b&-268435456;j=(h>>>24|h)^b;b=g+4|0;if((b|0)==(d|0)){e=j;break}else{g=b;f=j}}i=a;return e|0}function gg(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function hg(a){a=a|0;i=i;return}function ig(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;k=i;i=i+136|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=k+40|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+88|0;v=k+96|0;w=k+104|0;x=k+128|0;if((c[g+4>>2]&1|0)==0){c[q>>2]=-1;y=c[(c[d>>2]|0)+16>>2]|0;z=e;c[s>>2]=c[z>>2];c[t>>2]=c[f>>2];A=n;B=s;c[A+0>>2]=c[B+0>>2];B=m;A=t;c[B+0>>2]=c[A+0>>2];kc[y&63](r,d,n,m,g,h,q);m=c[r>>2]|0;c[z>>2]=m;z=c[q>>2]|0;if((z|0)==0){a[j]=0}else if((z|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}Qe(u,g);m=u;u=c[m>>2]|0;if(!((c[1282]|0)==-1)){c[p>>2]=5128;c[p+4>>2]=118;c[p+8>>2]=0;qe(5128,p,119)}p=(c[5132>>2]|0)+ -1|0;z=c[u+8>>2]|0;if(!((c[u+12>>2]|0)-z>>2>>>0>p>>>0)){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}u=c[z+(p<<2)>>2]|0;if((u|0)==0){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}C=u;Yd(c[m>>2]|0)|0;Qe(v,g);g=v;v=c[g>>2]|0;if(!((c[1318]|0)==-1)){c[o>>2]=5272;c[o+4>>2]=118;c[o+8>>2]=0;qe(5272,o,119)}o=(c[5276>>2]|0)+ -1|0;m=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-m>>2>>>0>o>>>0)){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}v=c[m+(o<<2)>>2]|0;if((v|0)==0){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}E=v;Yd(c[g>>2]|0)|0;g=w;F=v;nc[c[(c[F>>2]|0)+24>>2]&63](g,E);nc[c[(c[F>>2]|0)+28>>2]&63](w+12|0,E);c[x>>2]=c[f>>2];f=w+24|0;E=l;F=x;c[E+0>>2]=c[F+0>>2];F=jg(e,l,g,f,C,h,1)|0;a[j]=(F|0)==(g|0)|0;c[b>>2]=c[e>>2];ve(w+12|0);ve(w);i=k;return}function jg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;l=i;i=i+104|0;m=(g-f|0)/12|0;n=l;do{if(m>>>0>100){o=Km(m)|0;if((o|0)!=0){p=o;q=o;break}Wm()}else{p=0;q=n}}while(0);n=(f|0)==(g|0);if(n){r=0;s=m}else{o=f;t=0;u=m;m=q;while(1){v=a[o]|0;if((v&1)==0){w=(v&255)>>>1}else{w=c[o+4>>2]|0}if((w|0)==0){a[m]=2;x=t+1|0;y=u+ -1|0}else{a[m]=1;x=t;y=u}v=o+12|0;if((v|0)==(g|0)){r=x;s=y;break}else{o=v;t=x;u=y;m=m+1|0}}}m=b;b=e;e=h;y=0;u=r;r=s;a:while(1){s=c[m>>2]|0;do{if((s|0)==0){z=0}else{if((c[s+12>>2]|0)!=(c[s+16>>2]|0)){z=s;break}if((pc[c[(c[s>>2]|0)+36>>2]&127](s)|0)==-1){c[m>>2]=0;z=0;break}else{z=c[m>>2]|0;break}}}while(0);s=(z|0)==0;x=c[b>>2]|0;do{if((x|0)==0){A=0}else{if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){A=x;break}if(!((pc[c[(c[x>>2]|0)+36>>2]&127](x)|0)==-1)){A=x;break}c[b>>2]=0;A=0}}while(0);B=(A|0)==0;C=c[m>>2]|0;if(!((s^B)&(r|0)!=0)){break}x=c[C+12>>2]|0;if((x|0)==(c[C+16>>2]|0)){D=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{D=d[x]|0}x=D&255;if(k){E=x}else{E=yc[c[(c[e>>2]|0)+12>>2]&31](h,x)|0}x=y+1|0;if(n){y=x;r=r;u=u;continue}b:do{if(k){t=0;o=f;w=u;v=r;F=q;while(1){do{if((a[F]|0)==1){G=a[o]|0;H=(G&1)==0;if(H){I=o+1|0}else{I=c[o+8>>2]|0}if(!(E<<24>>24==(a[I+y|0]|0))){a[F]=0;J=t;K=w;L=v+ -1|0;break}if(H){M=(G&255)>>>1}else{M=c[o+4>>2]|0}if((M|0)!=(x|0)){J=1;K=w;L=v;break}a[F]=2;J=1;K=w+1|0;L=v+ -1|0}else{J=t;K=w;L=v}}while(0);G=o+12|0;if((G|0)==(g|0)){N=J;O=K;P=L;break b}t=J;o=G;w=K;v=L;F=F+1|0}}else{F=0;v=f;w=u;o=r;t=q;while(1){do{if((a[t]|0)==1){G=v;if((a[G]&1)==0){Q=v+1|0}else{Q=c[v+8>>2]|0}if(!(E<<24>>24==(yc[c[(c[e>>2]|0)+12>>2]&31](h,a[Q+y|0]|0)|0)<<24>>24)){a[t]=0;R=F;S=w;T=o+ -1|0;break}H=a[G]|0;if((H&1)==0){U=(H&255)>>>1}else{U=c[v+4>>2]|0}if((U|0)!=(x|0)){R=1;S=w;T=o;break}a[t]=2;R=1;S=w+1|0;T=o+ -1|0}else{R=F;S=w;T=o}}while(0);H=v+12|0;if((H|0)==(g|0)){N=R;O=S;P=T;break b}F=R;v=H;w=S;o=T;t=t+1|0}}}while(0);if(!N){y=x;u=O;r=P;continue}s=c[m>>2]|0;t=s+12|0;o=c[t>>2]|0;if((o|0)==(c[s+16>>2]|0)){pc[c[(c[s>>2]|0)+40>>2]&127](s)|0}else{c[t>>2]=o+1}if((P+O|0)>>>0<2){y=x;u=O;r=P;continue}else{V=f;W=O;X=q}while(1){do{if((a[X]|0)==2){o=a[V]|0;if((o&1)==0){Y=(o&255)>>>1}else{Y=c[V+4>>2]|0}if((Y|0)==(x|0)){Z=W;break}a[X]=0;Z=W+ -1|0}else{Z=W}}while(0);o=V+12|0;if((o|0)==(g|0)){y=x;u=Z;r=P;continue a}else{V=o;W=Z;X=X+1|0}}}do{if((C|0)==0){_=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){_=C;break}if((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1){c[m>>2]=0;_=0;break}else{_=c[m>>2]|0;break}}}while(0);m=(_|0)==0;do{if(B){$=78}else{if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(m){break}else{$=80;break}}if((pc[c[(c[A>>2]|0)+36>>2]&127](A)|0)==-1){c[b>>2]=0;$=78;break}else{if(m){break}else{$=80;break}}}}while(0);if(($|0)==78){if(m){$=80}}if(($|0)==80){c[j>>2]=c[j>>2]|2}c:do{if(n){$=85}else{if((a[q]|0)==2){aa=f;break}else{ba=f;ca=q}while(1){m=ba+12|0;b=ca+1|0;if((m|0)==(g|0)){$=85;break c}if((a[b]|0)==2){aa=m;break}else{ca=b;ba=m}}}}while(0);if(($|0)==85){c[j>>2]=c[j>>2]|4;aa=g}if((p|0)==0){i=l;return aa|0}Lm(p);i=l;return aa|0}function kg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];lg(a,0,k,j,f,g,h);i=b;return}function lg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}t=l;bh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((pc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}ye(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}ye(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{Q=d[I]|0}if((Dg(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);c[k>>2]=Vl(H,c[p>>2]|0,j,u)|0;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}function mg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];ng(a,0,k,j,f,g,h);i=b;return}function ng(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l;bh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((pc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){K=(D&255)>>>1}else{K=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(K|0)){if(I){L=(D&255)>>>1;M=(D&255)>>>1}else{D=c[z>>2]|0;L=D;M=D}ye(o,M<<1,0);if((a[h]&1)==0){N=10}else{N=(c[g>>2]&-2)+ -1|0}ye(o,N,0);if((a[h]&1)==0){O=v}else{O=c[w>>2]|0}c[p>>2]=O+L;P=O}else{P=B}D=C+12|0;I=c[D>>2]|0;Q=C+16|0;if((I|0)==(c[Q>>2]|0)){R=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{R=d[I]|0}if((Dg(R&255,u,P,p,s,A,n,l,r,t)|0)!=0){G=F;H=P;break}I=c[D>>2]|0;if((I|0)==(c[Q>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=P;continue}else{c[D>>2]=I+1;m=C;B=P;continue}}P=a[n]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){P=c[r>>2]|0;if((P-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=B}}while(0);s=Ul(H,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=s;c[u+4>>2]=J;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){T=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){T=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){T=C;break}c[y>>2]=0;T=0}}while(0);y=(T|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}function og(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];pg(a,0,k,j,f,g,h);i=b;return}function pg(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;f=i;i=i+256|0;m=f;n=f+32|0;o=f+40|0;p=f+56|0;q=f+72|0;r=f+80|0;s=f+240|0;t=f+248|0;u=c[j+4>>2]&74;if((u|0)==64){v=8}else if((u|0)==0){v=0}else if((u|0)==8){v=16}else{v=10}u=m;bh(o,j,u,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ye(p,10,0);if((a[j]&1)==0){m=p+1|0;w=m;x=p+8|0;y=m}else{m=p+8|0;w=p+1|0;x=m;y=c[m>>2]|0}c[q>>2]=y;m=r;c[s>>2]=m;c[t>>2]=0;z=g;g=h;h=p;A=p+4|0;B=a[n]|0;n=c[z>>2]|0;C=y;a:while(1){do{if((n|0)==0){D=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){D=n;break}if(!((pc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1)){D=n;break}c[z>>2]=0;D=0}}while(0);y=(D|0)==0;E=c[g>>2]|0;do{if((E|0)==0){F=18}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(y){G=E;break}else{H=E;I=C;break a}}if((pc[c[(c[E>>2]|0)+36>>2]&127](E)|0)==-1){c[g>>2]=0;F=18;break}else{if(y){G=E;break}else{H=E;I=C;break a}}}}while(0);if((F|0)==18){F=0;if(y){H=0;I=C;break}else{G=0}}E=a[j]|0;J=(E&1)==0;if(J){K=(E&255)>>>1}else{K=c[A>>2]|0}if(((c[q>>2]|0)-C|0)==(K|0)){if(J){L=(E&255)>>>1;M=(E&255)>>>1}else{E=c[A>>2]|0;L=E;M=E}ye(p,M<<1,0);if((a[j]&1)==0){N=10}else{N=(c[h>>2]&-2)+ -1|0}ye(p,N,0);if((a[j]&1)==0){O=w}else{O=c[x>>2]|0}c[q>>2]=O+L;P=O}else{P=C}E=D+12|0;J=c[E>>2]|0;Q=D+16|0;if((J|0)==(c[Q>>2]|0)){R=pc[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{R=d[J]|0}if((Dg(R&255,v,P,q,t,B,o,m,s,u)|0)!=0){H=G;I=P;break}J=c[E>>2]|0;if((J|0)==(c[Q>>2]|0)){pc[c[(c[D>>2]|0)+40>>2]&127](D)|0;n=D;C=P;continue}else{c[E>>2]=J+1;n=D;C=P;continue}}P=a[o]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[o+4>>2]|0}do{if((S|0)!=0){P=c[s>>2]|0;if((P-r|0)>=160){break}C=c[t>>2]|0;c[s>>2]=P+4;c[P>>2]=C}}while(0);b[l>>1]=Tl(I,c[q>>2]|0,k,v)|0;mj(o,m,c[s>>2]|0,k);do{if((D|0)==0){T=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){T=D;break}if(!((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1)){T=D;break}c[z>>2]=0;T=0}}while(0);z=(T|0)==0;do{if((H|0)==0){F=54}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){if(!z){break}U=e;c[U>>2]=T;ve(p);ve(o);i=f;return}if((pc[c[(c[H>>2]|0)+36>>2]&127](H)|0)==-1){c[g>>2]=0;F=54;break}if(!(z^(H|0)==0)){break}U=e;c[U>>2]=T;ve(p);ve(o);i=f;return}}while(0);do{if((F|0)==54){if(z){break}U=e;c[U>>2]=T;ve(p);ve(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;U=e;c[U>>2]=T;ve(p);ve(o);i=f;return}function qg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];rg(a,0,k,j,f,g,h);i=b;return}function rg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l;bh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((pc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}ye(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}ye(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{Q=d[I]|0}if((Dg(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);c[k>>2]=Sl(H,c[p>>2]|0,j,u)|0;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}function sg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];tg(a,0,k,j,f,g,h);i=b;return}function tg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==64){u=8}else if((t|0)==0){u=0}else if((t|0)==8){u=16}else{u=10}t=l;bh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((pc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[z>>2]|0;K=D;L=D}ye(o,L<<1,0);if((a[h]&1)==0){M=10}else{M=(c[g>>2]&-2)+ -1|0}ye(o,M,0);if((a[h]&1)==0){N=v}else{N=c[w>>2]|0}c[p>>2]=N+K;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{Q=d[I]|0}if((Dg(Q&255,u,O,p,s,A,n,l,r,t)|0)!=0){G=F;H=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=O;continue}else{c[D>>2]=I+1;m=C;B=O;continue}}O=a[n]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[n+4>>2]|0}do{if((R|0)!=0){O=c[r>>2]|0;if((O-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=B}}while(0);c[k>>2]=Rl(H,c[p>>2]|0,j,u)|0;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){S=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){S=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){S=C;break}c[y>>2]=0;S=0}}while(0);y=(S|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;T=b;c[T>>2]=S;ve(o);ve(n);i=e;return}function ug(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];vg(a,0,k,j,f,g,h);i=b;return}function vg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+256|0;l=e;m=e+32|0;n=e+40|0;o=e+56|0;p=e+72|0;q=e+80|0;r=e+240|0;s=e+248|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=l;bh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=a[m]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0}else{if((c[m+12>>2]|0)!=(c[m+16>>2]|0)){C=m;break}if(!((pc[c[(c[m>>2]|0)+36>>2]&127](m)|0)==-1)){C=m;break}c[y>>2]=0;C=0}}while(0);x=(C|0)==0;D=c[f>>2]|0;do{if((D|0)==0){E=18}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(x){F=D;break}else{G=D;H=B;break a}}if((pc[c[(c[D>>2]|0)+36>>2]&127](D)|0)==-1){c[f>>2]=0;E=18;break}else{if(x){F=D;break}else{G=D;H=B;break a}}}}while(0);if((E|0)==18){E=0;if(x){G=0;H=B;break}else{F=0}}D=a[h]|0;I=(D&1)==0;if(I){K=(D&255)>>>1}else{K=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(K|0)){if(I){L=(D&255)>>>1;M=(D&255)>>>1}else{D=c[z>>2]|0;L=D;M=D}ye(o,M<<1,0);if((a[h]&1)==0){N=10}else{N=(c[g>>2]&-2)+ -1|0}ye(o,N,0);if((a[h]&1)==0){O=v}else{O=c[w>>2]|0}c[p>>2]=O+L;P=O}else{P=B}D=C+12|0;I=c[D>>2]|0;Q=C+16|0;if((I|0)==(c[Q>>2]|0)){R=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{R=d[I]|0}if((Dg(R&255,u,P,p,s,A,n,l,r,t)|0)!=0){G=F;H=P;break}I=c[D>>2]|0;if((I|0)==(c[Q>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=P;continue}else{c[D>>2]=I+1;m=C;B=P;continue}}P=a[n]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[n+4>>2]|0}do{if((S|0)!=0){P=c[r>>2]|0;if((P-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=B}}while(0);s=Ql(H,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=s;c[u+4>>2]=J;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){T=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){T=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){T=C;break}c[y>>2]=0;T=0}}while(0);y=(T|0)==0;do{if((G|0)==0){E=54}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(!y){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;E=54;break}if(!(y^(G|0)==0)){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}}while(0);do{if((E|0)==54){if(y){break}U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;U=b;c[U>>2]=T;ve(o);ve(n);i=e;return}function wg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];xg(a,0,k,j,f,g,h);i=b;return}function xg(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;ch(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ye(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=h;h=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((pc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}ye(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[h>>2]&-2)+ -1|0}ye(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=pc[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{T=d[L]|0}if((dh(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){pc[c[(c[F>>2]|0)+40>>2]&127](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);g[l>>2]=+Pl(K,c[q>>2]|0,k);mj(o,x,c[s>>2]|0,k);do{if((F|0)==0){V=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){V=F;break}if(!((pc[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1)){V=F;break}c[B>>2]=0;V=0}}while(0);B=(V|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}if((pc[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}function yg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];zg(a,0,k,j,f,g,h);i=b;return}function zg(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;ch(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ye(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=g;g=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((pc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}ye(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[g>>2]&-2)+ -1|0}ye(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=pc[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{T=d[L]|0}if((dh(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){pc[c[(c[F>>2]|0)+40>>2]&127](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);h[l>>3]=+Ol(K,c[q>>2]|0,k);mj(o,x,c[s>>2]|0,k);do{if((F|0)==0){V=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){V=F;break}if(!((pc[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1)){V=F;break}c[B>>2]=0;V=0}}while(0);B=(V|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}if((pc[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}function Ag(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Bg(a,0,k,j,f,g,h);i=b;return}function Bg(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;e=i;i=i+280|0;m=e+32|0;n=e+40|0;o=e+48|0;p=e+64|0;q=e+80|0;r=e+88|0;s=e+248|0;t=e+256|0;u=e+264|0;v=e+272|0;w=e;ch(o,j,w,m,n);j=p;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ye(p,10,0);if((a[j]&1)==0){x=p+1|0;y=x;z=p+8|0;A=x}else{x=p+8|0;y=p+1|0;z=x;A=c[x>>2]|0}c[q>>2]=A;x=r;c[s>>2]=x;c[t>>2]=0;a[u]=1;a[v]=69;B=f;f=g;g=p;C=p+4|0;D=a[m]|0;m=a[n]|0;n=c[B>>2]|0;E=A;a:while(1){do{if((n|0)==0){F=0}else{if((c[n+12>>2]|0)!=(c[n+16>>2]|0)){F=n;break}if(!((pc[c[(c[n>>2]|0)+36>>2]&127](n)|0)==-1)){F=n;break}c[B>>2]=0;F=0}}while(0);A=(F|0)==0;G=c[f>>2]|0;do{if((G|0)==0){H=14}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(A){I=G;break}else{J=G;K=E;break a}}if((pc[c[(c[G>>2]|0)+36>>2]&127](G)|0)==-1){c[f>>2]=0;H=14;break}else{if(A){I=G;break}else{J=G;K=E;break a}}}}while(0);if((H|0)==14){H=0;if(A){J=0;K=E;break}else{I=0}}G=a[j]|0;L=(G&1)==0;if(L){M=(G&255)>>>1}else{M=c[C>>2]|0}if(((c[q>>2]|0)-E|0)==(M|0)){if(L){N=(G&255)>>>1;O=(G&255)>>>1}else{G=c[C>>2]|0;N=G;O=G}ye(p,O<<1,0);if((a[j]&1)==0){P=10}else{P=(c[g>>2]&-2)+ -1|0}ye(p,P,0);if((a[j]&1)==0){Q=y}else{Q=c[z>>2]|0}c[q>>2]=Q+N;R=Q}else{R=E}G=F+12|0;L=c[G>>2]|0;S=F+16|0;if((L|0)==(c[S>>2]|0)){T=pc[c[(c[F>>2]|0)+36>>2]&127](F)|0}else{T=d[L]|0}if((dh(T&255,u,v,R,q,D,m,o,x,s,t,w)|0)!=0){J=I;K=R;break}L=c[G>>2]|0;if((L|0)==(c[S>>2]|0)){pc[c[(c[F>>2]|0)+40>>2]&127](F)|0;n=F;E=R;continue}else{c[G>>2]=L+1;n=F;E=R;continue}}R=a[o]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[o+4>>2]|0}do{if((U|0)!=0){if((a[u]|0)==0){break}R=c[s>>2]|0;if((R-r|0)>=160){break}E=c[t>>2]|0;c[s>>2]=R+4;c[R>>2]=E}}while(0);h[l>>3]=+Nl(K,c[q>>2]|0,k);mj(o,x,c[s>>2]|0,k);do{if((F|0)==0){V=0}else{if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){V=F;break}if(!((pc[c[(c[F>>2]|0)+36>>2]&127](F)|0)==-1)){V=F;break}c[B>>2]=0;V=0}}while(0);B=(V|0)==0;do{if((J|0)==0){H=51}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(!B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}if((pc[c[(c[J>>2]|0)+36>>2]&127](J)|0)==-1){c[f>>2]=0;H=51;break}if(!(B^(J|0)==0)){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);do{if((H|0)==51){if(B){break}W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;W=b;c[W>>2]=V;ve(p);ve(o);i=e;return}function Cg(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+8|0;l=e;m=i;i=i+16|0;n=i;i=i+32|0;o=i;i=i+16|0;p=i;i=i+8|0;q=i;i=i+16|0;r=i;i=i+160|0;s=o;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Qe(p,h);h=p;p=c[h>>2]|0;if(!((c[1282]|0)==-1)){c[m>>2]=5128;c[m+4>>2]=118;c[m+8>>2]=0;qe(5128,m,119)}m=(c[5132>>2]|0)+ -1|0;t=c[p+8>>2]|0;if(!((c[p+12>>2]|0)-t>>2>>>0>m>>>0)){u=vb(4)|0;v=u;pm(v);cc(u|0,13088,107)}p=c[t+(m<<2)>>2]|0;if((p|0)==0){u=vb(4)|0;v=u;pm(v);cc(u|0,13088,107)}u=n;vc[c[(c[p>>2]|0)+32>>2]&7](p,3672,3698|0,u)|0;Yd(c[h>>2]|0)|0;h=q;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(q,10,0);if((a[h]&1)==0){p=q+1|0;w=p;x=q+8|0;y=p}else{p=q+8|0;w=q+1|0;x=p;y=c[p>>2]|0}p=f;f=g;g=q;v=q+4|0;m=n+24|0;t=n+25|0;z=r;A=n+26|0;B=n;n=o+4|0;C=c[p>>2]|0;D=y;E=r;r=0;F=y;a:while(1){do{if((C|0)==0){G=0}else{if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){G=C;break}if(!((pc[c[(c[C>>2]|0)+36>>2]&127](C)|0)==-1)){G=C;break}c[p>>2]=0;G=0}}while(0);y=(G|0)==0;H=c[f>>2]|0;do{if((H|0)==0){I=19}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){if(y){break}else{J=F;break a}}if((pc[c[(c[H>>2]|0)+36>>2]&127](H)|0)==-1){c[f>>2]=0;I=19;break}else{if(y){break}else{J=F;break a}}}}while(0);if((I|0)==19){I=0;if(y){J=F;break}}H=a[h]|0;K=(H&1)==0;if(K){L=(H&255)>>>1}else{L=c[v>>2]|0}if((D-F|0)==(L|0)){if(K){M=(H&255)>>>1;N=(H&255)>>>1}else{H=c[v>>2]|0;M=H;N=H}ye(q,N<<1,0);if((a[h]&1)==0){O=10}else{O=(c[g>>2]&-2)+ -1|0}ye(q,O,0);if((a[h]&1)==0){P=w}else{P=c[x>>2]|0}Q=P+M|0;R=P}else{Q=D;R=F}H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){S=pc[c[(c[G>>2]|0)+36>>2]&127](G)|0}else{S=d[H]|0}H=S&255;K=(Q|0)==(R|0);do{if(K){T=(a[m]|0)==H<<24>>24;if(!T){if(!((a[t]|0)==H<<24>>24)){I=40;break}}a[Q]=T?43:45;U=Q+1|0;V=E;W=0}else{I=40}}while(0);do{if((I|0)==40){I=0;y=a[s]|0;if((y&1)==0){X=(y&255)>>>1}else{X=c[n>>2]|0}if((X|0)!=0&H<<24>>24==0){if((E-z|0)>=160){U=Q;V=E;W=r;break}c[E>>2]=r;U=Q;V=E+4|0;W=0;break}else{Y=u}while(1){y=Y+1|0;if((a[Y]|0)==H<<24>>24){Z=Y;break}if((y|0)==(A|0)){Z=A;break}else{Y=y}}y=Z-B|0;if((y|0)>23){J=R;break a}if((y|0)<22){a[Q]=a[3672+y|0]|0;U=Q+1|0;V=E;W=r+1|0;break}if(K){J=Q;break a}if((Q-R|0)>=3){J=R;break a}if((a[Q+ -1|0]|0)!=48){J=R;break a}a[Q]=a[3672+y|0]|0;U=Q+1|0;V=E;W=0}}while(0);K=c[p>>2]|0;H=K+12|0;y=c[H>>2]|0;if((y|0)==(c[K+16>>2]|0)){pc[c[(c[K>>2]|0)+40>>2]&127](K)|0;C=K;D=U;E=V;r=W;F=R;continue}else{c[H>>2]=y+1;C=K;D=U;E=V;r=W;F=R;continue}}a[J+3|0]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);R=c[1254]|0;c[l>>2]=k;if((Eg(J,R,3712,l)|0)!=1){c[j>>2]=4}l=c[p>>2]|0;do{if((l|0)==0){_=0}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){_=l;break}if(!((pc[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1)){_=l;break}c[p>>2]=0;_=0}}while(0);p=(_|0)==0;l=c[f>>2]|0;do{if((l|0)==0){I=72}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!p){break}$=b;c[$>>2]=_;ve(q);ve(o);i=e;return}if((pc[c[(c[l>>2]|0)+36>>2]&127](l)|0)==-1){c[f>>2]=0;I=72;break}if(!(p^(l|0)==0)){break}$=b;c[$>>2]=_;ve(q);ve(o);i=e;return}}while(0);do{if((I|0)==72){if(p){break}$=b;c[$>>2]=_;ve(q);ve(o);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;$=b;c[$>>2]=_;ve(q);ve(o);i=e;return}function Dg(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(a[m+24|0]|0)==b<<24>>24;if(!q){if(!((a[m+25|0]|0)==b<<24>>24)){break}}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&b<<24>>24==h<<24>>24){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+26|0;h=m;while(1){l=h+1|0;if((a[h]|0)==b<<24>>24){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;if((h|0)>23){r=-1;i=n;return r|0}do{if((d|0)==10|(d|0)==8){if((h|0)<(d|0)){break}else{r=-1}i=n;return r|0}else if((d|0)==16){if((h|0)<22){break}if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;m=a[3672+h|0]|0;c[f>>2]=o+1;a[o]=m;r=0;i=n;return r|0}}while(0);e=a[3672+h|0]|0;c[f>>2]=o+1;a[o]=e;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function Eg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=zb(b|0)|0;b=Ea(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}zb(e|0)|0;i=f;return b|0}function Fg(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Gg(a){a=a|0;i=i;return}function Hg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;k=i;i=i+136|0;l=k;m=k+8|0;n=k+16|0;o=k+24|0;p=k+40|0;q=k+56|0;r=k+64|0;s=k+72|0;t=k+80|0;u=k+88|0;v=k+96|0;w=k+104|0;x=k+128|0;if((c[g+4>>2]&1|0)==0){c[q>>2]=-1;y=c[(c[d>>2]|0)+16>>2]|0;z=e;c[s>>2]=c[z>>2];c[t>>2]=c[f>>2];A=n;B=s;c[A+0>>2]=c[B+0>>2];B=m;A=t;c[B+0>>2]=c[A+0>>2];kc[y&63](r,d,n,m,g,h,q);m=c[r>>2]|0;c[z>>2]=m;z=c[q>>2]|0;if((z|0)==1){a[j]=1}else if((z|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}Qe(u,g);m=u;u=c[m>>2]|0;if(!((c[1280]|0)==-1)){c[p>>2]=5120;c[p+4>>2]=118;c[p+8>>2]=0;qe(5120,p,119)}p=(c[5124>>2]|0)+ -1|0;z=c[u+8>>2]|0;if(!((c[u+12>>2]|0)-z>>2>>>0>p>>>0)){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}u=c[z+(p<<2)>>2]|0;if((u|0)==0){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}C=u;Yd(c[m>>2]|0)|0;Qe(v,g);g=v;v=c[g>>2]|0;if(!((c[1320]|0)==-1)){c[o>>2]=5280;c[o+4>>2]=118;c[o+8>>2]=0;qe(5280,o,119)}o=(c[5284>>2]|0)+ -1|0;m=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-m>>2>>>0>o>>>0)){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}v=c[m+(o<<2)>>2]|0;if((v|0)==0){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}E=v;Yd(c[g>>2]|0)|0;g=w;F=v;nc[c[(c[F>>2]|0)+24>>2]&63](g,E);nc[c[(c[F>>2]|0)+28>>2]&63](w+12|0,E);c[x>>2]=c[f>>2];f=w+24|0;E=l;F=x;c[E+0>>2]=c[F+0>>2];F=Ig(e,l,g,f,C,h,1)|0;a[j]=(F|0)==(g|0)|0;c[b>>2]=c[e>>2];He(w+12|0);He(w);i=k;return}function Ig(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;k=i;i=i+104|0;l=(f-e|0)/12|0;m=k;do{if(l>>>0>100){n=Km(l)|0;if((n|0)!=0){o=n;p=n;break}Wm()}else{o=0;p=m}}while(0);m=(e|0)==(f|0);if(m){q=0;r=l}else{n=e;s=0;t=l;l=p;while(1){u=a[n]|0;if((u&1)==0){v=(u&255)>>>1}else{v=c[n+4>>2]|0}if((v|0)==0){a[l]=2;w=s+1|0;x=t+ -1|0}else{a[l]=1;w=s;x=t}u=n+12|0;if((u|0)==(f|0)){q=w;r=x;break}else{n=u;s=w;t=x;l=l+1|0}}}l=b;b=d;d=g;x=0;t=q;q=r;a:while(1){r=c[l>>2]|0;do{if((r|0)==0){y=1}else{w=c[r+12>>2]|0;if((w|0)==(c[r+16>>2]|0)){z=pc[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{z=c[w>>2]|0}if((z|0)==-1){c[l>>2]=0;y=1;break}else{y=(c[l>>2]|0)==0;break}}}while(0);r=c[b>>2]|0;do{if((r|0)==0){A=0;B=1}else{w=c[r+12>>2]|0;if((w|0)==(c[r+16>>2]|0)){C=pc[c[(c[r>>2]|0)+36>>2]&127](r)|0}else{C=c[w>>2]|0}if(!((C|0)==-1)){A=r;B=0;break}c[b>>2]=0;A=0;B=1}}while(0);D=c[l>>2]|0;if(!((y^B)&(q|0)!=0)){break}r=c[D+12>>2]|0;if((r|0)==(c[D+16>>2]|0)){E=pc[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{E=c[r>>2]|0}if(j){F=E}else{F=yc[c[(c[d>>2]|0)+28>>2]&31](g,E)|0}r=x+1|0;if(m){x=r;q=q;t=t;continue}b:do{if(j){w=0;s=e;n=t;v=q;u=p;while(1){do{if((a[u]|0)==1){G=a[s]|0;H=(G&1)==0;if(H){I=s+4|0}else{I=c[s+8>>2]|0}if((F|0)!=(c[I+(x<<2)>>2]|0)){a[u]=0;J=w;K=n;L=v+ -1|0;break}if(H){M=(G&255)>>>1}else{M=c[s+4>>2]|0}if((M|0)!=(r|0)){J=1;K=n;L=v;break}a[u]=2;J=1;K=n+1|0;L=v+ -1|0}else{J=w;K=n;L=v}}while(0);G=s+12|0;if((G|0)==(f|0)){N=J;O=K;P=L;break b}w=J;s=G;n=K;v=L;u=u+1|0}}else{u=0;v=e;n=t;s=q;w=p;while(1){do{if((a[w]|0)==1){G=v;if((a[G]&1)==0){Q=v+4|0}else{Q=c[v+8>>2]|0}if((F|0)!=(yc[c[(c[d>>2]|0)+28>>2]&31](g,c[Q+(x<<2)>>2]|0)|0)){a[w]=0;R=u;S=n;T=s+ -1|0;break}H=a[G]|0;if((H&1)==0){U=(H&255)>>>1}else{U=c[v+4>>2]|0}if((U|0)!=(r|0)){R=1;S=n;T=s;break}a[w]=2;R=1;S=n+1|0;T=s+ -1|0}else{R=u;S=n;T=s}}while(0);H=v+12|0;if((H|0)==(f|0)){N=R;O=S;P=T;break b}u=R;v=H;n=S;s=T;w=w+1|0}}}while(0);if(!N){x=r;t=O;q=P;continue}w=c[l>>2]|0;s=w+12|0;n=c[s>>2]|0;if((n|0)==(c[w+16>>2]|0)){pc[c[(c[w>>2]|0)+40>>2]&127](w)|0}else{c[s>>2]=n+4}if((P+O|0)>>>0<2){x=r;t=O;q=P;continue}else{V=e;W=O;X=p}while(1){do{if((a[X]|0)==2){n=a[V]|0;if((n&1)==0){Y=(n&255)>>>1}else{Y=c[V+4>>2]|0}if((Y|0)==(r|0)){Z=W;break}a[X]=0;Z=W+ -1|0}else{Z=W}}while(0);n=V+12|0;if((n|0)==(f|0)){x=r;t=Z;q=P;continue a}else{V=n;W=Z;X=X+1|0}}}do{if((D|0)==0){_=1}else{X=c[D+12>>2]|0;if((X|0)==(c[D+16>>2]|0)){$=pc[c[(c[D>>2]|0)+36>>2]&127](D)|0}else{$=c[X>>2]|0}if(($|0)==-1){c[l>>2]=0;_=1;break}else{_=(c[l>>2]|0)==0;break}}}while(0);do{if((A|0)==0){aa=85}else{l=c[A+12>>2]|0;if((l|0)==(c[A+16>>2]|0)){ba=pc[c[(c[A>>2]|0)+36>>2]&127](A)|0}else{ba=c[l>>2]|0}if((ba|0)==-1){c[b>>2]=0;aa=85;break}else{if(_){break}else{aa=87;break}}}}while(0);if((aa|0)==85){if(_){aa=87}}if((aa|0)==87){c[h>>2]=c[h>>2]|2}c:do{if(m){aa=92}else{if((a[p]|0)==2){ca=e;break}else{da=e;ea=p}while(1){_=da+12|0;b=ea+1|0;if((_|0)==(f|0)){aa=92;break c}if((a[b]|0)==2){ca=_;break}else{ea=b;da=_}}}}while(0);if((aa|0)==92){c[h>>2]=c[h>>2]|4;ca=f}if((o|0)==0){i=k;return ca|0}Lm(o);i=k;return ca|0}function Jg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Kg(a,0,k,j,f,g,h);i=b;return}function Kg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;eh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=pc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}ye(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}ye(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{R=c[F>>2]|0}if((ah(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){pc[c[(c[B>>2]|0)+40>>2]&127](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);c[j>>2]=Vl(J,c[o>>2]|0,h,t)|0;mj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=pc[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}function Lg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Mg(a,0,k,j,f,g,h);i=b;return}function Mg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;eh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=pc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;K=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;K=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){L=(w&255)>>>1}else{L=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(L|0)){if(F){M=(w&255)>>>1;N=(w&255)>>>1}else{w=c[y>>2]|0;M=w;N=w}ye(n,N<<1,0);if((a[g]&1)==0){O=10}else{O=(c[f>>2]&-2)+ -1|0}ye(n,O,0);if((a[g]&1)==0){P=u}else{P=c[v>>2]|0}c[o>>2]=P+M;Q=P}else{Q=A}w=B+12|0;F=c[w>>2]|0;R=B+16|0;if((F|0)==(c[R>>2]|0)){S=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{S=c[F>>2]|0}if((ah(S,t,Q,o,r,z,m,k,q,s)|0)!=0){I=H;K=Q;break}F=c[w>>2]|0;if((F|0)==(c[R>>2]|0)){pc[c[(c[B>>2]|0)+40>>2]&127](B)|0;l=B;A=Q;continue}else{c[w>>2]=F+4;l=B;A=Q;continue}}Q=a[m]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[m+4>>2]|0}do{if((T|0)!=0){Q=c[q>>2]|0;if((Q-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=A}}while(0);r=Ul(K,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=r;c[t+4>>2]=J;mj(m,k,c[q>>2]|0,h);do{if((B|0)==0){U=0;V=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){W=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{W=c[q>>2]|0}if(!((W|0)==-1)){U=B;V=0;break}c[x>>2]=0;U=0;V=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){X=pc[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{X=c[x>>2]|0}if((X|0)==-1){c[e>>2]=0;E=60;break}if(!V){break}Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}}while(0);do{if((E|0)==60){if(V){break}Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}function Ng(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Og(a,0,k,j,f,g,h);i=b;return}function Og(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;e=i;i=i+328|0;l=e;m=e+104|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+152|0;r=e+312|0;s=e+320|0;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}t=l;eh(n,h,t,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){l=o+1|0;v=l;w=o+8|0;x=l}else{l=o+8|0;v=o+1|0;w=l;x=c[l>>2]|0}c[p>>2]=x;l=q;c[r>>2]=l;c[s>>2]=0;y=f;f=g;g=o;z=o+4|0;A=c[m>>2]|0;m=c[y>>2]|0;B=x;a:while(1){do{if((m|0)==0){C=0;D=1}else{x=c[m+12>>2]|0;if((x|0)==(c[m+16>>2]|0)){E=pc[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{E=c[x>>2]|0}if(!((E|0)==-1)){C=m;D=0;break}c[y>>2]=0;C=0;D=1}}while(0);x=c[f>>2]|0;do{if((x|0)==0){F=21}else{G=c[x+12>>2]|0;if((G|0)==(c[x+16>>2]|0)){H=pc[c[(c[x>>2]|0)+36>>2]&127](x)|0}else{H=c[G>>2]|0}if((H|0)==-1){c[f>>2]=0;F=21;break}else{if(D){I=x;break}else{J=x;K=B;break a}}}}while(0);if((F|0)==21){F=0;if(D){J=0;K=B;break}else{I=0}}x=a[h]|0;G=(x&1)==0;if(G){L=(x&255)>>>1}else{L=c[z>>2]|0}if(((c[p>>2]|0)-B|0)==(L|0)){if(G){M=(x&255)>>>1;N=(x&255)>>>1}else{x=c[z>>2]|0;M=x;N=x}ye(o,N<<1,0);if((a[h]&1)==0){O=10}else{O=(c[g>>2]&-2)+ -1|0}ye(o,O,0);if((a[h]&1)==0){P=v}else{P=c[w>>2]|0}c[p>>2]=P+M;Q=P}else{Q=B}x=C+12|0;G=c[x>>2]|0;R=C+16|0;if((G|0)==(c[R>>2]|0)){S=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{S=c[G>>2]|0}if((ah(S,u,Q,p,s,A,n,l,r,t)|0)!=0){J=I;K=Q;break}G=c[x>>2]|0;if((G|0)==(c[R>>2]|0)){pc[c[(c[C>>2]|0)+40>>2]&127](C)|0;m=C;B=Q;continue}else{c[x>>2]=G+4;m=C;B=Q;continue}}Q=a[n]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[n+4>>2]|0}do{if((T|0)!=0){Q=c[r>>2]|0;if((Q-q|0)>=160){break}B=c[s>>2]|0;c[r>>2]=Q+4;c[Q>>2]=B}}while(0);b[k>>1]=Tl(K,c[p>>2]|0,j,u)|0;mj(n,l,c[r>>2]|0,j);do{if((C|0)==0){U=0;V=1}else{r=c[C+12>>2]|0;if((r|0)==(c[C+16>>2]|0)){W=pc[c[(c[C>>2]|0)+36>>2]&127](C)|0}else{W=c[r>>2]|0}if(!((W|0)==-1)){U=C;V=0;break}c[y>>2]=0;U=0;V=1}}while(0);do{if((J|0)==0){F=60}else{y=c[J+12>>2]|0;if((y|0)==(c[J+16>>2]|0)){X=pc[c[(c[J>>2]|0)+36>>2]&127](J)|0}else{X=c[y>>2]|0}if((X|0)==-1){c[f>>2]=0;F=60;break}if(!V){break}Y=d;c[Y>>2]=U;ve(o);ve(n);i=e;return}}while(0);do{if((F|0)==60){if(V){break}Y=d;c[Y>>2]=U;ve(o);ve(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;Y=d;c[Y>>2]=U;ve(o);ve(n);i=e;return}function Pg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Qg(a,0,k,j,f,g,h);i=b;return}function Qg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==64){t=8}else if((s|0)==0){t=0}else if((s|0)==8){t=16}else{t=10}s=k;eh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=pc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}ye(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}ye(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{R=c[F>>2]|0}if((ah(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){pc[c[(c[B>>2]|0)+40>>2]&127](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);c[j>>2]=Sl(J,c[o>>2]|0,h,t)|0;mj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=pc[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}function Rg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Sg(a,0,k,j,f,g,h);i=b;return}function Sg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;eh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=pc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;J=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;J=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){K=(w&255)>>>1}else{K=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(K|0)){if(F){L=(w&255)>>>1;M=(w&255)>>>1}else{w=c[y>>2]|0;L=w;M=w}ye(n,M<<1,0);if((a[g]&1)==0){N=10}else{N=(c[f>>2]&-2)+ -1|0}ye(n,N,0);if((a[g]&1)==0){O=u}else{O=c[v>>2]|0}c[o>>2]=O+L;P=O}else{P=A}w=B+12|0;F=c[w>>2]|0;Q=B+16|0;if((F|0)==(c[Q>>2]|0)){R=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{R=c[F>>2]|0}if((ah(R,t,P,o,r,z,m,k,q,s)|0)!=0){I=H;J=P;break}F=c[w>>2]|0;if((F|0)==(c[Q>>2]|0)){pc[c[(c[B>>2]|0)+40>>2]&127](B)|0;l=B;A=P;continue}else{c[w>>2]=F+4;l=B;A=P;continue}}P=a[m]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[m+4>>2]|0}do{if((S|0)!=0){P=c[q>>2]|0;if((P-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=A}}while(0);c[j>>2]=Rl(J,c[o>>2]|0,h,t)|0;mj(m,k,c[q>>2]|0,h);do{if((B|0)==0){T=0;U=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){V=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{V=c[q>>2]|0}if(!((V|0)==-1)){T=B;U=0;break}c[x>>2]=0;T=0;U=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){W=pc[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{W=c[x>>2]|0}if((W|0)==-1){c[e>>2]=0;E=60;break}if(!U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);do{if((E|0)==60){if(U){break}X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;X=b;c[X>>2]=T;ve(n);ve(m);i=d;return}function Tg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Ug(a,0,k,j,f,g,h);i=b;return}function Ug(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;d=i;i=i+328|0;k=d;l=d+104|0;m=d+112|0;n=d+128|0;o=d+144|0;p=d+152|0;q=d+312|0;r=d+320|0;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}s=k;eh(m,g,s,l);g=n;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;ye(n,10,0);if((a[g]&1)==0){k=n+1|0;u=k;v=n+8|0;w=k}else{k=n+8|0;u=n+1|0;v=k;w=c[k>>2]|0}c[o>>2]=w;k=p;c[q>>2]=k;c[r>>2]=0;x=e;e=f;f=n;y=n+4|0;z=c[l>>2]|0;l=c[x>>2]|0;A=w;a:while(1){do{if((l|0)==0){B=0;C=1}else{w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){D=pc[c[(c[l>>2]|0)+36>>2]&127](l)|0}else{D=c[w>>2]|0}if(!((D|0)==-1)){B=l;C=0;break}c[x>>2]=0;B=0;C=1}}while(0);w=c[e>>2]|0;do{if((w|0)==0){E=21}else{F=c[w+12>>2]|0;if((F|0)==(c[w+16>>2]|0)){G=pc[c[(c[w>>2]|0)+36>>2]&127](w)|0}else{G=c[F>>2]|0}if((G|0)==-1){c[e>>2]=0;E=21;break}else{if(C){H=w;break}else{I=w;K=A;break a}}}}while(0);if((E|0)==21){E=0;if(C){I=0;K=A;break}else{H=0}}w=a[g]|0;F=(w&1)==0;if(F){L=(w&255)>>>1}else{L=c[y>>2]|0}if(((c[o>>2]|0)-A|0)==(L|0)){if(F){M=(w&255)>>>1;N=(w&255)>>>1}else{w=c[y>>2]|0;M=w;N=w}ye(n,N<<1,0);if((a[g]&1)==0){O=10}else{O=(c[f>>2]&-2)+ -1|0}ye(n,O,0);if((a[g]&1)==0){P=u}else{P=c[v>>2]|0}c[o>>2]=P+M;Q=P}else{Q=A}w=B+12|0;F=c[w>>2]|0;R=B+16|0;if((F|0)==(c[R>>2]|0)){S=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{S=c[F>>2]|0}if((ah(S,t,Q,o,r,z,m,k,q,s)|0)!=0){I=H;K=Q;break}F=c[w>>2]|0;if((F|0)==(c[R>>2]|0)){pc[c[(c[B>>2]|0)+40>>2]&127](B)|0;l=B;A=Q;continue}else{c[w>>2]=F+4;l=B;A=Q;continue}}Q=a[m]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[m+4>>2]|0}do{if((T|0)!=0){Q=c[q>>2]|0;if((Q-p|0)>=160){break}A=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=A}}while(0);r=Ql(K,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=r;c[t+4>>2]=J;mj(m,k,c[q>>2]|0,h);do{if((B|0)==0){U=0;V=1}else{q=c[B+12>>2]|0;if((q|0)==(c[B+16>>2]|0)){W=pc[c[(c[B>>2]|0)+36>>2]&127](B)|0}else{W=c[q>>2]|0}if(!((W|0)==-1)){U=B;V=0;break}c[x>>2]=0;U=0;V=1}}while(0);do{if((I|0)==0){E=60}else{x=c[I+12>>2]|0;if((x|0)==(c[I+16>>2]|0)){X=pc[c[(c[I>>2]|0)+36>>2]&127](I)|0}else{X=c[x>>2]|0}if((X|0)==-1){c[e>>2]=0;E=60;break}if(!V){break}Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}}while(0);do{if((E|0)==60){if(V){break}Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}}while(0);c[h>>2]=c[h>>2]|2;Y=b;c[Y>>2]=U;ve(n);ve(m);i=d;return}function Vg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Wg(a,0,k,j,f,g,h);i=b;return}function Wg(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;d=i;i=i+376|0;l=d+128|0;m=d+136|0;n=d+144|0;o=d+160|0;p=d+176|0;q=d+184|0;r=d+344|0;s=d+352|0;t=d+360|0;u=d+368|0;v=d;fh(n,h,v,l,m);h=o;c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ye(o,10,0);if((a[h]&1)==0){w=o+1|0;x=w;y=o+8|0;z=w}else{w=o+8|0;x=o+1|0;y=w;z=c[w>>2]|0}c[p>>2]=z;w=q;c[r>>2]=w;c[s>>2]=0;a[t]=1;a[u]=69;A=e;e=f;f=o;B=o+4|0;C=c[l>>2]|0;l=c[m>>2]|0;m=c[A>>2]|0;D=z;a:while(1){do{if((m|0)==0){E=0;F=1}else{z=c[m+12>>2]|0;if((z|0)==(c[m+16>>2]|0)){G=pc[c[(c[m>>2]|0)+36>>2]&127](m)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){E=m;F=0;break}c[A>>2]=0;E=0;F=1}}while(0);z=c[e>>2]|0;do{if((z|0)==0){H=17}else{I=c[z+12>>2]|0;if((I|0)==(c[z+16>>2]|0)){J=pc[c[(c[z>>2]|0)+36>>2]&127](z)|0}else{J=c[I>>2]|0}if((J|0)==-1){c[e>>2]=0;H=17;break}else{if(F){K=z;break}else{L=z;M=D;break a}}}}while(0);if((H|0)==17){H=0;if(F){L=0;M=D;break}else{K=0}}z=a[h]|0;I=(z&1)==0;if(I){N=(z&255)>>>1}else{N=c[B>>2]|0}if(((c[p>>2]|0)-D|0)==(N|0)){if(I){O=(z&255)>>>1;P=(z&255)>>>1}else{z=c[B>>2]|0;O=z;P=z}ye(o,P<<1,0);if((a[h]&1)==0){Q=10}else{Q=(c[f>>2]&-2)+ -1|0}ye(o,Q,0);if((a[h]&1)==0){R=x}else{R=c[y>>2]|0}c[p>>2]=R+O;S=R}else{S=D}z=E+12|0;I=c[z>>2]|0;T=E+16|0;if((I|0)==(c[T>>2]|0)){U=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{U=c[I>>2]|0}if((gh(U,t,u,S,p,C,l,n,w,r,s,v)|0)!=0){L=K;M=S;break}I=c[z>>2]|0;if((I|0)==(c[T>>2]|0)){pc[c[(c[E>>2]|0)+40>>2]&127](E)|0;m=E;D=S;continue}else{c[z>>2]=I+4;m=E;D=S;continue}}S=a[n]|0;if((S&1)==0){V=(S&255)>>>1}else{V=c[n+4>>2]|0}do{if((V|0)!=0){if((a[t]|0)==0){break}S=c[r>>2]|0;if((S-q|0)>=160){break}D=c[s>>2]|0;c[r>>2]=S+4;c[S>>2]=D}}while(0);g[k>>2]=+Pl(M,c[p>>2]|0,j);mj(n,w,c[r>>2]|0,j);do{if((E|0)==0){W=0;X=1}else{r=c[E+12>>2]|0;if((r|0)==(c[E+16>>2]|0)){Y=pc[c[(c[E>>2]|0)+36>>2]&127](E)|0}else{Y=c[r>>2]|0}if(!((Y|0)==-1)){W=E;X=0;break}c[A>>2]=0;W=0;X=1}}while(0);do{if((L|0)==0){H=57}else{A=c[L+12>>2]|0;if((A|0)==(c[L+16>>2]|0)){Z=pc[c[(c[L>>2]|0)+36>>2]&127](L)|0}else{Z=c[A>>2]|0}if((Z|0)==-1){c[e>>2]=0;H=57;break}if(!X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);do{if((H|0)==57){if(X){break}_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}}while(0);c[j>>2]=c[j>>2]|2;_=b;c[_>>2]=W;ve(o);ve(n);i=d;return}function Xg(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=b;k=b+8|0;l=b+16|0;m=b+24|0;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];e=k;d=l;c[e+0>>2]=c[d+0>>2];d=j;e=m;c[d+0>>2]=c[e+0>>2];Yg(a,0,k,j,f,g,h);i=b;return}



function qj(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,kc=0,lc=0,nc=0,oc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0,Cc=0,Dc=0,Ec=0,Fc=0;p=i;i=i+408|0;q=p;r=p+400|0;s=r;t=i;i=i+8|0;u=i;i=i+8|0;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+8|0;B=i;i=i+8|0;C=q;c[r>>2]=0;D=v;c[D+0>>2]=0;c[D+4>>2]=0;c[D+8>>2]=0;E=w;c[E+0>>2]=0;c[E+4>>2]=0;c[E+8>>2]=0;F=x;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;G=y;c[G+0>>2]=0;c[G+4>>2]=0;c[G+8>>2]=0;H=z;c[H+0>>2]=0;c[H+4>>2]=0;c[H+8>>2]=0;tj(f,g,s,t,u,v,w,x,y,A);s=m;c[n>>2]=c[s>>2];g=b;b=e;e=r;r=l;f=y+4|0;I=y+8|0;J=x+4|0;K=x+8|0;L=(h&512|0)!=0;h=w+4|0;M=w+8|0;N=z+4|0;O=z+8|0;P=e+3|0;Q=m+4|0;m=v+4|0;R=q+400|0;q=C;S=C;C=o;o=0;T=0;U=120;a:while(1){V=c[g>>2]|0;do{if((V|0)==0){W=1}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){Y=pc[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{Y=c[X>>2]|0}if((Y|0)==-1){c[g>>2]=0;W=1;break}else{W=(c[g>>2]|0)==0;break}}}while(0);V=c[b>>2]|0;do{if((V|0)==0){Z=15}else{X=c[V+12>>2]|0;if((X|0)==(c[V+16>>2]|0)){_=pc[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{_=c[X>>2]|0}if((_|0)==-1){c[b>>2]=0;Z=15;break}else{if(W){$=V;break}else{aa=S;ba=q;ca=T;da=U;Z=292;break a}}}}while(0);if((Z|0)==15){Z=0;if(W){aa=S;ba=q;ca=T;da=U;Z=292;break}else{$=0}}b:do{switch(a[e+o|0]|0){case 2:{if(!((T|0)!=0|o>>>0<2)){if((o|0)==2){ea=(a[P]|0)!=0}else{ea=0}if(!(L|ea)){fa=C;ga=S;ha=q;ia=R;ja=0;ka=U;break b}}V=a[E]|0;X=(V&1)==0?h:c[M>>2]|0;c:do{if((o|0)==0){la=$;ma=$;na=V;oa=X}else{if((d[e+(o+ -1)|0]|0)<2){pa=V;qa=X}else{la=$;ma=$;na=V;oa=X;break}while(1){if((pa&1)==0){ra=h;sa=(pa&255)>>>1}else{ra=c[M>>2]|0;sa=c[h>>2]|0}if((qa|0)==(ra+(sa<<2)|0)){ta=pa;break}if(!(jc[c[(c[r>>2]|0)+12>>2]&31](l,8192,c[qa>>2]|0)|0)){Z=129;break}pa=a[E]|0;qa=qa+4|0}if((Z|0)==129){Z=0;ta=a[E]|0}ua=(ta&1)==0;va=qa-(ua?h:c[M>>2]|0)>>2;wa=a[H]|0;xa=(wa&1)==0;if(xa){ya=(wa&255)>>>1}else{ya=c[N>>2]|0}d:do{if(!(va>>>0>ya>>>0)){if(xa){za=N+(((wa&255)>>>1)-va<<2)|0;Aa=N;Ba=(wa&255)>>>1}else{Ca=c[O>>2]|0;Da=c[N>>2]|0;za=Ca+(Da-va<<2)|0;Aa=Ca;Ba=Da}Da=Aa+(Ba<<2)|0;if((za|0)==(Da|0)){la=$;ma=$;na=ta;oa=qa;break c}else{Ea=ua?h:c[M>>2]|0;Fa=za}while(1){if((c[Fa>>2]|0)!=(c[Ea>>2]|0)){break d}Ca=Fa+4|0;if((Ca|0)==(Da|0)){la=$;ma=$;na=ta;oa=qa;break c}Ea=Ea+4|0;Fa=Ca}}}while(0);la=$;ma=$;na=ta;oa=ua?h:c[M>>2]|0}}while(0);e:while(1){if((na&1)==0){Ga=h;Ha=(na&255)>>>1}else{Ga=c[M>>2]|0;Ha=c[h>>2]|0}if((oa|0)==(Ga+(Ha<<2)|0)){break}X=c[g>>2]|0;do{if((X|0)==0){Ia=1}else{V=c[X+12>>2]|0;if((V|0)==(c[X+16>>2]|0)){Ja=pc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{Ja=c[V>>2]|0}if((Ja|0)==-1){c[g>>2]=0;Ia=1;break}else{Ia=(c[g>>2]|0)==0;break}}}while(0);do{if((ma|0)==0){Ka=la;Z=159}else{X=c[ma+12>>2]|0;if((X|0)==(c[ma+16>>2]|0)){La=pc[c[(c[ma>>2]|0)+36>>2]&127](ma)|0}else{La=c[X>>2]|0}if((La|0)==-1){c[b>>2]=0;Ka=0;Z=159;break}else{if(Ia^(la|0)==0){Ma=la;Na=la;break}else{break e}}}}while(0);if((Z|0)==159){Z=0;if(Ia){break}else{Ma=Ka;Na=0}}X=c[g>>2]|0;ua=c[X+12>>2]|0;if((ua|0)==(c[X+16>>2]|0)){Oa=pc[c[(c[X>>2]|0)+36>>2]&127](X)|0}else{Oa=c[ua>>2]|0}if((Oa|0)!=(c[oa>>2]|0)){break}ua=c[g>>2]|0;X=ua+12|0;V=c[X>>2]|0;if((V|0)==(c[ua+16>>2]|0)){pc[c[(c[ua>>2]|0)+40>>2]&127](ua)|0}else{c[X>>2]=V+4}la=Ma;ma=Na;na=a[E]|0;oa=oa+4|0}if(!L){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break b}V=a[E]|0;if((V&1)==0){Pa=h;Qa=(V&255)>>>1}else{Pa=c[M>>2]|0;Qa=c[h>>2]|0}if((oa|0)==(Pa+(Qa<<2)|0)){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U}else{Z=174;break a}break};case 4:{V=C;X=S;ua=q;va=R;wa=0;xa=U;f:while(1){Da=c[g>>2]|0;do{if((Da|0)==0){Ra=1}else{Ca=c[Da+12>>2]|0;if((Ca|0)==(c[Da+16>>2]|0)){Sa=pc[c[(c[Da>>2]|0)+36>>2]&127](Da)|0}else{Sa=c[Ca>>2]|0}if((Sa|0)==-1){c[g>>2]=0;Ra=1;break}else{Ra=(c[g>>2]|0)==0;break}}}while(0);Da=c[b>>2]|0;do{if((Da|0)==0){Z=188}else{Ca=c[Da+12>>2]|0;if((Ca|0)==(c[Da+16>>2]|0)){Ta=pc[c[(c[Da>>2]|0)+36>>2]&127](Da)|0}else{Ta=c[Ca>>2]|0}if((Ta|0)==-1){c[b>>2]=0;Z=188;break}else{if(Ra){break}else{break f}}}}while(0);if((Z|0)==188){Z=0;if(Ra){break}}Da=c[g>>2]|0;Ca=c[Da+12>>2]|0;if((Ca|0)==(c[Da+16>>2]|0)){Ua=pc[c[(c[Da>>2]|0)+36>>2]&127](Da)|0}else{Ua=c[Ca>>2]|0}if(jc[c[(c[r>>2]|0)+12>>2]&31](l,2048,Ua)|0){Ca=c[n>>2]|0;if((Ca|0)==(V|0)){Da=(c[Q>>2]|0)!=120;Va=c[s>>2]|0;Wa=V-Va|0;Xa=Wa>>>0<2147483647?Wa<<1:-1;Ya=Wa>>2;if(Da){Za=Va}else{Za=0}Va=Mm(Za,Xa)|0;Wa=Va;if((Va|0)==0){Z=198;break a}do{if(Da){c[s>>2]=Wa;_a=Wa}else{Va=c[s>>2]|0;c[s>>2]=Wa;if((Va|0)==0){_a=Wa;break}mc[c[Q>>2]&255](Va);_a=c[s>>2]|0}}while(0);c[Q>>2]=121;Wa=_a+(Ya<<2)|0;c[n>>2]=Wa;$a=Wa;ab=(c[s>>2]|0)+(Xa>>>2<<2)|0}else{$a=Ca;ab=V}c[n>>2]=$a+4;c[$a>>2]=Ua;bb=ab;cb=X;db=ua;eb=va;fb=wa+1|0;gb=xa}else{Wa=a[D]|0;if((Wa&1)==0){hb=(Wa&255)>>>1}else{hb=c[m>>2]|0}if((hb|0)==0|(wa|0)==0){break}if((Ua|0)!=(c[u>>2]|0)){break}if((ua|0)==(va|0)){Wa=ua-X|0;Da=Wa>>>0<2147483647?Wa<<1:-1;if((xa|0)!=120){ib=X}else{ib=0}Va=Mm(ib,Da)|0;jb=Va;if((Va|0)==0){Z=214;break a}kb=jb;lb=jb+(Wa>>2<<2)|0;mb=jb+(Da>>>2<<2)|0;nb=121}else{kb=X;lb=ua;mb=va;nb=xa}c[lb>>2]=wa;bb=V;cb=kb;db=lb+4|0;eb=mb;fb=0;gb=nb}Da=c[g>>2]|0;jb=Da+12|0;Wa=c[jb>>2]|0;if((Wa|0)==(c[Da+16>>2]|0)){pc[c[(c[Da>>2]|0)+40>>2]&127](Da)|0;V=bb;X=cb;ua=db;va=eb;wa=fb;xa=gb;continue}else{c[jb>>2]=Wa+4;V=bb;X=cb;ua=db;va=eb;wa=fb;xa=gb;continue}}if((X|0)==(ua|0)|(wa|0)==0){ob=X;pb=ua;qb=va;rb=xa}else{if((ua|0)==(va|0)){Wa=ua-X|0;jb=Wa>>>0<2147483647?Wa<<1:-1;if((xa|0)!=120){sb=X}else{sb=0}Da=Mm(sb,jb)|0;Va=Da;if((Da|0)==0){Z=225;break a}tb=Va;ub=Va+(Wa>>2<<2)|0;vb=Va+(jb>>>2<<2)|0;wb=121}else{tb=X;ub=ua;vb=va;wb=xa}c[ub>>2]=wa;ob=tb;pb=ub+4|0;qb=vb;rb=wb}jb=c[A>>2]|0;if((jb|0)>0){Va=c[g>>2]|0;do{if((Va|0)==0){xb=1}else{Wa=c[Va+12>>2]|0;if((Wa|0)==(c[Va+16>>2]|0)){yb=pc[c[(c[Va>>2]|0)+36>>2]&127](Va)|0}else{yb=c[Wa>>2]|0}if((yb|0)==-1){c[g>>2]=0;xb=1;break}else{xb=(c[g>>2]|0)==0;break}}}while(0);Va=c[b>>2]|0;do{if((Va|0)==0){Z=242}else{wa=c[Va+12>>2]|0;if((wa|0)==(c[Va+16>>2]|0)){zb=pc[c[(c[Va>>2]|0)+36>>2]&127](Va)|0}else{zb=c[wa>>2]|0}if((zb|0)==-1){c[b>>2]=0;Z=242;break}else{if(xb){Ab=Va;break}else{Z=248;break a}}}}while(0);if((Z|0)==242){Z=0;if(xb){Z=248;break a}else{Ab=0}}Va=c[g>>2]|0;wa=c[Va+12>>2]|0;if((wa|0)==(c[Va+16>>2]|0)){Bb=pc[c[(c[Va>>2]|0)+36>>2]&127](Va)|0}else{Bb=c[wa>>2]|0}if((Bb|0)!=(c[t>>2]|0)){Z=248;break a}wa=c[g>>2]|0;Va=wa+12|0;xa=c[Va>>2]|0;if((xa|0)==(c[wa+16>>2]|0)){pc[c[(c[wa>>2]|0)+40>>2]&127](wa)|0;Cb=Ab;Db=jb;Eb=Ab;Fb=V}else{c[Va>>2]=xa+4;Cb=Ab;Db=jb;Eb=Ab;Fb=V}while(1){xa=c[g>>2]|0;do{if((xa|0)==0){Gb=1}else{Va=c[xa+12>>2]|0;if((Va|0)==(c[xa+16>>2]|0)){Hb=pc[c[(c[xa>>2]|0)+36>>2]&127](xa)|0}else{Hb=c[Va>>2]|0}if((Hb|0)==-1){c[g>>2]=0;Gb=1;break}else{Gb=(c[g>>2]|0)==0;break}}}while(0);do{if((Eb|0)==0){Ib=Cb;Z=265}else{xa=c[Eb+12>>2]|0;if((xa|0)==(c[Eb+16>>2]|0)){Jb=pc[c[(c[Eb>>2]|0)+36>>2]&127](Eb)|0}else{Jb=c[xa>>2]|0}if((Jb|0)==-1){c[b>>2]=0;Ib=0;Z=265;break}else{if(Gb^(Cb|0)==0){Kb=Cb;Lb=Cb;break}else{Z=271;break a}}}}while(0);if((Z|0)==265){Z=0;if(Gb){Z=271;break a}else{Kb=Ib;Lb=0}}xa=c[g>>2]|0;Ca=c[xa+12>>2]|0;if((Ca|0)==(c[xa+16>>2]|0)){Mb=pc[c[(c[xa>>2]|0)+36>>2]&127](xa)|0}else{Mb=c[Ca>>2]|0}if(!(jc[c[(c[r>>2]|0)+12>>2]&31](l,2048,Mb)|0)){Z=271;break a}Ca=c[n>>2]|0;if((Ca|0)==(Fb|0)){xa=(c[Q>>2]|0)!=120;Xa=c[s>>2]|0;Ya=Fb-Xa|0;Va=Ya>>>0<2147483647?Ya<<1:-1;wa=Ya>>2;if(xa){Nb=Xa}else{Nb=0}Xa=Mm(Nb,Va)|0;Ya=Xa;if((Xa|0)==0){Z=276;break a}do{if(xa){c[s>>2]=Ya;Ob=Ya}else{Xa=c[s>>2]|0;c[s>>2]=Ya;if((Xa|0)==0){Ob=Ya;break}mc[c[Q>>2]&255](Xa);Ob=c[s>>2]|0}}while(0);c[Q>>2]=121;Ya=Ob+(wa<<2)|0;c[n>>2]=Ya;Pb=Ya;Qb=(c[s>>2]|0)+(Va>>>2<<2)|0}else{Pb=Ca;Qb=Fb}Ya=c[g>>2]|0;xa=c[Ya+12>>2]|0;if((xa|0)==(c[Ya+16>>2]|0)){Xa=pc[c[(c[Ya>>2]|0)+36>>2]&127](Ya)|0;Rb=Xa;Sb=c[n>>2]|0}else{Rb=c[xa>>2]|0;Sb=Pb}c[n>>2]=Sb+4;c[Sb>>2]=Rb;xa=Db+ -1|0;c[A>>2]=xa;Xa=c[g>>2]|0;Ya=Xa+12|0;va=c[Ya>>2]|0;if((va|0)==(c[Xa+16>>2]|0)){pc[c[(c[Xa>>2]|0)+40>>2]&127](Xa)|0}else{c[Ya>>2]=va+4}if((xa|0)>0){Cb=Kb;Db=xa;Eb=Lb;Fb=Qb}else{Tb=Qb;break}}}else{Tb=V}if((c[n>>2]|0)==(c[s>>2]|0)){Z=290;break a}else{fa=Tb;ga=ob;ha=pb;ia=qb;ja=T;ka=rb}break};case 3:{jb=a[F]|0;xa=(jb&1)==0;if(xa){Ub=(jb&255)>>>1}else{Ub=c[J>>2]|0}va=a[G]|0;Ya=(va&1)==0;if(Ya){Vb=(va&255)>>>1}else{Vb=c[f>>2]|0}if((Ub|0)==(0-Vb|0)){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break b}if(xa){Wb=(jb&255)>>>1}else{Wb=c[J>>2]|0}do{if((Wb|0)!=0){if(Ya){Xb=(va&255)>>>1}else{Xb=c[f>>2]|0}if((Xb|0)==0){break}Xa=c[g>>2]|0;ua=c[Xa+12>>2]|0;if((ua|0)==(c[Xa+16>>2]|0)){X=pc[c[(c[Xa>>2]|0)+36>>2]&127](Xa)|0;Yb=X;Zb=a[F]|0}else{Yb=c[ua>>2]|0;Zb=jb}ua=c[g>>2]|0;X=ua+12|0;Xa=c[X>>2]|0;Wa=(Xa|0)==(c[ua+16>>2]|0);if((Yb|0)==(c[((Zb&1)==0?J:c[K>>2]|0)>>2]|0)){if(Wa){pc[c[(c[ua>>2]|0)+40>>2]&127](ua)|0}else{c[X>>2]=Xa+4}X=a[F]|0;if((X&1)==0){_b=(X&255)>>>1}else{_b=c[J>>2]|0}fa=C;ga=S;ha=q;ia=R;ja=_b>>>0>1?x:T;ka=U;break b}if(Wa){$b=pc[c[(c[ua>>2]|0)+36>>2]&127](ua)|0}else{$b=c[Xa>>2]|0}if(($b|0)!=(c[((a[G]&1)==0?f:c[I>>2]|0)>>2]|0)){Z=116;break a}Xa=c[g>>2]|0;ua=Xa+12|0;Wa=c[ua>>2]|0;if((Wa|0)==(c[Xa+16>>2]|0)){pc[c[(c[Xa>>2]|0)+40>>2]&127](Xa)|0}else{c[ua>>2]=Wa+4}a[k]=1;Wa=a[G]|0;if((Wa&1)==0){ac=(Wa&255)>>>1}else{ac=c[f>>2]|0}fa=C;ga=S;ha=q;ia=R;ja=ac>>>0>1?y:T;ka=U;break b}}while(0);if(xa){bc=(jb&255)>>>1}else{bc=c[J>>2]|0}Ya=c[g>>2]|0;V=c[Ya+12>>2]|0;Wa=(V|0)==(c[Ya+16>>2]|0);if((bc|0)==0){if(Wa){ua=pc[c[(c[Ya>>2]|0)+36>>2]&127](Ya)|0;cc=ua;dc=a[G]|0}else{cc=c[V>>2]|0;dc=va}if((cc|0)!=(c[((dc&1)==0?f:c[I>>2]|0)>>2]|0)){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break b}ua=c[g>>2]|0;Xa=ua+12|0;X=c[Xa>>2]|0;if((X|0)==(c[ua+16>>2]|0)){pc[c[(c[ua>>2]|0)+40>>2]&127](ua)|0}else{c[Xa>>2]=X+4}a[k]=1;X=a[G]|0;if((X&1)==0){ec=(X&255)>>>1}else{ec=c[f>>2]|0}fa=C;ga=S;ha=q;ia=R;ja=ec>>>0>1?y:T;ka=U;break b}if(Wa){Wa=pc[c[(c[Ya>>2]|0)+36>>2]&127](Ya)|0;fc=Wa;gc=a[F]|0}else{fc=c[V>>2]|0;gc=jb}if((fc|0)!=(c[((gc&1)==0?J:c[K>>2]|0)>>2]|0)){a[k]=1;fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break b}V=c[g>>2]|0;Wa=V+12|0;Ya=c[Wa>>2]|0;if((Ya|0)==(c[V+16>>2]|0)){pc[c[(c[V>>2]|0)+40>>2]&127](V)|0}else{c[Wa>>2]=Ya+4}Ya=a[F]|0;if((Ya&1)==0){hc=(Ya&255)>>>1}else{hc=c[J>>2]|0}fa=C;ga=S;ha=q;ia=R;ja=hc>>>0>1?x:T;ka=U;break};case 1:{if((o|0)==3){aa=S;ba=q;ca=T;da=U;Z=292;break a}Ya=c[g>>2]|0;Wa=c[Ya+12>>2]|0;if((Wa|0)==(c[Ya+16>>2]|0)){ic=pc[c[(c[Ya>>2]|0)+36>>2]&127](Ya)|0}else{ic=c[Wa>>2]|0}if(!(jc[c[(c[r>>2]|0)+12>>2]&31](l,8192,ic)|0)){Z=27;break a}Wa=c[g>>2]|0;Ya=Wa+12|0;V=c[Ya>>2]|0;if((V|0)==(c[Wa+16>>2]|0)){kc=pc[c[(c[Wa>>2]|0)+40>>2]&127](Wa)|0}else{c[Ya>>2]=V+4;kc=c[V>>2]|0}Le(z,kc);Z=28;break};case 0:{Z=28;break};default:{fa=C;ga=S;ha=q;ia=R;ja=T;ka=U}}}while(0);g:do{if((Z|0)==28){Z=0;if((o|0)==3){aa=S;ba=q;ca=T;da=U;Z=292;break a}else{lc=$;nc=$}while(1){V=c[g>>2]|0;do{if((V|0)==0){oc=1}else{Ya=c[V+12>>2]|0;if((Ya|0)==(c[V+16>>2]|0)){qc=pc[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{qc=c[Ya>>2]|0}if((qc|0)==-1){c[g>>2]=0;oc=1;break}else{oc=(c[g>>2]|0)==0;break}}}while(0);do{if((nc|0)==0){rc=lc;Z=42}else{V=c[nc+12>>2]|0;if((V|0)==(c[nc+16>>2]|0)){sc=pc[c[(c[nc>>2]|0)+36>>2]&127](nc)|0}else{sc=c[V>>2]|0}if((sc|0)==-1){c[b>>2]=0;rc=0;Z=42;break}else{if(oc^(lc|0)==0){tc=lc;uc=lc;break}else{fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break g}}}}while(0);if((Z|0)==42){Z=0;if(oc){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break g}else{tc=rc;uc=0}}V=c[g>>2]|0;Ca=c[V+12>>2]|0;if((Ca|0)==(c[V+16>>2]|0)){vc=pc[c[(c[V>>2]|0)+36>>2]&127](V)|0}else{vc=c[Ca>>2]|0}if(!(jc[c[(c[r>>2]|0)+12>>2]&31](l,8192,vc)|0)){fa=C;ga=S;ha=q;ia=R;ja=T;ka=U;break g}Ca=c[g>>2]|0;V=Ca+12|0;Va=c[V>>2]|0;if((Va|0)==(c[Ca+16>>2]|0)){wc=pc[c[(c[Ca>>2]|0)+40>>2]&127](Ca)|0}else{c[V>>2]=Va+4;wc=c[Va>>2]|0}Le(z,wc);lc=tc;nc=uc}}}while(0);jb=o+1|0;if(jb>>>0<4){R=ia;q=ha;S=ga;C=fa;o=jb;T=ja;U=ka}else{aa=ga;ba=ha;ca=ja;da=ka;Z=292;break}}h:do{if((Z|0)==27){c[j>>2]=c[j>>2]|4;xc=0;yc=S;zc=U}else if((Z|0)==116){c[j>>2]=c[j>>2]|4;xc=0;yc=S;zc=U}else if((Z|0)==174){c[j>>2]=c[j>>2]|4;xc=0;yc=S;zc=U}else if((Z|0)==198){Wm()}else if((Z|0)==214){Wm()}else if((Z|0)==225){Wm()}else if((Z|0)==248){c[j>>2]=c[j>>2]|4;xc=0;yc=ob;zc=rb}else if((Z|0)==271){c[j>>2]=c[j>>2]|4;xc=0;yc=ob;zc=rb}else if((Z|0)==276){Wm()}else if((Z|0)==290){c[j>>2]=c[j>>2]|4;xc=0;yc=ob;zc=rb}else if((Z|0)==292){i:do{if((ca|0)!=0){ka=ca;ja=ca+4|0;ha=ca+8|0;ga=1;j:while(1){T=a[ka]|0;if((T&1)==0){Ac=(T&255)>>>1}else{Ac=c[ja>>2]|0}if(!(ga>>>0<Ac>>>0)){break i}T=c[g>>2]|0;do{if((T|0)==0){Bc=1}else{o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Cc=pc[c[(c[T>>2]|0)+36>>2]&127](T)|0}else{Cc=c[o>>2]|0}if((Cc|0)==-1){c[g>>2]=0;Bc=1;break}else{Bc=(c[g>>2]|0)==0;break}}}while(0);T=c[b>>2]|0;do{if((T|0)==0){Z=311}else{o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Dc=pc[c[(c[T>>2]|0)+36>>2]&127](T)|0}else{Dc=c[o>>2]|0}if((Dc|0)==-1){c[b>>2]=0;Z=311;break}else{if(Bc){break}else{break j}}}}while(0);if((Z|0)==311){Z=0;if(Bc){break}}T=c[g>>2]|0;o=c[T+12>>2]|0;if((o|0)==(c[T+16>>2]|0)){Ec=pc[c[(c[T>>2]|0)+36>>2]&127](T)|0}else{Ec=c[o>>2]|0}if((a[ka]&1)==0){Fc=ja}else{Fc=c[ha>>2]|0}if((Ec|0)!=(c[Fc+(ga<<2)>>2]|0)){break}o=ga+1|0;T=c[g>>2]|0;fa=T+12|0;C=c[fa>>2]|0;if((C|0)==(c[T+16>>2]|0)){pc[c[(c[T>>2]|0)+40>>2]&127](T)|0;ga=o;continue}else{c[fa>>2]=C+4;ga=o;continue}}c[j>>2]=c[j>>2]|4;xc=0;yc=aa;zc=da;break h}}while(0);if((aa|0)==(ba|0)){xc=1;yc=ba;zc=da;break}c[B>>2]=0;mj(v,aa,ba,B);if((c[B>>2]|0)==0){xc=1;yc=aa;zc=da;break}c[j>>2]=c[j>>2]|4;xc=0;yc=aa;zc=da}}while(0);He(z);He(y);He(x);He(w);ve(v);if((yc|0)==0){i=p;return xc|0}mc[zc&255](yc);i=p;return xc|0}function rj(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;d=i;i=i+464|0;l=d;m=d+8|0;n=d+24|0;o=d+424|0;p=d+432|0;q=d+440|0;r=d+448|0;s=d+456|0;t=o;c[t>>2]=n;u=o+4|0;c[u>>2]=120;v=n+400|0;Qe(q,h);n=q;w=c[n>>2]|0;if(!((c[1280]|0)==-1)){c[m>>2]=5120;c[m+4>>2]=118;c[m+8>>2]=0;qe(5120,m,119)}m=(c[5124>>2]|0)+ -1|0;x=c[w+8>>2]|0;if(!((c[w+12>>2]|0)-x>>2>>>0>m>>>0)){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}w=c[x+(m<<2)>>2]|0;if((w|0)==0){y=vb(4)|0;z=y;pm(z);cc(y|0,13088,107)}y=w;a[r]=0;z=f;f=c[z>>2]|0;c[s>>2]=f;m=c[h+4>>2]|0;h=l;x=s;c[h+0>>2]=c[x+0>>2];x=qj(e,l,g,q,m,j,r,y,o,p,v)|0;if(x){x=k;if((a[x]&1)==0){c[k+4>>2]=0;a[x]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}x=w;if((a[r]|0)!=0){Le(k,yc[c[(c[x>>2]|0)+44>>2]&31](y,45)|0)}r=yc[c[(c[x>>2]|0)+44>>2]&31](y,48)|0;y=c[t>>2]|0;x=c[p>>2]|0;p=x+ -4|0;a:do{if(y>>>0<p>>>0){w=y;while(1){v=w+4|0;if((c[w>>2]|0)!=(r|0)){A=w;break a}if(v>>>0<p>>>0){w=v}else{A=v;break}}}else{A=y}}while(0);sj(k,A,x)|0}x=e;e=c[x>>2]|0;do{if((e|0)==0){B=1}else{A=c[e+12>>2]|0;if((A|0)==(c[e+16>>2]|0)){C=pc[c[(c[e>>2]|0)+36>>2]&127](e)|0}else{C=c[A>>2]|0}if((C|0)==-1){c[x>>2]=0;B=1;break}else{B=(c[x>>2]|0)==0;break}}}while(0);do{if((f|0)==0){D=29}else{C=c[f+12>>2]|0;if((C|0)==(c[f+16>>2]|0)){E=pc[c[(c[f>>2]|0)+36>>2]&127](f)|0}else{E=c[C>>2]|0}if((E|0)==-1){c[z>>2]=0;D=29;break}else{if(B){break}else{D=31;break}}}}while(0);if((D|0)==29){if(B){D=31}}if((D|0)==31){c[j>>2]=c[j>>2]|2}c[b>>2]=c[x>>2];Yd(c[n>>2]|0)|0;n=c[t>>2]|0;c[t>>2]=0;if((n|0)==0){i=d;return}mc[c[u>>2]&255](n);i=d;return}function sj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;g=b;h=d;j=a[g]|0;if((j&1)==0){k=(j&255)>>>1;l=j;m=1}else{j=c[b>>2]|0;k=c[b+4>>2]|0;l=j&255;m=(j&-2)+ -1|0}j=e-h>>2;if((j|0)==0){i=f;return b|0}if((m-k|0)>>>0<j>>>0){Ne(b,m,k+j-m|0,k,k,0,0);n=a[g]|0}else{n=l}if((n&1)==0){o=b+4|0}else{o=c[b+8>>2]|0}n=o+(k<<2)|0;if((d|0)==(e|0)){p=n}else{l=k+((e+ -4+(0-h)|0)>>>2)+1|0;h=d;d=n;while(1){c[d>>2]=c[h>>2];n=h+4|0;if((n|0)==(e|0)){break}else{d=d+4|0;h=n}}p=o+(l<<2)|0}c[p>>2]=0;p=k+j|0;if((a[g]&1)==0){a[g]=p<<1;i=f;return b|0}else{c[b+4>>2]=p;i=f;return b|0}return 0}function tj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+176|0;o=n;p=n+16|0;q=n+32|0;r=n+40|0;s=n+56|0;t=n+72|0;u=n+88|0;v=n+104|0;w=n+112|0;x=n+128|0;y=n+144|0;z=n+160|0;if(b){b=c[d>>2]|0;if(!((c[1174]|0)==-1)){c[p>>2]=4696;c[p+4>>2]=118;c[p+8>>2]=0;qe(4696,p,119)}p=(c[4700>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>p>>>0)){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}b=c[A+(p<<2)>>2]|0;if((b|0)==0){B=vb(4)|0;C=B;pm(C);cc(B|0,13088,107)}B=b;nc[c[(c[b>>2]|0)+44>>2]&63](q,B);C=e;p=c[q>>2]|0;a[C]=p;a[C+1|0]=p>>8;a[C+2|0]=p>>16;a[C+3|0]=p>>24;p=b;nc[c[(c[p>>2]|0)+32>>2]&63](r,B);C=l;if((a[C]&1)==0){c[l+4>>2]=0;a[C]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);q=r;c[C+0>>2]=c[q+0>>2];c[C+4>>2]=c[q+4>>2];c[C+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;He(r);nc[c[(c[p>>2]|0)+28>>2]&63](s,B);r=k;if((a[r]&1)==0){c[k+4>>2]=0;a[r]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Ke(k,0);q=s;c[r+0>>2]=c[q+0>>2];c[r+4>>2]=c[q+4>>2];c[r+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;He(s);s=b;c[f>>2]=pc[c[(c[s>>2]|0)+12>>2]&127](B)|0;c[g>>2]=pc[c[(c[s>>2]|0)+16>>2]&127](B)|0;nc[c[(c[b>>2]|0)+20>>2]&63](t,B);b=h;if((a[b]&1)==0){a[h+1|0]=0;a[b]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ae(h,0);q=t;c[b+0>>2]=c[q+0>>2];c[b+4>>2]=c[q+4>>2];c[b+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;ve(t);nc[c[(c[p>>2]|0)+24>>2]&63](u,B);p=j;if((a[p]&1)==0){c[j+4>>2]=0;a[p]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Ke(j,0);t=u;c[p+0>>2]=c[t+0>>2];c[p+4>>2]=c[t+4>>2];c[p+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;He(u);D=pc[c[(c[s>>2]|0)+36>>2]&127](B)|0;c[m>>2]=D;i=n;return}else{B=c[d>>2]|0;if(!((c[1158]|0)==-1)){c[o>>2]=4632;c[o+4>>2]=118;c[o+8>>2]=0;qe(4632,o,119)}o=(c[4636>>2]|0)+ -1|0;d=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-d>>2>>>0>o>>>0)){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}B=c[d+(o<<2)>>2]|0;if((B|0)==0){E=vb(4)|0;F=E;pm(F);cc(E|0,13088,107)}E=B;nc[c[(c[B>>2]|0)+44>>2]&63](v,E);F=e;e=c[v>>2]|0;a[F]=e;a[F+1|0]=e>>8;a[F+2|0]=e>>16;a[F+3|0]=e>>24;e=B;nc[c[(c[e>>2]|0)+32>>2]&63](w,E);F=l;if((a[F]&1)==0){c[l+4>>2]=0;a[F]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);l=w;c[F+0>>2]=c[l+0>>2];c[F+4>>2]=c[l+4>>2];c[F+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;He(w);nc[c[(c[e>>2]|0)+28>>2]&63](x,E);w=k;if((a[w]&1)==0){c[k+4>>2]=0;a[w]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Ke(k,0);k=x;c[w+0>>2]=c[k+0>>2];c[w+4>>2]=c[k+4>>2];c[w+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;He(x);x=B;c[f>>2]=pc[c[(c[x>>2]|0)+12>>2]&127](E)|0;c[g>>2]=pc[c[(c[x>>2]|0)+16>>2]&127](E)|0;nc[c[(c[B>>2]|0)+20>>2]&63](y,E);B=h;if((a[B]&1)==0){a[h+1|0]=0;a[B]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}Ae(h,0);h=y;c[B+0>>2]=c[h+0>>2];c[B+4>>2]=c[h+4>>2];c[B+8>>2]=c[h+8>>2];c[h+0>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;ve(y);nc[c[(c[e>>2]|0)+24>>2]&63](z,E);e=j;if((a[e]&1)==0){c[j+4>>2]=0;a[e]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Ke(j,0);j=z;c[e+0>>2]=c[j+0>>2];c[e+4>>2]=c[j+4>>2];c[e+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;He(z);D=pc[c[(c[x>>2]|0)+36>>2]&127](E)|0;c[m>>2]=D;i=n;return}}function uj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function vj(a){a=a|0;i=i;return}function wj(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0;d=i;i=i+16|0;m=d;n=d+8|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+104|0;r=i;i=i+8|0;s=i;i=i+104|0;t=i;i=i+8|0;u=i;i=i+8|0;v=u;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+104|0;D=i;i=i+8|0;E=i;i=i+8|0;F=i;i=i+8|0;G=q;c[r>>2]=G;q=s;s=o;h[k>>3]=l;c[s>>2]=c[k>>2];c[s+4>>2]=c[k+4>>2];s=Ab(G|0,100,4880,o|0)|0;do{if(s>>>0>99){do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;G=n;h[k>>3]=l;c[G>>2]=c[k>>2];c[G+4>>2]=c[k+4>>2];G=rh(r,o,4880,n)|0;o=c[r>>2]|0;if((o|0)==0){Wm()}H=Km(G)|0;if((H|0)!=0){I=o;J=H;K=H;L=G;break}Wm()}else{I=0;J=0;K=q;L=s}}while(0);Qe(t,g);s=t;q=c[s>>2]|0;if(!((c[1282]|0)==-1)){c[p>>2]=5128;c[p+4>>2]=118;c[p+8>>2]=0;qe(5128,p,119)}p=(c[5132>>2]|0)+ -1|0;n=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-n>>2>>>0>p>>>0)){M=vb(4)|0;N=M;pm(N);cc(M|0,13088,107)}q=c[n+(p<<2)>>2]|0;if((q|0)==0){M=vb(4)|0;N=M;pm(N);cc(M|0,13088,107)}M=q;N=c[r>>2]|0;vc[c[(c[q>>2]|0)+32>>2]&7](M,N,N+L|0,K)|0;if((L|0)==0){O=0}else{O=(a[c[r>>2]|0]|0)==45}c[u>>2]=0;u=y;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;u=z;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;r=A;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;xj(f,O,t,v,w,x,y,z,A,B);t=C;C=c[B>>2]|0;if((L|0)>(C|0)){B=a[r]|0;if((B&1)==0){P=(B&255)>>>1}else{P=c[A+4>>2]|0}B=a[u]|0;if((B&1)==0){Q=(B&255)>>>1}else{Q=c[z+4>>2]|0}R=P+(L-C<<1|1)+Q|0}else{Q=a[r]|0;if((Q&1)==0){S=(Q&255)>>>1}else{S=c[A+4>>2]|0}Q=a[u]|0;if((Q&1)==0){T=(Q&255)>>>1}else{T=c[z+4>>2]|0}R=S+2+T|0}T=R+C|0;do{if(T>>>0>100){R=Km(T)|0;if((R|0)!=0){U=R;V=R;break}Wm()}else{U=0;V=t}}while(0);yj(V,D,E,c[g+4>>2]|0,K,K+L|0,M,O,v,a[w]|0,a[x]|0,y,z,A,C);c[F>>2]=c[e>>2];e=c[D>>2]|0;D=c[E>>2]|0;E=m;C=F;c[E+0>>2]=c[C+0>>2];ad(b,m,V,e,D,g,j);if((U|0)!=0){Lm(U)}ve(A);ve(z);ve(y);Yd(c[s>>2]|0)|0;if((J|0)!=0){Lm(J)}if((I|0)==0){i=d;return}Lm(I);i=d;return}function xj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;n=i;i=i+40|0;o=n;p=n+16|0;q=n+32|0;r=q;s=i;i=i+16|0;t=i;i=i+8|0;u=t;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+8|0;z=y;A=i;i=i+16|0;B=i;i=i+8|0;C=B;D=i;i=i+16|0;E=i;i=i+16|0;F=i;i=i+16|0;G=c[e>>2]|0;if(b){if(!((c[1142]|0)==-1)){c[p>>2]=4568;c[p+4>>2]=118;c[p+8>>2]=0;qe(4568,p,119)}p=(c[4572>>2]|0)+ -1|0;b=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-b>>2>>>0>p>>>0)){H=vb(4)|0;I=H;pm(I);cc(H|0,13088,107)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){H=vb(4)|0;I=H;pm(I);cc(H|0,13088,107)}H=e;I=c[e>>2]|0;if(d){nc[c[I+44>>2]&63](r,H);r=f;p=c[q>>2]|0;a[r]=p;a[r+1|0]=p>>8;a[r+2|0]=p>>16;a[r+3|0]=p>>24;nc[c[(c[e>>2]|0)+32>>2]&63](s,H);p=l;if((a[p]&1)==0){a[l+1|0]=0;a[p]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);r=s;c[p+0>>2]=c[r+0>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;ve(s)}else{nc[c[I+40>>2]&63](u,H);u=f;I=c[t>>2]|0;a[u]=I;a[u+1|0]=I>>8;a[u+2|0]=I>>16;a[u+3|0]=I>>24;nc[c[(c[e>>2]|0)+28>>2]&63](v,H);I=l;if((a[I]&1)==0){a[l+1|0]=0;a[I]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);u=v;c[I+0>>2]=c[u+0>>2];c[I+4>>2]=c[u+4>>2];c[I+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;ve(v)}v=e;a[g]=pc[c[(c[v>>2]|0)+12>>2]&127](H)|0;a[h]=pc[c[(c[v>>2]|0)+16>>2]&127](H)|0;v=e;nc[c[(c[v>>2]|0)+20>>2]&63](w,H);u=j;if((a[u]&1)==0){a[j+1|0]=0;a[u]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);I=w;c[u+0>>2]=c[I+0>>2];c[u+4>>2]=c[I+4>>2];c[u+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;ve(w);nc[c[(c[v>>2]|0)+24>>2]&63](x,H);v=k;if((a[v]&1)==0){a[k+1|0]=0;a[v]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ae(k,0);w=x;c[v+0>>2]=c[w+0>>2];c[v+4>>2]=c[w+4>>2];c[v+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;ve(x);J=pc[c[(c[e>>2]|0)+36>>2]&127](H)|0;c[m>>2]=J;i=n;return}else{if(!((c[1126]|0)==-1)){c[o>>2]=4504;c[o+4>>2]=118;c[o+8>>2]=0;qe(4504,o,119)}o=(c[4508>>2]|0)+ -1|0;H=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-H>>2>>>0>o>>>0)){K=vb(4)|0;L=K;pm(L);cc(K|0,13088,107)}G=c[H+(o<<2)>>2]|0;if((G|0)==0){K=vb(4)|0;L=K;pm(L);cc(K|0,13088,107)}K=G;L=c[G>>2]|0;if(d){nc[c[L+44>>2]&63](z,K);z=f;d=c[y>>2]|0;a[z]=d;a[z+1|0]=d>>8;a[z+2|0]=d>>16;a[z+3|0]=d>>24;nc[c[(c[G>>2]|0)+32>>2]&63](A,K);d=l;if((a[d]&1)==0){a[l+1|0]=0;a[d]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);z=A;c[d+0>>2]=c[z+0>>2];c[d+4>>2]=c[z+4>>2];c[d+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;ve(A)}else{nc[c[L+40>>2]&63](C,K);C=f;f=c[B>>2]|0;a[C]=f;a[C+1|0]=f>>8;a[C+2|0]=f>>16;a[C+3|0]=f>>24;nc[c[(c[G>>2]|0)+28>>2]&63](D,K);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}Ae(l,0);l=D;c[f+0>>2]=c[l+0>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;ve(D)}D=G;a[g]=pc[c[(c[D>>2]|0)+12>>2]&127](K)|0;a[h]=pc[c[(c[D>>2]|0)+16>>2]&127](K)|0;D=G;nc[c[(c[D>>2]|0)+20>>2]&63](E,K);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);j=E;c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ve(E);nc[c[(c[D>>2]|0)+24>>2]&63](F,K);D=k;if((a[D]&1)==0){a[k+1|0]=0;a[D]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}Ae(k,0);k=F;c[D+0>>2]=c[k+0>>2];c[D+4>>2]=c[k+4>>2];c[D+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;ve(F);J=pc[c[(c[G>>2]|0)+36>>2]&127](K)|0;c[m>>2]=J;i=n;return}}function yj(d,e,f,g,h,j,k,l,m,n,o,p,q,r,s){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;var t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0;t=i;c[f>>2]=d;u=k;v=r;w=r+1|0;x=r+8|0;y=r+4|0;r=q;z=(g&512|0)==0;A=q+1|0;B=q+8|0;C=q+4|0;q=(s|0)>0;D=p;E=p+1|0;F=p+8|0;G=p+4|0;p=k+8|0;H=0-s|0;I=h;h=0;while(1){a:do{switch(a[m+h|0]|0){case 0:{c[e>>2]=c[f>>2];J=I;break};case 2:{K=a[r]|0;L=(K&1)==0;if(L){M=(K&255)>>>1}else{M=c[C>>2]|0}if((M|0)==0|z){J=I;break a}if(L){N=A;O=(K&255)>>>1}else{N=c[B>>2]|0;O=c[C>>2]|0}K=N+O|0;L=c[f>>2]|0;if((N|0)==(K|0)){P=L}else{Q=L;L=N;while(1){a[Q]=a[L]|0;R=L+1|0;S=Q+1|0;if((R|0)==(K|0)){P=S;break}else{L=R;Q=S}}}c[f>>2]=P;J=I;break};case 1:{c[e>>2]=c[f>>2];Q=yc[c[(c[u>>2]|0)+28>>2]&31](k,32)|0;L=c[f>>2]|0;c[f>>2]=L+1;a[L]=Q;J=I;break};case 4:{Q=c[f>>2]|0;L=l?I+1|0:I;b:do{if(L>>>0<j>>>0){K=L;while(1){S=a[K]|0;if(!(S<<24>>24>-1)){T=K;break b}R=K+1|0;if((b[(c[p>>2]|0)+(S<<24>>24<<1)>>1]&2048)==0){T=K;break b}if(R>>>0<j>>>0){K=R}else{T=R;break}}}else{T=L}}while(0);K=T;if(q){if(T>>>0>L>>>0){R=L+(0-K)|0;K=R>>>0<H>>>0?H:R;R=K+s|0;S=Q;U=T;V=s;while(1){W=U+ -1|0;X=a[W]|0;c[f>>2]=S+1;a[S]=X;X=V+ -1|0;Y=(X|0)>0;if(!(W>>>0>L>>>0&Y)){break}S=c[f>>2]|0;V=X;U=W}U=T+K|0;if(Y){Z=U;_=R;$=32}else{aa=0;ba=U;ca=R}}else{Z=T;_=s;$=32}if(($|0)==32){$=0;aa=yc[c[(c[u>>2]|0)+28>>2]&31](k,48)|0;ba=Z;ca=_}U=c[f>>2]|0;c[f>>2]=U+1;if((ca|0)>0){V=U;S=ca;while(1){a[V]=aa;W=S+ -1|0;X=c[f>>2]|0;c[f>>2]=X+1;if((W|0)>0){S=W;V=X}else{da=X;break}}}else{da=U}a[da]=n;ea=ba}else{ea=T}if((ea|0)==(L|0)){V=yc[c[(c[u>>2]|0)+28>>2]&31](k,48)|0;S=c[f>>2]|0;c[f>>2]=S+1;a[S]=V}else{V=a[D]|0;S=(V&1)==0;if(S){fa=(V&255)>>>1}else{fa=c[G>>2]|0}if((fa|0)==0){ga=ea;ha=-1;ia=0;ja=0}else{if(S){ka=E}else{ka=c[F>>2]|0}ga=ea;ha=a[ka]|0;ia=0;ja=0}while(1){do{if((ja|0)==(ha|0)){S=c[f>>2]|0;c[f>>2]=S+1;a[S]=o;S=ia+1|0;V=a[D]|0;R=(V&1)==0;if(R){la=(V&255)>>>1}else{la=c[G>>2]|0}if(!(S>>>0<la>>>0)){ma=ha;na=S;oa=0;break}if(R){pa=E}else{pa=c[F>>2]|0}if((a[pa+S|0]|0)==127){ma=-1;na=S;oa=0;break}if(R){qa=E}else{qa=c[F>>2]|0}ma=a[qa+S|0]|0;na=S;oa=0}else{ma=ha;na=ia;oa=ja}}while(0);S=ga+ -1|0;R=a[S]|0;V=c[f>>2]|0;c[f>>2]=V+1;a[V]=R;if((S|0)==(L|0)){break}else{ga=S;ha=ma;ia=na;ja=oa+1|0}}}U=c[f>>2]|0;if((Q|0)==(U|0)){J=L;break a}S=U+ -1|0;if(S>>>0>Q>>>0){ra=Q;sa=S}else{J=L;break a}while(1){S=a[ra]|0;a[ra]=a[sa]|0;a[sa]=S;S=ra+1|0;U=sa+ -1|0;if(S>>>0<U>>>0){sa=U;ra=S}else{J=L;break}}break};case 3:{L=a[v]|0;Q=(L&1)==0;if(Q){ta=(L&255)>>>1}else{ta=c[y>>2]|0}if((ta|0)==0){J=I;break a}if(Q){ua=w}else{ua=c[x>>2]|0}Q=a[ua]|0;L=c[f>>2]|0;c[f>>2]=L+1;a[L]=Q;J=I;break};default:{J=I}}}while(0);Q=h+1|0;if((Q|0)==4){break}else{I=J;h=Q}}h=a[v]|0;v=(h&1)==0;if(v){va=(h&255)>>>1}else{va=c[y>>2]|0}if(va>>>0>1){if(v){wa=w;xa=(h&255)>>>1}else{wa=c[x>>2]|0;xa=c[y>>2]|0}y=wa+1|0;x=wa+xa|0;xa=c[f>>2]|0;if((y|0)==(x|0)){ya=xa}else{wa=xa;xa=y;while(1){a[wa]=a[xa]|0;y=xa+1|0;h=wa+1|0;if((y|0)==(x|0)){ya=h;break}else{xa=y;wa=h}}}c[f>>2]=ya}ya=g&176;if((ya|0)==32){c[e>>2]=c[f>>2];i=t;return}else if((ya|0)==16){i=t;return}else{c[e>>2]=d;i=t;return}}function zj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+40|0;k=d;l=d+8|0;m=d+24|0;n=d+32|0;o=n;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+16|0;s=i;i=i+16|0;t=i;i=i+16|0;u=i;i=i+8|0;v=i;i=i+104|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;Qe(m,g);z=m;A=c[z>>2]|0;if(!((c[1282]|0)==-1)){c[l>>2]=5128;c[l+4>>2]=118;c[l+8>>2]=0;qe(5128,l,119)}l=(c[5132>>2]|0)+ -1|0;B=c[A+8>>2]|0;if(!((c[A+12>>2]|0)-B>>2>>>0>l>>>0)){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}A=c[B+(l<<2)>>2]|0;if((A|0)==0){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}C=A;D=j;l=a[D]|0;B=(l&1)==0;if(B){E=(l&255)>>>1}else{E=c[j+4>>2]|0}if((E|0)==0){F=0}else{if(B){G=j+1|0}else{G=c[j+8>>2]|0}B=a[G]|0;F=B<<24>>24==(yc[c[(c[A>>2]|0)+28>>2]&31](C,45)|0)<<24>>24}c[n>>2]=0;n=r;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;n=s;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;A=t;c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;xj(f,F,m,o,p,q,r,s,t,u);m=v;v=a[D]|0;D=(v&1)==0;if(D){H=(v&255)>>>1}else{H=c[j+4>>2]|0}f=c[u>>2]|0;if((H|0)>(f|0)){if(D){I=(v&255)>>>1}else{I=c[j+4>>2]|0}D=a[A]|0;if((D&1)==0){J=(D&255)>>>1}else{J=c[t+4>>2]|0}D=a[n]|0;if((D&1)==0){K=(D&255)>>>1}else{K=c[s+4>>2]|0}L=J+(I-f<<1|1)+K|0}else{K=a[A]|0;if((K&1)==0){M=(K&255)>>>1}else{M=c[t+4>>2]|0}K=a[n]|0;if((K&1)==0){N=(K&255)>>>1}else{N=c[s+4>>2]|0}L=M+2+N|0}N=L+f|0;do{if(N>>>0>100){L=Km(N)|0;if((L|0)!=0){O=L;P=L;break}Wm()}else{O=0;P=m}}while(0);if((v&1)==0){Q=j+1|0;R=(v&255)>>>1}else{Q=c[j+8>>2]|0;R=c[j+4>>2]|0}yj(P,w,x,c[g+4>>2]|0,Q,Q+R|0,C,F,o,a[p]|0,a[q]|0,r,s,t,f);c[y>>2]=c[e>>2];e=c[w>>2]|0;w=c[x>>2]|0;x=k;f=y;c[x+0>>2]=c[f+0>>2];ad(b,k,P,e,w,g,h);if((O|0)==0){ve(t);ve(s);ve(r);S=c[z>>2]|0;T=S;Yd(T)|0;i=d;return}Lm(O);ve(t);ve(s);ve(r);S=c[z>>2]|0;T=S;Yd(T)|0;i=d;return}function Aj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Bj(a){a=a|0;i=i;return}function Cj(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+16|0;m=d;n=d+8|0;o=i;i=i+8|0;p=i;i=i+16|0;q=i;i=i+104|0;r=i;i=i+8|0;s=i;i=i+400|0;t=i;i=i+8|0;u=i;i=i+8|0;v=u;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+16|0;z=i;i=i+16|0;A=i;i=i+16|0;B=i;i=i+8|0;C=i;i=i+400|0;D=i;i=i+8|0;E=i;i=i+8|0;F=i;i=i+8|0;G=q;c[r>>2]=G;q=s;s=o;h[k>>3]=l;c[s>>2]=c[k>>2];c[s+4>>2]=c[k+4>>2];s=Ab(G|0,100,4880,o|0)|0;do{if(s>>>0>99){do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);o=c[1254]|0;G=n;h[k>>3]=l;c[G>>2]=c[k>>2];c[G+4>>2]=c[k+4>>2];G=rh(r,o,4880,n)|0;o=c[r>>2]|0;if((o|0)==0){Wm()}H=Km(G<<2)|0;I=H;if((H|0)!=0){J=o;K=I;L=I;M=G;break}Wm()}else{J=0;K=0;L=q;M=s}}while(0);Qe(t,g);s=t;q=c[s>>2]|0;if(!((c[1280]|0)==-1)){c[p>>2]=5120;c[p+4>>2]=118;c[p+8>>2]=0;qe(5120,p,119)}p=(c[5124>>2]|0)+ -1|0;n=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-n>>2>>>0>p>>>0)){N=vb(4)|0;O=N;pm(O);cc(N|0,13088,107)}q=c[n+(p<<2)>>2]|0;if((q|0)==0){N=vb(4)|0;O=N;pm(O);cc(N|0,13088,107)}N=q;O=c[r>>2]|0;vc[c[(c[q>>2]|0)+48>>2]&7](N,O,O+M|0,L)|0;if((M|0)==0){P=0}else{P=(a[c[r>>2]|0]|0)==45}c[u>>2]=0;u=y;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;u=z;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;r=A;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Dj(f,P,t,v,w,x,y,z,A,B);t=C;C=c[B>>2]|0;if((M|0)>(C|0)){B=a[r]|0;if((B&1)==0){Q=(B&255)>>>1}else{Q=c[A+4>>2]|0}B=a[u]|0;if((B&1)==0){R=(B&255)>>>1}else{R=c[z+4>>2]|0}S=Q+(M-C<<1|1)+R|0}else{R=a[r]|0;if((R&1)==0){T=(R&255)>>>1}else{T=c[A+4>>2]|0}R=a[u]|0;if((R&1)==0){U=(R&255)>>>1}else{U=c[z+4>>2]|0}S=T+2+U|0}U=S+C|0;do{if(U>>>0>100){S=Km(U<<2)|0;T=S;if((S|0)!=0){V=T;W=T;break}Wm()}else{V=0;W=t}}while(0);Ej(W,D,E,c[g+4>>2]|0,L,L+(M<<2)|0,N,P,v,c[w>>2]|0,c[x>>2]|0,y,z,A,C);c[F>>2]=c[e>>2];e=c[D>>2]|0;D=c[E>>2]|0;E=m;C=F;c[E+0>>2]=c[C+0>>2];Ah(b,m,W,e,D,g,j);if((V|0)!=0){Lm(V)}He(A);He(z);ve(y);Yd(c[s>>2]|0)|0;if((K|0)!=0){Lm(K)}if((J|0)==0){i=d;return}Lm(J);i=d;return}function Dj(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;n=i;i=i+40|0;o=n;p=n+16|0;q=n+32|0;r=q;s=i;i=i+16|0;t=i;i=i+8|0;u=t;v=i;i=i+16|0;w=i;i=i+16|0;x=i;i=i+16|0;y=i;i=i+8|0;z=y;A=i;i=i+16|0;B=i;i=i+8|0;C=B;D=i;i=i+16|0;E=i;i=i+16|0;F=i;i=i+16|0;G=c[e>>2]|0;if(b){if(!((c[1174]|0)==-1)){c[p>>2]=4696;c[p+4>>2]=118;c[p+8>>2]=0;qe(4696,p,119)}p=(c[4700>>2]|0)+ -1|0;b=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-b>>2>>>0>p>>>0)){H=vb(4)|0;I=H;pm(I);cc(H|0,13088,107)}e=c[b+(p<<2)>>2]|0;if((e|0)==0){H=vb(4)|0;I=H;pm(I);cc(H|0,13088,107)}H=e;I=c[e>>2]|0;if(d){nc[c[I+44>>2]&63](r,H);r=f;p=c[q>>2]|0;a[r]=p;a[r+1|0]=p>>8;a[r+2|0]=p>>16;a[r+3|0]=p>>24;nc[c[(c[e>>2]|0)+32>>2]&63](s,H);p=l;if((a[p]&1)==0){c[l+4>>2]=0;a[p]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);r=s;c[p+0>>2]=c[r+0>>2];c[p+4>>2]=c[r+4>>2];c[p+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;He(s)}else{nc[c[I+40>>2]&63](u,H);u=f;I=c[t>>2]|0;a[u]=I;a[u+1|0]=I>>8;a[u+2|0]=I>>16;a[u+3|0]=I>>24;nc[c[(c[e>>2]|0)+28>>2]&63](v,H);I=l;if((a[I]&1)==0){c[l+4>>2]=0;a[I]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);u=v;c[I+0>>2]=c[u+0>>2];c[I+4>>2]=c[u+4>>2];c[I+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;He(v)}v=e;c[g>>2]=pc[c[(c[v>>2]|0)+12>>2]&127](H)|0;c[h>>2]=pc[c[(c[v>>2]|0)+16>>2]&127](H)|0;nc[c[(c[e>>2]|0)+20>>2]&63](w,H);u=j;if((a[u]&1)==0){a[j+1|0]=0;a[u]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);I=w;c[u+0>>2]=c[I+0>>2];c[u+4>>2]=c[I+4>>2];c[u+8>>2]=c[I+8>>2];c[I+0>>2]=0;c[I+4>>2]=0;c[I+8>>2]=0;ve(w);nc[c[(c[e>>2]|0)+24>>2]&63](x,H);e=k;if((a[e]&1)==0){c[k+4>>2]=0;a[e]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Ke(k,0);w=x;c[e+0>>2]=c[w+0>>2];c[e+4>>2]=c[w+4>>2];c[e+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;He(x);J=pc[c[(c[v>>2]|0)+36>>2]&127](H)|0;c[m>>2]=J;i=n;return}else{if(!((c[1158]|0)==-1)){c[o>>2]=4632;c[o+4>>2]=118;c[o+8>>2]=0;qe(4632,o,119)}o=(c[4636>>2]|0)+ -1|0;H=c[G+8>>2]|0;if(!((c[G+12>>2]|0)-H>>2>>>0>o>>>0)){K=vb(4)|0;L=K;pm(L);cc(K|0,13088,107)}G=c[H+(o<<2)>>2]|0;if((G|0)==0){K=vb(4)|0;L=K;pm(L);cc(K|0,13088,107)}K=G;L=c[G>>2]|0;if(d){nc[c[L+44>>2]&63](z,K);z=f;d=c[y>>2]|0;a[z]=d;a[z+1|0]=d>>8;a[z+2|0]=d>>16;a[z+3|0]=d>>24;nc[c[(c[G>>2]|0)+32>>2]&63](A,K);d=l;if((a[d]&1)==0){c[l+4>>2]=0;a[d]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);z=A;c[d+0>>2]=c[z+0>>2];c[d+4>>2]=c[z+4>>2];c[d+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;He(A)}else{nc[c[L+40>>2]&63](C,K);C=f;f=c[B>>2]|0;a[C]=f;a[C+1|0]=f>>8;a[C+2|0]=f>>16;a[C+3|0]=f>>24;nc[c[(c[G>>2]|0)+28>>2]&63](D,K);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Ke(l,0);l=D;c[f+0>>2]=c[l+0>>2];c[f+4>>2]=c[l+4>>2];c[f+8>>2]=c[l+8>>2];c[l+0>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;He(D)}D=G;c[g>>2]=pc[c[(c[D>>2]|0)+12>>2]&127](K)|0;c[h>>2]=pc[c[(c[D>>2]|0)+16>>2]&127](K)|0;nc[c[(c[G>>2]|0)+20>>2]&63](E,K);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}Ae(j,0);j=E;c[h+0>>2]=c[j+0>>2];c[h+4>>2]=c[j+4>>2];c[h+8>>2]=c[j+8>>2];c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;ve(E);nc[c[(c[G>>2]|0)+24>>2]&63](F,K);G=k;if((a[G]&1)==0){c[k+4>>2]=0;a[G]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Ke(k,0);k=F;c[G+0>>2]=c[k+0>>2];c[G+4>>2]=c[k+4>>2];c[G+8>>2]=c[k+8>>2];c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;He(F);J=pc[c[(c[D>>2]|0)+36>>2]&127](K)|0;c[m>>2]=J;i=n;return}}function Ej(b,d,e,f,g,h,j,k,l,m,n,o,p,q,r){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0;s=i;c[e>>2]=b;t=j;u=q;v=q+4|0;w=q+8|0;q=p;x=(f&512|0)==0;y=p+4|0;z=p+8|0;p=(r|0)>0;A=o;B=o+1|0;C=o+8|0;D=o+4|0;o=j;E=g;g=0;while(1){a:do{switch(a[l+g|0]|0){case 1:{c[d>>2]=c[e>>2];F=yc[c[(c[t>>2]|0)+44>>2]&31](j,32)|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;H=E;break};case 4:{F=c[e>>2]|0;G=k?E+4|0:E;b:do{if(G>>>0<h>>>0){I=G;while(1){J=I+4|0;if(!(jc[c[(c[o>>2]|0)+12>>2]&31](j,2048,c[I>>2]|0)|0)){K=I;break b}if(J>>>0<h>>>0){I=J}else{K=J;break}}}else{K=G}}while(0);if(p){do{if(K>>>0>G>>>0){I=c[e>>2]|0;J=K;L=r;while(1){M=J+ -4|0;N=I+4|0;c[I>>2]=c[M>>2];O=L+ -1|0;P=(O|0)>0;if(M>>>0>G>>>0&P){L=O;J=M;I=N}else{break}}c[e>>2]=N;if(P){Q=M;R=O;S=34;break}I=c[e>>2]|0;c[e>>2]=I+4;T=I;U=M}else{Q=K;R=r;S=34}}while(0);do{if((S|0)==34){S=0;I=yc[c[(c[t>>2]|0)+44>>2]&31](j,48)|0;J=c[e>>2]|0;L=J+4|0;c[e>>2]=L;if((R|0)>0){V=L;W=J;X=R}else{T=J;U=Q;break}while(1){c[W>>2]=I;L=X+ -1|0;if((L|0)>0){X=L;W=V;V=V+4|0}else{break}}c[e>>2]=J+(R+1<<2);T=J+(R<<2)|0;U=Q}}while(0);c[T>>2]=m;Y=U}else{Y=K}if((Y|0)==(G|0)){I=yc[c[(c[t>>2]|0)+44>>2]&31](j,48)|0;L=c[e>>2]|0;Z=L+4|0;c[e>>2]=Z;c[L>>2]=I;_=Z}else{Z=a[A]|0;I=(Z&1)==0;if(I){$=(Z&255)>>>1}else{$=c[D>>2]|0}if(($|0)==0){aa=Y;ba=-1;ca=0;da=0}else{if(I){ea=B}else{ea=c[C>>2]|0}aa=Y;ba=a[ea]|0;ca=0;da=0}while(1){I=c[e>>2]|0;do{if((da|0)==(ba|0)){Z=I+4|0;c[e>>2]=Z;c[I>>2]=n;L=ca+1|0;fa=a[A]|0;ga=(fa&1)==0;if(ga){ha=(fa&255)>>>1}else{ha=c[D>>2]|0}if(!(L>>>0<ha>>>0)){ia=Z;ja=ba;ka=L;la=0;break}if(ga){ma=B}else{ma=c[C>>2]|0}if((a[ma+L|0]|0)==127){ia=Z;ja=-1;ka=L;la=0;break}if(ga){na=B}else{na=c[C>>2]|0}ia=Z;ja=a[na+L|0]|0;ka=L;la=0}else{ia=I;ja=ba;ka=ca;la=da}}while(0);I=aa+ -4|0;J=c[I>>2]|0;L=ia+4|0;c[e>>2]=L;c[ia>>2]=J;if((I|0)==(G|0)){_=L;break}else{aa=I;ba=ja;ca=ka;da=la+1|0}}}if((F|0)==(_|0)){H=G;break a}I=_+ -4|0;if(I>>>0>F>>>0){oa=F;pa=I}else{H=G;break a}while(1){I=c[oa>>2]|0;c[oa>>2]=c[pa>>2];c[pa>>2]=I;I=oa+4|0;L=pa+ -4|0;if(I>>>0<L>>>0){pa=L;oa=I}else{H=G;break}}break};case 3:{G=a[u]|0;F=(G&1)==0;if(F){qa=(G&255)>>>1}else{qa=c[v>>2]|0}if((qa|0)==0){H=E;break a}if(F){ra=v}else{ra=c[w>>2]|0}F=c[ra>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=F;H=E;break};case 0:{c[d>>2]=c[e>>2];H=E;break};case 2:{F=a[q]|0;G=(F&1)==0;if(G){sa=(F&255)>>>1}else{sa=c[y>>2]|0}if((sa|0)==0|x){H=E;break a}if(G){ta=y;ua=(F&255)>>>1}else{ta=c[z>>2]|0;ua=c[y>>2]|0}F=ta+(ua<<2)|0;G=c[e>>2]|0;if((ta|0)==(F|0)){va=G}else{I=(ta+(ua+ -1<<2)+(0-ta)|0)>>>2;L=G;J=ta;while(1){c[L>>2]=c[J>>2];Z=J+4|0;if((Z|0)==(F|0)){break}L=L+4|0;J=Z}va=G+(I+1<<2)|0}c[e>>2]=va;H=E;break};default:{H=E}}}while(0);J=g+1|0;if((J|0)==4){break}else{E=H;g=J}}g=a[u]|0;u=(g&1)==0;if(u){wa=(g&255)>>>1}else{wa=c[v>>2]|0}if(wa>>>0>1){if(u){xa=v;ya=(g&255)>>>1}else{xa=c[w>>2]|0;ya=c[v>>2]|0}v=xa+4|0;w=xa+(ya<<2)|0;g=c[e>>2]|0;if((v|0)==(w|0)){za=g}else{u=(xa+(ya+ -1<<2)+(0-v)|0)>>>2;ya=g;xa=v;while(1){c[ya>>2]=c[xa>>2];v=xa+4|0;if((v|0)==(w|0)){break}else{xa=v;ya=ya+4|0}}za=g+(u+1<<2)|0}c[e>>2]=za}za=f&176;if((za|0)==32){c[d>>2]=c[e>>2];i=s;return}else if((za|0)==16){i=s;return}else{c[d>>2]=b;i=s;return}}function Fj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+40|0;k=d;l=d+8|0;m=d+24|0;n=d+32|0;o=n;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+16|0;s=i;i=i+16|0;t=i;i=i+16|0;u=i;i=i+8|0;v=i;i=i+400|0;w=i;i=i+8|0;x=i;i=i+8|0;y=i;i=i+8|0;Qe(m,g);z=m;A=c[z>>2]|0;if(!((c[1280]|0)==-1)){c[l>>2]=5120;c[l+4>>2]=118;c[l+8>>2]=0;qe(5120,l,119)}l=(c[5124>>2]|0)+ -1|0;B=c[A+8>>2]|0;if(!((c[A+12>>2]|0)-B>>2>>>0>l>>>0)){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}A=c[B+(l<<2)>>2]|0;if((A|0)==0){C=vb(4)|0;D=C;pm(D);cc(C|0,13088,107)}C=A;D=j;l=a[D]|0;B=(l&1)==0;if(B){E=(l&255)>>>1}else{E=c[j+4>>2]|0}if((E|0)==0){F=0}else{if(B){G=j+4|0}else{G=c[j+8>>2]|0}B=c[G>>2]|0;F=(B|0)==(yc[c[(c[A>>2]|0)+44>>2]&31](C,45)|0)}c[n>>2]=0;n=r;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;n=s;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;A=t;c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;Dj(f,F,m,o,p,q,r,s,t,u);m=v;v=a[D]|0;D=(v&1)==0;if(D){H=(v&255)>>>1}else{H=c[j+4>>2]|0}f=c[u>>2]|0;if((H|0)>(f|0)){if(D){I=(v&255)>>>1}else{I=c[j+4>>2]|0}D=a[A]|0;if((D&1)==0){J=(D&255)>>>1}else{J=c[t+4>>2]|0}D=a[n]|0;if((D&1)==0){K=(D&255)>>>1}else{K=c[s+4>>2]|0}L=J+(I-f<<1|1)+K|0}else{K=a[A]|0;if((K&1)==0){M=(K&255)>>>1}else{M=c[t+4>>2]|0}K=a[n]|0;if((K&1)==0){N=(K&255)>>>1}else{N=c[s+4>>2]|0}L=M+2+N|0}N=L+f|0;do{if(N>>>0>100){L=Km(N<<2)|0;M=L;if((L|0)!=0){O=M;P=M;break}Wm()}else{O=0;P=m}}while(0);if((v&1)==0){Q=j+4|0;R=(v&255)>>>1}else{Q=c[j+8>>2]|0;R=c[j+4>>2]|0}Ej(P,w,x,c[g+4>>2]|0,Q,Q+(R<<2)|0,C,F,o,c[p>>2]|0,c[q>>2]|0,r,s,t,f);c[y>>2]=c[e>>2];e=c[w>>2]|0;w=c[x>>2]|0;x=k;f=y;c[x+0>>2]=c[f+0>>2];Ah(b,k,P,e,w,g,h);if((O|0)==0){He(t);He(s);ve(r);S=c[z>>2]|0;T=S;Yd(T)|0;i=d;return}Lm(O);He(t);He(s);ve(r);S=c[z>>2]|0;T=S;Yd(T)|0;i=d;return}function Gj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Hj(a){a=a|0;i=i;return}function Ij(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=rb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function Jj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+16|0;j=d;k=j;c[k+0>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;l=a[h]|0;if((l&1)==0){m=h+1|0;n=h+1|0;o=(l&255)>>>1}else{l=c[h+8>>2]|0;m=l;n=l;o=c[h+4>>2]|0}h=m+o|0;do{if(n>>>0<h>>>0){o=n;do{Be(j,a[o]|0);o=o+1|0;}while((o|0)!=(h|0));o=(e|0)==-1?-1:e<<1;if((a[k]&1)==0){p=o;q=9;break}r=o;s=c[j+8>>2]|0}else{p=(e|0)==-1?-1:e<<1;q=9}}while(0);if((q|0)==9){r=p;s=j+1|0}p=Ub(r|0,f|0,g|0,s|0)|0;s=b;c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;s=on(p|0)|0;g=p+s|0;if((s|0)>0){t=p}else{ve(j);i=d;return}do{Be(b,a[t]|0);t=t+1|0;}while((t|0)!=(g|0));ve(j);i=d;return}function Kj(a,b){a=a|0;b=b|0;a=i;Xa(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Lj(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Mj(a){a=a|0;i=i;return}function Nj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=rb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function Oj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+240|0;j=d;k=d+8|0;l=d+40|0;m=d+48|0;n=d+56|0;o=d+64|0;p=d+192|0;q=d+200|0;r=d+208|0;s=d+224|0;t=d+232|0;u=r;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[s+4>>2]=0;c[s>>2]=6784;v=a[h]|0;if((v&1)==0){w=h+4|0;x=h+4|0;y=(v&255)>>>1}else{v=c[h+8>>2]|0;w=v;x=v;y=c[h+4>>2]|0}h=w+(y<<2)|0;y=k;w=j;v=j;c[v>>2]=0;c[v+4>>2]=0;a:do{if(x>>>0<h>>>0){v=s;j=s;z=k+32|0;A=x;B=6784|0;while(1){c[m>>2]=A;C=(uc[c[B+12>>2]&15](v,w,A,h,m,y,z,l)|0)==2;D=c[m>>2]|0;if(C|(D|0)==(A|0)){break}if(y>>>0<(c[l>>2]|0)>>>0){C=y;do{Be(r,a[C]|0);C=C+1|0;}while(C>>>0<(c[l>>2]|0)>>>0);E=c[m>>2]|0}else{E=D}if(!(E>>>0<h>>>0)){break a}A=E;B=c[j>>2]|0}ij(6008)}}while(0);if((a[u]&1)==0){F=r+1|0}else{F=c[r+8>>2]|0}u=Ub(((e|0)==-1?-1:e<<1)|0,f|0,g|0,F|0)|0;F=b;c[F+0>>2]=0;c[F+4>>2]=0;c[F+8>>2]=0;c[t+4>>2]=0;c[t>>2]=6888;F=on(u|0)|0;g=u+F|0;f=n;e=n;c[e>>2]=0;c[e+4>>2]=0;if((F|0)<=0){ve(r);i=d;return}F=t;e=t;t=g;n=o;E=o+128|0;o=u;u=6888|0;while(1){c[q>>2]=o;h=(uc[c[u+16>>2]&15](F,f,o,(t-o|0)>32?o+32|0:g,q,n,E,p)|0)==2;m=c[q>>2]|0;if(h|(m|0)==(o|0)){G=20;break}if(n>>>0<(c[p>>2]|0)>>>0){h=n;do{Le(b,c[h>>2]|0);h=h+4|0;}while(h>>>0<(c[p>>2]|0)>>>0);H=c[q>>2]|0}else{H=m}if(!(H>>>0<g>>>0)){G=25;break}o=H;u=c[e>>2]|0}if((G|0)==20){ij(6008)}else if((G|0)==25){ve(r);i=d;return}}function Pj(a,b){a=a|0;b=b|0;a=i;Xa(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Qj(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=5216;e=b+8|0;b=c[e>>2]|0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);if((b|0)==(c[1254]|0)){i=d;return}ib(c[e>>2]|0);i=d;return}function Rj(a){a=a|0;a=vb(8)|0;Zd(a,5008);c[a>>2]=2056;cc(a|0,2096,19)}function Sj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;e=i;i=i+448|0;f=e;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=e+256|0;x=e+272|0;y=e+288|0;z=e+304|0;A=e+320|0;B=e+336|0;C=e+352|0;D=e+368|0;E=e+384|0;F=e+400|0;G=e+416|0;H=e+432|0;c[b+4>>2]=d+ -1;c[b>>2]=5048;d=b+8|0;I=b+12|0;J=b+136|0;a[J]=1;K=b+24|0;c[I>>2]=K;c[d>>2]=K;c[b+16>>2]=J;J=28;L=K;do{if((L|0)==0){M=0}else{c[L>>2]=0;M=c[I>>2]|0}L=M+4|0;c[I>>2]=L;J=J+ -1|0;}while((J|0)!=0);te(b+144|0,5032,1);J=c[d>>2]|0;d=c[I>>2]|0;if((d|0)!=(J|0)){c[I>>2]=d+(~((d+ -4+(0-J)|0)>>>2)<<2)}c[9940>>2]=0;c[2484]=3528;if(!((c[888]|0)==-1)){c[G>>2]=3552;c[G+4>>2]=118;c[G+8>>2]=0;qe(3552,G,119)}Tj(b,9936,(c[3556>>2]|0)+ -1|0);c[9932>>2]=0;c[2482]=3568;if(!((c[898]|0)==-1)){c[F>>2]=3592;c[F+4>>2]=118;c[F+8>>2]=0;qe(3592,F,119)}Tj(b,9928,(c[3596>>2]|0)+ -1|0);c[9916>>2]=0;c[2478]=5144;c[9920>>2]=0;a[9924|0]=0;c[9920>>2]=c[(tb()|0)>>2];if(!((c[1282]|0)==-1)){c[E>>2]=5128;c[E+4>>2]=118;c[E+8>>2]=0;qe(5128,E,119)}Tj(b,9912,(c[5132>>2]|0)+ -1|0);c[9908>>2]=0;c[2476]=6104;if(!((c[1280]|0)==-1)){c[D>>2]=5120;c[D+4>>2]=118;c[D+8>>2]=0;qe(5120,D,119)}Tj(b,9904,(c[5124>>2]|0)+ -1|0);c[9900>>2]=0;c[2474]=6320;if(!((c[1298]|0)==-1)){c[C>>2]=5192;c[C+4>>2]=118;c[C+8>>2]=0;qe(5192,C,119)}Tj(b,9896,(c[5196>>2]|0)+ -1|0);c[9884>>2]=0;c[2470]=5216;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);c[9888>>2]=c[1254];if(!((c[1300]|0)==-1)){c[B>>2]=5200;c[B+4>>2]=118;c[B+8>>2]=0;qe(5200,B,119)}Tj(b,9880,(c[5204>>2]|0)+ -1|0);c[9876>>2]=0;c[2468]=6544;if(!((c[1314]|0)==-1)){c[A>>2]=5256;c[A+4>>2]=118;c[A+8>>2]=0;qe(5256,A,119)}Tj(b,9872,(c[5260>>2]|0)+ -1|0);c[9868>>2]=0;c[2466]=6664;if(!((c[1316]|0)==-1)){c[z>>2]=5264;c[z+4>>2]=118;c[z+8>>2]=0;qe(5264,z,119)}Tj(b,9864,(c[5268>>2]|0)+ -1|0);c[9844>>2]=0;c[2460]=5296;a[9848|0]=46;a[9849|0]=44;c[9852>>2]=0;c[9856>>2]=0;c[9860>>2]=0;if(!((c[1318]|0)==-1)){c[y>>2]=5272;c[y+4>>2]=118;c[y+8>>2]=0;qe(5272,y,119)}Tj(b,9840,(c[5276>>2]|0)+ -1|0);c[9812>>2]=0;c[2452]=5336;c[9816>>2]=46;c[9820>>2]=44;c[9824>>2]=0;c[9828>>2]=0;c[9832>>2]=0;if(!((c[1320]|0)==-1)){c[x>>2]=5280;c[x+4>>2]=118;c[x+8>>2]=0;qe(5280,x,119)}Tj(b,9808,(c[5284>>2]|0)+ -1|0);c[9804>>2]=0;c[2450]=3608;if(!((c[916]|0)==-1)){c[w>>2]=3664;c[w+4>>2]=118;c[w+8>>2]=0;qe(3664,w,119)}Tj(b,9800,(c[3668>>2]|0)+ -1|0);c[9796>>2]=0;c[2448]=3728;if(!((c[946]|0)==-1)){c[v>>2]=3784;c[v+4>>2]=118;c[v+8>>2]=0;qe(3784,v,119)}Tj(b,9792,(c[3788>>2]|0)+ -1|0);c[9788>>2]=0;c[2446]=3800;if(!((c[962]|0)==-1)){c[u>>2]=3848;c[u+4>>2]=118;c[u+8>>2]=0;qe(3848,u,119)}Tj(b,9784,(c[3852>>2]|0)+ -1|0);c[9780>>2]=0;c[2444]=3864;if(!((c[978]|0)==-1)){c[t>>2]=3912;c[t+4>>2]=118;c[t+8>>2]=0;qe(3912,t,119)}Tj(b,9776,(c[3916>>2]|0)+ -1|0);c[9772>>2]=0;c[2442]=4456;if(!((c[1126]|0)==-1)){c[s>>2]=4504;c[s+4>>2]=118;c[s+8>>2]=0;qe(4504,s,119)}Tj(b,9768,(c[4508>>2]|0)+ -1|0);c[9764>>2]=0;c[2440]=4520;if(!((c[1142]|0)==-1)){c[r>>2]=4568;c[r+4>>2]=118;c[r+8>>2]=0;qe(4568,r,119)}Tj(b,9760,(c[4572>>2]|0)+ -1|0);c[9756>>2]=0;c[2438]=4584;if(!((c[1158]|0)==-1)){c[q>>2]=4632;c[q+4>>2]=118;c[q+8>>2]=0;qe(4632,q,119)}Tj(b,9752,(c[4636>>2]|0)+ -1|0);c[9748>>2]=0;c[2436]=4648;if(!((c[1174]|0)==-1)){c[p>>2]=4696;c[p+4>>2]=118;c[p+8>>2]=0;qe(4696,p,119)}Tj(b,9744,(c[4700>>2]|0)+ -1|0);c[9740>>2]=0;c[2434]=4712;if(!((c[1184]|0)==-1)){c[o>>2]=4736;c[o+4>>2]=118;c[o+8>>2]=0;qe(4736,o,119)}Tj(b,9736,(c[4740>>2]|0)+ -1|0);c[9732>>2]=0;c[2432]=4792;if(!((c[1204]|0)==-1)){c[n>>2]=4816;c[n+4>>2]=118;c[n+8>>2]=0;qe(4816,n,119)}Tj(b,9728,(c[4820>>2]|0)+ -1|0);c[9724>>2]=0;c[2430]=4848;if(!((c[1218]|0)==-1)){c[m>>2]=4872;c[m+4>>2]=118;c[m+8>>2]=0;qe(4872,m,119)}Tj(b,9720,(c[4876>>2]|0)+ -1|0);c[9716>>2]=0;c[2428]=4896;if(!((c[1230]|0)==-1)){c[l>>2]=4920;c[l+4>>2]=118;c[l+8>>2]=0;qe(4920,l,119)}Tj(b,9712,(c[4924>>2]|0)+ -1|0);c[9700>>2]=0;c[2424]=3944;c[9704>>2]=3992;if(!((c[1006]|0)==-1)){c[k>>2]=4024;c[k+4>>2]=118;c[k+8>>2]=0;qe(4024,k,119)}Tj(b,9696,(c[4028>>2]|0)+ -1|0);c[9684>>2]=0;c[2420]=4096;c[9688>>2]=4144;if(!((c[1044]|0)==-1)){c[j>>2]=4176;c[j+4>>2]=118;c[j+8>>2]=0;qe(4176,j,119)}Tj(b,9680,(c[4180>>2]|0)+ -1|0);c[9668>>2]=0;c[2416]=6040;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);c[9672>>2]=c[1254];c[2416]=4392;if(!((c[1102]|0)==-1)){c[h>>2]=4408;c[h+4>>2]=118;c[h+8>>2]=0;qe(4408,h,119)}Tj(b,9664,(c[4412>>2]|0)+ -1|0);c[9652>>2]=0;c[2412]=6040;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);c[9656>>2]=c[1254];c[2412]=4424;if(!((c[1110]|0)==-1)){c[g>>2]=4440;c[g+4>>2]=118;c[g+8>>2]=0;qe(4440,g,119)}Tj(b,9648,(c[4444>>2]|0)+ -1|0);c[9644>>2]=0;c[2410]=4936;if(!((c[1240]|0)==-1)){c[f>>2]=4960;c[f+4>>2]=118;c[f+8>>2]=0;qe(4960,f,119)}Tj(b,9640,(c[4964>>2]|0)+ -1|0);c[9636>>2]=0;c[2408]=4976;if((c[1250]|0)==-1){N=c[5004>>2]|0;O=N+ -1|0;Tj(b,9632,O);i=e;return}c[H>>2]=5e3;c[H+4>>2]=118;c[H+8>>2]=0;qe(5e3,H,119);N=c[5004>>2]|0;O=N+ -1|0;Tj(b,9632,O);i=e;return}function Tj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;Xd(b);f=a+8|0;g=a+12|0;a=c[g>>2]|0;h=f;j=c[h>>2]|0;k=a-j>>2;do{if(k>>>0>d>>>0){l=j}else{m=d+1|0;if(k>>>0<m>>>0){Xl(f,m-k|0);l=c[h>>2]|0;break}if(!(k>>>0>m>>>0)){l=j;break}n=j+(m<<2)|0;if((a|0)==(n|0)){l=j;break}c[g>>2]=a+(~((a+ -4+(0-n)|0)>>>2)<<2);l=j}}while(0);j=c[l+(d<<2)>>2]|0;if((j|0)==0){o=l;p=o+(d<<2)|0;c[p>>2]=b;i=e;return}Yd(j)|0;o=c[h>>2]|0;p=o+(d<<2)|0;c[p>>2]=b;i=e;return}function Uj(a){a=a|0;var b=0;b=i;Vj(a);Rm(a);i=b;return}function Vj(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;c[b>>2]=5048;e=b+12|0;f=c[e>>2]|0;g=b+8|0;h=c[g>>2]|0;if((f|0)!=(h|0)){j=f;f=h;h=0;while(1){k=c[f+(h<<2)>>2]|0;if((k|0)==0){l=f;m=j}else{Yd(k)|0;l=c[g>>2]|0;m=c[e>>2]|0}k=h+1|0;if(k>>>0<m-l>>2>>>0){j=m;f=l;h=k}else{break}}}ve(b+144|0);h=c[g>>2]|0;if((h|0)==0){i=d;return}g=c[e>>2]|0;if((g|0)!=(h|0)){c[e>>2]=g+(~((g+ -4+(0-h)|0)>>>2)<<2)}if((b+24|0)==(h|0)){a[b+136|0]=0;i=d;return}else{Rm(h);i=d;return}}function Wj(){var b=0,d=0,e=0;b=i;if((a[5104]|0)!=0){d=c[1274]|0;i=b;return d|0}if((Ga(5104)|0)==0){d=c[1274]|0;i=b;return d|0}do{if((a[5080]|0)==0){if((Ga(5080)|0)==0){break}Sj(9472,1);c[1266]=9472;c[1268]=5064;cb(5080)}}while(0);e=c[c[1268]>>2]|0;c[1272]=e;Xd(e);c[1274]=5088;cb(5104);d=c[1274]|0;i=b;return d|0}function Xj(a){a=a|0;var b=0,d=0;b=i;d=c[(Wj()|0)>>2]|0;c[a>>2]=d;Xd(d);i=b;return}function Yj(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=c[b>>2]|0;c[a>>2]=e;Xd(e);i=d;return}function Zj(a){a=a|0;var b=0;b=i;Yd(c[a>>2]|0)|0;i=b;return}function _j(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=c[a>>2]|0;a=b;if(!((c[a>>2]|0)==-1)){c[e>>2]=b;c[e+4>>2]=118;c[e+8>>2]=0;qe(a,e,119)}e=(c[b+4>>2]|0)+ -1|0;b=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-b>>2>>>0>e>>>0)){g=vb(4)|0;h=g;pm(h);cc(g|0,13088,107)}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=vb(4)|0;h=g;pm(h);cc(g|0,13088,107)}else{i=d;return f|0}return 0}function $j(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function ak(a){a=a|0;var b=0;b=i;if((a|0)==0){i=b;return}mc[c[(c[a>>2]|0)+4>>2]&255](a);i=b;return}function bk(a){a=a|0;var b=0;b=c[1278]|0;c[1278]=b+1;c[a+4>>2]=b+1;i=i;return}function ck(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function dk(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;a=i;if(!(e>>>0<128)){f=0;i=a;return f|0}f=(b[(c[(tb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;i=a;return f|0}function ek(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;if((d|0)==(e|0)){g=d;i=a;return g|0}else{h=d;j=f}while(1){f=c[h>>2]|0;if(f>>>0<128){k=b[(c[(tb()|0)>>2]|0)+(f<<1)>>1]|0}else{k=0}b[j>>1]=k;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;j=j+2|0}}i=a;return g|0}function fk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(j>>>0<128){if(!((b[(c[(tb()|0)>>2]|0)+(j<<1)>>1]&d)<<16>>16==0)){g=h;break a}}j=h+4|0;if((j|0)==(f|0)){g=f;break}else{h=j}}}}while(0);i=a;return g|0}function gk(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(!(j>>>0<128)){g=h;break a}k=h+4|0;if((b[(c[(tb()|0)>>2]|0)+(j<<1)>>1]&d)<<16>>16==0){g=h;break a}if((k|0)==(f|0)){g=f;break}else{h=k}}}}while(0);i=a;return g|0}function hk(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}d=c[(c[(Ja()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function ik(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(Ja()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function jk(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}d=c[(c[(Yb()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function kk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(Yb()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function lk(a,b){a=a|0;b=b|0;i=i;return b<<24>>24|0}function mk(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((d|0)==(e|0)){g=d;i=b;return g|0}else{h=d;j=f}while(1){c[j>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{j=j+4|0;h=f}}i=b;return g|0}function nk(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return(b>>>0<128?b&255:c)|0}function ok(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;b=i;if((d|0)==(e|0)){h=d;i=b;return h|0}j=((e+ -4+(0-d)|0)>>>2)+1|0;k=d;l=g;while(1){g=c[k>>2]|0;a[l]=g>>>0<128?g&255:f;g=k+4|0;if((g|0)==(e|0)){break}else{l=l+1|0;k=g}}h=d+(j<<2)|0;i=b;return h|0}function pk(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=5144;e=c[b+8>>2]|0;do{if((e|0)!=0){if((a[b+12|0]|0)==0){break}Sm(e)}}while(0);Rm(b);i=d;return}function qk(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=5144;e=c[b+8>>2]|0;if((e|0)==0){i=d;return}if((a[b+12|0]|0)==0){i=d;return}Sm(e);i=d;return}function rk(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}d=c[(c[(Ja()|0)>>2]|0)+((b&255)<<2)>>2]&255;i=a;return d|0}function sk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(Ja()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function tk(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}d=c[(c[(Yb()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;i=a;return d|0}function uk(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(Yb()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function vk(a,b){a=a|0;b=b|0;i=i;return b|0}function wk(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;b=i;if((c|0)==(d|0)){f=c}else{g=c;c=e;while(1){a[c]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{c=c+1|0;g=e}}}i=b;return f|0}function xk(a,b,c){a=a|0;b=b|0;c=c|0;i=i;return(b<<24>>24>-1?b:c)|0}function yk(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((c|0)==(d|0)){g=c;i=b;return g|0}else{h=c;j=f}while(1){f=a[h]|0;a[j]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{j=j+1|0;h=f}}i=b;return g|0}function zk(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Ak(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;c[f>>2]=d;c[j>>2]=g;i=i;return 3}function Bk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;c[f>>2]=d;c[j>>2]=g;i=i;return 3}function Ck(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function Dk(a){a=a|0;i=i;return 1}function Ek(a){a=a|0;i=i;return 1}function Fk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;i=i;return(b>>>0<e>>>0?b:e)|0}function Gk(a){a=a|0;i=i;return 1}function Hk(a){a=a|0;var b=0;b=i;Qj(a);Rm(a);i=b;return}function Ik(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;l=i;i=i+8|0;m=l;n=m;o=i;i=i+8|0;p=(e|0)==(f|0);a:do{if(p){c[k>>2]=h;c[g>>2]=e;q=e}else{r=e;while(1){s=r+4|0;if((c[r>>2]|0)==0){t=r;break}if((s|0)==(f|0)){t=f;break}else{r=s}}c[k>>2]=h;c[g>>2]=e;if(p|(h|0)==(j|0)){q=e;break}r=d;s=j;u=b+8|0;v=o;w=e;x=h;y=t;while(1){z=r;A=c[z+4>>2]|0;B=m;c[B>>2]=c[z>>2];c[B+4>>2]=A;A=zb(c[u>>2]|0)|0;B=im(x,g,y-w>>2,s-x|0,d)|0;if((A|0)!=0){zb(A|0)|0}if((B|0)==-1){C=10;break}else if((B|0)==0){D=1;C=33;break}A=(c[k>>2]|0)+B|0;c[k>>2]=A;if((A|0)==(j|0)){C=31;break}if((y|0)==(f|0)){E=c[g>>2]|0;F=A;G=f}else{A=zb(c[u>>2]|0)|0;B=hm(v,0,d)|0;if((A|0)!=0){zb(A|0)|0}if((B|0)==-1){D=2;C=33;break}A=c[k>>2]|0;if(B>>>0>(s-A|0)>>>0){D=1;C=33;break}b:do{if((B|0)!=0){z=A;H=B;I=v;while(1){J=a[I]|0;c[k>>2]=z+1;a[z]=J;J=H+ -1|0;if((J|0)==0){break b}z=c[k>>2]|0;I=I+1|0;H=J}}}while(0);B=(c[g>>2]|0)+4|0;c[g>>2]=B;c:do{if((B|0)==(f|0)){K=f}else{A=B;while(1){H=A+4|0;if((c[A>>2]|0)==0){K=A;break c}if((H|0)==(f|0)){K=f;break}else{A=H}}}}while(0);E=B;F=c[k>>2]|0;G=K}if((E|0)==(f|0)|(F|0)==(j|0)){q=E;break a}else{w=E;x=F;y=G}}if((C|0)==10){c[k>>2]=x;d:do{if((w|0)==(c[g>>2]|0)){L=w}else{y=w;v=x;while(1){s=c[y>>2]|0;r=zb(c[u>>2]|0)|0;A=hm(v,s,n)|0;if((r|0)!=0){zb(r|0)|0}if((A|0)==-1){L=y;break d}r=(c[k>>2]|0)+A|0;c[k>>2]=r;A=y+4|0;if((A|0)==(c[g>>2]|0)){L=A;break}else{y=A;v=r}}}}while(0);c[g>>2]=L;D=2;i=l;return D|0}else if((C|0)==31){q=c[g>>2]|0;break}else if((C|0)==33){i=l;return D|0}}}while(0);D=(q|0)!=(f|0)|0;i=l;return D|0}function Jk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;l=i;i=i+8|0;m=l;n=m;o=(e|0)==(f|0);a:do{if(o){c[k>>2]=h;c[g>>2]=e;p=e}else{q=e;while(1){r=q+1|0;if((a[q]|0)==0){s=q;break}if((r|0)==(f|0)){s=f;break}else{q=r}}c[k>>2]=h;c[g>>2]=e;if(o|(h|0)==(j|0)){p=e;break}q=d;r=j;t=b+8|0;u=e;v=h;w=s;while(1){x=q;y=c[x+4>>2]|0;z=m;c[z>>2]=c[x>>2];c[z+4>>2]=y;A=w;y=zb(c[t>>2]|0)|0;z=em(v,g,A-u|0,r-v>>2,d)|0;if((y|0)!=0){zb(y|0)|0}if((z|0)==-1){B=10;break}else if((z|0)==0){C=2;B=32;break}y=(c[k>>2]|0)+(z<<2)|0;c[k>>2]=y;if((y|0)==(j|0)){B=30;break}z=c[g>>2]|0;if((w|0)==(f|0)){D=z;E=y;F=f}else{x=zb(c[t>>2]|0)|0;G=dm(y,z,1,d)|0;if((x|0)!=0){zb(x|0)|0}if((G|0)!=0){C=2;B=32;break}c[k>>2]=(c[k>>2]|0)+4;G=(c[g>>2]|0)+1|0;c[g>>2]=G;b:do{if((G|0)==(f|0)){H=f}else{x=G;while(1){z=x+1|0;if((a[x]|0)==0){H=x;break b}if((z|0)==(f|0)){H=f;break}else{x=z}}}}while(0);D=G;E=c[k>>2]|0;F=H}if((D|0)==(f|0)|(E|0)==(j|0)){p=D;break a}else{u=D;v=E;w=F}}if((B|0)==10){c[k>>2]=v;c:do{if((u|0)==(c[g>>2]|0)){I=u}else{w=u;r=v;while(1){q=zb(c[t>>2]|0)|0;x=dm(r,w,A-w|0,n)|0;if((q|0)!=0){zb(q|0)|0}if((x|0)==-1){B=15;break}else if((x|0)==-2){B=16;break}else if((x|0)==0){J=w+1|0}else{J=w+x|0}x=(c[k>>2]|0)+4|0;c[k>>2]=x;if((J|0)==(c[g>>2]|0)){I=J;break c}else{w=J;r=x}}if((B|0)==15){c[g>>2]=w;C=2;i=l;return C|0}else if((B|0)==16){c[g>>2]=w;C=1;i=l;return C|0}}}while(0);c[g>>2]=I;C=(I|0)!=(f|0)|0;i=l;return C|0}else if((B|0)==30){p=c[g>>2]|0;break}else if((B|0)==32){i=l;return C|0}}}while(0);C=(p|0)!=(f|0)|0;i=l;return C|0}function Kk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+8|0;c[g>>2]=e;e=h;j=zb(c[b+8>>2]|0)|0;b=hm(e,0,d)|0;if((j|0)!=0){zb(j|0)|0}if((b|0)==0|(b|0)==-1){k=2;i=h;return k|0}j=b+ -1|0;b=c[g>>2]|0;if(j>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((j|0)==0){k=0;i=h;return k|0}else{l=b;m=j;n=e}while(1){e=a[n]|0;c[g>>2]=l+1;a[l]=e;e=m+ -1|0;if((e|0)==0){k=0;break}l=c[g>>2]|0;n=n+1|0;m=e}i=h;return k|0}function Lk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;d=a+8|0;a=zb(c[d>>2]|0)|0;e=gm(0,0,4)|0;if((a|0)!=0){zb(a|0)|0}do{if((e|0)==0){a=c[d>>2]|0;if((a|0)==0){f=1;break}g=zb(a|0)|0;if((g|0)==0){f=0;break}zb(g|0)|0;f=0}else{f=-1}}while(0);i=b;return f|0}function Mk(a){a=a|0;i=i;return 0}function Nk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;if((f|0)==0|(d|0)==(e|0)){h=0;i=g;return h|0}j=e;k=a+8|0;a=d;d=0;l=0;while(1){m=zb(c[k>>2]|0)|0;n=cm(a,j-a|0,b)|0;if((m|0)!=0){zb(m|0)|0}if((n|0)==0){o=a+1|0;p=1}else if((n|0)==-2|(n|0)==-1){h=d;q=9;break}else{o=a+n|0;p=n}n=p+d|0;m=l+1|0;if(m>>>0>=f>>>0|(o|0)==(e|0)){h=n;q=9;break}else{a=o;d=n;l=m}}if((q|0)==9){i=g;return h|0}return 0}function Ok(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[a+8>>2]|0;do{if((d|0)==0){e=1}else{a=zb(d|0)|0;if((a|0)==0){e=4;break}zb(a|0)|0;e=4}}while(0);i=b;return e|0}function Pk(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Qk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=Rk(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function Rk(d,f,g,h,j,k,l,m){d=d|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;c[g>>2]=d;c[k>>2]=h;do{if((m&2|0)!=0){if((j-h|0)<3){o=1;i=n;return o|0}else{c[k>>2]=h+1;a[h]=-17;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-69;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-65;break}}}while(0);h=f;m=c[g>>2]|0;if(!(m>>>0<f>>>0)){o=0;i=n;return o|0}d=j;j=m;a:while(1){m=b[j>>1]|0;p=m&65535;if(p>>>0>l>>>0){o=2;q=26;break}do{if((m&65535)<128){r=c[k>>2]|0;if((d-r|0)<1){o=1;q=26;break a}c[k>>2]=r+1;a[r]=m}else{if((m&65535)<2048){r=c[k>>2]|0;if((d-r|0)<2){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>6|192;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((m&65535)<55296){r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if(!((m&65535)<56320)){if((m&65535)<57344){o=2;q=26;break a}r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((h-j|0)<4){o=1;q=26;break a}r=j+2|0;s=e[r>>1]|0;if((s&64512|0)!=56320){o=2;q=26;break a}if((d-(c[k>>2]|0)|0)<4){o=1;q=26;break a}t=p&960;if(((t<<10)+65536|p<<10&64512|s&1023)>>>0>l>>>0){o=2;q=26;break a}c[g>>2]=r;r=(t>>>6)+1|0;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=r>>>2|240;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=p>>>2&15|r<<4&48|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p<<4&48|s>>>6&15|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=s&63|128}}while(0);p=(c[g>>2]|0)+2|0;c[g>>2]=p;if(p>>>0<f>>>0){j=p}else{o=0;q=26;break}}if((q|0)==26){i=n;return o|0}return 0}function Sk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=Tk(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function Tk(e,f,g,h,j,k,l,m){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;c[g>>2]=e;c[k>>2]=h;h=c[g>>2]|0;do{if((m&4|0)==0){o=h}else{if((f-h|0)<=2){o=h;break}if(!((a[h]|0)==-17)){o=h;break}if(!((a[h+1|0]|0)==-69)){o=h;break}if(!((a[h+2|0]|0)==-65)){o=h;break}e=h+3|0;c[g>>2]=e;o=e}}while(0);a:do{if(o>>>0<f>>>0){h=f;m=j;e=o;p=c[k>>2]|0;b:while(1){if(!(p>>>0<j>>>0)){q=e;break a}r=a[e]|0;s=r&255;if(s>>>0>l>>>0){t=2;u=41;break}do{if(r<<24>>24>-1){b[p>>1]=r&255;c[g>>2]=e+1}else{if((r&255)<194){t=2;u=41;break b}if((r&255)<224){if((h-e|0)<2){t=1;u=41;break b}v=d[e+1|0]|0;if((v&192|0)!=128){t=2;u=41;break b}w=v&63|s<<6&1984;if(w>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=w;c[g>>2]=e+2;break}if((r&255)<240){if((h-e|0)<3){t=1;u=41;break b}w=a[e+1|0]|0;v=a[e+2|0]|0;if((s|0)==224){if(!((w&-32)<<24>>24==-96)){t=2;u=41;break b}}else if((s|0)==237){if(!((w&-32)<<24>>24==-128)){t=2;u=41;break b}}else{if(!((w&-64)<<24>>24==-128)){t=2;u=41;break b}}x=v&255;if((x&192|0)!=128){t=2;u=41;break b}v=(w&255)<<6&4032|s<<12|x&63;if((v&65535)>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=v;c[g>>2]=e+3;break}if(!((r&255)<245)){t=2;u=41;break b}if((h-e|0)<4){t=1;u=41;break b}v=a[e+1|0]|0;x=a[e+2|0]|0;w=a[e+3|0]|0;if((s|0)==244){if(!((v&-16)<<24>>24==-128)){t=2;u=41;break b}}else if((s|0)==240){if(!((v+112<<24>>24&255)<48)){t=2;u=41;break b}}else{if(!((v&-64)<<24>>24==-128)){t=2;u=41;break b}}y=x&255;if((y&192|0)!=128){t=2;u=41;break b}x=w&255;if((x&192|0)!=128){t=2;u=41;break b}if((m-p|0)<4){t=1;u=41;break b}w=s&7;z=v&255;v=y<<6;A=x&63;if((z<<12&258048|w<<18|v&4032|A)>>>0>l>>>0){t=2;u=41;break b}b[p>>1]=z<<2&60|y>>>4&3|((z>>>4&3|w<<2)<<6)+16320|55296;w=p+2|0;c[k>>2]=w;b[w>>1]=A|v&960|56320;c[g>>2]=(c[g>>2]|0)+4}}while(0);s=(c[k>>2]|0)+2|0;c[k>>2]=s;r=c[g>>2]|0;if(r>>>0<f>>>0){e=r;p=s}else{q=r;break a}}if((u|0)==41){i=n;return t|0}}else{q=o}}while(0);t=q>>>0<f>>>0|0;i=n;return t|0}function Uk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function Vk(a){a=a|0;i=i;return 0}function Wk(a){a=a|0;i=i;return 0}function Xk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=Yk(c,d,e,1114111,0)|0;i=b;return a|0}function Yk(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=i;do{if((g&4|0)==0){j=b}else{if((c-b|0)<=2){j=b;break}if(!((a[b]|0)==-17)){j=b;break}if(!((a[b+1|0]|0)==-69)){j=b;break}j=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=0;b:while(1){m=a[k]|0;n=m&255;if(n>>>0>f>>>0){o=k;break a}do{if(m<<24>>24>-1){p=k+1|0;q=l}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}r=d[k+1|0]|0;if((r&192|0)!=128){o=k;break a}if((r&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;q=l;break}if((m&255)<240){s=k;if((g-s|0)<3){o=k;break a}r=a[k+1|0]|0;t=a[k+2|0]|0;if((n|0)==224){if(!((r&-32)<<24>>24==-96)){u=21;break b}}else if((n|0)==237){if(!((r&-32)<<24>>24==-128)){u=23;break b}}else{if(!((r&-64)<<24>>24==-128)){u=25;break b}}v=t&255;if((v&192|0)!=128){o=k;break a}if(((r&255)<<6&4032|n<<12&61440|v&63)>>>0>f>>>0){o=k;break a}p=k+3|0;q=l;break}if(!((m&255)<245)){o=k;break a}w=k;if((g-w|0)<4){o=k;break a}if((e-l|0)>>>0<2){o=k;break a}v=a[k+1|0]|0;r=a[k+2|0]|0;t=a[k+3|0]|0;if((n|0)==244){if(!((v&-16)<<24>>24==-128)){u=36;break b}}else if((n|0)==240){if(!((v+112<<24>>24&255)<48)){u=34;break b}}else{if(!((v&-64)<<24>>24==-128)){u=38;break b}}x=r&255;if((x&192|0)!=128){o=k;break a}r=t&255;if((r&192|0)!=128){o=k;break a}if(((v&255)<<12&258048|n<<18&1835008|x<<6&4032|r&63)>>>0>f>>>0){o=k;break a}p=k+4|0;q=l+1|0}}while(0);n=q+1|0;if(p>>>0<c>>>0&n>>>0<e>>>0){k=p;l=n}else{o=p;break a}}if((u|0)==21){y=s-b|0;i=h;return y|0}else if((u|0)==23){y=s-b|0;i=h;return y|0}else if((u|0)==25){y=s-b|0;i=h;return y|0}else if((u|0)==34){y=w-b|0;i=h;return y|0}else if((u|0)==36){y=w-b|0;i=h;return y|0}else if((u|0)==38){y=w-b|0;i=h;return y|0}}else{o=j}}while(0);y=o-b|0;i=h;return y|0}function Zk(a){a=a|0;i=i;return 4}function _k(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function $k(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=al(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function al(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;l=i;c[e>>2]=b;c[h>>2]=f;do{if((k&2|0)!=0){if((g-f|0)<3){m=1;i=l;return m|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(!(f>>>0<d>>>0)){m=0;i=l;return m|0}k=g;g=f;a:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>j>>>0){m=2;n=19;break}do{if(f>>>0<128){b=c[h>>2]|0;if((k-b|0)<1){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f}else{if(f>>>0<2048){b=c[h>>2]|0;if((k-b|0)<2){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>6|192;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}b=c[h>>2]|0;o=k-b|0;if(f>>>0<65536){if((o|0)<3){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>12|224;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f>>>6&63|128;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f&63|128;break}else{if((o|0)<4){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>18|240;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>12&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{m=0;n=19;break}}if((n|0)==19){i=l;return m|0}return 0}function bl(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b;k=b+8|0;c[a>>2]=d;c[k>>2]=g;l=cl(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function cl(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;m=i;c[f>>2]=b;c[j>>2]=g;g=c[f>>2]|0;do{if((l&4|0)==0){n=g}else{if((e-g|0)<=2){n=g;break}if(!((a[g]|0)==-17)){n=g;break}if(!((a[g+1|0]|0)==-69)){n=g;break}if(!((a[g+2|0]|0)==-65)){n=g;break}b=g+3|0;c[f>>2]=b;n=b}}while(0);a:do{if(n>>>0<e>>>0){g=e;l=n;b=c[j>>2]|0;while(1){if(!(b>>>0<h>>>0)){o=l;p=39;break a}q=a[l]|0;r=q&255;do{if(q<<24>>24>-1){if(r>>>0>k>>>0){s=2;break a}c[b>>2]=r;c[f>>2]=l+1}else{if((q&255)<194){s=2;break a}if((q&255)<224){if((g-l|0)<2){s=1;break a}t=d[l+1|0]|0;if((t&192|0)!=128){s=2;break a}u=t&63|r<<6&1984;if(u>>>0>k>>>0){s=2;break a}c[b>>2]=u;c[f>>2]=l+2;break}if((q&255)<240){if((g-l|0)<3){s=1;break a}u=a[l+1|0]|0;t=a[l+2|0]|0;if((r|0)==224){if(!((u&-32)<<24>>24==-96)){s=2;break a}}else if((r|0)==237){if(!((u&-32)<<24>>24==-128)){s=2;break a}}else{if(!((u&-64)<<24>>24==-128)){s=2;break a}}v=t&255;if((v&192|0)!=128){s=2;break a}t=(u&255)<<6&4032|r<<12&61440|v&63;if(t>>>0>k>>>0){s=2;break a}c[b>>2]=t;c[f>>2]=l+3;break}if(!((q&255)<245)){s=2;break a}if((g-l|0)<4){s=1;break a}t=a[l+1|0]|0;v=a[l+2|0]|0;u=a[l+3|0]|0;if((r|0)==244){if(!((t&-16)<<24>>24==-128)){s=2;break a}}else if((r|0)==240){if(!((t+112<<24>>24&255)<48)){s=2;break a}}else{if(!((t&-64)<<24>>24==-128)){s=2;break a}}w=v&255;if((w&192|0)!=128){s=2;break a}v=u&255;if((v&192|0)!=128){s=2;break a}u=(t&255)<<12&258048|r<<18&1835008|w<<6&4032|v&63;if(u>>>0>k>>>0){s=2;break a}c[b>>2]=u;c[f>>2]=l+4}}while(0);r=(c[j>>2]|0)+4|0;c[j>>2]=r;q=c[f>>2]|0;if(q>>>0<e>>>0){l=q;b=r}else{o=q;p=39;break}}}else{o=n;p=39}}while(0);if((p|0)==39){s=o>>>0<e>>>0|0}i=m;return s|0}function dl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;i=i;return 3}function el(a){a=a|0;i=i;return 0}function fl(a){a=a|0;i=i;return 0}function gl(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=hl(c,d,e,1114111,0)|0;i=b;return a|0}function hl(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;do{if((g&4|0)==0){j=b}else{if((c-b|0)<=2){j=b;break}if(!((a[b]|0)==-17)){j=b;break}if(!((a[b+1|0]|0)==-69)){j=b;break}j=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=1;b:while(1){m=a[k]|0;n=m&255;do{if(m<<24>>24>-1){if(n>>>0>f>>>0){o=k;break a}p=k+1|0}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}q=d[k+1|0]|0;if((q&192|0)!=128){o=k;break a}if((q&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;break}if((m&255)<240){r=k;if((g-r|0)<3){o=k;break a}q=a[k+1|0]|0;s=a[k+2|0]|0;if((n|0)==224){if(!((q&-32)<<24>>24==-96)){t=21;break b}}else if((n|0)==237){if(!((q&-32)<<24>>24==-128)){t=23;break b}}else{if(!((q&-64)<<24>>24==-128)){t=25;break b}}u=s&255;if((u&192|0)!=128){o=k;break a}if(((q&255)<<6&4032|n<<12&61440|u&63)>>>0>f>>>0){o=k;break a}p=k+3|0;break}if(!((m&255)<245)){o=k;break a}v=k;if((g-v|0)<4){o=k;break a}u=a[k+1|0]|0;q=a[k+2|0]|0;s=a[k+3|0]|0;if((n|0)==244){if(!((u&-16)<<24>>24==-128)){t=35;break b}}else if((n|0)==240){if(!((u+112<<24>>24&255)<48)){t=33;break b}}else{if(!((u&-64)<<24>>24==-128)){t=37;break b}}w=q&255;if((w&192|0)!=128){o=k;break a}q=s&255;if((q&192|0)!=128){o=k;break a}if(((u&255)<<12&258048|n<<18&1835008|w<<6&4032|q&63)>>>0>f>>>0){o=k;break a}p=k+4|0}}while(0);if(!(p>>>0<c>>>0&l>>>0<e>>>0)){o=p;break a}k=p;l=l+1|0}if((t|0)==21){x=r-b|0;i=h;return x|0}else if((t|0)==23){x=r-b|0;i=h;return x|0}else if((t|0)==25){x=r-b|0;i=h;return x|0}else if((t|0)==33){x=v-b|0;i=h;return x|0}else if((t|0)==35){x=v-b|0;i=h;return x|0}else if((t|0)==37){x=v-b|0;i=h;return x|0}}else{o=j}}while(0);x=o-b|0;i=h;return x|0}function il(a){a=a|0;i=i;return 4}function jl(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function kl(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function ll(a){a=a|0;var b=0;b=i;c[a>>2]=5296;ve(a+12|0);Rm(a);i=b;return}function ml(a){a=a|0;var b=0;b=i;c[a>>2]=5296;ve(a+12|0);i=b;return}function nl(a){a=a|0;var b=0;b=i;c[a>>2]=5336;ve(a+16|0);Rm(a);i=b;return}function ol(a){a=a|0;var b=0;b=i;c[a>>2]=5336;ve(a+16|0);i=b;return}function pl(b){b=b|0;i=i;return a[b+8|0]|0}function ql(a){a=a|0;i=i;return c[a+8>>2]|0}function rl(b){b=b|0;i=i;return a[b+9|0]|0}function sl(a){a=a|0;i=i;return c[a+12>>2]|0}function tl(a,b){a=a|0;b=b|0;var c=0;c=i;se(a,b+12|0);i=c;return}function ul(a,b){a=a|0;b=b|0;var c=0;c=i;se(a,b+16|0);i=c;return}function vl(a,b){a=a|0;b=b|0;b=i;te(a,5368,4);i=b;return}function wl(a,b){a=a|0;b=b|0;b=i;Fe(a,5376,km(5376)|0);i=b;return}function xl(a,b){a=a|0;b=b|0;b=i;te(a,5400,5);i=b;return}function yl(a,b){a=a|0;b=b|0;b=i;Fe(a,5408,km(5408)|0);i=b;return}function zl(b){b=b|0;var d=0;b=i;if((a[5440]|0)!=0){d=c[1358]|0;i=b;return d|0}if((Ga(5440)|0)==0){d=c[1358]|0;i=b;return d|0}do{if((a[12640]|0)==0){if((Ga(12640)|0)==0){break}jn(12472,0,168)|0;gc(122,0,q|0)|0;cb(12640)}}while(0);xe(12472,12648)|0;xe(12484|0,12656)|0;xe(12496|0,12664)|0;xe(12508|0,12672)|0;xe(12520|0,12688)|0;xe(12532|0,12704)|0;xe(12544|0,12712)|0;xe(12556|0,12728)|0;xe(12568|0,12736)|0;xe(12580|0,12744)|0;xe(12592|0,12752)|0;xe(12604|0,12760)|0;xe(12616|0,12768)|0;xe(12628|0,12776)|0;c[1358]=12472;cb(5440);d=c[1358]|0;i=b;return d|0}function Al(b){b=b|0;var d=0;b=i;if((a[5456]|0)!=0){d=c[1362]|0;i=b;return d|0}if((Ga(5456)|0)==0){d=c[1362]|0;i=b;return d|0}do{if((a[12104]|0)==0){if((Ga(12104)|0)==0){break}jn(11936,0,168)|0;gc(123,0,q|0)|0;cb(12104)}}while(0);Ie(11936,12112)|0;Ie(11948|0,12144)|0;Ie(11960|0,12176)|0;Ie(11972|0,12208)|0;Ie(11984|0,12248)|0;Ie(11996|0,12288)|0;Ie(12008|0,12320)|0;Ie(12020|0,12360)|0;Ie(12032|0,12376)|0;Ie(12044|0,12392)|0;Ie(12056|0,12408)|0;Ie(12068|0,12424)|0;Ie(12080|0,12440)|0;Ie(12092|0,12456)|0;c[1362]=11936;cb(5456);d=c[1362]|0;i=b;return d|0}function Bl(b){b=b|0;var d=0;b=i;if((a[5472]|0)!=0){d=c[1366]|0;i=b;return d|0}if((Ga(5472)|0)==0){d=c[1366]|0;i=b;return d|0}do{if((a[11712]|0)==0){if((Ga(11712)|0)==0){break}jn(11424,0,288)|0;gc(124,0,q|0)|0;cb(11712)}}while(0);xe(11424,11720)|0;xe(11436|0,11728)|0;xe(11448|0,11744)|0;xe(11460|0,11752)|0;xe(11472|0,11760)|0;xe(11484|0,11768)|0;xe(11496|0,11776)|0;xe(11508|0,11784)|0;xe(11520|0,11792)|0;xe(11532|0,11808)|0;xe(11544|0,11816)|0;xe(11556|0,11832)|0;xe(11568|0,11848)|0;xe(11580|0,11856)|0;xe(11592|0,11864)|0;xe(11604|0,11872)|0;xe(11616|0,11760)|0;xe(11628|0,11880)|0;xe(11640|0,11888)|0;xe(11652|0,11896)|0;xe(11664|0,11904)|0;xe(11676|0,11912)|0;xe(11688|0,11920)|0;xe(11700|0,11928)|0;c[1366]=11424;cb(5472);d=c[1366]|0;i=b;return d|0}function Cl(b){b=b|0;var d=0;b=i;if((a[5488]|0)!=0){d=c[1370]|0;i=b;return d|0}if((Ga(5488)|0)==0){d=c[1370]|0;i=b;return d|0}do{if((a[10872]|0)==0){if((Ga(10872)|0)==0){break}jn(10584,0,288)|0;gc(125,0,q|0)|0;cb(10872)}}while(0);Ie(10584,10880)|0;Ie(10596|0,10912)|0;Ie(10608|0,10952)|0;Ie(10620|0,10976)|0;Ie(10632|0,11296)|0;Ie(10644|0,11e3)|0;Ie(10656|0,11024)|0;Ie(10668|0,11048)|0;Ie(10680|0,11080)|0;Ie(10692|0,11120)|0;Ie(10704|0,11152)|0;Ie(10716|0,11192)|0;Ie(10728|0,11232)|0;Ie(10740|0,11248)|0;Ie(10752|0,11264)|0;Ie(10764|0,11280)|0;Ie(10776|0,11296)|0;Ie(10788|0,11312)|0;Ie(10800|0,11328)|0;Ie(10812|0,11344)|0;Ie(10824|0,11360)|0;Ie(10836|0,11376)|0;Ie(10848|0,11392)|0;Ie(10860|0,11408)|0;c[1370]=10584;cb(5488);d=c[1370]|0;i=b;return d|0}function Dl(b){b=b|0;var d=0;b=i;if((a[5504]|0)!=0){d=c[1374]|0;i=b;return d|0}if((Ga(5504)|0)==0){d=c[1374]|0;i=b;return d|0}do{if((a[10560]|0)==0){if((Ga(10560)|0)==0){break}jn(10272,0,288)|0;gc(126,0,q|0)|0;cb(10560)}}while(0);xe(10272,10568)|0;xe(10284|0,10576)|0;c[1374]=10272;cb(5504);d=c[1374]|0;i=b;return d|0}function El(b){b=b|0;var d=0;b=i;if((a[5520]|0)!=0){d=c[1378]|0;i=b;return d|0}if((Ga(5520)|0)==0){d=c[1378]|0;i=b;return d|0}do{if((a[10232]|0)==0){if((Ga(10232)|0)==0){break}jn(9944,0,288)|0;gc(127,0,q|0)|0;cb(10232)}}while(0);Ie(9944,10240)|0;Ie(9956|0,10256)|0;c[1378]=9944;cb(5520);d=c[1378]|0;i=b;return d|0}function Fl(b){b=b|0;b=i;do{if((a[5544]|0)==0){if((Ga(5544)|0)==0){break}te(5528,5552,8);gc(128,5528,q|0)|0;cb(5544)}}while(0);i=b;return 5528}function Gl(b){b=b|0;b=i;if((a[5584]|0)!=0){i=b;return 5568}if((Ga(5584)|0)==0){i=b;return 5568}Fe(5568,5592,km(5592)|0);gc(129,5568,q|0)|0;cb(5584);i=b;return 5568}function Hl(b){b=b|0;b=i;do{if((a[5648]|0)==0){if((Ga(5648)|0)==0){break}te(5632,5656,8);gc(128,5632,q|0)|0;cb(5648)}}while(0);i=b;return 5632}function Il(b){b=b|0;b=i;if((a[5688]|0)!=0){i=b;return 5672}if((Ga(5688)|0)==0){i=b;return 5672}Fe(5672,5696,km(5696)|0);gc(129,5672,q|0)|0;cb(5688);i=b;return 5672}function Jl(b){b=b|0;b=i;do{if((a[5752]|0)==0){if((Ga(5752)|0)==0){break}te(5736,5760,20);gc(128,5736,q|0)|0;cb(5752)}}while(0);i=b;return 5736}function Kl(b){b=b|0;b=i;if((a[5800]|0)!=0){i=b;return 5784}if((Ga(5800)|0)==0){i=b;return 5784}Fe(5784,5808,km(5808)|0);gc(129,5784,q|0)|0;cb(5800);i=b;return 5784}function Ll(b){b=b|0;b=i;do{if((a[5912]|0)==0){if((Ga(5912)|0)==0){break}te(5896,5920,11);gc(128,5896,q|0)|0;cb(5912)}}while(0);i=b;return 5896}function Ml(b){b=b|0;b=i;if((a[5952]|0)!=0){i=b;return 5936}if((Ga(5952)|0)==0){i=b;return 5936}Fe(5936,5960,km(5960)|0);gc(129,5936,q|0)|0;cb(5952);i=b;return 5936}function Nl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);l=+dn(b,g,c[1254]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=l;i=f;return+h}c[e>>2]=4;h=l;i=f;return+h}function Ol(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);l=+dn(b,g,c[1254]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=l;i=f;return+h}c[e>>2]=4;h=l;i=f;return+h}function Pl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+8|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);l=+dn(b,g,c[1254]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)==34){c[e>>2]=4}h=l;i=f;return+h}function Ql(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+8|0;h=g;do{if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0}else{if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=ac()|0;m=c[l>>2]|0;c[l>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);n=mb(b|0,h|0,f|0,c[1254]|0)|0;o=c[l>>2]|0;if((o|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)!=34){j=n;k=J;break}c[e>>2]=4;j=-1;k=-1}}while(0);J=k;i=g;return j|0}function Rl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);m=mb(b|0,h|0,f|0,c[1254]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Sl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);m=mb(b|0,h|0,f|0,c[1254]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Tl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);m=mb(b|0,h|0,f|0,c[1254]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>65535)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function Ul(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;J=k;i=g;return j|0}l=ac()|0;m=c[l>>2]|0;c[l>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);n=Wb(b|0,h|0,f|0,c[1254]|0)|0;f=J;b=c[l>>2]|0;if((b|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;J=k;i=g;return j|0}if((b|0)==34){c[e>>2]=4;e=(f|0)>0|(f|0)==0&n>>>0>0;J=e?2147483647:-2147483648;i=g;return(e?-1:0)|0}else{j=n;k=f;J=k;i=g;return j|0}return 0}function Vl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+8|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;do{if((a[5024]|0)==0){if((Ga(5024)|0)==0){break}c[1254]=fb(2147483647,5032,0)|0;cb(5024)}}while(0);m=Wb(b|0,h|0,f|0,c[1254]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}do{if((b|0)==34){c[e>>2]=4;if((f|0)>0|(f|0)==0&m>>>0>0){j=2147483647}else{break}i=g;return j|0}else{if((f|0)<-1|(f|0)==-1&m>>>0<2147483648){c[e>>2]=4;break}if((f|0)>0|(f|0)==0&m>>>0>2147483647){c[e>>2]=4;j=2147483647;i=g;return j|0}else{j=m;i=g;return j|0}}}while(0);j=-2147483648;i=g;return j|0}function Wl(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;b=i;e=a+4|0;f=e;g=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24;f=e+4|0;e=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24;f=(c[a>>2]|0)+(e>>1)|0;a=f;if((e&1|0)==0){h=g;mc[h&255](a);i=b;return}else{h=c[(c[f>>2]|0)+g>>2]|0;mc[h&255](a);i=b;return}}function Xl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=i;f=b+8|0;g=b+4|0;h=c[g>>2]|0;j=c[f>>2]|0;k=h;if(!(j-k>>2>>>0<d>>>0)){l=d;m=h;do{if((m|0)==0){n=0}else{c[m>>2]=0;n=c[g>>2]|0}m=n+4|0;c[g>>2]=m;l=l+ -1|0;}while((l|0)!=0);i=e;return}l=b+16|0;m=b;n=c[m>>2]|0;h=k-n>>2;k=h+d|0;if(k>>>0>1073741823){Rj(0)}o=j-n|0;do{if(o>>2>>>0<536870911){n=o>>1;j=n>>>0<k>>>0?k:n;if((j|0)==0){p=0;q=0;break}n=b+128|0;if(!((a[n]|0)==0&j>>>0<29)){r=j;s=11;break}a[n]=1;p=j;q=l}else{r=1073741823;s=11}}while(0);if((s|0)==11){p=r;q=Pm(r<<2)|0}r=d;d=q+(h<<2)|0;do{if((d|0)==0){t=0}else{c[d>>2]=0;t=d}d=t+4|0;r=r+ -1|0;}while((r|0)!=0);r=c[m>>2]|0;t=(c[g>>2]|0)-r|0;s=q+(h-(t>>2)<<2)|0;h=r;mn(s|0,h|0,t|0)|0;c[m>>2]=s;c[g>>2]=d;c[f>>2]=q+(p<<2);if((r|0)==0){i=e;return}if((l|0)==(r|0)){a[b+128|0]=0;i=e;return}else{Rm(h);i=e;return}}function Yl(a){a=a|0;a=i;He(10220|0);He(10208|0);He(10196|0);He(10184|0);He(10172|0);He(10160|0);He(10148|0);He(10136|0);He(10124|0);He(10112|0);He(10100|0);He(10088|0);He(10076|0);He(10064|0);He(10052|0);He(10040|0);He(10028|0);He(10016|0);He(10004|0);He(9992|0);He(9980|0);He(9968|0);He(9956|0);He(9944);i=a;return}function Zl(a){a=a|0;a=i;ve(10548|0);ve(10536|0);ve(10524|0);ve(10512|0);ve(10500|0);ve(10488|0);ve(10476|0);ve(10464|0);ve(10452|0);ve(10440|0);ve(10428|0);ve(10416|0);ve(10404|0);ve(10392|0);ve(10380|0);ve(10368|0);ve(10356|0);ve(10344|0);ve(10332|0);ve(10320|0);ve(10308|0);ve(10296|0);ve(10284|0);ve(10272);i=a;return}function _l(a){a=a|0;a=i;He(10860|0);He(10848|0);He(10836|0);He(10824|0);He(10812|0);He(10800|0);He(10788|0);He(10776|0);He(10764|0);He(10752|0);He(10740|0);He(10728|0);He(10716|0);He(10704|0);He(10692|0);He(10680|0);He(10668|0);He(10656|0);He(10644|0);He(10632|0);He(10620|0);He(10608|0);He(10596|0);He(10584);i=a;return}function $l(a){a=a|0;a=i;ve(11700|0);ve(11688|0);ve(11676|0);ve(11664|0);ve(11652|0);ve(11640|0);ve(11628|0);ve(11616|0);ve(11604|0);ve(11592|0);ve(11580|0);ve(11568|0);ve(11556|0);ve(11544|0);ve(11532|0);ve(11520|0);ve(11508|0);ve(11496|0);ve(11484|0);ve(11472|0);ve(11460|0);ve(11448|0);ve(11436|0);ve(11424);i=a;return}function am(a){a=a|0;a=i;He(12092|0);He(12080|0);He(12068|0);He(12056|0);He(12044|0);He(12032|0);He(12020|0);He(12008|0);He(11996|0);He(11984|0);He(11972|0);He(11960|0);He(11948|0);He(11936);i=a;return}function bm(a){a=a|0;a=i;ve(12628|0);ve(12616|0);ve(12604|0);ve(12592|0);ve(12580|0);ve(12568|0);ve(12556|0);ve(12544|0);ve(12532|0);ve(12520|0);ve(12508|0);ve(12496|0);ve(12484|0);ve(12472);i=a;return}function cm(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=dm(0,a,b,(c|0)!=0?c:12992)|0;i=d;return e|0}function dm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+8|0;h=g;c[h>>2]=b;j=(f|0)==0?13e3:f;f=c[j>>2]|0;a:do{if((d|0)==0){if((f|0)==0){k=0}else{break}i=g;return k|0}else{if((b|0)==0){l=h;c[h>>2]=l;m=l}else{m=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){l=a[d]|0;n=l&255;if(l<<24>>24>-1){c[m>>2]=n;k=l<<24>>24!=0|0;i=g;return k|0}else{l=n+ -194|0;if(l>>>0>50){break a}o=e+ -1|0;p=c[12784+(l<<2)>>2]|0;q=d+1|0;break}}else{o=e;p=f;q=d}}while(0);b:do{if((o|0)==0){r=p}else{l=a[q]|0;n=(l&255)>>>3;if((n+ -16|n+(p>>26))>>>0>7){break a}else{s=o;t=l;u=p;v=q}while(1){v=v+1|0;u=(t&255)+ -128|u<<6;s=s+ -1|0;if((u|0)>=0){break}if((s|0)==0){r=u;break b}t=a[v]|0;if(((t&255)+ -128|0)>>>0>63){break a}}c[j>>2]=0;c[m>>2]=u;k=e-s|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(ac()|0)>>2]=84;k=-1;i=g;return k|0}function em(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;g=i;i=i+1032|0;h=g+1024|0;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=g;m=k?e:256;e=k?a:l;a:do{if((j|0)==0|(m|0)==0){n=d;o=m;p=j;q=0;r=e}else{a=d;s=m;t=j;u=0;v=e;while(1){w=a>>>2;x=w>>>0>=s>>>0;if(!(x|a>>>0>131)){n=a;o=s;p=t;q=u;r=v;break a}y=x?s:w;z=a-y|0;w=fm(v,h,y,f)|0;if((w|0)==-1){break}if((v|0)==(l|0)){A=s;B=l}else{A=s-w|0;B=v+(w<<2)|0}y=w+u|0;w=c[h>>2]|0;if((w|0)==0|(A|0)==0){n=z;o=A;p=w;q=y;r=B;break a}else{a=z;s=A;t=w;u=y;v=B}}n=z;o=0;p=c[h>>2]|0;q=-1;r=v}}while(0);b:do{if((p|0)==0){C=q}else{if((o|0)==0|(n|0)==0){C=q;break}else{D=n;E=o;F=p;G=q;H=r}while(1){I=dm(H,F,D,f)|0;if((I+2|0)>>>0<3){break}z=(c[h>>2]|0)+I|0;c[h>>2]=z;B=E+ -1|0;A=G+1|0;if((B|0)==0|(D|0)==(I|0)){C=A;break b}else{D=D-I|0;E=B;F=z;G=A;H=H+4|0}}if((I|0)==0){c[h>>2]=0;C=G;break}else if((I|0)==-1){C=-1;break}else{c[f>>2]=0;C=G;break}}}while(0);if(!k){i=g;return C|0}c[b>>2]=c[h>>2];i=g;return C|0}function fm(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;h=i;j=c[e>>2]|0;do{if((g|0)==0){k=5}else{l=g;m=c[l>>2]|0;if((m|0)==0){k=5;break}if((b|0)==0){n=f;o=m;p=j;k=16;break}c[l>>2]=0;q=b;r=f;s=m;t=j;k=36}}while(0);if((k|0)==5){if((b|0)==0){u=f;v=j;k=7}else{w=b;x=f;y=j;k=6}}a:while(1){if((k|0)==6){k=0;if((x|0)==0){z=f;k=53;break}else{A=w;B=x;C=y}while(1){j=a[C]|0;do{if(((j&255)+ -1|0)>>>0<127){if((C&3|0)==0&B>>>0>3){D=A;E=B;F=C}else{G=A;H=B;I=j;J=C;break}while(1){K=c[F>>2]|0;if(((K+ -16843009|K)&-2139062144|0)!=0){k=30;break}c[D>>2]=K&255;c[D+4>>2]=d[F+1|0]|0;c[D+8>>2]=d[F+2|0]|0;L=F+4|0;M=D+16|0;c[D+12>>2]=d[F+3|0]|0;N=E+ -4|0;if(N>>>0>3){D=M;E=N;F=L}else{k=31;break}}if((k|0)==30){k=0;G=D;H=E;I=K&255;J=F;break}else if((k|0)==31){k=0;G=M;H=N;I=a[L]|0;J=L;break}}else{G=A;H=B;I=j;J=C}}while(0);O=I&255;if(!((O+ -1|0)>>>0<127)){break}c[G>>2]=O;j=H+ -1|0;if((j|0)==0){z=f;k=53;break a}else{A=G+4|0;B=j;C=J+1|0}}j=O+ -194|0;if(j>>>0>50){P=G;Q=H;R=J;k=47;break}q=G;r=H;s=c[12784+(j<<2)>>2]|0;t=J+1|0;k=36;continue}else if((k|0)==7){k=0;j=a[v]|0;do{if(((j&255)+ -1|0)>>>0<127){if((v&3|0)!=0){S=u;T=j;U=v;break}g=c[v>>2]|0;if(((g+ -16843009|g)&-2139062144|0)==0){m=u;l=v;while(1){V=l+4|0;W=m+ -4|0;X=c[V>>2]|0;if(((X+ -16843009|X)&-2139062144|0)==0){l=V;m=W}else{Y=W;Z=X;_=V;break}}}else{Y=u;Z=g;_=v}S=Y;T=Z&255;U=_}else{S=u;T=j;U=v}}while(0);j=T&255;if((j+ -1|0)>>>0<127){u=S+ -1|0;v=U+1|0;k=7;continue}m=j+ -194|0;if(m>>>0>50){P=b;Q=S;R=U;k=47;break}n=S;o=c[12784+(m<<2)>>2]|0;p=U+1|0;k=16;continue}else if((k|0)==16){k=0;m=(d[p]|0)>>>3;if((m+ -16|m+(o>>26))>>>0>7){k=17;break}m=p+1|0;do{if((o&33554432|0)==0){$=m}else{if(((d[m]|0)+ -128|0)>>>0>63){k=20;break a}j=p+2|0;if((o&524288|0)==0){$=j;break}if(((d[j]|0)+ -128|0)>>>0>63){k=23;break a}$=p+3|0}}while(0);u=n+ -1|0;v=$;k=7;continue}else if((k|0)==36){k=0;m=d[t]|0;j=m>>>3;if((j+ -16|j+(s>>26))>>>0>7){k=37;break}j=t+1|0;aa=m+ -128|s<<6;do{if((aa|0)<0){m=(d[j]|0)+ -128|0;if(m>>>0>63){k=40;break a}l=t+2|0;ba=m|aa<<6;if((ba|0)>=0){ca=ba;da=l;break}m=(d[l]|0)+ -128|0;if(m>>>0>63){k=43;break a}ca=m|ba<<6;da=t+3|0}else{ca=aa;da=j}}while(0);c[q>>2]=ca;w=q+4|0;x=r+ -1|0;y=da;k=6;continue}}if((k|0)==17){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==20){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==23){ea=b;fa=n;ga=o;ha=p+ -1|0;k=46}else if((k|0)==37){ea=q;fa=r;ga=s;ha=t+ -1|0;k=46}else if((k|0)==40){ea=q;fa=r;ga=aa;ha=t+ -1|0;k=46}else if((k|0)==43){ea=q;fa=r;ga=ba;ha=t+ -1|0;k=46}else if((k|0)==53){i=h;return z|0}if((k|0)==46){if((ga|0)==0){P=ea;Q=fa;R=ha;k=47}else{ia=ea;ja=ha}}do{if((k|0)==47){if((a[R]|0)!=0){ia=P;ja=R;break}if((P|0)!=0){c[P>>2]=0;c[e>>2]=0}z=f-Q|0;i=h;return z|0}}while(0);c[(ac()|0)>>2]=84;if((ia|0)==0){z=-1;i=h;return z|0}c[e>>2]=ja;z=-1;i=h;return z|0}function gm(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m+ -194|0;if(k>>>0>50){break}m=e+1|0;n=c[12784+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>((f*6|0)+ -6|0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m+ -16|m+(n>>26))>>>0>7){break}m=k+ -128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)+ -128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)+ -128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(ac()|0)>>2]=84;j=-1;i=g;return j|0}function hm(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((b|0)==0){f=1;i=e;return f|0}if(d>>>0<128){a[b]=d;f=1;i=e;return f|0}if(d>>>0<2048){a[b]=d>>>6|192;a[b+1|0]=d&63|128;f=2;i=e;return f|0}if(d>>>0<55296|(d+ -57344|0)>>>0<8192){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;f=3;i=e;return f|0}if((d+ -65536|0)>>>0<1048576){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;f=4;i=e;return f|0}else{c[(ac()|0)>>2]=84;f=-1;i=e;return f|0}return 0}function im(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+264|0;g=f+256|0;h=f;j=c[b>>2]|0;c[g>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:h;a:do{if((j|0)==0|(l|0)==0){m=d;n=l;o=j;p=0;q=e}else{a=d;r=l;s=j;t=0;u=e;while(1){v=a>>>0>=r>>>0;if(!(v|a>>>0>32)){m=a;n=r;o=s;p=t;q=u;break a}w=v?r:a;x=a-w|0;v=jm(u,g,w,0)|0;if((v|0)==-1){break}if((u|0)==(h|0)){y=r;z=h}else{y=r-v|0;z=u+v|0}w=v+t|0;v=c[g>>2]|0;if((v|0)==0|(y|0)==0){m=x;n=y;o=v;p=w;q=z;break a}else{a=x;r=y;s=v;t=w;u=z}}m=x;n=0;o=c[g>>2]|0;p=-1;q=u}}while(0);b:do{if((o|0)==0){A=p}else{if((n|0)==0|(m|0)==0){A=p;break}else{B=m;C=n;D=o;E=p;F=q}while(1){G=hm(F,c[D>>2]|0,0)|0;if((G+1|0)>>>0<2){break}x=(c[g>>2]|0)+4|0;c[g>>2]=x;z=B+ -1|0;y=E+1|0;if((C|0)==(G|0)|(z|0)==0){A=y;break b}else{B=z;C=C-G|0;D=x;E=y;F=F+G|0}}if((G|0)!=0){A=-1;break}c[g>>2]=0;A=E}}while(0);if(!k){i=f;return A|0}c[b>>2]=c[g>>2];i=f;return A|0}function jm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+8|0;g=f;if((b|0)==0){h=c[d>>2]|0;j=g;k=c[h>>2]|0;if((k|0)==0){l=0;i=f;return l|0}else{m=0;n=k;o=h}while(1){if(n>>>0>127){h=hm(j,n,0)|0;if((h|0)==-1){l=-1;p=26;break}else{q=h}}else{q=1}h=q+m|0;k=o+4|0;r=c[k>>2]|0;if((r|0)==0){l=h;p=26;break}else{m=h;n=r;o=k}}if((p|0)==26){i=f;return l|0}}a:do{if(e>>>0>3){o=b;n=e;m=c[d>>2]|0;while(1){q=c[m>>2]|0;if((q|0)==0){s=o;t=n;break a}if(q>>>0>127){j=hm(o,q,0)|0;if((j|0)==-1){l=-1;break}u=o+j|0;v=n-j|0;w=m}else{a[o]=q;u=o+1|0;v=n+ -1|0;w=c[d>>2]|0}q=w+4|0;c[d>>2]=q;if(v>>>0>3){o=u;n=v;m=q}else{s=u;t=v;break a}}i=f;return l|0}else{s=b;t=e}}while(0);b:do{if((t|0)==0){x=0}else{b=g;v=s;u=t;w=c[d>>2]|0;while(1){m=c[w>>2]|0;if((m|0)==0){p=24;break}if(m>>>0>127){n=hm(b,m,0)|0;if((n|0)==-1){l=-1;p=26;break}if(n>>>0>u>>>0){p=20;break}hm(v,c[w>>2]|0,0)|0;y=v+n|0;z=u-n|0;A=w}else{a[v]=m;y=v+1|0;z=u+ -1|0;A=c[d>>2]|0}m=A+4|0;c[d>>2]=m;if((z|0)==0){x=0;break b}else{v=y;u=z;w=m}}if((p|0)==20){l=e-u|0;i=f;return l|0}else if((p|0)==24){a[v]=0;x=u;break}else if((p|0)==26){i=f;return l|0}}}while(0);c[d>>2]=0;l=e-x|0;i=f;return l|0}function km(a){a=a|0;var b=0,d=0;b=i;d=a;while(1){if((c[d>>2]|0)==0){break}else{d=d+4|0}}i=b;return d-a>>2|0}function lm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;if((d|0)==0){i=e;return a|0}else{f=d;g=b;h=a}while(1){b=f+ -1|0;c[h>>2]=c[g>>2];if((b|0)==0){break}else{h=h+4|0;g=g+4|0;f=b}}i=e;return a|0}function mm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=(d|0)==0;do{if(a-b>>2>>>0<d>>>0){if(f){break}else{g=d}do{g=g+ -1|0;c[a+(g<<2)>>2]=c[b+(g<<2)>>2];}while((g|0)!=0)}else{if(f){break}else{h=b;j=a;k=d}while(1){l=k+ -1|0;c[j>>2]=c[h>>2];if((l|0)==0){break}else{k=l;j=j+4|0;h=h+4|0}}}}while(0);i=e;return a|0}function nm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;if((d|0)!=0){f=d;d=a;while(1){g=f+ -1|0;c[d>>2]=b;if((g|0)==0){break}else{d=d+4|0;f=g}}}i=e;return a|0}function om(a){a=a|0;i=i;return}function pm(a){a=a|0;c[a>>2]=13016;i=i;return}function qm(a){a=a|0;var b=0;b=i;Ta(a|0);Rm(a);i=b;return}function rm(a){a=a|0;var b=0;b=i;Ta(a|0);i=b;return}function sm(a){a=a|0;i=i;return 13032}function tm(a){a=a|0;i=i;return}function um(a){a=a|0;i=i;return}function vm(a){a=a|0;i=i;return}function wm(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function xm(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function ym(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function zm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+56|0;f=e;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=Dm(b,13144,13200,0)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}j=f+0|0;k=j+56|0;do{c[j>>2]=0;j=j+4|0}while((j|0)<(k|0));c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Ac[c[(c[h>>2]|0)+28>>2]&15](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function Am(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((c[d+8>>2]|0)!=(b|0)){i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function Bm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((b|0)!=(c[d+8>>2]|0)){h=c[b+8>>2]|0;Ac[c[(c[h>>2]|0)+28>>2]&15](h,d,e,f);i=g;return}h=d+16|0;b=c[h>>2]|0;if((b|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function Cm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;if((b|0)==(c[d+8>>2]|0)){h=d+16|0;j=c[h>>2]|0;if((j|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((j|0)!=(e|0)){j=d+36|0;c[j>>2]=(c[j>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}j=d+24|0;if((c[j>>2]|0)!=2){i=g;return}c[j>>2]=f;i=g;return}j=c[b+12>>2]|0;h=b+(j<<3)+16|0;k=c[b+20>>2]|0;l=k>>8;if((k&1|0)==0){m=l}else{m=c[(c[e>>2]|0)+l>>2]|0}l=c[b+16>>2]|0;Ac[c[(c[l>>2]|0)+28>>2]&15](l,d,e+m|0,(k&2|0)!=0?f:2);if((j|0)<=1){i=g;return}j=d+54|0;k=e;m=b+24|0;while(1){b=c[m+4>>2]|0;l=b>>8;if((b&1|0)==0){n=l}else{n=c[(c[k>>2]|0)+l>>2]|0}l=c[m>>2]|0;Ac[c[(c[l>>2]|0)+28>>2]&15](l,d,e+n|0,(b&2|0)!=0?f:2);if((a[j]|0)!=0){o=16;break}b=m+8|0;if(b>>>0<h>>>0){m=b}else{o=16;break}}if((o|0)==16){i=g;return}}function Dm(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;i=i+56|0;j=h;k=c[d>>2]|0;l=d+(c[k+ -8>>2]|0)|0;m=c[k+ -4>>2]|0;k=m;c[j>>2]=f;c[j+4>>2]=d;c[j+8>>2]=e;c[j+12>>2]=g;g=j+16|0;e=j+20|0;d=j+24|0;n=j+28|0;o=j+32|0;p=j+40|0;q=(m|0)==(f|0);f=g;r=f+0|0;s=r+36|0;do{c[r>>2]=0;r=r+4|0}while((r|0)<(s|0));b[f+36>>1]=0;a[f+38|0]=0;if(q){c[j+48>>2]=1;xc[c[(c[m>>2]|0)+20>>2]&31](k,j,l,l,1,0);t=(c[d>>2]|0)==1?l:0;i=h;return t|0}lc[c[(c[m>>2]|0)+24>>2]&3](k,j,l,1,0);l=c[j+36>>2]|0;if((l|0)==1){do{if((c[d>>2]|0)!=1){if((c[p>>2]|0)!=0){t=0;i=h;return t|0}if((c[n>>2]|0)!=1){t=0;i=h;return t|0}if((c[o>>2]|0)==1){break}else{t=0}i=h;return t|0}}while(0);t=c[g>>2]|0;i=h;return t|0}else if((l|0)==0){if((c[p>>2]|0)!=1){t=0;i=h;return t|0}if((c[n>>2]|0)!=1){t=0;i=h;return t|0}t=(c[o>>2]|0)==1?c[e>>2]|0:0;i=h;return t|0}else{t=0;i=h;return t|0}return 0}function Em(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;h=i;j=b;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}k=d+28|0;if((c[k>>2]|0)==1){i=h;return}c[k>>2]=f;i=h;return}if((j|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){j=d+20|0;if((c[j>>2]|0)==(e|0)){break}c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=c[b+12>>2]|0;m=b+(l<<3)+16|0;a:do{if((l|0)>0){n=d+52|0;o=d+53|0;p=d+54|0;q=b+8|0;r=d+24|0;s=e;t=0;u=0;v=b+16|0;b:while(1){a[n]=0;a[o]=0;w=c[v+4>>2]|0;x=w>>8;if((w&1|0)==0){y=x}else{y=c[(c[s>>2]|0)+x>>2]|0}x=c[v>>2]|0;xc[c[(c[x>>2]|0)+20>>2]&31](x,d,e,e+y|0,2-(w>>>1&1)|0,g);if((a[p]|0)!=0){z=t;A=u;break}do{if((a[o]|0)==0){B=t;C=u}else{if((a[n]|0)==0){if((c[q>>2]&1|0)==0){z=t;A=1;break b}else{B=t;C=1;break}}if((c[r>>2]|0)==1){D=27;break a}if((c[q>>2]&2|0)==0){D=27;break a}else{B=1;C=1}}}while(0);w=v+8|0;if(w>>>0<m>>>0){t=B;u=C;v=w}else{z=B;A=C;break}}if(z){E=A;D=26}else{F=A;D=23}}else{F=0;D=23}}while(0);do{if((D|0)==23){c[j>>2]=e;m=d+40|0;c[m>>2]=(c[m>>2]|0)+1;if((c[d+36>>2]|0)!=1){E=F;D=26;break}if((c[d+24>>2]|0)!=2){E=F;D=26;break}a[d+54|0]=1;if(F){D=27}else{D=28}}}while(0);if((D|0)==26){if(E){D=27}else{D=28}}if((D|0)==27){c[k>>2]=3;i=h;return}else if((D|0)==28){c[k>>2]=4;i=h;return}}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}E=c[b+12>>2]|0;F=b+(E<<3)+16|0;A=c[b+20>>2]|0;z=A>>8;if((A&1|0)==0){G=z}else{G=c[(c[e>>2]|0)+z>>2]|0}z=c[b+16>>2]|0;lc[c[(c[z>>2]|0)+24>>2]&3](z,d,e+G|0,(A&2|0)!=0?f:2,g);A=b+24|0;if((E|0)<=1){i=h;return}E=c[b+8>>2]|0;do{if((E&2|0)==0){b=d+36|0;if((c[b>>2]|0)==1){break}if((E&1|0)==0){G=d+54|0;z=e;C=A;while(1){if((a[G]|0)!=0){D=53;break}if((c[b>>2]|0)==1){D=53;break}B=c[C+4>>2]|0;y=B>>8;if((B&1|0)==0){H=y}else{H=c[(c[z>>2]|0)+y>>2]|0}y=c[C>>2]|0;lc[c[(c[y>>2]|0)+24>>2]&3](y,d,e+H|0,(B&2|0)!=0?f:2,g);B=C+8|0;if(B>>>0<F>>>0){C=B}else{D=53;break}}if((D|0)==53){i=h;return}}C=d+24|0;z=d+54|0;G=e;k=A;while(1){if((a[z]|0)!=0){D=53;break}if((c[b>>2]|0)==1){if((c[C>>2]|0)==1){D=53;break}}B=c[k+4>>2]|0;y=B>>8;if((B&1|0)==0){I=y}else{I=c[(c[G>>2]|0)+y>>2]|0}y=c[k>>2]|0;lc[c[(c[y>>2]|0)+24>>2]&3](y,d,e+I|0,(B&2|0)!=0?f:2,g);B=k+8|0;if(B>>>0<F>>>0){k=B}else{D=53;break}}if((D|0)==53){i=h;return}}}while(0);I=d+54|0;H=e;E=A;while(1){if((a[I]|0)!=0){D=53;break}A=c[E+4>>2]|0;k=A>>8;if((A&1|0)==0){J=k}else{J=c[(c[H>>2]|0)+k>>2]|0}k=c[E>>2]|0;lc[c[(c[k>>2]|0)+24>>2]&3](k,d,e+J|0,(A&2|0)!=0?f:2,g);A=E+8|0;if(A>>>0<F>>>0){E=A}else{D=53;break}}if((D|0)==53){i=h;return}}function Fm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;j=b;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}k=d+28|0;if((c[k>>2]|0)==1){i=h;return}c[k>>2]=f;i=h;return}if((j|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;lc[c[(c[j>>2]|0)+24>>2]&3](j,d,e,f,g);i=h;return}do{if((c[d+16>>2]|0)!=(e|0)){j=d+20|0;if((c[j>>2]|0)==(e|0)){break}c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=d+52|0;a[l]=0;m=d+53|0;a[m]=0;n=c[b+8>>2]|0;xc[c[(c[n>>2]|0)+20>>2]&31](n,d,e,e,1,g);if((a[m]|0)==0){o=0;p=13}else{if((a[l]|0)==0){o=1;p=13}}a:do{if((p|0)==13){c[j>>2]=e;l=d+40|0;c[l>>2]=(c[l>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){p=16;break}a[d+54|0]=1;if(o){break a}}else{p=16}}while(0);if((p|0)==16){if(o){break}}c[k>>2]=4;i=h;return}}while(0);c[k>>2]=3;i=h;return}}while(0);if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}function Gm(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;g=i;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){i=g;return}h=d+28|0;if((c[h>>2]|0)==1){i=g;return}c[h>>2]=f;i=g;return}if((c[d>>2]|0)!=(b|0)){i=g;return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;i=g;return}}while(0);if((f|0)!=1){i=g;return}c[d+32>>2]=1;i=g;return}function Hm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=d+52|0;l=a[k]|0;m=d+53|0;n=a[m]|0;o=c[b+12>>2]|0;p=b+(o<<3)+16|0;a[k]=0;a[m]=0;q=c[b+20>>2]|0;r=q>>8;if((q&1|0)==0){s=r}else{s=c[(c[f>>2]|0)+r>>2]|0}r=c[b+16>>2]|0;xc[c[(c[r>>2]|0)+20>>2]&31](r,d,e,f+s|0,(q&2|0)!=0?g:2,h);a:do{if((o|0)>1){q=d+24|0;s=b+8|0;r=d+54|0;t=f;u=b+24|0;do{if((a[r]|0)!=0){break a}do{if((a[k]|0)==0){if((a[m]|0)==0){break}if((c[s>>2]&1|0)==0){break a}}else{if((c[q>>2]|0)==1){break a}if((c[s>>2]&2|0)==0){break a}}}while(0);a[k]=0;a[m]=0;v=c[u+4>>2]|0;w=v>>8;if((v&1|0)==0){x=w}else{x=c[(c[t>>2]|0)+w>>2]|0}w=c[u>>2]|0;xc[c[(c[w>>2]|0)+20>>2]&31](w,d,e,f+x|0,(v&2|0)!=0?g:2,h);u=u+8|0;}while(u>>>0<p>>>0)}}while(0);a[k]=l;a[m]=n;i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;n=c[f>>2]|0;if((n|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((n|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;n=c[e>>2]|0;if((n|0)==2){c[e>>2]=g;y=g}else{y=n}if(!((c[d+48>>2]|0)==1&(y|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Im(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=c[b+8>>2]|0;xc[c[(c[k>>2]|0)+20>>2]&31](k,d,e,f,g,h);i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;l=g}else{l=h}if(!((c[d+48>>2]|0)==1&(l|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Jm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;h=i;if((c[d+8>>2]|0)!=(b|0)){i=h;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=h;return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=h;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;j=g}else{j=b}if(!((c[d+48>>2]|0)==1&(j|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}



function Km(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,Ma=0,Na=0,Pa=0;b=i;do{if(a>>>0<245){if(a>>>0<11){d=16}else{d=a+11&-8}e=d>>>3;f=c[3362]|0;g=f>>>e;if((g&3|0)!=0){h=(g&1^1)+e|0;j=h<<1;k=13488+(j<<2)|0;l=13488+(j+2<<2)|0;j=c[l>>2]|0;m=j+8|0;n=c[m>>2]|0;do{if((k|0)==(n|0)){c[3362]=f&~(1<<h)}else{if(n>>>0<(c[13464>>2]|0)>>>0){Mb()}o=n+12|0;if((c[o>>2]|0)==(j|0)){c[o>>2]=k;c[l>>2]=n;break}else{Mb()}}}while(0);n=h<<3;c[j+4>>2]=n|3;l=j+(n|4)|0;c[l>>2]=c[l>>2]|1;p=m;i=b;return p|0}if(!(d>>>0>(c[13456>>2]|0)>>>0)){q=d;break}if((g|0)!=0){l=2<<e;n=g<<e&(l|0-l);l=(n&0-n)+ -1|0;n=l>>>12&16;k=l>>>n;l=k>>>5&8;o=k>>>l;k=o>>>2&4;r=o>>>k;o=r>>>1&2;s=r>>>o;r=s>>>1&1;t=(l|n|k|o|r)+(s>>>r)|0;r=t<<1;s=13488+(r<<2)|0;o=13488+(r+2<<2)|0;r=c[o>>2]|0;k=r+8|0;n=c[k>>2]|0;do{if((s|0)==(n|0)){c[3362]=f&~(1<<t)}else{if(n>>>0<(c[13464>>2]|0)>>>0){Mb()}l=n+12|0;if((c[l>>2]|0)==(r|0)){c[l>>2]=s;c[o>>2]=n;break}else{Mb()}}}while(0);n=t<<3;o=n-d|0;c[r+4>>2]=d|3;s=r;f=s+d|0;c[s+(d|4)>>2]=o|1;c[s+n>>2]=o;n=c[13456>>2]|0;if((n|0)!=0){s=c[13468>>2]|0;e=n>>>3;n=e<<1;g=13488+(n<<2)|0;m=c[3362]|0;j=1<<e;do{if((m&j|0)==0){c[3362]=m|j;u=13488+(n+2<<2)|0;v=g}else{e=13488+(n+2<<2)|0;h=c[e>>2]|0;if(!(h>>>0<(c[13464>>2]|0)>>>0)){u=e;v=h;break}Mb()}}while(0);c[u>>2]=s;c[v+12>>2]=s;c[s+8>>2]=v;c[s+12>>2]=g}c[13456>>2]=o;c[13468>>2]=f;p=k;i=b;return p|0}n=c[13452>>2]|0;if((n|0)==0){q=d;break}j=(n&0-n)+ -1|0;n=j>>>12&16;m=j>>>n;j=m>>>5&8;r=m>>>j;m=r>>>2&4;t=r>>>m;r=t>>>1&2;h=t>>>r;t=h>>>1&1;e=c[13752+((j|n|m|r|t)+(h>>>t)<<2)>>2]|0;t=(c[e+4>>2]&-8)-d|0;h=e;r=e;while(1){e=c[h+16>>2]|0;if((e|0)==0){m=c[h+20>>2]|0;if((m|0)==0){break}else{w=m}}else{w=e}e=(c[w+4>>2]&-8)-d|0;m=e>>>0<t>>>0;t=m?e:t;h=w;r=m?w:r}h=r;k=c[13464>>2]|0;if(h>>>0<k>>>0){Mb()}f=h+d|0;o=f;if(!(h>>>0<f>>>0)){Mb()}f=c[r+24>>2]|0;g=c[r+12>>2]|0;do{if((g|0)==(r|0)){s=r+20|0;m=c[s>>2]|0;if((m|0)==0){e=r+16|0;n=c[e>>2]|0;if((n|0)==0){x=0;break}else{y=n;z=e}}else{y=m;z=s}while(1){s=y+20|0;m=c[s>>2]|0;if((m|0)!=0){z=s;y=m;continue}m=y+16|0;s=c[m>>2]|0;if((s|0)==0){break}else{y=s;z=m}}if(z>>>0<k>>>0){Mb()}else{c[z>>2]=0;x=y;break}}else{m=c[r+8>>2]|0;if(m>>>0<k>>>0){Mb()}s=m+12|0;if((c[s>>2]|0)!=(r|0)){Mb()}e=g+8|0;if((c[e>>2]|0)==(r|0)){c[s>>2]=g;c[e>>2]=m;x=g;break}else{Mb()}}}while(0);a:do{if((f|0)!=0){g=c[r+28>>2]|0;k=13752+(g<<2)|0;do{if((r|0)==(c[k>>2]|0)){c[k>>2]=x;if((x|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<g);break a}else{if(f>>>0<(c[13464>>2]|0)>>>0){Mb()}m=f+16|0;if((c[m>>2]|0)==(r|0)){c[m>>2]=x}else{c[f+20>>2]=x}if((x|0)==0){break a}}}while(0);if(x>>>0<(c[13464>>2]|0)>>>0){Mb()}c[x+24>>2]=f;g=c[r+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[x+16>>2]=g;c[g+24>>2]=x;break}}}while(0);g=c[r+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[x+20>>2]=g;c[g+24>>2]=x;break}}}while(0);if(t>>>0<16){f=t+d|0;c[r+4>>2]=f|3;g=h+(f+4)|0;c[g>>2]=c[g>>2]|1}else{c[r+4>>2]=d|3;c[h+(d|4)>>2]=t|1;c[h+(t+d)>>2]=t;g=c[13456>>2]|0;if((g|0)!=0){f=c[13468>>2]|0;k=g>>>3;g=k<<1;m=13488+(g<<2)|0;e=c[3362]|0;s=1<<k;do{if((e&s|0)==0){c[3362]=e|s;A=13488+(g+2<<2)|0;B=m}else{k=13488+(g+2<<2)|0;n=c[k>>2]|0;if(!(n>>>0<(c[13464>>2]|0)>>>0)){A=k;B=n;break}Mb()}}while(0);c[A>>2]=f;c[B+12>>2]=f;c[f+8>>2]=B;c[f+12>>2]=m}c[13456>>2]=t;c[13468>>2]=o}p=r+8|0;i=b;return p|0}else{if(a>>>0>4294967231){q=-1;break}g=a+11|0;s=g&-8;e=c[13452>>2]|0;if((e|0)==0){q=s;break}h=0-s|0;n=g>>>8;do{if((n|0)==0){C=0}else{if(s>>>0>16777215){C=31;break}g=(n+1048320|0)>>>16&8;k=n<<g;j=(k+520192|0)>>>16&4;l=k<<j;k=(l+245760|0)>>>16&2;D=14-(j|g|k)+(l<<k>>>15)|0;C=s>>>(D+7|0)&1|D<<1}}while(0);n=c[13752+(C<<2)>>2]|0;b:do{if((n|0)==0){E=h;F=0;G=0}else{if((C|0)==31){H=0}else{H=25-(C>>>1)|0}r=h;o=0;t=s<<H;m=n;f=0;while(1){D=c[m+4>>2]&-8;k=D-s|0;if(k>>>0<r>>>0){if((D|0)==(s|0)){E=k;F=m;G=m;break b}else{I=k;J=m}}else{I=r;J=f}k=c[m+20>>2]|0;D=c[m+(t>>>31<<2)+16>>2]|0;l=(k|0)==0|(k|0)==(D|0)?o:k;if((D|0)==0){E=I;F=l;G=J;break}else{r=I;o=l;t=t<<1;m=D;f=J}}}}while(0);if((F|0)==0&(G|0)==0){n=2<<C;h=e&(n|0-n);if((h|0)==0){q=s;break}n=(h&0-h)+ -1|0;h=n>>>12&16;f=n>>>h;n=f>>>5&8;m=f>>>n;f=m>>>2&4;t=m>>>f;m=t>>>1&2;o=t>>>m;t=o>>>1&1;K=c[13752+((n|h|f|m|t)+(o>>>t)<<2)>>2]|0}else{K=F}if((K|0)==0){L=E;M=G}else{t=E;o=K;m=G;while(1){f=(c[o+4>>2]&-8)-s|0;h=f>>>0<t>>>0;n=h?f:t;f=h?o:m;h=c[o+16>>2]|0;if((h|0)!=0){N=f;O=n;m=N;o=h;t=O;continue}h=c[o+20>>2]|0;if((h|0)==0){L=n;M=f;break}else{N=f;O=n;o=h;m=N;t=O}}}if((M|0)==0){q=s;break}if(!(L>>>0<((c[13456>>2]|0)-s|0)>>>0)){q=s;break}t=M;m=c[13464>>2]|0;if(t>>>0<m>>>0){Mb()}o=t+s|0;e=o;if(!(t>>>0<o>>>0)){Mb()}h=c[M+24>>2]|0;n=c[M+12>>2]|0;do{if((n|0)==(M|0)){f=M+20|0;r=c[f>>2]|0;if((r|0)==0){D=M+16|0;l=c[D>>2]|0;if((l|0)==0){P=0;break}else{Q=l;R=D}}else{Q=r;R=f}while(1){f=Q+20|0;r=c[f>>2]|0;if((r|0)!=0){R=f;Q=r;continue}r=Q+16|0;f=c[r>>2]|0;if((f|0)==0){break}else{Q=f;R=r}}if(R>>>0<m>>>0){Mb()}else{c[R>>2]=0;P=Q;break}}else{r=c[M+8>>2]|0;if(r>>>0<m>>>0){Mb()}f=r+12|0;if((c[f>>2]|0)!=(M|0)){Mb()}D=n+8|0;if((c[D>>2]|0)==(M|0)){c[f>>2]=n;c[D>>2]=r;P=n;break}else{Mb()}}}while(0);c:do{if((h|0)!=0){n=c[M+28>>2]|0;m=13752+(n<<2)|0;do{if((M|0)==(c[m>>2]|0)){c[m>>2]=P;if((P|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<n);break c}else{if(h>>>0<(c[13464>>2]|0)>>>0){Mb()}r=h+16|0;if((c[r>>2]|0)==(M|0)){c[r>>2]=P}else{c[h+20>>2]=P}if((P|0)==0){break c}}}while(0);if(P>>>0<(c[13464>>2]|0)>>>0){Mb()}c[P+24>>2]=h;n=c[M+16>>2]|0;do{if((n|0)!=0){if(n>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[P+16>>2]=n;c[n+24>>2]=P;break}}}while(0);n=c[M+20>>2]|0;if((n|0)==0){break}if(n>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[P+20>>2]=n;c[n+24>>2]=P;break}}}while(0);d:do{if(L>>>0<16){h=L+s|0;c[M+4>>2]=h|3;n=t+(h+4)|0;c[n>>2]=c[n>>2]|1}else{c[M+4>>2]=s|3;c[t+(s|4)>>2]=L|1;c[t+(L+s)>>2]=L;n=L>>>3;if(L>>>0<256){h=n<<1;m=13488+(h<<2)|0;r=c[3362]|0;D=1<<n;do{if((r&D|0)==0){c[3362]=r|D;S=13488+(h+2<<2)|0;T=m}else{n=13488+(h+2<<2)|0;f=c[n>>2]|0;if(!(f>>>0<(c[13464>>2]|0)>>>0)){S=n;T=f;break}Mb()}}while(0);c[S>>2]=e;c[T+12>>2]=e;c[t+(s+8)>>2]=T;c[t+(s+12)>>2]=m;break}h=o;D=L>>>8;do{if((D|0)==0){U=0}else{if(L>>>0>16777215){U=31;break}r=(D+1048320|0)>>>16&8;f=D<<r;n=(f+520192|0)>>>16&4;l=f<<n;f=(l+245760|0)>>>16&2;k=14-(n|r|f)+(l<<f>>>15)|0;U=L>>>(k+7|0)&1|k<<1}}while(0);D=13752+(U<<2)|0;c[t+(s+28)>>2]=U;c[t+(s+20)>>2]=0;c[t+(s+16)>>2]=0;m=c[13452>>2]|0;k=1<<U;if((m&k|0)==0){c[13452>>2]=m|k;c[D>>2]=h;c[t+(s+24)>>2]=D;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break}k=c[D>>2]|0;if((U|0)==31){V=0}else{V=25-(U>>>1)|0}e:do{if((c[k+4>>2]&-8|0)==(L|0)){W=k}else{D=L<<V;m=k;while(1){X=m+(D>>>31<<2)+16|0;f=c[X>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(L|0)){W=f;break e}else{D=D<<1;m=f}}if(X>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[X>>2]=h;c[t+(s+24)>>2]=m;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break d}}}while(0);k=W+8|0;D=c[k>>2]|0;f=c[13464>>2]|0;if(W>>>0<f>>>0){Mb()}if(D>>>0<f>>>0){Mb()}else{c[D+12>>2]=h;c[k>>2]=h;c[t+(s+8)>>2]=D;c[t+(s+12)>>2]=W;c[t+(s+24)>>2]=0;break}}}while(0);p=M+8|0;i=b;return p|0}}while(0);M=c[13456>>2]|0;if(!(q>>>0>M>>>0)){W=M-q|0;X=c[13468>>2]|0;if(W>>>0>15){L=X;c[13468>>2]=L+q;c[13456>>2]=W;c[L+(q+4)>>2]=W|1;c[L+M>>2]=W;c[X+4>>2]=q|3}else{c[13456>>2]=0;c[13468>>2]=0;c[X+4>>2]=M|3;W=X+(M+4)|0;c[W>>2]=c[W>>2]|1}p=X+8|0;i=b;return p|0}X=c[13460>>2]|0;if(q>>>0<X>>>0){W=X-q|0;c[13460>>2]=W;X=c[13472>>2]|0;M=X;c[13472>>2]=M+q;c[M+(q+4)>>2]=W|1;c[X+4>>2]=q|3;p=X+8|0;i=b;return p|0}do{if((c[3480]|0)==0){X=Oa(30)|0;if((X+ -1&X|0)==0){c[13928>>2]=X;c[13924>>2]=X;c[13932>>2]=-1;c[13936>>2]=-1;c[13940>>2]=0;c[13892>>2]=0;c[3480]=(pb(0)|0)&-16^1431655768;break}else{Mb()}}}while(0);X=q+48|0;W=c[13928>>2]|0;M=q+47|0;L=W+M|0;V=0-W|0;W=L&V;if(!(W>>>0>q>>>0)){p=0;i=b;return p|0}U=c[13888>>2]|0;do{if((U|0)!=0){T=c[13880>>2]|0;S=T+W|0;if(S>>>0<=T>>>0|S>>>0>U>>>0){p=0}else{break}i=b;return p|0}}while(0);f:do{if((c[13892>>2]&4|0)==0){U=c[13472>>2]|0;g:do{if((U|0)==0){Y=182}else{S=U;T=13896|0;while(1){Z=T;P=c[Z>>2]|0;if(!(P>>>0>S>>>0)){_=T+4|0;if((P+(c[_>>2]|0)|0)>>>0>S>>>0){break}}P=c[T+8>>2]|0;if((P|0)==0){Y=182;break g}else{T=P}}if((T|0)==0){Y=182;break}S=L-(c[13460>>2]|0)&V;if(!(S>>>0<2147483647)){$=0;break}h=La(S|0)|0;P=(h|0)==((c[Z>>2]|0)+(c[_>>2]|0)|0);aa=h;ba=S;ca=P?h:-1;da=P?S:0;Y=191}}while(0);do{if((Y|0)==182){U=La(0)|0;if((U|0)==(-1|0)){$=0;break}S=U;P=c[13924>>2]|0;h=P+ -1|0;if((h&S|0)==0){ea=W}else{ea=W-S+(h+S&0-P)|0}P=c[13880>>2]|0;S=P+ea|0;if(!(ea>>>0>q>>>0&ea>>>0<2147483647)){$=0;break}h=c[13888>>2]|0;if((h|0)!=0){if(S>>>0<=P>>>0|S>>>0>h>>>0){$=0;break}}h=La(ea|0)|0;S=(h|0)==(U|0);aa=h;ba=ea;ca=S?U:-1;da=S?ea:0;Y=191}}while(0);h:do{if((Y|0)==191){S=0-ba|0;if((ca|0)!=(-1|0)){fa=ca;ga=da;Y=202;break f}do{if((aa|0)!=(-1|0)&ba>>>0<2147483647&ba>>>0<X>>>0){U=c[13928>>2]|0;h=M-ba+U&0-U;if(!(h>>>0<2147483647)){ha=ba;break}if((La(h|0)|0)==(-1|0)){La(S|0)|0;$=da;break h}else{ha=h+ba|0;break}}else{ha=ba}}while(0);if((aa|0)==(-1|0)){$=da}else{fa=aa;ga=ha;Y=202;break f}}}while(0);c[13892>>2]=c[13892>>2]|4;ia=$;Y=199}else{ia=0;Y=199}}while(0);do{if((Y|0)==199){if(!(W>>>0<2147483647)){break}$=La(W|0)|0;ha=La(0)|0;if(!((ha|0)!=(-1|0)&($|0)!=(-1|0)&$>>>0<ha>>>0)){break}aa=ha-$|0;ha=aa>>>0>(q+40|0)>>>0;if(ha){fa=$;ga=ha?aa:ia;Y=202}}}while(0);do{if((Y|0)==202){ia=(c[13880>>2]|0)+ga|0;c[13880>>2]=ia;if(ia>>>0>(c[13884>>2]|0)>>>0){c[13884>>2]=ia}ia=c[13472>>2]|0;i:do{if((ia|0)==0){W=c[13464>>2]|0;if((W|0)==0|fa>>>0<W>>>0){c[13464>>2]=fa}c[13896>>2]=fa;c[13900>>2]=ga;c[13908>>2]=0;c[13484>>2]=c[3480];c[13480>>2]=-1;W=0;do{aa=W<<1;ha=13488+(aa<<2)|0;c[13488+(aa+3<<2)>>2]=ha;c[13488+(aa+2<<2)>>2]=ha;W=W+1|0;}while((W|0)!=32);W=fa+8|0;if((W&7|0)==0){ja=0}else{ja=0-W&7}W=ga+ -40-ja|0;c[13472>>2]=fa+ja;c[13460>>2]=W;c[fa+(ja+4)>>2]=W|1;c[fa+(ga+ -36)>>2]=40;c[13476>>2]=c[13936>>2]}else{W=13896|0;while(1){ka=c[W>>2]|0;la=W+4|0;ma=c[la>>2]|0;if((fa|0)==(ka+ma|0)){Y=214;break}ha=c[W+8>>2]|0;if((ha|0)==0){break}else{W=ha}}do{if((Y|0)==214){if((c[W+12>>2]&8|0)!=0){break}ha=ia;if(!(ha>>>0>=ka>>>0&ha>>>0<fa>>>0)){break}c[la>>2]=ma+ga;aa=(c[13460>>2]|0)+ga|0;$=ia+8|0;if(($&7|0)==0){na=0}else{na=0-$&7}$=aa-na|0;c[13472>>2]=ha+na;c[13460>>2]=$;c[ha+(na+4)>>2]=$|1;c[ha+(aa+4)>>2]=40;c[13476>>2]=c[13936>>2];break i}}while(0);if(fa>>>0<(c[13464>>2]|0)>>>0){c[13464>>2]=fa}W=fa+ga|0;aa=13896|0;while(1){oa=aa;if((c[oa>>2]|0)==(W|0)){Y=224;break}ha=c[aa+8>>2]|0;if((ha|0)==0){break}else{aa=ha}}do{if((Y|0)==224){if((c[aa+12>>2]&8|0)!=0){break}c[oa>>2]=fa;W=aa+4|0;c[W>>2]=(c[W>>2]|0)+ga;W=fa+8|0;if((W&7|0)==0){pa=0}else{pa=0-W&7}W=fa+(ga+8)|0;if((W&7|0)==0){qa=0}else{qa=0-W&7}W=fa+(qa+ga)|0;ha=W;$=pa+q|0;da=fa+$|0;ba=da;M=W-(fa+pa)-q|0;c[fa+(pa+4)>>2]=q|3;j:do{if((ha|0)==(c[13472>>2]|0)){X=(c[13460>>2]|0)+M|0;c[13460>>2]=X;c[13472>>2]=ba;c[fa+($+4)>>2]=X|1}else{if((ha|0)==(c[13468>>2]|0)){X=(c[13456>>2]|0)+M|0;c[13456>>2]=X;c[13468>>2]=ba;c[fa+($+4)>>2]=X|1;c[fa+(X+$)>>2]=X;break}X=ga+4|0;ca=c[fa+(X+qa)>>2]|0;if((ca&3|0)==1){ea=ca&-8;_=ca>>>3;k:do{if(ca>>>0<256){Z=c[fa+((qa|8)+ga)>>2]|0;V=c[fa+(ga+12+qa)>>2]|0;L=13488+(_<<1<<2)|0;do{if((Z|0)!=(L|0)){if(Z>>>0<(c[13464>>2]|0)>>>0){Mb()}if((c[Z+12>>2]|0)==(ha|0)){break}Mb()}}while(0);if((V|0)==(Z|0)){c[3362]=c[3362]&~(1<<_);break}do{if((V|0)==(L|0)){ra=V+8|0}else{if(V>>>0<(c[13464>>2]|0)>>>0){Mb()}S=V+8|0;if((c[S>>2]|0)==(ha|0)){ra=S;break}Mb()}}while(0);c[Z+12>>2]=V;c[ra>>2]=Z}else{L=W;S=c[fa+((qa|24)+ga)>>2]|0;T=c[fa+(ga+12+qa)>>2]|0;do{if((T|0)==(L|0)){h=qa|16;U=fa+(X+h)|0;P=c[U>>2]|0;if((P|0)==0){Q=fa+(h+ga)|0;h=c[Q>>2]|0;if((h|0)==0){sa=0;break}else{ta=h;ua=Q}}else{ta=P;ua=U}while(1){U=ta+20|0;P=c[U>>2]|0;if((P|0)!=0){ua=U;ta=P;continue}P=ta+16|0;U=c[P>>2]|0;if((U|0)==0){break}else{ta=U;ua=P}}if(ua>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[ua>>2]=0;sa=ta;break}}else{P=c[fa+((qa|8)+ga)>>2]|0;if(P>>>0<(c[13464>>2]|0)>>>0){Mb()}U=P+12|0;if((c[U>>2]|0)!=(L|0)){Mb()}Q=T+8|0;if((c[Q>>2]|0)==(L|0)){c[U>>2]=T;c[Q>>2]=P;sa=T;break}else{Mb()}}}while(0);if((S|0)==0){break}T=c[fa+(ga+28+qa)>>2]|0;Z=13752+(T<<2)|0;do{if((L|0)==(c[Z>>2]|0)){c[Z>>2]=sa;if((sa|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<T);break k}else{if(S>>>0<(c[13464>>2]|0)>>>0){Mb()}V=S+16|0;if((c[V>>2]|0)==(L|0)){c[V>>2]=sa}else{c[S+20>>2]=sa}if((sa|0)==0){break k}}}while(0);if(sa>>>0<(c[13464>>2]|0)>>>0){Mb()}c[sa+24>>2]=S;L=qa|16;T=c[fa+(L+ga)>>2]|0;do{if((T|0)!=0){if(T>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[sa+16>>2]=T;c[T+24>>2]=sa;break}}}while(0);T=c[fa+(X+L)>>2]|0;if((T|0)==0){break}if(T>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[sa+20>>2]=T;c[T+24>>2]=sa;break}}}while(0);va=fa+((ea|qa)+ga)|0;wa=ea+M|0}else{va=ha;wa=M}X=va+4|0;c[X>>2]=c[X>>2]&-2;c[fa+($+4)>>2]=wa|1;c[fa+(wa+$)>>2]=wa;X=wa>>>3;if(wa>>>0<256){_=X<<1;ca=13488+(_<<2)|0;T=c[3362]|0;S=1<<X;do{if((T&S|0)==0){c[3362]=T|S;xa=13488+(_+2<<2)|0;ya=ca}else{X=13488+(_+2<<2)|0;Z=c[X>>2]|0;if(!(Z>>>0<(c[13464>>2]|0)>>>0)){xa=X;ya=Z;break}Mb()}}while(0);c[xa>>2]=ba;c[ya+12>>2]=ba;c[fa+($+8)>>2]=ya;c[fa+($+12)>>2]=ca;break}_=da;S=wa>>>8;do{if((S|0)==0){za=0}else{if(wa>>>0>16777215){za=31;break}T=(S+1048320|0)>>>16&8;ea=S<<T;Z=(ea+520192|0)>>>16&4;X=ea<<Z;ea=(X+245760|0)>>>16&2;V=14-(Z|T|ea)+(X<<ea>>>15)|0;za=wa>>>(V+7|0)&1|V<<1}}while(0);S=13752+(za<<2)|0;c[fa+($+28)>>2]=za;c[fa+($+20)>>2]=0;c[fa+($+16)>>2]=0;ca=c[13452>>2]|0;V=1<<za;if((ca&V|0)==0){c[13452>>2]=ca|V;c[S>>2]=_;c[fa+($+24)>>2]=S;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break}V=c[S>>2]|0;if((za|0)==31){Aa=0}else{Aa=25-(za>>>1)|0}l:do{if((c[V+4>>2]&-8|0)==(wa|0)){Ba=V}else{S=wa<<Aa;ca=V;while(1){Ca=ca+(S>>>31<<2)+16|0;ea=c[Ca>>2]|0;if((ea|0)==0){break}if((c[ea+4>>2]&-8|0)==(wa|0)){Ba=ea;break l}else{S=S<<1;ca=ea}}if(Ca>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[Ca>>2]=_;c[fa+($+24)>>2]=ca;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break j}}}while(0);V=Ba+8|0;S=c[V>>2]|0;L=c[13464>>2]|0;if(Ba>>>0<L>>>0){Mb()}if(S>>>0<L>>>0){Mb()}else{c[S+12>>2]=_;c[V>>2]=_;c[fa+($+8)>>2]=S;c[fa+($+12)>>2]=Ba;c[fa+($+24)>>2]=0;break}}}while(0);p=fa+(pa|8)|0;i=b;return p|0}}while(0);aa=ia;$=13896|0;while(1){Da=c[$>>2]|0;if(!(Da>>>0>aa>>>0)){Ea=c[$+4>>2]|0;Fa=Da+Ea|0;if(Fa>>>0>aa>>>0){break}}$=c[$+8>>2]|0}$=Da+(Ea+ -39)|0;if(($&7|0)==0){Ga=0}else{Ga=0-$&7}$=Da+(Ea+ -47+Ga)|0;da=$>>>0<(ia+16|0)>>>0?aa:$;$=da+8|0;ba=$;M=fa+8|0;if((M&7|0)==0){Ha=0}else{Ha=0-M&7}M=ga+ -40-Ha|0;c[13472>>2]=fa+Ha;c[13460>>2]=M;c[fa+(Ha+4)>>2]=M|1;c[fa+(ga+ -36)>>2]=40;c[13476>>2]=c[13936>>2];c[da+4>>2]=27;c[$+0>>2]=c[13896>>2];c[$+4>>2]=c[13900>>2];c[$+8>>2]=c[13904>>2];c[$+12>>2]=c[13908>>2];c[13896>>2]=fa;c[13900>>2]=ga;c[13908>>2]=0;c[13904>>2]=ba;ba=da+28|0;c[ba>>2]=7;if((da+32|0)>>>0<Fa>>>0){$=ba;while(1){ba=$+4|0;c[ba>>2]=7;if(($+8|0)>>>0<Fa>>>0){$=ba}else{break}}}if((da|0)==(aa|0)){break}$=da-ia|0;ba=aa+($+4)|0;c[ba>>2]=c[ba>>2]&-2;c[ia+4>>2]=$|1;c[aa+$>>2]=$;ba=$>>>3;if($>>>0<256){M=ba<<1;ha=13488+(M<<2)|0;W=c[3362]|0;m=1<<ba;do{if((W&m|0)==0){c[3362]=W|m;Ia=13488+(M+2<<2)|0;Ja=ha}else{ba=13488+(M+2<<2)|0;S=c[ba>>2]|0;if(!(S>>>0<(c[13464>>2]|0)>>>0)){Ia=ba;Ja=S;break}Mb()}}while(0);c[Ia>>2]=ia;c[Ja+12>>2]=ia;c[ia+8>>2]=Ja;c[ia+12>>2]=ha;break}M=ia;m=$>>>8;do{if((m|0)==0){Ka=0}else{if($>>>0>16777215){Ka=31;break}W=(m+1048320|0)>>>16&8;aa=m<<W;da=(aa+520192|0)>>>16&4;S=aa<<da;aa=(S+245760|0)>>>16&2;ba=14-(da|W|aa)+(S<<aa>>>15)|0;Ka=$>>>(ba+7|0)&1|ba<<1}}while(0);m=13752+(Ka<<2)|0;c[ia+28>>2]=Ka;c[ia+20>>2]=0;c[ia+16>>2]=0;ha=c[13452>>2]|0;ba=1<<Ka;if((ha&ba|0)==0){c[13452>>2]=ha|ba;c[m>>2]=M;c[ia+24>>2]=m;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break}ba=c[m>>2]|0;if((Ka|0)==31){Ma=0}else{Ma=25-(Ka>>>1)|0}m:do{if((c[ba+4>>2]&-8|0)==($|0)){Na=ba}else{m=$<<Ma;ha=ba;while(1){Pa=ha+(m>>>31<<2)+16|0;aa=c[Pa>>2]|0;if((aa|0)==0){break}if((c[aa+4>>2]&-8|0)==($|0)){Na=aa;break m}else{m=m<<1;ha=aa}}if(Pa>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[Pa>>2]=M;c[ia+24>>2]=ha;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break i}}}while(0);$=Na+8|0;ba=c[$>>2]|0;m=c[13464>>2]|0;if(Na>>>0<m>>>0){Mb()}if(ba>>>0<m>>>0){Mb()}else{c[ba+12>>2]=M;c[$>>2]=M;c[ia+8>>2]=ba;c[ia+12>>2]=Na;c[ia+24>>2]=0;break}}}while(0);ia=c[13460>>2]|0;if(!(ia>>>0>q>>>0)){break}ba=ia-q|0;c[13460>>2]=ba;ia=c[13472>>2]|0;$=ia;c[13472>>2]=$+q;c[$+(q+4)>>2]=ba|1;c[ia+4>>2]=q|3;p=ia+8|0;i=b;return p|0}}while(0);c[(ac()|0)>>2]=12;p=0;i=b;return p|0}function Lm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=i;if((a|0)==0){i=b;return}d=a+ -8|0;e=d;f=c[13464>>2]|0;if(d>>>0<f>>>0){Mb()}g=c[a+ -4>>2]|0;h=g&3;if((h|0)==1){Mb()}j=g&-8;k=a+(j+ -8)|0;l=k;a:do{if((g&1|0)==0){m=c[d>>2]|0;if((h|0)==0){i=b;return}n=-8-m|0;o=a+n|0;p=o;q=m+j|0;if(o>>>0<f>>>0){Mb()}if((p|0)==(c[13468>>2]|0)){r=a+(j+ -4)|0;if((c[r>>2]&3|0)!=3){s=p;t=q;break}c[13456>>2]=q;c[r>>2]=c[r>>2]&-2;c[a+(n+4)>>2]=q|1;c[k>>2]=q;i=b;return}r=m>>>3;if(m>>>0<256){m=c[a+(n+8)>>2]|0;u=c[a+(n+12)>>2]|0;v=13488+(r<<1<<2)|0;do{if((m|0)!=(v|0)){if(m>>>0<f>>>0){Mb()}if((c[m+12>>2]|0)==(p|0)){break}Mb()}}while(0);if((u|0)==(m|0)){c[3362]=c[3362]&~(1<<r);s=p;t=q;break}do{if((u|0)==(v|0)){w=u+8|0}else{if(u>>>0<f>>>0){Mb()}x=u+8|0;if((c[x>>2]|0)==(p|0)){w=x;break}Mb()}}while(0);c[m+12>>2]=u;c[w>>2]=m;s=p;t=q;break}v=o;r=c[a+(n+24)>>2]|0;x=c[a+(n+12)>>2]|0;do{if((x|0)==(v|0)){y=a+(n+20)|0;z=c[y>>2]|0;if((z|0)==0){A=a+(n+16)|0;B=c[A>>2]|0;if((B|0)==0){C=0;break}else{D=B;E=A}}else{D=z;E=y}while(1){y=D+20|0;z=c[y>>2]|0;if((z|0)!=0){E=y;D=z;continue}z=D+16|0;y=c[z>>2]|0;if((y|0)==0){break}else{D=y;E=z}}if(E>>>0<f>>>0){Mb()}else{c[E>>2]=0;C=D;break}}else{z=c[a+(n+8)>>2]|0;if(z>>>0<f>>>0){Mb()}y=z+12|0;if((c[y>>2]|0)!=(v|0)){Mb()}A=x+8|0;if((c[A>>2]|0)==(v|0)){c[y>>2]=x;c[A>>2]=z;C=x;break}else{Mb()}}}while(0);if((r|0)==0){s=p;t=q;break}x=c[a+(n+28)>>2]|0;o=13752+(x<<2)|0;do{if((v|0)==(c[o>>2]|0)){c[o>>2]=C;if((C|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<x);s=p;t=q;break a}else{if(r>>>0<(c[13464>>2]|0)>>>0){Mb()}m=r+16|0;if((c[m>>2]|0)==(v|0)){c[m>>2]=C}else{c[r+20>>2]=C}if((C|0)==0){s=p;t=q;break a}}}while(0);if(C>>>0<(c[13464>>2]|0)>>>0){Mb()}c[C+24>>2]=r;v=c[a+(n+16)>>2]|0;do{if((v|0)!=0){if(v>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[C+16>>2]=v;c[v+24>>2]=C;break}}}while(0);v=c[a+(n+20)>>2]|0;if((v|0)==0){s=p;t=q;break}if(v>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[C+20>>2]=v;c[v+24>>2]=C;s=p;t=q;break}}else{s=e;t=j}}while(0);e=s;if(!(e>>>0<k>>>0)){Mb()}C=a+(j+ -4)|0;f=c[C>>2]|0;if((f&1|0)==0){Mb()}do{if((f&2|0)==0){if((l|0)==(c[13472>>2]|0)){D=(c[13460>>2]|0)+t|0;c[13460>>2]=D;c[13472>>2]=s;c[s+4>>2]=D|1;if((s|0)!=(c[13468>>2]|0)){i=b;return}c[13468>>2]=0;c[13456>>2]=0;i=b;return}if((l|0)==(c[13468>>2]|0)){D=(c[13456>>2]|0)+t|0;c[13456>>2]=D;c[13468>>2]=s;c[s+4>>2]=D|1;c[e+D>>2]=D;i=b;return}D=(f&-8)+t|0;E=f>>>3;b:do{if(f>>>0<256){w=c[a+j>>2]|0;h=c[a+(j|4)>>2]|0;d=13488+(E<<1<<2)|0;do{if((w|0)!=(d|0)){if(w>>>0<(c[13464>>2]|0)>>>0){Mb()}if((c[w+12>>2]|0)==(l|0)){break}Mb()}}while(0);if((h|0)==(w|0)){c[3362]=c[3362]&~(1<<E);break}do{if((h|0)==(d|0)){F=h+8|0}else{if(h>>>0<(c[13464>>2]|0)>>>0){Mb()}g=h+8|0;if((c[g>>2]|0)==(l|0)){F=g;break}Mb()}}while(0);c[w+12>>2]=h;c[F>>2]=w}else{d=k;g=c[a+(j+16)>>2]|0;v=c[a+(j|4)>>2]|0;do{if((v|0)==(d|0)){r=a+(j+12)|0;x=c[r>>2]|0;if((x|0)==0){o=a+(j+8)|0;m=c[o>>2]|0;if((m|0)==0){G=0;break}else{H=m;I=o}}else{H=x;I=r}while(1){r=H+20|0;x=c[r>>2]|0;if((x|0)!=0){I=r;H=x;continue}x=H+16|0;r=c[x>>2]|0;if((r|0)==0){break}else{H=r;I=x}}if(I>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[I>>2]=0;G=H;break}}else{x=c[a+j>>2]|0;if(x>>>0<(c[13464>>2]|0)>>>0){Mb()}r=x+12|0;if((c[r>>2]|0)!=(d|0)){Mb()}o=v+8|0;if((c[o>>2]|0)==(d|0)){c[r>>2]=v;c[o>>2]=x;G=v;break}else{Mb()}}}while(0);if((g|0)==0){break}v=c[a+(j+20)>>2]|0;w=13752+(v<<2)|0;do{if((d|0)==(c[w>>2]|0)){c[w>>2]=G;if((G|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<v);break b}else{if(g>>>0<(c[13464>>2]|0)>>>0){Mb()}h=g+16|0;if((c[h>>2]|0)==(d|0)){c[h>>2]=G}else{c[g+20>>2]=G}if((G|0)==0){break b}}}while(0);if(G>>>0<(c[13464>>2]|0)>>>0){Mb()}c[G+24>>2]=g;d=c[a+(j+8)>>2]|0;do{if((d|0)!=0){if(d>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[G+16>>2]=d;c[d+24>>2]=G;break}}}while(0);d=c[a+(j+12)>>2]|0;if((d|0)==0){break}if(d>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[G+20>>2]=d;c[d+24>>2]=G;break}}}while(0);c[s+4>>2]=D|1;c[e+D>>2]=D;if((s|0)!=(c[13468>>2]|0)){J=D;break}c[13456>>2]=D;i=b;return}else{c[C>>2]=f&-2;c[s+4>>2]=t|1;c[e+t>>2]=t;J=t}}while(0);t=J>>>3;if(J>>>0<256){e=t<<1;f=13488+(e<<2)|0;C=c[3362]|0;G=1<<t;do{if((C&G|0)==0){c[3362]=C|G;K=13488+(e+2<<2)|0;L=f}else{t=13488+(e+2<<2)|0;j=c[t>>2]|0;if(!(j>>>0<(c[13464>>2]|0)>>>0)){K=t;L=j;break}Mb()}}while(0);c[K>>2]=s;c[L+12>>2]=s;c[s+8>>2]=L;c[s+12>>2]=f;i=b;return}f=s;L=J>>>8;do{if((L|0)==0){M=0}else{if(J>>>0>16777215){M=31;break}K=(L+1048320|0)>>>16&8;e=L<<K;G=(e+520192|0)>>>16&4;C=e<<G;e=(C+245760|0)>>>16&2;j=14-(G|K|e)+(C<<e>>>15)|0;M=J>>>(j+7|0)&1|j<<1}}while(0);L=13752+(M<<2)|0;c[s+28>>2]=M;c[s+20>>2]=0;c[s+16>>2]=0;j=c[13452>>2]|0;e=1<<M;c:do{if((j&e|0)==0){c[13452>>2]=j|e;c[L>>2]=f;c[s+24>>2]=L;c[s+12>>2]=s;c[s+8>>2]=s}else{C=c[L>>2]|0;if((M|0)==31){N=0}else{N=25-(M>>>1)|0}d:do{if((c[C+4>>2]&-8|0)==(J|0)){O=C}else{K=J<<N;G=C;while(1){P=G+(K>>>31<<2)+16|0;t=c[P>>2]|0;if((t|0)==0){break}if((c[t+4>>2]&-8|0)==(J|0)){O=t;break d}else{K=K<<1;G=t}}if(P>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[P>>2]=f;c[s+24>>2]=G;c[s+12>>2]=s;c[s+8>>2]=s;break c}}}while(0);C=O+8|0;D=c[C>>2]|0;K=c[13464>>2]|0;if(O>>>0<K>>>0){Mb()}if(D>>>0<K>>>0){Mb()}else{c[D+12>>2]=f;c[C>>2]=f;c[s+8>>2]=D;c[s+12>>2]=O;c[s+24>>2]=0;break}}}while(0);s=(c[13480>>2]|0)+ -1|0;c[13480>>2]=s;if((s|0)==0){Q=13904|0}else{i=b;return}while(1){s=c[Q>>2]|0;if((s|0)==0){break}else{Q=s+8|0}}c[13480>>2]=-1;i=b;return}function Mm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;if((a|0)==0){e=Km(b)|0;i=d;return e|0}if(b>>>0>4294967231){c[(ac()|0)>>2]=12;e=0;i=d;return e|0}if(b>>>0<11){f=16}else{f=b+11&-8}g=Nm(a+ -8|0,f)|0;if((g|0)!=0){e=g+8|0;i=d;return e|0}g=Km(b)|0;if((g|0)==0){e=0;i=d;return e|0}f=c[a+ -4>>2]|0;h=(f&-8)-((f&3|0)==0?8:4)|0;mn(g|0,a|0,(h>>>0<b>>>0?h:b)|0)|0;Lm(a);e=g;i=d;return e|0}function Nm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;d=i;e=a+4|0;f=c[e>>2]|0;g=f&-8;h=a;j=h+g|0;k=j;l=c[13464>>2]|0;if(h>>>0<l>>>0){Mb()}m=f&3;if(!((m|0)!=1&h>>>0<j>>>0)){Mb()}n=h+(g|4)|0;o=c[n>>2]|0;if((o&1|0)==0){Mb()}if((m|0)==0){if(b>>>0<256){p=0;i=d;return p|0}do{if(!(g>>>0<(b+4|0)>>>0)){if((g-b|0)>>>0>c[13928>>2]<<1>>>0){break}else{p=a}i=d;return p|0}}while(0);p=0;i=d;return p|0}if(!(g>>>0<b>>>0)){m=g-b|0;if(!(m>>>0>15)){p=a;i=d;return p|0}c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=m|3;c[n>>2]=c[n>>2]|1;Om(h+b|0,m);p=a;i=d;return p|0}if((k|0)==(c[13472>>2]|0)){m=(c[13460>>2]|0)+g|0;if(!(m>>>0>b>>>0)){p=0;i=d;return p|0}n=m-b|0;c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=n|1;c[13472>>2]=h+b;c[13460>>2]=n;p=a;i=d;return p|0}if((k|0)==(c[13468>>2]|0)){n=(c[13456>>2]|0)+g|0;if(n>>>0<b>>>0){p=0;i=d;return p|0}m=n-b|0;if(m>>>0>15){c[e>>2]=f&1|b|2;c[h+(b+4)>>2]=m|1;c[h+n>>2]=m;q=h+(n+4)|0;c[q>>2]=c[q>>2]&-2;r=h+b|0;s=m}else{c[e>>2]=f&1|n|2;f=h+(n+4)|0;c[f>>2]=c[f>>2]|1;r=0;s=0}c[13456>>2]=s;c[13468>>2]=r;p=a;i=d;return p|0}if((o&2|0)!=0){p=0;i=d;return p|0}r=(o&-8)+g|0;if(r>>>0<b>>>0){p=0;i=d;return p|0}s=r-b|0;f=o>>>3;a:do{if(o>>>0<256){n=c[h+(g+8)>>2]|0;m=c[h+(g+12)>>2]|0;q=13488+(f<<1<<2)|0;do{if((n|0)!=(q|0)){if(n>>>0<l>>>0){Mb()}if((c[n+12>>2]|0)==(k|0)){break}Mb()}}while(0);if((m|0)==(n|0)){c[3362]=c[3362]&~(1<<f);break}do{if((m|0)==(q|0)){t=m+8|0}else{if(m>>>0<l>>>0){Mb()}u=m+8|0;if((c[u>>2]|0)==(k|0)){t=u;break}Mb()}}while(0);c[n+12>>2]=m;c[t>>2]=n}else{q=j;u=c[h+(g+24)>>2]|0;v=c[h+(g+12)>>2]|0;do{if((v|0)==(q|0)){w=h+(g+20)|0;x=c[w>>2]|0;if((x|0)==0){y=h+(g+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){C=w;B=x;continue}x=B+16|0;w=c[x>>2]|0;if((w|0)==0){break}else{B=w;C=x}}if(C>>>0<l>>>0){Mb()}else{c[C>>2]=0;A=B;break}}else{x=c[h+(g+8)>>2]|0;if(x>>>0<l>>>0){Mb()}w=x+12|0;if((c[w>>2]|0)!=(q|0)){Mb()}y=v+8|0;if((c[y>>2]|0)==(q|0)){c[w>>2]=v;c[y>>2]=x;A=v;break}else{Mb()}}}while(0);if((u|0)==0){break}v=c[h+(g+28)>>2]|0;n=13752+(v<<2)|0;do{if((q|0)==(c[n>>2]|0)){c[n>>2]=A;if((A|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<v);break a}else{if(u>>>0<(c[13464>>2]|0)>>>0){Mb()}m=u+16|0;if((c[m>>2]|0)==(q|0)){c[m>>2]=A}else{c[u+20>>2]=A}if((A|0)==0){break a}}}while(0);if(A>>>0<(c[13464>>2]|0)>>>0){Mb()}c[A+24>>2]=u;q=c[h+(g+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[A+16>>2]=q;c[q+24>>2]=A;break}}}while(0);q=c[h+(g+20)>>2]|0;if((q|0)==0){break}if(q>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[A+20>>2]=q;c[q+24>>2]=A;break}}}while(0);if(s>>>0<16){c[e>>2]=r|c[e>>2]&1|2;A=h+(r|4)|0;c[A>>2]=c[A>>2]|1;p=a;i=d;return p|0}else{c[e>>2]=c[e>>2]&1|b|2;c[h+(b+4)>>2]=s|3;e=h+(r|4)|0;c[e>>2]=c[e>>2]|1;Om(h+b|0,s);p=a;i=d;return p|0}return 0}function Om(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;d=i;e=a;f=e+b|0;g=f;h=c[a+4>>2]|0;a:do{if((h&1|0)==0){j=c[a>>2]|0;if((h&3|0)==0){i=d;return}k=e+(0-j)|0;l=k;m=j+b|0;n=c[13464>>2]|0;if(k>>>0<n>>>0){Mb()}if((l|0)==(c[13468>>2]|0)){o=e+(b+4)|0;if((c[o>>2]&3|0)!=3){p=l;q=m;break}c[13456>>2]=m;c[o>>2]=c[o>>2]&-2;c[e+(4-j)>>2]=m|1;c[f>>2]=m;i=d;return}o=j>>>3;if(j>>>0<256){r=c[e+(8-j)>>2]|0;s=c[e+(12-j)>>2]|0;t=13488+(o<<1<<2)|0;do{if((r|0)!=(t|0)){if(r>>>0<n>>>0){Mb()}if((c[r+12>>2]|0)==(l|0)){break}Mb()}}while(0);if((s|0)==(r|0)){c[3362]=c[3362]&~(1<<o);p=l;q=m;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<n>>>0){Mb()}v=s+8|0;if((c[v>>2]|0)==(l|0)){u=v;break}Mb()}}while(0);c[r+12>>2]=s;c[u>>2]=r;p=l;q=m;break}t=k;o=c[e+(24-j)>>2]|0;v=c[e+(12-j)>>2]|0;do{if((v|0)==(t|0)){w=16-j|0;x=e+(w+4)|0;y=c[x>>2]|0;if((y|0)==0){z=e+w|0;w=c[z>>2]|0;if((w|0)==0){A=0;break}else{B=w;C=z}}else{B=y;C=x}while(1){x=B+20|0;y=c[x>>2]|0;if((y|0)!=0){C=x;B=y;continue}y=B+16|0;x=c[y>>2]|0;if((x|0)==0){break}else{B=x;C=y}}if(C>>>0<n>>>0){Mb()}else{c[C>>2]=0;A=B;break}}else{y=c[e+(8-j)>>2]|0;if(y>>>0<n>>>0){Mb()}x=y+12|0;if((c[x>>2]|0)!=(t|0)){Mb()}z=v+8|0;if((c[z>>2]|0)==(t|0)){c[x>>2]=v;c[z>>2]=y;A=v;break}else{Mb()}}}while(0);if((o|0)==0){p=l;q=m;break}v=c[e+(28-j)>>2]|0;n=13752+(v<<2)|0;do{if((t|0)==(c[n>>2]|0)){c[n>>2]=A;if((A|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<v);p=l;q=m;break a}else{if(o>>>0<(c[13464>>2]|0)>>>0){Mb()}k=o+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[o+20>>2]=A}if((A|0)==0){p=l;q=m;break a}}}while(0);if(A>>>0<(c[13464>>2]|0)>>>0){Mb()}c[A+24>>2]=o;t=16-j|0;v=c[e+t>>2]|0;do{if((v|0)!=0){if(v>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[A+16>>2]=v;c[v+24>>2]=A;break}}}while(0);v=c[e+(t+4)>>2]|0;if((v|0)==0){p=l;q=m;break}if(v>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[A+20>>2]=v;c[v+24>>2]=A;p=l;q=m;break}}else{p=a;q=b}}while(0);a=c[13464>>2]|0;if(f>>>0<a>>>0){Mb()}A=e+(b+4)|0;B=c[A>>2]|0;do{if((B&2|0)==0){if((g|0)==(c[13472>>2]|0)){C=(c[13460>>2]|0)+q|0;c[13460>>2]=C;c[13472>>2]=p;c[p+4>>2]=C|1;if((p|0)!=(c[13468>>2]|0)){i=d;return}c[13468>>2]=0;c[13456>>2]=0;i=d;return}if((g|0)==(c[13468>>2]|0)){C=(c[13456>>2]|0)+q|0;c[13456>>2]=C;c[13468>>2]=p;c[p+4>>2]=C|1;c[p+C>>2]=C;i=d;return}C=(B&-8)+q|0;u=B>>>3;b:do{if(B>>>0<256){h=c[e+(b+8)>>2]|0;v=c[e+(b+12)>>2]|0;j=13488+(u<<1<<2)|0;do{if((h|0)!=(j|0)){if(h>>>0<a>>>0){Mb()}if((c[h+12>>2]|0)==(g|0)){break}Mb()}}while(0);if((v|0)==(h|0)){c[3362]=c[3362]&~(1<<u);break}do{if((v|0)==(j|0)){D=v+8|0}else{if(v>>>0<a>>>0){Mb()}o=v+8|0;if((c[o>>2]|0)==(g|0)){D=o;break}Mb()}}while(0);c[h+12>>2]=v;c[D>>2]=h}else{j=f;o=c[e+(b+24)>>2]|0;n=c[e+(b+12)>>2]|0;do{if((n|0)==(j|0)){k=e+(b+20)|0;r=c[k>>2]|0;if((r|0)==0){s=e+(b+16)|0;y=c[s>>2]|0;if((y|0)==0){E=0;break}else{F=y;G=s}}else{F=r;G=k}while(1){k=F+20|0;r=c[k>>2]|0;if((r|0)!=0){G=k;F=r;continue}r=F+16|0;k=c[r>>2]|0;if((k|0)==0){break}else{F=k;G=r}}if(G>>>0<a>>>0){Mb()}else{c[G>>2]=0;E=F;break}}else{r=c[e+(b+8)>>2]|0;if(r>>>0<a>>>0){Mb()}k=r+12|0;if((c[k>>2]|0)!=(j|0)){Mb()}s=n+8|0;if((c[s>>2]|0)==(j|0)){c[k>>2]=n;c[s>>2]=r;E=n;break}else{Mb()}}}while(0);if((o|0)==0){break}n=c[e+(b+28)>>2]|0;h=13752+(n<<2)|0;do{if((j|0)==(c[h>>2]|0)){c[h>>2]=E;if((E|0)!=0){break}c[13452>>2]=c[13452>>2]&~(1<<n);break b}else{if(o>>>0<(c[13464>>2]|0)>>>0){Mb()}v=o+16|0;if((c[v>>2]|0)==(j|0)){c[v>>2]=E}else{c[o+20>>2]=E}if((E|0)==0){break b}}}while(0);if(E>>>0<(c[13464>>2]|0)>>>0){Mb()}c[E+24>>2]=o;j=c[e+(b+16)>>2]|0;do{if((j|0)!=0){if(j>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[E+16>>2]=j;c[j+24>>2]=E;break}}}while(0);j=c[e+(b+20)>>2]|0;if((j|0)==0){break}if(j>>>0<(c[13464>>2]|0)>>>0){Mb()}else{c[E+20>>2]=j;c[j+24>>2]=E;break}}}while(0);c[p+4>>2]=C|1;c[p+C>>2]=C;if((p|0)!=(c[13468>>2]|0)){H=C;break}c[13456>>2]=C;i=d;return}else{c[A>>2]=B&-2;c[p+4>>2]=q|1;c[p+q>>2]=q;H=q}}while(0);q=H>>>3;if(H>>>0<256){B=q<<1;A=13488+(B<<2)|0;E=c[3362]|0;b=1<<q;do{if((E&b|0)==0){c[3362]=E|b;I=13488+(B+2<<2)|0;J=A}else{q=13488+(B+2<<2)|0;e=c[q>>2]|0;if(!(e>>>0<(c[13464>>2]|0)>>>0)){I=q;J=e;break}Mb()}}while(0);c[I>>2]=p;c[J+12>>2]=p;c[p+8>>2]=J;c[p+12>>2]=A;i=d;return}A=p;J=H>>>8;do{if((J|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}I=(J+1048320|0)>>>16&8;B=J<<I;b=(B+520192|0)>>>16&4;E=B<<b;B=(E+245760|0)>>>16&2;e=14-(b|I|B)+(E<<B>>>15)|0;K=H>>>(e+7|0)&1|e<<1}}while(0);J=13752+(K<<2)|0;c[p+28>>2]=K;c[p+20>>2]=0;c[p+16>>2]=0;e=c[13452>>2]|0;B=1<<K;if((e&B|0)==0){c[13452>>2]=e|B;c[J>>2]=A;c[p+24>>2]=J;c[p+12>>2]=p;c[p+8>>2]=p;i=d;return}B=c[J>>2]|0;if((K|0)==31){L=0}else{L=25-(K>>>1)|0}c:do{if((c[B+4>>2]&-8|0)==(H|0)){M=B}else{K=H<<L;J=B;while(1){N=J+(K>>>31<<2)+16|0;e=c[N>>2]|0;if((e|0)==0){break}if((c[e+4>>2]&-8|0)==(H|0)){M=e;break c}else{K=K<<1;J=e}}if(N>>>0<(c[13464>>2]|0)>>>0){Mb()}c[N>>2]=A;c[p+24>>2]=J;c[p+12>>2]=p;c[p+8>>2]=p;i=d;return}}while(0);N=M+8|0;H=c[N>>2]|0;B=c[13464>>2]|0;if(M>>>0<B>>>0){Mb()}if(H>>>0<B>>>0){Mb()}c[H+12>>2]=A;c[N>>2]=A;c[p+8>>2]=H;c[p+12>>2]=M;c[p+24>>2]=0;i=d;return}function Pm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=(a|0)==0?1:a;while(1){e=Km(d)|0;if((e|0)!=0){f=6;break}a=c[3486]|0;c[3486]=a+0;if((a|0)==0){f=5;break}tc[a&0]()}if((f|0)==5){d=vb(4)|0;c[d>>2]=13960;cc(d|0,14008,115)}else if((f|0)==6){i=b;return e|0}return 0}function Qm(a){a=a|0;var b=0,c=0;b=i;c=Pm(a)|0;i=b;return c|0}function Rm(a){a=a|0;var b=0;b=i;if((a|0)!=0){Lm(a)}i=b;return}function Sm(a){a=a|0;var b=0;b=i;Rm(a);i=b;return}function Tm(a){a=a|0;var b=0;b=i;Ta(a|0);Rm(a);i=b;return}function Um(a){a=a|0;var b=0;b=i;Ta(a|0);i=b;return}function Vm(a){a=a|0;i=i;return 13976}function Wm(){var a=0;a=vb(4)|0;c[a>>2]=13960;cc(a|0,14008,115)}function Xm(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0,T=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ga=0,ha=0,ia=0.0,ja=0,ka=0.0,la=0,ma=0.0,na=0,oa=0.0,pa=0.0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0.0,ya=0,za=0.0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0.0,Fa=0,Ga=0.0,Ha=0.0,Ia=0,Ja=0.0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0.0,Bc=0,Cc=0,Dc=0.0,Ec=0.0,Fc=0.0,Gc=0.0,Hc=0.0,Ic=0.0,Jc=0,Kc=0,Lc=0.0,Mc=0,Nc=0.0,Oc=0;g=i;i=i+512|0;h=g;if((e|0)==1){j=53;k=-1074}else if((e|0)==2){j=53;k=-1074}else if((e|0)==0){j=24;k=-149}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=_m(b)|0}}while((Nb(o|0)|0)!=0);do{if((o|0)==43|(o|0)==45){n=1-(((o|0)==45)<<1)|0;p=c[e>>2]|0;if(p>>>0<(c[m>>2]|0)>>>0){c[e>>2]=p+1;q=d[p]|0;r=n;break}else{q=_m(b)|0;r=n;break}}else{q=o;r=1}}while(0);o=q;q=0;while(1){if((o|32|0)!=(a[14024+q|0]|0)){s=o;t=q;break}do{if(q>>>0<7){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;u=d[n]|0;break}else{u=_m(b)|0;break}}else{u=o}}while(0);n=q+1|0;if(n>>>0<8){o=u;q=n}else{s=u;t=n;break}}do{if((t|0)==3){v=23}else if((t|0)!=8){u=(f|0)==0;if(!(t>>>0<4|u)){if((t|0)==8){break}else{v=23;break}}a:do{if((t|0)==0){q=s;o=0;while(1){if((q|32|0)!=(a[14040+o|0]|0)){w=q;x=o;break a}do{if(o>>>0<2){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;A=d[n]|0;break}else{A=_m(b)|0;break}}else{A=q}}while(0);n=o+1|0;if(n>>>0<3){q=A;o=n}else{w=A;x=n;break}}}else{w=s;x=t}}while(0);if((x|0)==3){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;B=d[o]|0}else{B=_m(b)|0}if((B|0)==40){C=1}else{if((c[m>>2]|0)==0){l=y;i=g;return+l}c[e>>2]=(c[e>>2]|0)+ -1;l=y;i=g;return+l}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;D=d[o]|0}else{D=_m(b)|0}if(!((D+ -48|0)>>>0<10|(D+ -65|0)>>>0<26)){if(!((D+ -97|0)>>>0<26|(D|0)==95)){break}}C=C+1|0}if((D|0)==41){l=y;i=g;return+l}o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}if(u){c[(ac()|0)>>2]=22;Zm(b,0);l=0.0;i=g;return+l}if((C|0)==0|o){l=y;i=g;return+l}else{E=C}while(1){o=E+ -1|0;c[e>>2]=(c[e>>2]|0)+ -1;if((o|0)==0){l=y;break}else{E=o}}i=g;return+l}else if((x|0)==0){do{if((w|0)==48){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;F=d[o]|0}else{F=_m(b)|0}if((F|32|0)!=120){if((c[m>>2]|0)==0){G=48;break}c[e>>2]=(c[e>>2]|0)+ -1;G=48;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;I=0}else{H=_m(b)|0;I=0}while(1){if((H|0)==46){v=70;break}else if((H|0)!=48){K=0;L=0;M=0;N=0;O=H;P=I;Q=0;R=0;S=1.0;T=0;V=0.0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;I=1;continue}else{H=_m(b)|0;I=1;continue}}b:do{if((v|0)==70){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;W=d[o]|0}else{W=_m(b)|0}if((W|0)==48){X=-1;Y=-1}else{K=0;L=0;M=0;N=0;O=W;P=I;Q=1;R=0;S=1.0;T=0;V=0.0;break}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;Z=d[o]|0}else{Z=_m(b)|0}if((Z|0)!=48){K=X;L=Y;M=0;N=0;O=Z;P=1;Q=1;R=0;S=1.0;T=0;V=0.0;break b}o=ln(X|0,Y|0,-1,-1)|0;X=o;Y=J}}}while(0);c:while(1){o=O+ -48|0;do{if(o>>>0<10){_=o;v=84}else{q=O|32;n=(O|0)==46;if(!((q+ -97|0)>>>0<6|n)){$=O;break c}if(n){if((Q|0)==0){aa=M;ba=N;ca=M;da=N;ea=P;ga=1;ha=R;ia=S;ja=T;ka=V;break}else{$=46;break c}}else{_=(O|0)>57?q+ -87|0:o;v=84;break}}}while(0);if((v|0)==84){v=0;do{if((N|0)<0|(N|0)==0&M>>>0<8){la=R;ma=S;na=_+(T<<4)|0;oa=V}else{if((N|0)<0|(N|0)==0&M>>>0<14){pa=S*.0625;la=R;ma=pa;na=T;oa=V+pa*+(_|0);break}if(!((_|0)!=0&(R|0)==0)){la=R;ma=S;na=T;oa=V;break}la=1;ma=S;na=T;oa=V+S*.5}}while(0);o=ln(M|0,N|0,1,0)|0;aa=K;ba=L;ca=o;da=J;ea=1;ga=Q;ha=la;ia=ma;ja=na;ka=oa}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;K=aa;L=ba;M=ca;N=da;O=d[o]|0;P=ea;Q=ga;R=ha;S=ia;T=ja;V=ka;continue}else{K=aa;L=ba;M=ca;N=da;O=_m(b)|0;P=ea;Q=ga;R=ha;S=ia;T=ja;V=ka;continue}}if((P|0)==0){o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}do{if(u){Zm(b,0)}else{if(o){break}q=c[e>>2]|0;c[e>>2]=q+ -1;if((Q|0)==0){break}c[e>>2]=q+ -2}}while(0);l=+(r|0)*0.0;i=g;return+l}o=(Q|0)==0;q=o?M:K;n=o?N:L;if((N|0)<0|(N|0)==0&M>>>0<8){o=M;p=N;qa=T;while(1){ra=qa<<4;sa=ln(o|0,p|0,1,0)|0;ta=J;if((ta|0)<0|(ta|0)==0&sa>>>0<8){qa=ra;p=ta;o=sa}else{ua=ra;break}}}else{ua=T}do{if(($|32|0)==112){o=Ym(b,f)|0;p=J;if(!((o|0)==0&(p|0)==-2147483648)){va=o;wa=p;break}if(u){Zm(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0;break}}else{if((c[m>>2]|0)==0){va=0;wa=0;break}c[e>>2]=(c[e>>2]|0)+ -1;va=0;wa=0}}while(0);p=pn(q|0,n|0,2)|0;o=ln(p|0,J|0,-32,-1)|0;p=ln(o|0,J|0,va|0,wa|0)|0;o=J;if((ua|0)==0){l=+(r|0)*0.0;i=g;return+l}if((o|0)>0|(o|0)==0&p>>>0>(0-k|0)>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}qa=k+ -106|0;ra=((qa|0)<0)<<31>>31;if((o|0)<(ra|0)|(o|0)==(ra|0)&p>>>0<qa>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((ua|0)>-1){qa=p;ra=o;sa=ua;pa=V;while(1){ta=sa<<1;if(!(pa>=.5)){xa=pa;ya=ta}else{xa=pa+-1.0;ya=ta|1}za=pa+xa;ta=ln(qa|0,ra|0,-1,-1)|0;Aa=J;if((ya|0)>-1){qa=ta;ra=Aa;sa=ya;pa=za}else{Ba=ta;Ca=Aa;Da=ya;Ea=za;break}}}else{Ba=p;Ca=o;Da=ua;Ea=V}sa=kn(32,0,k|0,((k|0)<0)<<31>>31|0)|0;ra=ln(Ba|0,Ca|0,sa|0,J|0)|0;sa=J;if(0>(sa|0)|0==(sa|0)&j>>>0>ra>>>0){Fa=(ra|0)<0?0:ra}else{Fa=j}do{if((Fa|0)<53){pa=+(r|0);za=+bc(+(+$m(1.0,84-Fa|0)),+pa);if(!((Fa|0)<32&Ea!=0.0)){Ga=pa;Ha=za;Ia=Da;Ja=Ea;break}ra=Da&1;Ga=pa;Ha=za;Ia=(ra^1)+Da|0;Ja=(ra|0)==0?0.0:Ea}else{Ga=+(r|0);Ha=0.0;Ia=Da;Ja=Ea}}while(0);za=Ga*Ja+(Ha+Ga*+(Ia>>>0))-Ha;if(!(za!=0.0)){c[(ac()|0)>>2]=34}l=+an(za,Ba);i=g;return+l}else{G=w}}while(0);o=k+j|0;p=0-o|0;ra=G;sa=0;while(1){if((ra|0)==46){v=139;break}else if((ra|0)!=48){Ka=ra;La=0;Ma=0;Na=sa;Oa=0;break}qa=c[e>>2]|0;if(qa>>>0<(c[m>>2]|0)>>>0){c[e>>2]=qa+1;ra=d[qa]|0;sa=1;continue}else{ra=_m(b)|0;sa=1;continue}}d:do{if((v|0)==139){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Pa=d[ra]|0}else{Pa=_m(b)|0}if((Pa|0)==48){Qa=-1;Ra=-1}else{Ka=Pa;La=0;Ma=0;Na=sa;Oa=1;break}while(1){ra=c[e>>2]|0;if(ra>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ra+1;Sa=d[ra]|0}else{Sa=_m(b)|0}if((Sa|0)!=48){Ka=Sa;La=Qa;Ma=Ra;Na=1;Oa=1;break d}ra=ln(Qa|0,Ra|0,-1,-1)|0;Qa=ra;Ra=J}}}while(0);sa=h;c[sa>>2]=0;ra=Ka+ -48|0;qa=(Ka|0)==46;e:do{if(ra>>>0<10|qa){n=h+496|0;q=Ka;Aa=qa;ta=ra;Ta=0;Ua=0;Va=La;Wa=Ma;Xa=Na;Ya=Oa;Za=0;_a=0;$a=0;while(1){do{if(Aa){if((Ya|0)==0){ab=Ta;bb=Ua;cb=Ta;db=Ua;eb=Xa;fb=1;gb=Za;hb=_a;ib=$a}else{jb=q;kb=Ta;lb=Ua;mb=Va;nb=Wa;ob=Xa;pb=Za;qb=_a;rb=$a;break e}}else{sb=ln(Ta|0,Ua|0,1,0)|0;tb=J;vb=(q|0)!=48;if((_a|0)>=125){if(!vb){ab=Va;bb=Wa;cb=sb;db=tb;eb=Xa;fb=Ya;gb=Za;hb=_a;ib=$a;break}c[n>>2]=c[n>>2]|1;ab=Va;bb=Wa;cb=sb;db=tb;eb=Xa;fb=Ya;gb=Za;hb=_a;ib=$a;break}wb=h+(_a<<2)|0;if((Za|0)==0){xb=ta}else{xb=q+ -48+((c[wb>>2]|0)*10|0)|0}c[wb>>2]=xb;wb=Za+1|0;yb=(wb|0)==9;ab=Va;bb=Wa;cb=sb;db=tb;eb=1;fb=Ya;gb=yb?0:wb;hb=(yb&1)+_a|0;ib=vb?sb:$a}}while(0);sb=c[e>>2]|0;if(sb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=sb+1;zb=d[sb]|0}else{zb=_m(b)|0}sb=zb+ -48|0;vb=(zb|0)==46;if(sb>>>0<10|vb){q=zb;Aa=vb;ta=sb;Ta=cb;Ua=db;Va=ab;Wa=bb;Xa=eb;Ya=fb;Za=gb;_a=hb;$a=ib}else{Ab=zb;Bb=cb;Cb=db;Db=ab;Eb=bb;Fb=eb;Gb=fb;Hb=gb;Ib=hb;Jb=ib;v=162;break}}}else{Ab=Ka;Bb=0;Cb=0;Db=La;Eb=Ma;Fb=Na;Gb=Oa;Hb=0;Ib=0;Jb=0;v=162}}while(0);if((v|0)==162){ra=(Gb|0)==0;jb=Ab;kb=Bb;lb=Cb;mb=ra?Bb:Db;nb=ra?Cb:Eb;ob=Fb;pb=Hb;qb=Ib;rb=Jb}ra=(ob|0)!=0;do{if(ra){if((jb|32|0)!=101){v=171;break}qa=Ym(b,f)|0;$a=J;do{if((qa|0)==0&($a|0)==-2147483648){if(u){Zm(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Kb=0;Lb=0;break}c[e>>2]=(c[e>>2]|0)+ -1;Kb=0;Lb=0;break}}else{Kb=qa;Lb=$a}}while(0);$a=ln(Kb|0,Lb|0,mb|0,nb|0)|0;Mb=$a;Ob=J}else{v=171}}while(0);do{if((v|0)==171){if(!((jb|0)>-1)){Mb=mb;Ob=nb;break}if((c[m>>2]|0)==0){Mb=mb;Ob=nb;break}c[e>>2]=(c[e>>2]|0)+ -1;Mb=mb;Ob=nb}}while(0);if(!ra){c[(ac()|0)>>2]=22;Zm(b,0);l=0.0;i=g;return+l}u=c[sa>>2]|0;if((u|0)==0){l=+(r|0)*0.0;i=g;return+l}do{if((Mb|0)==(kb|0)&(Ob|0)==(lb|0)&((lb|0)<0|(lb|0)==0&kb>>>0<10)){if(!(j>>>0>30)){if((u>>>j|0)!=0){break}}l=+(r|0)*+(u>>>0);i=g;return+l}}while(0);u=(k|0)/-2|0;ra=((u|0)<0)<<31>>31;if((Ob|0)>(ra|0)|(Ob|0)==(ra|0)&Mb>>>0>u>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}u=k+ -106|0;ra=((u|0)<0)<<31>>31;if((Ob|0)<(ra|0)|(Ob|0)==(ra|0)&Mb>>>0<u>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((pb|0)==0){Pb=qb}else{if((pb|0)<9){u=h+(qb<<2)|0;ra=c[u>>2]|0;$a=pb;do{ra=ra*10|0;$a=$a+1|0;}while(($a|0)!=9);c[u>>2]=ra}Pb=qb+1|0}do{if((rb|0)<9){if(!((rb|0)<=(Mb|0)&(Mb|0)<18)){break}if((Mb|0)==9){l=+(r|0)*+((c[sa>>2]|0)>>>0);i=g;return+l}if((Mb|0)<9){l=+(r|0)*+((c[sa>>2]|0)>>>0)/+(c[14056+(8-Mb<<2)>>2]|0);i=g;return+l}$a=j+27+(fa(Mb,-3)|0)|0;qa=c[sa>>2]|0;if(($a|0)<=30){if((qa>>>$a|0)!=0){break}}l=+(r|0)*+(qa>>>0)*+(c[14056+(Mb+ -10<<2)>>2]|0);i=g;return+l}}while(0);sa=(Mb|0)%9|0;if((sa|0)==0){Qb=0;Rb=0;Sb=Mb;Tb=Pb}else{ra=(Mb|0)>-1?sa:sa+9|0;sa=c[14056+(8-ra<<2)>>2]|0;do{if((Pb|0)==0){Ub=0;Vb=Mb;Wb=0}else{u=1e9/(sa|0)|0;qa=0;$a=0;_a=0;Za=Mb;while(1){Ya=h+(_a<<2)|0;Xa=c[Ya>>2]|0;Wa=((Xa>>>0)/(sa>>>0)|0)+$a|0;c[Ya>>2]=Wa;Xb=fa((Xa>>>0)%(sa>>>0)|0,u)|0;Xa=_a+1|0;if((_a|0)==(qa|0)&(Wa|0)==0){Yb=Xa&127;Zb=Za+ -9|0}else{Yb=qa;Zb=Za}if((Xa|0)==(Pb|0)){break}else{qa=Yb;Za=Zb;_a=Xa;$a=Xb}}if((Xb|0)==0){Ub=Yb;Vb=Zb;Wb=Pb;break}c[h+(Pb<<2)>>2]=Xb;Ub=Yb;Vb=Zb;Wb=Pb+1|0}}while(0);Qb=Ub;Rb=0;Sb=9-ra+Vb|0;Tb=Wb}f:while(1){sa=h+(Qb<<2)|0;if((Sb|0)<18){$a=Rb;_a=Tb;while(1){Za=0;qa=_a+127|0;u=_a;while(1){Xa=qa&127;Wa=h+(Xa<<2)|0;Ya=pn(c[Wa>>2]|0,0,29)|0;Va=ln(Ya|0,J|0,Za|0,0)|0;Ya=J;if(Ya>>>0>0|(Ya|0)==0&Va>>>0>1e9){Ua=yn(Va|0,Ya|0,1e9,0)|0;Ta=zn(Va|0,Ya|0,1e9,0)|0;_b=Ta;$b=Ua}else{_b=Va;$b=0}c[Wa>>2]=_b;Wa=(Xa|0)==(Qb|0);if((Xa|0)!=(u+127&127|0)|Wa){cc=u}else{cc=(_b|0)==0?Xa:u}if(Wa){break}else{Za=$b;qa=Xa+ -1|0;u=cc}}u=$a+ -29|0;if(($b|0)==0){$a=u;_a=cc}else{dc=u;ec=$b;fc=cc;break}}}else{if((Sb|0)==18){gc=Rb;hc=Tb}else{ic=Qb;jc=Rb;kc=Sb;lc=Tb;break}while(1){if(!((c[sa>>2]|0)>>>0<9007199)){ic=Qb;jc=gc;kc=18;lc=hc;break f}_a=0;$a=hc+127|0;u=hc;while(1){qa=$a&127;Za=h+(qa<<2)|0;Xa=pn(c[Za>>2]|0,0,29)|0;Wa=ln(Xa|0,J|0,_a|0,0)|0;Xa=J;if(Xa>>>0>0|(Xa|0)==0&Wa>>>0>1e9){Va=yn(Wa|0,Xa|0,1e9,0)|0;Ua=zn(Wa|0,Xa|0,1e9,0)|0;mc=Ua;nc=Va}else{mc=Wa;nc=0}c[Za>>2]=mc;Za=(qa|0)==(Qb|0);if((qa|0)!=(u+127&127|0)|Za){oc=u}else{oc=(mc|0)==0?qa:u}if(Za){break}else{_a=nc;$a=qa+ -1|0;u=oc}}u=gc+ -29|0;if((nc|0)==0){gc=u;hc=oc}else{dc=u;ec=nc;fc=oc;break}}}sa=Qb+127&127;if((sa|0)==(fc|0)){u=fc+127&127;$a=h+((fc+126&127)<<2)|0;c[$a>>2]=c[$a>>2]|c[h+(u<<2)>>2];pc=u}else{pc=fc}c[h+(sa<<2)>>2]=ec;Qb=sa;Rb=dc;Sb=Sb+9|0;Tb=pc}g:while(1){qc=lc+1&127;ra=h+((lc+127&127)<<2)|0;sa=ic;u=jc;$a=kc;while(1){_a=($a|0)==18;qa=($a|0)>27?9:1;rc=sa;sc=u;while(1){Za=0;while(1){Wa=Za+rc&127;if((Wa|0)==(lc|0)){tc=2;break}Va=c[h+(Wa<<2)>>2]|0;Wa=c[14048+(Za<<2)>>2]|0;if(Va>>>0<Wa>>>0){tc=2;break}Ua=Za+1|0;if(Va>>>0>Wa>>>0){tc=Za;break}if((Ua|0)<2){Za=Ua}else{tc=Ua;break}}if((tc|0)==2&_a){break g}uc=qa+sc|0;if((rc|0)==(lc|0)){rc=lc;sc=uc}else{break}}_a=(1<<qa)+ -1|0;Za=1e9>>>qa;vc=rc;wc=0;Ua=rc;xc=$a;do{Wa=h+(Ua<<2)|0;Va=c[Wa>>2]|0;Xa=(Va>>>qa)+wc|0;c[Wa>>2]=Xa;wc=fa(Va&_a,Za)|0;Va=(Ua|0)==(vc|0)&(Xa|0)==0;Ua=Ua+1&127;xc=Va?xc+ -9|0:xc;vc=Va?Ua:vc;}while((Ua|0)!=(lc|0));if((wc|0)==0){sa=vc;u=uc;$a=xc;continue}if((qc|0)!=(vc|0)){break}c[ra>>2]=c[ra>>2]|1;sa=vc;u=uc;$a=xc}c[h+(lc<<2)>>2]=wc;ic=vc;jc=uc;kc=xc;lc=qc}$a=rc&127;if(($a|0)==(lc|0)){c[h+(qc+ -1<<2)>>2]=0;yc=qc}else{yc=lc}za=+((c[h+($a<<2)>>2]|0)>>>0);$a=rc+1&127;if(($a|0)==(yc|0)){u=yc+1&127;c[h+(u+ -1<<2)>>2]=0;zc=u}else{zc=yc}pa=+(r|0);Ac=pa*(za*1.0e9+ +((c[h+($a<<2)>>2]|0)>>>0));$a=sc+53|0;u=$a-k|0;if((u|0)<(j|0)){Bc=(u|0)<0?0:u;Cc=1}else{Bc=j;Cc=0}if((Bc|0)<53){za=+bc(+(+$m(1.0,105-Bc|0)),+Ac);Dc=+ub(+Ac,+(+$m(1.0,53-Bc|0)));Ec=za;Fc=Dc;Gc=za+(Ac-Dc)}else{Ec=0.0;Fc=0.0;Gc=Ac}sa=rc+2&127;do{if((sa|0)==(zc|0)){Hc=Fc}else{ra=c[h+(sa<<2)>>2]|0;do{if(ra>>>0<5e8){if((ra|0)==0){if((rc+3&127|0)==(zc|0)){Ic=Fc;break}}Ic=pa*.25+Fc}else{if(ra>>>0>5e8){Ic=pa*.75+Fc;break}if((rc+3&127|0)==(zc|0)){Ic=pa*.5+Fc;break}else{Ic=pa*.75+Fc;break}}}while(0);if((53-Bc|0)<=1){Hc=Ic;break}if(+ub(+Ic,1.0)!=0.0){Hc=Ic;break}Hc=Ic+1.0}}while(0);pa=Gc+Hc-Ec;do{if(($a&2147483647|0)>(-2-o|0)){if(!(+U(+pa)>=9007199254740992.0)){Jc=Cc;Kc=sc;Lc=pa}else{Jc=(Cc|0)!=0&(Bc|0)==(u|0)?0:Cc;Kc=sc+1|0;Lc=pa*.5}if((Kc+50|0)<=(p|0)){if(!((Jc|0)!=0&Hc!=0.0)){Mc=Kc;Nc=Lc;break}}c[(ac()|0)>>2]=34;Mc=Kc;Nc=Lc}else{Mc=sc;Nc=pa}}while(0);l=+an(Nc,Mc);i=g;return+l}else{if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)+ -1}c[(ac()|0)>>2]=22;Zm(b,0);l=0.0;i=g;return+l}}}while(0);do{if((v|0)==23){b=(c[m>>2]|0)==0;if(!b){c[e>>2]=(c[e>>2]|0)+ -1}if(t>>>0<4|(f|0)==0|b){break}else{Oc=t}do{c[e>>2]=(c[e>>2]|0)+ -1;Oc=Oc+ -1|0;}while(Oc>>>0>3)}}while(0);l=+(r|0)*z;i=g;return+l}function Ym(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=i;f=a+4|0;g=c[f>>2]|0;h=a+100|0;if(g>>>0<(c[h>>2]|0)>>>0){c[f>>2]=g+1;j=d[g]|0}else{j=_m(a)|0}do{if((j|0)==43|(j|0)==45){g=(j|0)==45|0;k=c[f>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){c[f>>2]=k+1;l=d[k]|0}else{l=_m(a)|0}if((l+ -48|0)>>>0<10|(b|0)==0){m=l;n=g;break}if((c[h>>2]|0)==0){m=l;n=g;break}c[f>>2]=(c[f>>2]|0)+ -1;m=l;n=g}else{m=j;n=0}}while(0);if((m+ -48|0)>>>0>9){if((c[h>>2]|0)==0){o=0;p=-2147483648;J=p;i=e;return o|0}c[f>>2]=(c[f>>2]|0)+ -1;o=0;p=-2147483648;J=p;i=e;return o|0}else{q=m;r=0}while(1){s=q+ -48+r|0;m=c[f>>2]|0;if(m>>>0<(c[h>>2]|0)>>>0){c[f>>2]=m+1;t=d[m]|0}else{t=_m(a)|0}if(!((t+ -48|0)>>>0<10&(s|0)<214748364)){break}q=t;r=s*10|0}r=((s|0)<0)<<31>>31;if((t+ -48|0)>>>0<10){q=s;m=r;j=t;while(1){l=xn(q|0,m|0,10,0)|0;b=J;g=ln(j|0,((j|0)<0)<<31>>31|0,-48,-1)|0;k=ln(g|0,J|0,l|0,b|0)|0;b=J;l=c[f>>2]|0;if(l>>>0<(c[h>>2]|0)>>>0){c[f>>2]=l+1;u=d[l]|0}else{u=_m(a)|0}if((u+ -48|0)>>>0<10&((b|0)<21474836|(b|0)==21474836&k>>>0<2061584302)){j=u;m=b;q=k}else{v=k;w=b;x=u;break}}}else{v=s;w=r;x=t}if((x+ -48|0)>>>0<10){do{x=c[f>>2]|0;if(x>>>0<(c[h>>2]|0)>>>0){c[f>>2]=x+1;y=d[x]|0}else{y=_m(a)|0}}while((y+ -48|0)>>>0<10)}if((c[h>>2]|0)!=0){c[f>>2]=(c[f>>2]|0)+ -1}f=(n|0)!=0;n=kn(0,0,v|0,w|0)|0;o=f?n:v;p=f?J:w;J=p;i=e;return o|0}function Zm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a+104>>2]=b;e=c[a+8>>2]|0;f=c[a+4>>2]|0;g=e-f|0;c[a+108>>2]=g;if((b|0)!=0&(g|0)>(b|0)){c[a+100>>2]=f+b;i=d;return}else{c[a+100>>2]=e;i=d;return}}function _m(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=b+104|0;g=c[f>>2]|0;if((g|0)==0){h=3}else{if((c[b+108>>2]|0)<(g|0)){h=3}}do{if((h|0)==3){g=cn(b)|0;if((g|0)<0){break}j=c[f>>2]|0;k=c[b+8>>2]|0;do{if((j|0)==0){h=8}else{l=c[b+4>>2]|0;m=j-(c[b+108>>2]|0)+ -1|0;if((k-l|0)<=(m|0)){h=8;break}c[b+100>>2]=l+m}}while(0);if((h|0)==8){c[b+100>>2]=k}j=c[b+4>>2]|0;if((k|0)!=0){m=b+108|0;c[m>>2]=k+1-j+(c[m>>2]|0)}m=j+ -1|0;if((d[m]|0|0)==(g|0)){n=g;i=e;return n|0}a[m]=g;n=g;i=e;return n|0}}while(0);c[b+100>>2]=0;n=-1;i=e;return n|0}function $m(a,b){a=+a;b=b|0;var d=0,e=0.0,f=0,g=0,j=0.0;d=i;do{if((b|0)>1023){e=a*8.98846567431158e+307;f=b+ -1023|0;if((f|0)<=1023){g=f;j=e;break}f=b+ -2046|0;g=(f|0)>1023?1023:f;j=e*8.98846567431158e+307}else{if(!((b|0)<-1022)){g=b;j=a;break}e=a*2.2250738585072014e-308;f=b+1022|0;if(!((f|0)<-1022)){g=f;j=e;break}f=b+2044|0;g=(f|0)<-1022?-1022:f;j=e*2.2250738585072014e-308}}while(0);b=pn(g+1023|0,0,52)|0;g=J;c[k>>2]=b;c[k+4>>2]=g;a=j*+h[k>>3];i=d;return+a}function an(a,b){a=+a;b=b|0;var c=0,d=0.0;c=i;d=+$m(a,b);i=c;return+d}function bn(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;e=b+74|0;f=a[e]|0;a[e]=f+255|f;f=b+20|0;e=b+44|0;if((c[f>>2]|0)>>>0>(c[e>>2]|0)>>>0){jc[c[b+36>>2]&31](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[f>>2]=0;f=b;g=c[f>>2]|0;if((g&20|0)==0){h=c[e>>2]|0;c[b+8>>2]=h;c[b+4>>2]=h;j=0;i=d;return j|0}if((g&4|0)==0){j=-1;i=d;return j|0}c[f>>2]=g|32;j=-1;i=d;return j|0}function cn(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+8|0;e=b;if((c[a+8>>2]|0)==0){if((bn(a)|0)==0){f=3}else{g=-1}}else{f=3}do{if((f|0)==3){if((jc[c[a+32>>2]&31](a,e,1)|0)!=1){g=-1;break}g=d[e]|0}}while(0);i=b;return g|0}function dn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0.0,j=0,k=0;d=i;i=i+112|0;e=d;f=e+0|0;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;Zm(e,0);h=+Xm(e,2,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){i=d;return+h}if((j|0)==0){k=a}else{k=a+j|0}c[b>>2]=k;i=d;return+h}function en(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;a:do{if((d|0)==0){f=0}else{g=d;h=b;j=c;while(1){k=a[h]|0;l=a[j]|0;if(!(k<<24>>24==l<<24>>24)){break}m=g+ -1|0;if((m|0)==0){f=0;break a}else{g=m;h=h+1|0;j=j+1|0}}f=(k&255)-(l&255)|0}}while(0);i=e;return f|0}function fn(){c[510]=p;c[536]=p;c[3274]=p;c[3504]=p}function gn(a){a=a|0;var b=0;b=(fa(c[a>>2]|0,31010991)|0)+1735287159&2147483647;c[a>>2]=b;return b|0}function hn(){return gn(o)|0}function jn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function kn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(J=e,a-c>>>0|0)|0}function ln(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(J=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function mn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Na(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function nn(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{mn(b,c,d)|0}return b|0}function on(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function pn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}J=a<<c-32;return 0}function qn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}J=0;return b>>>c-32|0}function rn(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}J=(b|0)<0?-1:0;return b>>c-32|0}function sn(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function tn(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function un(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=fa(d,c)|0;f=a>>>16;a=(e>>>16)+(fa(d,f)|0)|0;d=b>>>16;b=fa(d,c)|0;return(J=(a>>>16)+(fa(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function vn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=kn(e^a,f^b,e,f)|0;b=J;a=g^e;e=h^f;f=kn((An(i,b,kn(g^c,h^d,g,h)|0,J,0)|0)^a,J^e,a,e)|0;return(J=J,f)|0}function wn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=kn(h^a,j^b,h,j)|0;b=J;An(m,b,kn(k^d,l^e,k,l)|0,J,g)|0;l=kn(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=J;i=f;return(J=j,l)|0}function xn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=un(e,a)|0;f=J;return(J=(fa(b,a)|0)+(fa(d,e)|0)+f|f&0,c|0|0)|0}function yn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=An(a,b,c,d,0)|0;return(J=J,e)|0}function zn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;An(a,b,d,e,g)|0;i=f;return(J=c[g+4>>2]|0,c[g>>2]|0)|0}function An(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(J=n,o)|0}else{if(!m){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(J=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(J=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(J=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((tn(l|0)|0)>>>0);return(J=n,o)|0}p=(sn(l|0)|0)-(sn(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(J=n,o)|0}else{if(!m){r=(sn(l|0)|0)-(sn(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(J=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(sn(j|0)|0)+33-(sn(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(J=n,o)|0}else{p=tn(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(J=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=ln(g,d,-1,-1)|0;k=J;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;kn(e,k,j,a)|0;b=J;h=b>>31|((b|0)<0?-1:0)<<1;K=h&1;L=kn(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=J;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=K}}B=H;C=I;D=M;E=L;F=0;G=K}K=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(K|0)>>>31|(B|C)<<1|(C<<1|K>>>31)&0|F;o=(K<<1|0>>>31)&-2|G;return(J=n,o)|0}function Bn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return jc[a&31](b|0,c|0,d|0)|0}function Cn(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;kc[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Dn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;lc[a&3](b|0,c|0,d|0,e|0,f|0)}function En(a,b){a=a|0;b=b|0;mc[a&255](b|0)}function Fn(a,b,c){a=a|0;b=b|0;c=c|0;nc[a&63](b|0,c|0)}function Gn(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;oc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Hn(a,b){a=a|0;b=b|0;return pc[a&127](b|0)|0}function In(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;qc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Jn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;rc[a&3](b|0,c|0,d|0)}function Kn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;sc[a&7](b|0,c|0,d|0,e|0,f|0,+g)}function Ln(a){a=a|0;tc[a&0]()}function Mn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return uc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Nn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return vc[a&7](b|0,c|0,d|0,e|0)|0}function On(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;wc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Pn(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;xc[a&31](b|0,c|0,d|0,e|0,f|0,g|0)}function Qn(a,b,c){a=a|0;b=b|0;c=c|0;return yc[a&31](b|0,c|0)|0}function Rn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return zc[a&15](b|0,c|0,d|0,e|0,f|0)|0}function Sn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Ac[a&15](b|0,c|0,d|0,e|0)}function Tn(a,b,c){a=a|0;b=b|0;c=c|0;ga(0);return 0}function Un(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ga(1)}function Vn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ga(2)}function Wn(a){a=a|0;ga(3)}function Xn(a,b){a=a|0;b=b|0;ga(4)}function Yn(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ga(5)}function Zn(a){a=a|0;ga(6);return 0}function _n(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ga(7)}function $n(a,b,c){a=a|0;b=b|0;c=c|0;ga(8)}function ao(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ga(9)}function bo(){ga(10)}function co(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ga(11);return 0}function eo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ga(12);return 0}function fo(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ga(13)}function go(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ga(14)}function ho(a,b){a=a|0;b=b|0;ga(15);return 0}function io(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ga(16);return 0}function jo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ga(17)}




// EMSCRIPTEN_END_FUNCS
var jc=[Tn,Ve,_e,cf,hf,nf,xd,rf,Ld,je,ke,ag,fg,Ij,Nj,sk,uk,xk,dk,ik,kk,nk,zm,Tn,Tn,Tn,Tn,Tn,Tn,Tn,Tn,Tn];var kc=[Un,ig,kg,mg,og,qg,sg,ug,wg,yg,Ag,Cg,Hg,Jg,Lg,Ng,Pg,Rg,Tg,Vg,Xg,Zg,$g,nh,ph,Bh,Dh,Mh,Nh,Oh,Ph,Qh,Zh,_h,$h,ai,bi,zj,Fj,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un,Un];var lc=[Vn,Gm,Fm,Em];var mc=[Wn,Xc,cd,dd,ed,Ff,Ef,Hf,Gf,fd,gd,td,ud,Ad,Bd,Hd,Id,Od,Pd,$d,_d,ee,de,ge,pe,oe,Te,Se,ff,ef,uf,tf,wf,vf,Af,zf,Cf,Bf,Mf,Lf,Of,Nf,Uf,Tf,Pe,Vf,Sf,Wf,Yf,Xf,ak,cg,bg,hg,gg,Gg,Fg,ih,hh,wh,vh,Kh,Jh,Xh,Wh,hi,gi,ki,ji,oi,ni,zi,yi,Ki,Ji,Vi,Ui,ej,dj,oj,nj,vj,uj,Bj,Aj,Hj,Gj,Mj,Lj,Vj,Uj,qk,pk,Qj,Hk,ml,ll,ol,nl,Zf,$j,ck,zk,Pk,_k,jl,kl,rm,qm,tm,wm,um,vm,xm,ym,Um,Tm,sd,bk,Wl,gj,Lm,bm,am,$l,_l,Zl,Yl,ve,He,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn,Wn];var nc=[Xn,Ue,vd,Cd,Jd,Qd,gf,ri,si,ti,ui,wi,xi,Ci,Di,Ei,Fi,Hi,Ii,Ni,Oi,Pi,Qi,Si,Ti,Yi,Zi,_i,$i,bj,cj,Kj,Pj,tl,vl,xl,ul,wl,yl,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn,Xn];var oc=[Yn,Rh,ci,Yn];var pc=[Zn,Ye,Ze,jd,af,wd,mf,of,pf,lf,Dd,Ed,Kd,$e,Rd,Sd,ae,fe,Qf,Lh,zl,Bl,Dl,Jl,Ll,Fl,Hl,Yh,Al,Cl,El,Kl,Ml,Gl,Il,pi,qi,vi,Ai,Bi,Gi,Li,Mi,Ri,Wi,Xi,aj,Lk,Mk,Ok,pl,rl,ql,sl,Dk,Ek,Gk,Vk,Wk,Zk,el,fl,il,sm,Vm,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn,Zn];var qc=[_n,wj,Cj,_n];var rc=[$n,ie,Rf,$n];var sc=[ao,qh,th,Eh,Gh,ao,ao,ao];var tc=[bo];var uc=[co,Ik,Jk,Ak,Bk,Qk,Sk,$k,bl,co,co,co,co,co,co,co];var vc=[eo,wk,ek,fk,gk,mk,eo,eo];var wc=[fo,ii,li,fj,jj,pj,rj,fo];var xc=[go,hd,jf,We,jh,kh,oh,uh,xh,yh,Ch,Hh,Jj,Oj,Jm,Im,Hm,go,go,go,go,go,go,go,go,go,go,go,go,go,go,go];var yc=[ho,kd,ld,qf,yd,Fd,sf,bf,Md,Td,df,rk,tk,vk,hk,jk,lk,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho,ho];var zc=[io,_f,dg,yk,Kk,Nk,ok,Ck,Fk,Uk,Xk,dl,gl,io,io,io];var Ac=[jo,id,kf,Xe,$f,eg,Am,Bm,Cm,jo,jo,jo,jo,jo,jo,jo];return{_i64Subtract:kn,_free:Lm,_main:_c,_rand_r:gn,_realloc:Mm,_i64Add:ln,_memmove:nn,_memset:jn,_malloc:Km,_memcpy:mn,_strlen:on,_rand:hn,_bitshift64Shl:pn,__GLOBAL__I_a:Vd,runPostSets:fn,stackAlloc:Bc,stackSave:Cc,stackRestore:Dc,setThrew:Ec,setTempRet0:Hc,setTempRet1:Ic,setTempRet2:Jc,setTempRet3:Kc,setTempRet4:Lc,setTempRet5:Mc,setTempRet6:Nc,setTempRet7:Oc,setTempRet8:Pc,setTempRet9:Qc,dynCall_iiii:Bn,dynCall_viiiiiii:Cn,dynCall_viiiii:Dn,dynCall_vi:En,dynCall_vii:Fn,dynCall_viiiiiiiii:Gn,dynCall_ii:Hn,dynCall_viiiiiid:In,dynCall_viii:Jn,dynCall_viiiiid:Kn,dynCall_v:Ln,dynCall_iiiiiiiii:Mn,dynCall_iiiii:Nn,dynCall_viiiiiiii:On,dynCall_viiiiii:Pn,dynCall_iii:Qn,dynCall_iiiiii:Rn,dynCall_viiii:Sn}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_ii": invoke_ii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viii": invoke_viii, "invoke_viiiiid": invoke_viiiiid, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_fabs": _fabs, "_vsscanf": _vsscanf, "__ZSt9terminatev": __ZSt9terminatev, "___cxa_guard_acquire": ___cxa_guard_acquire, "__reallyNegative": __reallyNegative, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___ctype_toupper_loc": ___ctype_toupper_loc, "__addDays": __addDays, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_fileno": _fileno, "_fread": _fread, "_write": _write, "__isLeapYear": __isLeapYear, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "___cxa_does_inherit": ___cxa_does_inherit, "__exit": __exit, "___cxa_rethrow": ___cxa_rethrow, "_catclose": _catclose, "_llvm_lifetime_end": _llvm_lifetime_end, "_send": _send, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_free_exception": ___cxa_free_exception, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_isxdigit_l": _isxdigit_l, "___cxa_guard_release": ___cxa_guard_release, "_strtol": _strtol, "___setErrNo": ___setErrNo, "_newlocale": _newlocale, "_isdigit_l": _isdigit_l, "___resumeException": ___resumeException, "_freelocale": _freelocale, "_sprintf": _sprintf, "_vasprintf": _vasprintf, "_vsnprintf": _vsnprintf, "_strtoull_l": _strtoull_l, "_read": _read, "_fwrite": _fwrite, "_time": _time, "_pthread_mutex_lock": _pthread_mutex_lock, "_catopen": _catopen, "_exit": _exit, "___ctype_b_loc": ___ctype_b_loc, "_fmod": _fmod, "___cxa_allocate_exception": ___cxa_allocate_exception, "_atoi": _atoi, "_strtoll": _strtoll, "_pwrite": _pwrite, "_uselocale": _uselocale, "_snprintf": _snprintf, "__scanString": __scanString, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_strftime": _strftime, "_isxdigit": _isxdigit, "__parseInt": __parseInt, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_recv": _recv, "_fgetc": _fgetc, "__parseInt64": __parseInt64, "__getFloat": __getFloat, "_abort": _abort, "_isspace": _isspace, "_pthread_cond_wait": _pthread_cond_wait, "_llvm_lifetime_start": _llvm_lifetime_start, "_ungetc": _ungetc, "_fflush": _fflush, "_strftime_l": _strftime_l, "_sscanf": _sscanf, "_catgets": _catgets, "_asprintf": _asprintf, "_strtoll_l": _strtoll_l, "__arraySum": __arraySum, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_pread": _pread, "_mkport": _mkport, "___errno_location": ___errno_location, "_copysign": _copysign, "___cxa_throw": ___cxa_throw, "_isdigit": _isdigit, "_strerror": _strerror, "__formatString": __formatString, "_atexit": _atexit, "_strerror_r": _strerror_r, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "___dso_handle": ___dso_handle, "_stderr": _stderr, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _rand = Module["_rand"] = asm["_rand"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






