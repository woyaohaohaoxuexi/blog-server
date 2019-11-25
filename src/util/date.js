// 转为时间字符串
/**
 * 十位补零
 * @param num (Number)
 * @returns padTime(0) -> '00'
 */
const padTime = num => (num < 10 ? '0' + num : num)

/**
 *  将时间戳转换为日期
 * "使用Date(), 将时间戳转换转换为可读格式)."
 * @param {传入的时间戳} timestamp
 * @param {布尔值是否需要时钟} needTime
 * @param {返回的格式 (1:yyyy-mm-dd或者2: dd/mm/yyyy )} format
 * Example1: timestampToTime(1489525200000, true) -> "2017-03-15 05:00:00"
 * Example2: timestampToTime(1489525200000, false) -> "2017-03-15"
 * Example3: timestampToTime(1489525200000, true,2) -> "2017/03/15 05:00:00"
 * Example4: timestampToTime(1489525200000, false,2) -> "2017/03/15"
 */
module.exports = {
  timestampToTime: (timestamp, needTime = false, format = 1) => {
    let date = new Date(timestamp)
    let Y = date.getFullYear()
    let M = padTime(date.getMonth() + 1)
    let D = padTime(date.getDate())
    let h = padTime(date.getHours())
    let m = padTime(date.getMinutes())
    let s = padTime(date.getSeconds())

    switch (format) {
      case 1:
        return needTime ? `${Y}-${M}-${D} ${h}:${m}:${s}` : `${Y}-${M}-${D}`
      case 2:
        return needTime ? `${D}/${M}/${Y} ${h}:${m}:${s}` : `${D}/${M}/${Y}`
      case 3:
        return needTime ? `${Y}${M}${D} ${h}${m}${s}` : `${Y}${M}${D}`
      case 4:
        return needTime ? `${Y}.${M}.${D} ${h}${m}${s}` : `${Y}.${M}.${D}`
    }
  }
}
