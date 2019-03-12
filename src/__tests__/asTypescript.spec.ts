import mockfs from 'mock-fs';
import fs from 'fs';
import { tsHandler } from '../typescript';

describe('asTypescript', () => {
  beforeAll(() => {
    const fixtures = fs.readdirSync('fixtures');
    const mockContents: { [name: string]: string } = {};

    fixtures.forEach(fixture => {
      if (fixture.endsWith('.ts') || fixture.endsWith('.tsx')) {
        mockContents[`../../src/${fixture}`] = fs.readFileSync(fixture).toString();
      }
    });

    mockfs(mockContents);
  });

  afterAll(() => {
    mockfs.restore();
  });

  it('replaces node with text', () => {
    const fixture = '../../src/fixtures/variableDeclaration.ts';

    tsHandler([fixture], (node, modder) => {
      return modder.replace(node, 'hello');
    });

    expect(fs.readFileSync(fixture)).toMatchSnapshot();
  });
});
