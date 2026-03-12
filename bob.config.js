module.exports = {
  // The React Native version this project is using
  reactNativeVersion: '0.74.1',
  
  // The platforms to build for
  platforms: ['ios', 'android'],
  
  // The output directory for the build
  output: 'lib',
  
  // The source directory
  source: 'src',
  
  // The module formats to build
  formats: ['cjs', 'esm'],
  
  // The TypeScript configuration
  typescript: {
    // The path to the tsconfig file
    project: 'tsconfig.json',
    // Whether to generate declaration files
    declaration: true,
  },
  
  // The Babel configuration
  babel: {
    // The Babel presets to use
    presets: ['module:metro-react-native-babel-preset'],
    // The Babel plugins to use
    plugins: [],
  },
  
  // The Metro bundler configuration
  metro: {
    // The Metro bundler configuration file
    config: 'metro.config.js',
  },
  
  // The Jest configuration
  jest: {
    // The Jest configuration file
    config: 'jest.config.js',
    // Whether to collect coverage
    collectCoverage: true,
    // The coverage directory
    coverageDirectory: 'coverage',
  },
  
  // The ESLint configuration
  eslint: {
    // The ESLint configuration file
    config: '.eslintrc.js',
    // The files to lint
    include: ['src/**/*.{js,jsx,ts,tsx}'],
    // The files to ignore
    exclude: ['**/node_modules/**', '**/lib/**'],
  },
  
  // The Prettier configuration
  prettier: {
    // The Prettier configuration file
    config: '.prettierrc.js',
    // The files to format
    include: ['src/**/*.{js,jsx,ts,tsx,json,md}'],
    // The files to ignore
    exclude: ['**/node_modules/**', '**/lib/**'],
  },
};
