import mockfs from 'mock-fs';
import ts from 'typescript';
import { loadFixtures } from './testutils/loadFixtures';
import { testTsHandlerWithFixtureFactory } from './testutils/testTsHandlerWithFixtureFactory';

const FixturesPath = 'src/__tests__/fixtures/typescript';

describe('tshandler', () => {
  const mockContents = loadFixtures(FixturesPath);
  const testWithFixture = testTsHandlerWithFixtureFactory(FixturesPath);

  beforeEach(() => {
    mockfs(mockContents);
  });

  it('replaces node with text', () => {
    testWithFixture('variableDeclaration.ts', (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.replace(node, `${node.name.getText()} = 'test'`);
      }
    });
  });

  it('prepends node with text', () => {
    testWithFixture('prepend.ts', (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.prepend(node.parent, `console.log('prepended');\n`);
      }
    });
  });

  it('appends node with text', () => {
    testWithFixture('append.ts', (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.append(node.parent, `\nconsole.log('appended');`);
      }
    });
  });

  it('removes node', () => {
    testWithFixture('remove.ts', (node, modder) => {
      if (ts.isExpressionStatement(node)) {
        return modder.remove(node);
      }
    });
  });

  it('removes node fully', () => {
    testWithFixture('removeFull.ts', (node, modder) => {
      if (ts.isExpressionStatement(node)) {
        return modder.removeFull(node);
      }
    });
  });
});
