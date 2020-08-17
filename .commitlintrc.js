const ErrorLevel = {
  ERROR: 2,
};

module.exports = {
  extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
    'body-max-line-length': [ErrorLevel.ERROR, 'always', Infinity],
  },
};
