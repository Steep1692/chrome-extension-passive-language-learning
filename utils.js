import { IN_FOLDER_NAME } from './builder-config.js'
import { glob } from 'glob'

export const generateJSEntryObject = () => {
  return glob.sync('./' + IN_FOLDER_NAME + "/**/*.js").reduce(
    (acc, path) => {
      const pathFixed = './' + path;
      const filename = path.replace(IN_FOLDER_NAME, '') // partially used as an output path
      acc[filename] = pathFixed;

      return acc;
    },
    {}
  );
};