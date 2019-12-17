const http = require('http')
const URL = require('url')
const fs = require('fs')
const mysql = require('mysql')
const $date = require('./util/date')
const querystring = require('querystring')

const mysql_config = {
  host: '47.106.90.160',
  user: 'root',
  password : '$Liu294847013',
  database : 'blog_db'
}
let connection = mysql.createPool(mysql_config)

http.createServer((req, res) => {
  const reqUrl = req.url
  res.setHeader("Access-Control-Allow-Origin", "*");  // 设置允许跨域
  // 上传 md 文件
  if (reqUrl.indexOf('/upload/management') > -1) {
    const headerData = req.headers
    const boundary = headerData['content-type'].split('boundary=')[1]
    let result = []
    req
      .on('data', (chunk) => {
        result.push(chunk)
      })
      .on('end', () => {
        result = Buffer.concat(result).toString()
        let tempData = result.split(`--${boundary}`)[1]
        const uploadStr = tempData.split('\r\n\r\n')[1]
      })
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(JSON.stringify({success: true, code: 20000}))
    res.end();
  }

  // 上传图片
  if (reqUrl.includes('/upload/image')) {
    const boundary = req.headers['content-type'].split('boundary=')[1]
    let tempStr = ''
    // 设置编码方式
    req.setEncoding('binary')
    // const destinationFile = fs.createWriteStream('temp.png')
    req
      .on('data', chunk => {
        tempStr += chunk
        // destinationFile.write(chunk)
      })
      .on('end', () => {
        // req.pipe(destinationFile)
        // 解析为 对象数据
        const file = querystring.parse(tempStr, '\r\n', ':')
        // 获取文件名称
        let fileName = ''
        for (let f in file) {
          if (f === 'Content-Disposition') {
            let tempData = file[f].split('; ')
            tempData.some(item => {
              if (item.includes('filename')) {
                fileName = /^filename="(.{1,})"$/.exec(item)[1]
                return true
              }
            })
          }
        }
        const entireData = tempStr.toString()
        const contentType = file['Content-Type'].substring(1)
        // 获取文件二进制数据开始位置
        const upperBoundary = entireData.indexOf(contentType) + contentType.length
        const shorterData = entireData.substring(upperBoundary)

        // 替换开始位置的空格
        const binaryDataAlmost = shorterData.replace(/^\s\s*/, '').replace(/\s\s*$/, '')

        // 去除数据末尾的额外数据， "--" + boundary + "--"
        const binaryData = binaryDataAlmost.substring(0,
          binaryDataAlmost.indexOf("--" + boundary + "--")
        )
        const buferData = new Buffer.from(binaryData, 'binary')
        const imgPath = `/var/www/assets/image/${fileName}`
        fs.writeFile(imgPath, buferData, err => {
          if (err) {
            console.log('写入错误：', err)
            return 
          }
          console.log('写入成功')
          res.writeHead(200, { 'Content-type': 'application/json' });
          res.write(JSON.stringify({success: true, code: 20000, path: `image/${fileName}`}))
          res.end();
        })
      })

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
    const queryStr = reqUrl.split('?')[1]
    const queryData = new URLSearchParams(queryStr)
    console.log('请求参数：', queryData.get('articleId'))
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

