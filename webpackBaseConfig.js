const path = require('path');

// WARNING: Use this module only as an inspiration.
// Cherry-pick the parts you need and inline them in the webpack.config you need.
// This module isn't used to build the documentation. We use Next.js for that.
// This module is used by the visual regression tests to run the demos and by eslint-plugin-import.
module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      '@stoked-ui/docs-markdown': path.resolve(__dirname, './packages-internal/markdown'),
      '@stoked-ui/media-selector': path.resolve(__dirname, './packages/sui-media-selector/src'),
      '@stoked-ui/docs': path.resolve(__dirname, './packages/sui-docs/src'),
      '@stoked-ui/timeline': path.resolve(__dirname, './packages/sui-timeline/src'),
      '@stoked-ui/file-explorer': path.resolve(__dirname, './packages/sui-file-explorer/src'),
      '@stoked-ui/editor': path.resolve(__dirname, './packages/sui-editor/src'),
      '@stoked-ui/docs-utils': path.resolve(__dirname, './packages-internal/docs-utils/src'),
      '@stoked-ui/proptypes/typescript-to-proptypes': path.resolve(__dirname, './packages-internal/scripts/typescript-to-proptypes/src'),
      docs: path.resolve(__dirname, './docs'),
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
};
