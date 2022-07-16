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
    const { width: imgwidth, height: imgheight } = img
    const { width: canvaswidth, height: canvasheight } = canvas
    const scale = imgheight / imgwidth;
    function getPosition(): [number,number,number,number]{
      if(rule == 2){
        // 图片等比缩放放在canvas里 即 按照宽高比例缩放 剩余部分留白
        const heightScale = canvasheight >= imgheight ?  canvasheight / imgheight : 1
        const widthScale = canvaswidth >= imgwidth ?  canvaswidth / imgwidth : 1
        const endScale = Math.min(heightScale, widthScale)
        let startPoint:[number, number] = [0, 0]
        if(endScale == heightScale){
          startPoint = [(canvaswidth - imgwidth * endScale) / 2, 0]
        }else{ // endScale == widthScale
          startPoint = [0, (canvasheight - imgheight * endScale) / 2]
        }
        const endPoint:[number, number] = [imgwidth * endScale, imgwidth * endScale * scale]
        return [...startPoint, ...endPoint]
      }else if(rule == 3){
        // 等比放大 截取中间部分
        const heightScale = canvasheight >= imgheight ?  canvasheight / imgheight : 1
        const widthScale = canvaswidth >= imgwidth ?  canvaswidth / imgwidth : 1
        const endScale = Math.max(heightScale, widthScale)
        let startPoint:[number, number] = [0, 0]
        if(endScale == heightScale){
          startPoint = [(canvaswidth - imgwidth * endScale) / 2, 0]
        }else{ // endScale == widthScale
          startPoint = [0, (canvasheight - imgheight * endScale) / 2]
        }
        const endPoint:[number, number] = [imgwidth * endScale, imgwidth * endScale * scale]
        return [...startPoint, ...endPoint]
      }
      // 图片覆盖canvas
      return [0, 0, canvaswidth, canvasheight]
    }
    const position = getPosition()
    function flipX(ctx:CanvasRenderingContext2D, rotateY: number){
      // Y轴旋转
      // let _scale = 1
      // if(rotateY < 180){ // 0 - 180
      //   _scale = -rotateY / 180
      // }else{ // 180 - 360
      //   _scale = rotateY / 180` * 2 - 3
      // }
      const _scale = rotateY == 180 ? -1 : 1
      // 坐标参考调整
      ctx.translate((canvas.width - img.width * _scale) / 2, 0);
      ctx.scale(_scale, 1);
      ctx.drawImage(img, ...position)
      // 坐标参考还原
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    flipX(ctx, frame.rotateY)
    return canvas
  }
}