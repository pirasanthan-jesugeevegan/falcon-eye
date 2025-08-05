export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Increase header line length from default 100 to 150 characters
    'header-max-length': [2, 'always', 150],
    // Increase body line length from default 100 to 120 characters
    'body-max-line-length': [2, 'always', 120],
    // Increase footer line length from default 100 to 120 characters
    'footer-max-line-length': [2, 'always', 120],
  },
};
