// src/routes/api/get.js

const { version, author } = require('../../../package.json');
/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  res.status(200).json({
    status: 'ok',
    author,
    //  TODO: change this to use your GitHub username
    githubUrl: 'https://github.com/kbaitubayev/fragments',
    version,
    fragments: [],
  });
};
