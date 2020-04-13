const process = require('process')
const { NODE_ENV } = process.env
module.exports = {
  NODE_ENV,
  IS_DEV: NODE_ENV === 'development'
}
