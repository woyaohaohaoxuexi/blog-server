module.exports = (status, data) => {
  let resData = null
  let tempData = data || {}
  switch (status) {
    case 200:
      resData = {
        success: true,
        code: 20000,
        data: tempData
      }
      break
    case 400:
      resData = {
        success: false,
        code: 40000,
        message: tempData
      }
      break
  }
  return {
    headeData: {
      'Content-type': 'application/json;  charset=utf-8'
    },
    bodyData: JSON.stringify(resData)
  }
}