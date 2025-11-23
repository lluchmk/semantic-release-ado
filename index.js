const analyzeCommits = require('./lib/analyzeCommits')
const verifyRelease = require('./lib/verifyRelease')
const generateNotes = require('./lib/generateNotes')

module.exports = {
  analyzeCommits,
  verifyRelease,
  generateNotes
}
