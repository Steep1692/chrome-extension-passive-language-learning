import path from 'path'
import { glob } from 'glob'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { URL } from 'url'
import { IN_FOLDER_NAME, OUT_FOLDER_NAME } from './builder-config.js'
const __dirname = new URL('.', import.meta.url).pathname

const generateEntryObject = () => {
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

const entries = generateEntryObject();

export default {
  mode: 'development',

  // to prevent appearing {eval} in "development" mode
  // as it leads to an 'unsafe-eval' error
  devtool: 'cheap-module-source-map',

  context: __dirname,
  node: {
    __filename: true
  },

  entry: entries,
  module: {
    rules: [
      {
        test: /\.(scss|css)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
        loader: "file-loader",
      },
      {
        test: /\.(js|jsx)$/,
        include: path.join(__dirname, IN_FOLDER_NAME),
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, OUT_FOLDER_NAME),
    filename: "[name]",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: ({ chunk }) => {
        // Prevent "main.js.css", ...
        return chunk.name.replace(".js", "") + ".css";
      },
    }),
  ],
};