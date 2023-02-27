/**
 * uuid
 * @returns
 */
export function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 防抖
 * 函数连续触发，只执行最后一次。
 */
export function debounce(func: Function, wait: undefined | number = 300) {
  let timer: any;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, wait);
  };
}

/**
 * 节流
 * 函数在一定时间内只能执行一次
 */
export function throttle(func: Function, wait: undefined | number = 300) {
  let timer: any;
  return () => {
    if (timer) return;
    timer = setTimeout(() => {
      func();
      timer = null;
    }, wait);
  };
}
