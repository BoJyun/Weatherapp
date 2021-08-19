const path=require("path");
module.exports={
    entry:"./src/index.js",
    output:{
        filename:"main.js",
        path:path.resolve(__dirname,"dist")
    },
    mode:"development",
    devServer:{
        contentBase:"./dist"
    },
    module:{
        rules:[
            {
                test:/\.css$/i,
                use:["style-loader","css-loader"]
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader",
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
            },
            {
                test: /\.svg$/,
                // use: [
                //   {
                //     loader: "svg-url-loader",
                //   },
                // ],
                use: ['@svgr/webpack'],
            }
        ]
    }
};