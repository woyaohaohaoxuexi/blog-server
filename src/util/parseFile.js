module.exports = (str, boundary) => {
  if (!str || !boundary) {
    return console.error('解析文件上传失败！！')
  }
  const keyReg = /\bname="(\w+)"/
  const splitList = str.match(`^(-+${boundary})`)
  let splitStr
  if (Array.isArray(splitList) && splitList.length) {
    splitStr = splitList[1]
  }
  let splitData = str.split(splitStr)
  let requestData = {}
  
  splitData.pop()
  splitData.shift()
  splitData.forEach(item => {
    const spaceReg = /^\r\n|\r\n$/g
    const tempStr = item.replace(spaceReg, "")
    const spaceIndex = tempStr.indexOf('\r\n\r\n')
    if (spaceIndex !== -1) {
      const nameStr = tempStr.slice(0, spaceIndex)
      const valueStr = tempStr.slice(spaceIndex + 4)
      const name = nameStr.match(keyReg)[1]
      requestData[name] = valueStr
    }
  })
  return requestData
}