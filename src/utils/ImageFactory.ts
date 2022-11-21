import { Frame, VideoOption } from "../type/video";

export class ImageFactory {
  options: VideoOption;
  constructor(options: VideoOption) {
    this.options = options; 
  }
  async transforms(frames: Frame[]): Promise<Blob[]>{
    return Promise.all(frames.map(async frame => await this.transform(frame)))
  }
  async transform(frame: Frame): Promise<Blob>{
    const img = await this._loadImg(frame.file)
    const canvas = this._paintFrame({img, frame})
    return await this._canvasToBlob(canvas)
  }
  async _canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise(function(res, rej){
      canvas.toBlob(function(blob){
        if(blob){
          res(blob)
        }else{
          rej('数据异常')
        }
      }, "image/jpeg", 1)
    })
  }
  _canvasToImage(canvas: HTMLCanvasElement) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  }
  async _loadImg(file: File): Promise<HTMLImageElement>{
    return new Promise(function(rej){
      const img = new Image();
      img.src = window.URL.createObjectURL(file);
      img.onload = function() {
        rej(img)
      };
    })
  }
  _paintFrame(imgLoadObject: {
    img: HTMLImageElement
    frame: Frame
  }): HTMLCanvasElement {
    const { width, height, rule, background } = this.options;
    const { img, frame } = imgLoadObject
    // init
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')
    if(!img || !ctx) throw new Error('数据异常')
    // 背景色
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 处理图片
    const { canvasData, imgData } = (function(){
      const { width: imgwidth, height: imgheight } = img
      const { width: canvaswidth, height: canvasheight } = canvas
      // 需要放大的最大倍数
      const scale = Math.max(canvaswidth / imgwidth, canvasheight / imgheight, 1)
      // canvas中定位的坐标值, canvas中即将绘制区域
      // 图像在canvas里的起点坐标(默认 0，0 ), 图像在canvas中绘制的大小（默认 图片宽高，宽高比变了图片可以变形）
      // image所要绘制的起始位置, image所要绘制区域
      const imgCut = [Math.floor(canvaswidth / scale), Math.floor(canvasheight / scale)];
      const imgData = [Math.floor((imgwidth - imgCut[0]) / 2), Math.floor((imgheight - imgCut[1]) / 2), Math.floor(canvaswidth / scale), Math.floor(canvasheight / scale)]
      const canvasData = [ 0 , 0, canvaswidth, canvasheight];
      return { imgData, canvasData }
    })()
    // 绘制
    // 坐标参考调整
    const [ox, oy, owidth, oheight] = imgData;
    const [sx, sy, swidth, sheight] = canvasData;
    // 把 img中起始坐标为 ox, oy 宽 owidth 高 oheight的图像绘制在canvas中，绘制的起始坐标为sx, sy，绘制的宽高为swidth, sheight
    ctx.drawImage(img, ox, oy, owidth, oheight, sx, sy, swidth, sheight);
    // 变换
    const { rotateY } = frame
    const _scale = rotateY == 180 ? -1 : 1
    if(_scale == -1){
      // 镜像
      const getCanvasData = ctx.getImageData(0, 0, swidth, sheight);
      const newCanvasData = ctx.getImageData(0, 0, swidth, sheight);
      ctx.putImageData(this.canvasDataHRevert(getCanvasData, newCanvasData), 0, 0)
    }
    return canvas
  }
  canvasDataHRevert(sourcedata: ImageData, newdata: ImageData): ImageData {
    for (var i = 0, h = sourcedata.height; i < h; i++) {
      for (var j = 0, w = sourcedata.width; j < w; j++) {
        newdata.data[i * w * 4 + j * 4 + 0] = sourcedata.data[i * w * 4 + (w - j) * 4 + 0];
        newdata.data[i * w * 4 + j * 4 + 1] = sourcedata.data[i * w * 4 + (w - j) * 4 + 1];
        newdata.data[i * w * 4 + j * 4 + 2] = sourcedata.data[i * w * 4 + (w - j) * 4 + 2];
        newdata.data[i * w * 4 + j * 4 + 3] = sourcedata.data[i * w * 4 + (w - j) * 4 + 3];
      }
    }
    return newdata;
  }
}