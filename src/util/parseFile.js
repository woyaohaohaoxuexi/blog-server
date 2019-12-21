module.exports = (str, boundary) => {
  if (!str || !boundary) {
    return console.error('解析文件上传失败！！')
  }
  const keyReg = /\bname="(\w+)"/
  let splitData = str.split(`--${boundary}`)
  let requestData = {}
  
  splitData.pop()
  splitData.shift()
  splitData.forEach(item => {
    let arr = item.split('\r\n\r\n')
    let name = keyReg.exec(arr[0])[1]
    let value = arr[1].replace('\r\n', '')
    requestData[name] = value
  })
  return requestData
}