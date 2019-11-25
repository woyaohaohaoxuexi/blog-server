const http = require('http')
const URL = require('url')
const fs = require('fs')
const mysql = require('mysql')
const $date = require('./util/date')
let connection = mysql.createConnection({
  host: '47.106.90.160',
  user: 'root',
  password : '$Liu294847013',
  database : 'blog_db'
})
connection.connect()
http.createServer((req, res) => {
  const reqUrl = req.url
  res.setHeader("Access-Control-Allow-Origin", "*");  // 设置允许跨域
  console.log('服务端获取到请求')
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
  if (reqUrl.indexOf('/add/article') > -1) {
    const headerData = req.headers
    const boundary = headerData['content-type'].split('boundary=')[1]
    const addSql = 'INSERT INTO blog_list(id,title,introduction,article,updateDate) VALUES(0,?,?,?,?)'
    const currentDate = Date.now()
    const sordArr = ['title', 'introduction', 'article']
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
        setData.push($date.timestampToTime(currentDate, true))
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
  // 获取文章列表
  if (reqUrl.indexOf('/get/article-list') > -1) {
    const sql = 'SELECT id,title,introduction,updateDate FROM blog_list'
    console.log('获取到请求')
    connection.query(sql,  (err, result) => {
      if(err){
        console.log('[SELECT ERROR] - ', err.message);
        return;
      }
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.write(JSON.stringify({
        success: true,
        code: 2000,
        data: {
          list: result,
          page: { total: result.length }
        }
      }))
      res.end();
    });
  }

  // 获取文章详情
  if (reqUrl.indexOf('/get/article-detail') > -1) {
    // console.log('获取文章详情：', req)
    const queryStr = reqUrl.split('?')[1]
    const queryData = new URLSearchParams(queryStr)
    console.log('请求参数：', queryData)
    const sql = `SELECT article,updateDate FROM blog_list WHERE id = ${ queryData.get('articleId') }`
    connection.query(sql,  (err, result) => {
      if(err){
        console.log('[SELECT ERROR] - ', err.message);
        return;
      }
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.write(JSON.stringify({
        success: true,
        code: 2000,
        data: result[0]
      }))
      res.end();
    });
  }

}).listen(8090)

