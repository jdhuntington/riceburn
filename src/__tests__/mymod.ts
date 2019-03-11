import mod from '../mod';
import ts from 'typescript';

mod('../../src/test.ts')
  .asTypescript((node, modder) => {
    if (ts.isVariableDeclaration(node)) {
      const declaration = node as ts.VariableDeclaration;
      const name = declaration.name.getText();
      const value = '5555';
      return modder.replace(node, `${name} = ${value}`);
    }
  })
  .asTypescript((node, modder) => {
    if (ts.isExpressionStatement(node)) {
      for (let child of node.getChildren()) {
        if (ts.isCallExpression(child)) {
          return modder.prepend(node, 'console.log("hi");');
        }
      }
    }
  });
