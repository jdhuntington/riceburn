import mockfs from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { tsHandler } from '../../typescript';
import { Visitor } from '../../interfaces';

export function testTsHandlerWithFixtureFactory(fixturesPath: string) {
  return function(fixtureName: string, test: Visitor) {
    const fixture = path.join(fixturesPath, fixtureName);
    tsHandler([fixture], test);

    const newContent = fs.readFileSync(fixture).toString();
    mockfs.restore();

    expect(newContent).toMatchSnapshot();
  };
}
