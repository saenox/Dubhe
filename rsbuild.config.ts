import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  tools: {
    rspack: {
      module: {
        rules: [
          {
            test: /\.(sass|scss)$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    // ...
                  },
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  // using `modern-compiler` and `sass-embedded` together significantly improve build performance,
                  // requires `sass-loader >= 14.2.1`
                  api: 'modern-compiler',
                  implementation: require.resolve('sass-embedded'),
                },
              },
            ],
            // set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
          },
        ],
      },
    },
  },
});
