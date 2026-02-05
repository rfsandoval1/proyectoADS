module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest', 
    '^.+\\.js$': 'babel-jest' 
  },
  transformIgnorePatterns: [
    '/node_modules/(?!k6)' 
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  clearMocks: true
};
