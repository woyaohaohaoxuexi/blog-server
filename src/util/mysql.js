const mysql = require('mysql')
const { IS_DEV } = require('./env')
let host = '121.37.229.207'
let password = '$Liu199112'

// if (IS_DEV) {
//   host = 'localhost'
//   password = '$Liu294847013'
// } else {
//   host = '121.37.229.207'
//   password = '$Liu199112'
// }
const mysqlConfig = {
  host,
  user: 'root',
  password,
  database : 'blog'
}

module.exports = mysql.createPool(mysqlConfig)