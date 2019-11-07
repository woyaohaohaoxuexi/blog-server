const http = require('http')
const URL = require('url')
const fs = require('fs')

http.createServer((req, res) => {
  const reqUrl = req.url
  res.setHeader("Access-Control-Allow-Origin", "*");  // 设置允许跨域
  if (reqUrl.indexOf('/upload')) {
    let strs = ''
    req.on('data', (str) => {
      strs += str
    })
    req.on('end', () => {
      console.log('接受到的数据：', strs)
    })
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.write(strs)
    res.end();
  }

}).listen(8090)

