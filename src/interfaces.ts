import ts from 'typescript';

export interface Modder {
  replace(node: ts.Node, replacement: string): TypescriptMod;
  append(node: ts.Node, suffix: string): TypescriptMod;
  prepend(node: ts.Node, prefix: string): TypescriptMod;
  removeFull(node: ts.Node): TypescriptMod;
  remove(node: ts.Node): TypescriptMod;
}

export interface Visitor {
  (node: ts.Node, modder: Modder): TypescriptMod | undefined;
}

export interface TypescriptMod {
  node: ts.Node;
  start: number;
  length: number;
  replacement: string;
}

export interface ModHandlers<T> {
  asJson: (cb: (json: T) => T) => ModHandlers<T>;
  asText: (cb: (text: string) => string) => ModHandlers<T>;
  asTypescript: (visitor: Visitor) => ModHandlers<T>;
}
