module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    ['commonjs', { sourceMaps: false }],
    ['module', { sourceMaps: false }],
    'typescript',
  ],
};
