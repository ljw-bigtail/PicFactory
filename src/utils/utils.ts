/**
 * 时间格式化处理
 * @param fmt 
 * @param date 
 * @returns 
 */
export function dateFmt(fmt?: any, date?: any) {
  if (!date) {
    date = new Date()
  }
  if (!fmt) {
    fmt = "yyyy-MM-dd HH:mm:ss"
  }
  switch (typeof date) {
    case "string":
      date = new Date(date.replace(/-/, "/"));
      break;
    case "number":
      date = new Date(date);
      break;
  }
  if (date instanceof Date) {
    const dict: any = {
      yyyy: date.getFullYear(),
      M: date.getMonth() + 1,
      d: date.getDate(),
      H: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds(),
      MM: ("" + (date.getMonth() + 101)).substr(1),
      dd: ("" + (date.getDate() + 100)).substr(1),
      HH: ("" + (date.getHours() + 100)).substr(1),
      mm: ("" + (date.getMinutes() + 100)).substr(1),
      ss: ("" + (date.getSeconds() + 100)).substr(1),
    };
    return fmt.replace(/(yyyy|MM?|dd?|HH?|mm?|ss?)/g, function () {
      return dict[arguments[0]];
    });
  }
}

/**
 * uuid
 * @returns 
 */
export function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * localStorage
 */
export const Cache = {
  get: (key: string)=>{
    const json = window.localStorage.getItem(key)
    return json ? JSON.parse(json) : {}
  },
  set: (key: string, value: {})=>{
    window.localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string)=>{
    window.localStorage.removeItem(key)
  },
  clear: ()=>{
    window.localStorage.clear()
  }
}

export default {
  dateFmt,
  uuid,
  Cache,
}