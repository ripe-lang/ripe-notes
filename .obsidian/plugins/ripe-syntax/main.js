"use strict";

const obsidian = require("obsidian");

const ALIASES = ["ripe", "rp"];

const NEST_DEPTH = 4;

function blockCommentPattern() {
  const plain = '(?:[^*/]|\\*(?!\\/)|\\/(?!\\*))';
  let pattern = '\\/\\*' + plain + '*\\*\\/';
  for (let level = 0; level < NEST_DEPTH; level++) {
    pattern = '\\/\\*(?:' + plain + '|' + pattern + ')*\\*\\/';
  }
  return new RegExp(pattern);
}

function ripePrismGrammar() {
  return {
    comment: [
      {
        pattern: blockCommentPattern(),
        greedy: true,
      },
      {
        pattern: /\/\/.*/,
        greedy: true,
      },
    ],
    string: {
      pattern: /"(?:[^"\\]|\\.)*"/,
      greedy: true,
      inside: {
        escape: {
          pattern: /\\[nt\\"']|\\0|{{|}}/,
          alias: 'constant',
        },
        interpolation: {
          pattern: /{[^{}]*}/,
          inside: {
            punctuation: /^{|}$/,
          },
        },
      },
    },
    'char-literal': {
      pattern: /'(?:[^'\\]|\\.)'/,
      greedy: true,
      alias: 'string',
    },
    'function-definition': {
      pattern: /\b(func)\s+[A-Za-z_]\w*/,
      inside: {
        keyword: /^func/,
        function: /\w+$/,
      },
    },
    'import-path': {
      pattern: /\b(import|module)\s+[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/,
      inside: {
        keyword: /^\w+/,
        'class-name': /[\w.]+$/,
      },
    },
    keyword: /\b(?:var|func|struct|enum|type|newtype|comptime|module|import|if|else|while|for|in|break|continue|return|loop|match|extern|pub|as|sizeof)\b/,
    builtin: {
      pattern: /\b(?:i8|i16|i32|i64|u8|u16|u32|u64|isize|usize|f32|f64|bool|cstr|char|never|opaque|str|int|float)\b/,
      alias: 'class-name',
    },
    boolean: /\b(?:true|false)\b/,
    constant: /\b(?:null|undefined)\b/,
    function: /\b[A-Za-z_]\w*(?=\s*\()/,
    number: /\b(?:0[xX][\da-fA-F][\da-fA-F_]*|0[bB][01][01_]*|0[oO][0-7][0-7_]*|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)(?:i8|i16|i32|i64|isize|u8|u16|u32|u64|usize|f32|f64)?\b/,
    operator: /\.\.=|\.\.\.|\.\.|<<=?|>>=?|&&|\|\||[+\-*/%&|^]=?|[=!<>]=|[=!~<>]/,
    punctuation: /[{}[\]();,.:]/,
  };
}

const KEYWORDS = new Set(["var","func","struct","enum","type","newtype","comptime","module","import","if","else","while","for","in","break","continue","return","loop","match","extern","pub","as","sizeof"]);

const TYPES = new Set(["i8","i16","i32","i64","u8","u16","u32","u64","isize","usize","f32","f64","bool","cstr","char","never","opaque","str","int","float"]);

const ATOMS = new Set(["true","false","null","undefined"]);

// Live preview runs on CodeMirror 6 but still reads modes from the CM5 shim
function ripeStreamMode() {
  return {
    startState() {
      return { commentDepth: 0 };
    },
    token(stream, state) {
      if (state.commentDepth > 0) {
        while (!stream.eol()) {
          if (stream.match("/*")) {
            state.commentDepth++;
            continue;
          }
          if (stream.match("*/")) {
            state.commentDepth--;
            if (state.commentDepth === 0) break;
            continue;
          }
          stream.next();
        }
        return "comment";
      }

      if (stream.eatSpace()) return null;

      if (stream.match("//")) {
        stream.skipToEnd();
        return "comment";
      }

      if (stream.match("/*")) {
        state.commentDepth = 1;
        return "comment";
      }

      const quote = stream.peek();
      if (quote === '"' || quote === "'") {
        stream.next();
        let escaped = false;
        while (!stream.eol()) {
          const ch = stream.next();
          if (!escaped && ch === quote) break;
          escaped = !escaped && ch === "\\";
        }
        return "string";
      }

      if (stream.match(/^\d[\w.]*/)) return "number";

      if (stream.match(/^[A-Za-z_]\w*/)) {
        const word = stream.current();
        if (KEYWORDS.has(word)) return "keyword";
        if (TYPES.has(word)) return "type";
        if (ATOMS.has(word)) return "atom";
        if (stream.match(/^\s*\(/, false)) return "variable-2";
        return null;
      }

      if (
        stream.match(
          /^(?:\.\.=|\.\.\.|\.\.|<<=?|>>=?|&&|\|\||[+\-*/%&|^]=?|[=!<>]=|[=!~<>])/,
        )
      )
        return "operator";

      stream.next();
      return null;
    },
    lineComment: "//",
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
  };
}

module.exports = class RipeSyntaxPlugin extends obsidian.Plugin {
  onload() {
    const prism = window.Prism;
    if (prism) {
      const grammar = ripePrismGrammar();
      for (const alias of ALIASES) prism.languages[alias] = grammar;
    }

    const cm = window.CodeMirror;
    if (cm && cm.defineMode) {
      cm.defineMode("ripe", ripeStreamMode);
      for (const alias of ALIASES) cm.defineMIME("text/x-" + alias, "ripe");
      if (cm.modeInfo) {
        cm.modeInfo.push({
          name: "Ripe",
          mime: "text/x-ripe",
          mode: "ripe",
          ext: ["rp"],
          alias: ALIASES,
        });
      }
    }
  }
};
