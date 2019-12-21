const mysql = require('mysql')

const mysqlConfig = {
  host: '47.106.90.160',
  user: 'root',
  password : '$Liu294847013',
  database : 'blog_db'
}

module.exports = mysql.createPool(mysqlConfig)