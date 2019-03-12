import mockfs from 'mock-fs';
import fs from 'fs';
import ts from 'typescript';
import { tsHandler } from '../typescript';

const FixturesPath = 'src/__tests__/fixtures';

describe('asTypescript', () => {
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

  it('replaces node with text', async () => {
    const fixture = `${FixturesPath}/variableDeclaration.ts`;

    await tsHandler([fixture], (node, modder) => {
      if (ts.isVariableDeclaration(node)) {
        return modder.replace(node, `${node.name.getText()} = 'test'`);
      }
    });

    matchSnapshot(fs.readFileSync(fixture).toString());
  });

  function matchSnapshot(content: string) {
    mockfs.restore();
    expect(content).toMatchSnapshot();
  }
});
