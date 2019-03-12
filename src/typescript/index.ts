import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import { modder } from './modder';
import { TypescriptMod, Visitor } from '../interfaces';

function getSourceFile(file: string, content: string) {
  const normalizedFile = path.normalize(file).replace(/\\/g, '/');
  return ts.createSourceFile(normalizedFile, content, ts.ScriptTarget.ES5, true);
}

export function _applyMods(content: string, mods: TypescriptMod[]) {
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

export function _sortMods(mods: TypescriptMod[]) {
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

export function _visitAndCollectMods(sourceFile: ts.SourceFile, visitor: Visitor) {
  const mods: TypescriptMod[] = [];

  const visitorWrapper = (node: ts.Node) => {
    const mod = visitor(node, modder);
    if (mod) {
      mods.push(mod);
    }
    node.forEachChild(visitorWrapper);
  };

  sourceFile.forEachChild(visitorWrapper);

  return mods;
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
      const mods = _visitAndCollectMods(sourceFile, visitor);
      newContent = _applyMods(sourceFile.getFullText(), _sortMods(mods));

      if (newContent !== content) {
        fs.writeFileSync(match, newContent);
      }
    }
  });
}
