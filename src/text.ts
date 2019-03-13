import fs from 'fs';

export function textHandler<T = any>(matches: string[], cb: (text: string) => any) {
  let outputString: string;
  let inputString: string;

  matches.forEach(match => {
    inputString = fs.readFileSync(match).toString();

    if (cb) {
      outputString = cb(inputString);

      if (outputString !== inputString) {
        fs.writeFileSync(match, outputString);
      }
    }
  });
}
