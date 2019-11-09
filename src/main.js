const http = require('http')
const URL = require('url')
const fs = require('fs')
const mysql = require('mysql')
let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'liu_1991',
  database : 'blog_db'
})
connection.connect()
http.createServer((req, res) => {
  const reqUrl = req.url
  res.setHeader("Access-Control-Allow-Origin", "*");  // 设置允许跨域
  if (reqUrl.indexOf('/upload') > -1) {
    const headerData = req.headers
    const boundary = headerData['content-type'].split('boundary=')[1]
    console.log('边界为：', boundary)
    let result = []
    req
      .on('data', (chunk) => {
        result.push(chunk)
      })
      .on('end', () => {
        result = Buffer.concat(result).toString()
        console.log('结果：', result.indexOf(boundary))
        let tempData = result.split(`--${boundary}`)[1]
        const uploadStr = tempData.split('\r\n\r\n')[1]
        console.log('切割后的数据为：', uploadStr)
        
      })
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify({success: true, code: 20000}))
    res.end();
  }
  if (reqUrl.indexOf('/add/management') > -1) {
    const headerData = req.headers
    const boundary = headerData['content-type'].split('boundary=')[1]
    const addSql = 'INSERT INTO management(id,title,introduction,management) VALUES(0,?,?,?)'
    const sordArr = ['title', 'introduction', 'management']
    let result = []
    req
      .on('data', (chunk) => {
        result.push(chunk)
      })
      .on('end', () => {
        result = Buffer.concat(result).toString()
        let splitData = result.split(`--${boundary}`)
        let manageData = {}
        let setData = []
        const keyReg = /\bname="(\w+)"/
        splitData.pop()
        splitData.shift()
        splitData.forEach(item => {
          let arr = item.split('\r\n\r\n')
          let name = keyReg.exec(arr[0])[1]
          let value = arr[1].replace('\r\n', '')
          manageData[name] = value
        })
        sordArr.forEach(item => {
          setData.push(manageData[item])
        })
        connection.query(addSql, setData, (err, result) => {
          if (err) {
            console.log('设置数据库数据失败：', err)
            return;
          }
          console.log('设置数据结果为：', result)
        })
      })
    res.writeHead(200, { 'Content-type': 'application/json; charset=utf-8' });
    res.write(JSON.stringify({success: true, code: 20000}))
    res.end();
  }
  if (reqUrl.indexOf('/get/management') > -1) {
    const sql = 'SELECT * FROM management'
    connection.query(sql,  (err, result) => {
      if(err){
        console.log('[SELECT ERROR] - ', err.message);
        return;
      }
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.write(JSON.stringify({success: true, code: 20000, data: result}))
      res.end();
    });
  }

}).listen(8090)

