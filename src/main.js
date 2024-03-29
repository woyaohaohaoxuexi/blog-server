const http = require('http')
const url = require('url')
const fs = require('fs')
const $date = require('./util/date')
const querystring = require('querystring')
const connection = require('./util/mysql')
const parseFile = require('./util/parseFile')
const parseImg = require('./util/parseImg')
const handlerResponse = require('./util/response')

http.createServer((req, res) => {
  // 设置允许跨域
  res.setHeader("Access-Control-Allow-Origin", "*"); // 允许跨域
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"); // 
  res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  const reqUrl = req.url
  const headerData = req.headers
  const contentType = headerData['content-type']
  let typeReg = /^multipart\/form-data/
  let boundaryReg = /^.*\bboundary=(.*)/
  console.log('获取到请求', req.url, req.method);
  
  // 让 options 请求快速返回
  if (req.method === 'OPTIONS') {
    res.end()
    return
  }
  // 如果请求头的 content-type 为上传类型 （multipart/form-data ）就获取 boundary
  if (typeReg.test(contentType)) {
    boundary = boundaryReg.exec(contentType)[1]
  }
  // 注册用户
  if (/^\/ley\/user\/register/.test(reqUrl)) {
    const querySql = 'SELECT name FROM user_db'
    const addSql = 'INSERT INTO user_db(name,password,createDate) VALUES(?,?,?)'
    const currentDate = $date.timestampToTime(Date.now(), true)
    let currentNames
    let reqResult = ''
    let resStatus
    let resInfo
    // req.setEncoding('utf8')
    
    req
      .on('data', chunk => {
        console.log('接受参数', chunk)
        reqResult += chunk
      })
      .on('end', () => {
        reqResult = JSON.parse(reqResult)
        const { name, password } = reqResult
        connection.query(querySql, (err, result) => {
          if (err) {
            console.log('查询当前拥有的用户', err)
            resStatus = 400
            resInfo = err.message
          } else {
            console.log('查询当前拥有的用户结果', result)
            console.log('拥有用户', typeof result)
            currentNames = result
            if (currentNames.some(item => item.name === name)) {
              resStatus = 400
              resInfo = '该用户已注册，请登陆'
            } else {
              connection.query(addSql, [name, password, currentDate], (err, addResult) => {
                if (err) {
                  resStatus = 400
                  resInfo = err.message
                } else {
                  resStatus = 200
                  resInfo = '注册成功'
                }
                console.log('是否注册成功', resStatus)
                const responseData = handlerResponse(resStatus, resInfo)
                res.writeHead(resStatus, responseData.headeData);
                res.end(responseData.bodyData);
              })
              return
            }
          }
          const responseData = handlerResponse(resStatus, resInfo)
          res.writeHead(resStatus, responseData.headeData);
          res.end(responseData.bodyData);
        })
      })
  }
  // 添加文章
  if (/^\/ley\/add\/article/.test(reqUrl)) {
    const addSql = 'INSERT INTO blog_list(title,introduction,article,updateDate) VALUES(?,?,?,?)'
    const currentDate = Date.now()
    const sordArr = ['title', 'introduction', 'article']
    let result = ''
    let resStatus
    let resInfo
    req.setEncoding('utf8')
    req
      .on('data', (chunk) => {
        result += chunk
      })
      .on('end', () => {
        let setData = []
        let requestData = parseFile(result, boundary)
        sordArr.forEach(item => {
          setData.push(requestData[item])
        })
        setData.push($date.timestampToTime(currentDate, true))
        connection.query(addSql, setData, (err, result) => {
          if (err) {
            resStatus = 400
            resInfo = err
          } else {
            resStatus = 200
            console.log('添加文章成功：', $date.timestampToTime(new Date(), true))
          }
          const resData = handlerResponse(resStatus, resInfo)
          res.writeHead(resStatus, resData.headeData);
          res.end(resData.bodyData);
        })
      })
  }

  // 上传图片
  if (/^\/ley\/upload\/image/.test(reqUrl)) {
    let tempStr = ''
    let status
    let resInfo
    // 设置编码方式
    req.setEncoding('binary')
    req
      .on('data', chunk => {
        tempStr += chunk
      })
      .on('end', () => {
        const fileData = parseImg(tempStr, boundary)
        const { imgName, fileStr } = fileData
        const bufferData = Buffer.from(fileStr, 'binary')
        const imgPath = `/home/iblog/images/${imgName}`
        // const imgPath = `src/images/${imgName}`
        // console.log('
        fs.writeFile(imgPath, bufferData, err => {
          if (err) {
            status = 400
            resInfo = err.message
          } else {
            status = 200
            resInfo = {
              path: `image/${imgName}`
            }
          }
          console.log('上传图片：')
          const responseData = handlerResponse(status, resInfo)
          res.writeHead(status, responseData.headeData);
          res.end(responseData.bodyData);
        })
        // tempStr 数据 图片数据
        // ------WebKitFormBoundaryCAl5a45FLDXq56mw
        // Content-Disposition: form-data; name="file"; filename="right.png"
        // Content-Type: image/png

        // PNG

        // IHDR 
        // ÅM  ÿ4sRGB®ÎéIDATH
        // ¥©ûÅnÛ¸1©'Ò
        // ±Û^Å½GqãÂÎ$JðÕ $Mf(Ã¼|$þEQÔô»Øns²-Tê7UU]9íÐ
        // nvíû¾)Ëò©Ýy\(L
        //               p=á`îMù+Ë²æSWÔÍ,ñ!Åh[a¢Ê·?;5°ôpg?«¿Û84M[¬öeöYµ$UÐÌPT³[rIL'
        //                                                                         È 0     g
        // ä­8ÂÛt%Cà· G(¹ì<,àùæ§¯£0lö³|ãS¾7ðeÁ*ràãÌN96ÄÜ%-ä¾h#G.,0B¾üiHvèó»IEND®B`
        // ------WebKitFormBoundaryCAl5a45FLDXq56mw--
      })
  }

  // 获取文章列表
  if (/^\/ley\/get\/article-list/.test(reqUrl)) {
    const sql = 'SELECT id,title,introduction,updateDate FROM blog_list'
    let status
    let resInfo
    connection.query(sql, (err, result) => {
      if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        status = 400
        resInfo = err.message
      } else {
        status = 200
        resInfo = {
          list: result,
          page: { total: result.length }
        }
      }
      const responseData = handlerResponse(status, resInfo)
      res.writeHead(status, responseData.headeData);
      res.end(responseData.bodyData);
    });
  }

  // 获取文章详情
  if (/^\/ley\/get\/article-detail/.test(reqUrl)) {
    const queryStr = url.parse(reqUrl).query
    const queryData = new URLSearchParams(queryStr)
    const sql = `SELECT article,updateDate FROM blog_list WHERE id = ${queryData.get('articleId')}`
    let status
    let resInfo
    connection.query(sql,  (err, result) => {
      if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        status = 400
        resInfo = err.message
      } else {
        status = 200
        resInfo = result[0]
      }
      const responseData = handlerResponse(status, resInfo)

      res.writeHead(status, responseData.headeData);
      res.end(responseData.bodyData);
    });
  }

  // 删除文章
  if (/^\/ley\/delete\/article/.test(reqUrl)) {
    console.log('删除解耦：', reqUrl)
    const queryStr = url.parse(reqUrl).query
    const delId = new URLSearchParams(queryStr).get('id')
    const sql = `DELETE FROM blog_list WHERE id = ${delId}`
    let status
    let resInfo
    connection.query(sql, (err, result) => {
      if (err) {
        status = 400
        resInfo = err.message
      } else {
        status = 200
      }
      const responseData = handlerResponse(status, resInfo)
      res.writeHead(status, responseData.headeData)
      res.end(responseData.bodyData)
    })
  }

  // 添加标签
  if (/^\/ley\/add\/label/.test(reqUrl)) {
    let result = []
    let resStatus
    let resInfo
    req
    .on('data', data => {
      result.push(data)
    })
    .on('end', () => {
      let requestBody = Buffer.concat(result).toString()
      try {
        requestBody = JSON.parse(requestBody)
      } catch (error) {
        console.log('添加标签接口报错：', error);
      }
      const addSql = 'INSERT INTO label_list(name) VALUES(?)'
      
      connection.query(addSql, [requestBody.name], (err, result) => {
        if (err) {
          resStatus = 400
          resInfo = err
        } else {
          resStatus = 200
          resInfo = result
        }
        const responseData = handlerResponse(resStatus, resInfo)
        res.writeHead(resStatus, responseData.headeData)
        res.end(responseData.bodyData)
      })   
    })
  }

}).listen(8090)
