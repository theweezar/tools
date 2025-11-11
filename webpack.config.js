"use strict";

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

/**
 * Lists all .js files in the client/js folder.
 * @param {string} _path - Folder path.
 * @returns {Object} An object where keys are filenames without extensions and values are full paths.
 */
const listJSFiles = (_path) => {
  const folderPath = path.join(cwd, _path);
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    const result = {};
    files
      .filter(file => file.isFile() && file.name.endsWith(".js"))
      .forEach(file => {
        const name = path.basename(file.name, path.extname(file.name));
        result[name] = path.join(folderPath, file.name);
      });
    return result;
  } catch (error) {
    console.error(`Error reading folder: ${error.message}`);
    throw error;
  }
};

const mode = "production";

const JS_RULE = {
  test: /\.m?js$/,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
    options: {
      plugins: [
        "@babel/plugin-proposal-optional-chaining"
      ],
      presets: ["@babel/preset-env"],
      cacheDirectory: true
    }
  }
};

const CSS_RULE = {
  test: /\.(scss)$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader
    },
    {
      loader: "css-loader"
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: function () {
            return [
              require("autoprefixer")
            ];
          }
        }
      }
    },
    {
      loader: "sass-loader",
      options: {
        sassOptions: {
          silenceDeprecations: [
            "import",
            "color-functions",
            "global-builtin",
            "mixed-decls",
            "legacy-js-api",
          ],
          quietDeps: true
        }
      }
    }
  ]
};

const COMMON = {
  mode: mode,
  devtool: "cheap-module-source-map",
  target: ["web", "es5"],
  module: {
    rules: [
      {
        ...JS_RULE
      },
      {
        ...CSS_RULE
      }
    ]
  }
};

module.exports = [
  {
    ...COMMON,
    entry: listJSFiles("makecv/client"),
    output: {
      path: path.join(cwd, "makecv/dist"),
      filename: "[name].js"
    },
    externals: {
      "chrome": "chrome"
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css"
      })
    ]
  }
];
