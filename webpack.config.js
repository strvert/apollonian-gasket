import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import sass from "sass";
import HtmlWebpackPlugin from "html-webpack-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const __dirname = path.resolve(path.dirname(''));

const config = {
    context: __dirname,
    devtool: "eval-cheap-module-source-map",

    mode: "development",

    devServer: {
        static: {
            directory: "dist"
        },
        devMiddleware: {
            writeToDisk: true,
        },
        open: true
    },


    entry: "./src/scripts/index.ts",

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/main.js",
    },

    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: sass,
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    transpileOnly: true
                }
            }
        ]
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: "./css/style.css"
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new ForkTsCheckerWebpackPlugin(),
        new CleanWebpackPlugin()
    ],
};

export default config;
