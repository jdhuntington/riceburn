import glob from 'glob';
import { jsonHandler } from './json';
import { textHandler } from './text';
import { tsHandler } from './typescript';
import { ModHandlers, Visitor } from './interfaces';

export default function mod(pattern: string) {
  const fileList = glob.sync(pattern);

  const handlers: ModHandlers<any> = {
    asJson: <T>(cb: (json: T) => T, indent?: number) => {
      jsonHandler(fileList, cb, indent);
      return mod(pattern);
    },
    asText: (cb: (text: string) => string) => {
      textHandler(fileList, cb);
      return mod(pattern);
    },
    asTypescript: (visitor: Visitor) => {
      tsHandler(fileList, visitor);
      return mod(pattern);
    }
  };

  return handlers;
}
