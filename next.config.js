const withPlugins = require('next-compose-plugins');

const nextConfig = {
  /* config options here */
  output: "standalone",
};

module.exports = withPlugins([], nextConfig);

