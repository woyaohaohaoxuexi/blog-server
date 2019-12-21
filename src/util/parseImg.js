module.exports = (str, boundary) => {
  const fileReg = /\bfilename="(.*)"/
  const tempArr = str.split(`--${boundary}`)
  tempArr.pop()
  tempArr.shift()
  const reqStr = tempArr[0]
  const fileArr = reqStr.split('\r\n\r\n')
  const nameStr = fileArr[0]
  const fileName = fileReg.exec(nameStr)[1]
  const fileStr = fileArr[1]

  return {
    fileName,
    fileStr
  }
}