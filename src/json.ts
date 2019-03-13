import fs from 'fs';

export function jsonHandler<T = any>(matches: string[], cb: (json: any) => any, spaceIndents: number = 2) {
  let json: T;
  let newJson: T;
  let outputString: string;
  let inputString: string;

  matches.forEach(match => {
    inputString = fs.readFileSync(match).toString();

    try {
      json = JSON.parse(inputString);
    } catch {
      console.error('invalid JSON');
    }

    if (cb) {
      newJson = cb(json);
      outputString = JSON.stringify(newJson, null, spaceIndents);

      if (outputString !== inputString) {
        fs.writeFileSync(match, outputString);
      }
    }
  });
}
