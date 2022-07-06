import GIF from "gif.js";
import { saveAs } from 'file-saver';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { dateFmt } from "./utils";

type Option = {
  width: number,
  height: number,
  repeat: number,
  delay: number,
  background: string,
  rule: number,
}
type FileOption = { id: number; src: string; file: File };
type ImageOption = {
  img: HTMLImageElement,
  canvas: HTMLCanvasElement
}

const ffmpeg = createFFmpeg({
  log: true,
});

export class PaintsFactory {
  options: Option
  blob: Blob | null
  buffer: ArrayBufferLike|null
  ffmpeg: any
  constructor() {
    this.blob = null
    this.buffer = null
    this.options = {
      width: 900,
      height: 1600,
      repeat: 0,
      delay: 750,
      background: '#FFFFFF',
      rule: 3,
    }
    this.ffmpeg = createFFmpeg({
      log: true,
    });
  }
  setOpt(opt: {}) {
    this.options = Object.assign(this.options, opt)
    return this
  }
  _loadPaint(data:FileOption[]) {
    const opt = this.options
    return Promise.all(data.map(item => {
      return new Promise((res, rej) => {
        const canvas = document.createElement("canvas")
        canvas.width = opt.width
        canvas.height = opt.height
        
        const img = new Image()
        img.src = window.URL.createObjectURL(item.file)
        img.onload = function (e) {
          const _img:ImageOption = {
            canvas,
            img
          }
          res(_img)
        }
      })
    }))
  }
  _paintFrame(imgLoadObject: ImageOption): CanvasImageSource | undefined {
    const opt = this.options
    const {img, canvas} = imgLoadObject
    const ctx = canvas.getContext('2d')
    if(!canvas || !img || !ctx) return
    // 背景色
    ctx.fillStyle = opt.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 处理图片
    const { width: imgwidth, height: imgheight } = img
    const { width: canvaswidth, height: canvasheight } = canvas
    const scale = imgheight / imgwidth;
    if(opt.rule == 1){
      // 图片覆盖canvas
      ctx.drawImage(img, 0, 0, canvaswidth, canvasheight)
    }else if(opt.rule == 2){
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
      ctx.drawImage(img, ...startPoint, ...endPoint)
    }else if(opt.rule == 3){
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
      ctx.drawImage(img, ...startPoint, ...endPoint)
    }
    return canvas
  }
  toBlob(data:FileOption[] = []){
    const that = this
    return new Promise((res, rej) => {
      if(data.length == 0){
        this.blob = null
        rej('数据为空')
      }
      // if(this.blob) {
      //   res(this.blob)
      //   return
      // }
      const opt = that.options
      const gif = new GIF(Object.assign({
        workers: 2,
        quality: 10,
        repeat: 0, // -1 never 0 ever or number 
        background: '#FFFFFF',
        // debug: true,
        dither: false, // 抖动方法 // FloydSteinberg FalseFloydSteinberg Stucki Atkinson
        workerScript: 'static/gif.worker.js'
      }, opt));
      that._loadPaint(data)
        .then(imgs => {
          imgs.forEach(imgLoadObjectas => {
            const cancas = that._paintFrame(imgLoadObjectas as ImageOption)
            if(cancas){
              gif.addFrame(cancas, {
                delay: opt.delay, // 延迟时间
                copy: true
              })
            }
          })
        })
        .then(res => {
          gif.render();
        })
        .catch(e => rej)
      gif.on('finished', function (blob) {
        that.blob = blob
        res(blob)
      });
    })
  }
  async toPreView(){
    if(!this.blob) return ''
    await this.mixinMusic()
    if(!this.buffer) return ''
    // 生成预览
    return URL.createObjectURL(new Blob([this.buffer], { type: 'video/mp4' }))
  }
  async toFile(fileType: 'gif' | 'mp4') {
    const fileName = `${fileType}-${dateFmt()}.${fileType}`
    switch(fileType){
      case 'gif': 
        if(this.blob){ // 生成gif
          saveAs(this.blob, fileName);
          this.blob = null
        }
      break;
      case 'mp4': 
        if(!this.buffer){  // 生成mp4
          await this.mixinMusic()
        }
        if(this.buffer){
          saveAs(new Blob([this.buffer], { type: 'video/mp4' }), fileName);
          this.buffer = null
        }

      break;
    }
  }
  async mixinMusic(){
    if(!this.blob) return

    if(!ffmpeg.isLoaded()){
      await ffmpeg.load();
    }

    const inFile = 'in.mp4', outFile = 'out.mp4';

    // ffmpeg.FS("writeFile", "video.mp4", await fetchFile('../assets/1.mp4'));
    console.log(typeof this.blob);
    
    ffmpeg.FS('writeFile', inFile, await fetchFile(this.blob));
    // ffmpeg.FS('writeFile', inFile, await fetchFile(testFile));
    // ffmpeg.FS('writeFile', 'music.mp3', await fetchFile('../assets/music.mp3'));
    
    // ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 output.mp4
    // await ffmpeg.run('-i', 'bj.mp4', '-i', 'music.mp3', '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', '-map', '0:v:0', '-map', '1:a:0', 'output.mp4');
    await ffmpeg.run('-i', inFile, outFile);
    
    this.buffer = ffmpeg.FS('readFile', outFile).buffer
  }
} 
