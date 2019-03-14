import ts from 'typescript';
import { Modder } from '../interfaces';

export function replaceJsxPropValue(tagName: string, propName: string, value: string) {
  return function replaceJsxPropValueVisitor(node: ts.Node, modder: Modder) {
    if (ts.isJsxOpeningLikeElement(node)) {
      if (node.tagName.getText() === tagName && node.attributes && node.attributes.properties) {
        for (let prop of node.attributes.properties) {
          if (prop && prop.name && prop.name.getText() === propName) {
            debugger;
          }
        }
      }
    }

    return undefined;
  };
}
