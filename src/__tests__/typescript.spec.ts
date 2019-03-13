import mockfs from 'mock-fs';
import fs from 'fs';
import ts from 'typescript';
import { tsHandler } from '../typescript';

const FixturesPath = 'src/__tests__/fixtures';

describe('tshandler', () => {
  const mockContents: { [pathName: string]: { [fileName: string]: string } } = {
    [FixturesPath]: {}
  };

  beforeAll(() => {
    console.log(process.cwd());

    const fixtures = fs.readdirSync(FixturesPath);

    fixtures.forEach(fixture => {
      if (fixture.endsWith('.ts') || fixture.endsWith('.tsx')) {
        mockContents[FixturesPath][fixture] = fs.readFileSync(`${FixturesPath}/${fixture}`).toString();
      }
    });
  });

  beforeEach(() => {
    mockfs(mockContents);
  });

  it('replaces node with text', () => {
    const fixture = `${FixturesPath}/variableDeclaration.ts`;

    tsHandler([fixture], (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.replace(node, `${node.name.getText()} = 'test'`);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  it('prepends node with text', () => {
    const fixture = `${FixturesPath}/prepend.ts`;

    tsHandler([fixture], (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.prepend(node.parent, `console.log('prepended');\n`);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  it('appends node with text', () => {
    const fixture = `${FixturesPath}/append.ts`;

    tsHandler([fixture], (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.append(node.parent, `\nconsole.log('appended');`);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  it('removes node', () => {
    const fixture = `${FixturesPath}/remove.ts`;

    tsHandler([fixture], (node, modder) => {
      if (ts.isExpressionStatement(node)) {
        return modder.remove(node);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  it('removes node fully', () => {
    const fixture = `${FixturesPath}/removeFull.ts`;

    tsHandler([fixture], (node, modder) => {
      if (ts.isExpressionStatement(node)) {
        return modder.removeFull(node);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  function matchSnapshot(content: string) {
    mockfs.restore();
    expect(content).toMatchSnapshot();
  }
});
