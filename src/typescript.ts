import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

function getSourceFile(file: string, content: string) {
  const normalizedFile = path.normalize(file).replace(/\\/g, '/');
  return ts.createSourceFile(normalizedFile, content, ts.ScriptTarget.ES5, true);
}

interface TypescriptMod {
  node: ts.Node;
  start: number;
  length: number;
  replacement: string;
}

const Modder = {
  replace(node: ts.Node, replacement: string): TypescriptMod {
    return {
      node,
      start: node.getStart(),
      length: node.getText().length,
      replacement
    };
  },

  append(node: ts.Node, suffix: string): TypescriptMod {
    return {
      node,
      start: node.getStart() + node.getText().length,
      length: 0,
      replacement: suffix
    };
  },

  prepend(node: ts.Node, prefix: string): TypescriptMod {
    return {
      node,
      start: node.getStart(),
      length: 0,
      replacement: prefix
    };
  },

  removeFull(node: ts.Node): TypescriptMod {
    return {
      node,
      start: node.getFullStart(),
      length: node.getFullText().length,
      replacement: ''
    };
  },

  remove(node: ts.Node): TypescriptMod {
    return {
      node,
      start: node.getStart(),
      length: node.getText().length,
      replacement: ''
    };
  }
};

function applyMods(content: string, mods: TypescriptMod[]) {
  let index = 0;
  let newContent: string[] = [];

  mods.forEach(mod => {
    newContent.push(content.slice(index, mod.start));
    newContent.push(mod.replacement);
    index = mod.start + mod.length;
  });

  newContent.push(content.slice(index));

  return newContent.join('');
}

function sortMods(mods: TypescriptMod[]) {
  const sorted = mods.sort((a, b) => {
    return a.start < b.start ? -1 : a.start === b.start ? 0 : 1;
  });

  // Check for overlapped ranges
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.length + prev.start > curr.start) {
      throw new Error('Some of the mods overlap with each other. Please separate this out as another "asTypescript()" call.');
    }
  }

  return sorted;
}

export interface Visitor {
  // TODO: returns a TypescriptMod?
  (node: ts.Node, modder: typeof Modder): TypescriptMod | undefined;
}

export async function tsHandler(matches: string[], visitor: Visitor) {
  let sourceFile: ts.SourceFile;
  let content: string;
  let newContent: string;

  matches.forEach(async match => {
    content = fs.readFileSync(match).toString();

    try {
      sourceFile = getSourceFile(match, content);
    } catch {
      console.error('invalid Typescript file');
    }

    if (visitor) {
      let mods: TypescriptMod[] = [];

      const visitorWrapper = (node: ts.Node) => {
        const mod = visitor(node, Modder);
        if (mod) {
          mods.push(mod);
        }
        node.forEachChild(visitorWrapper);
      };

      sourceFile.forEachChild(visitorWrapper);

      newContent = applyMods(sourceFile.getFullText(), sortMods(mods));

      if (newContent !== content) {
        fs.writeFileSync(match, newContent);
      }
    }
  });
}
