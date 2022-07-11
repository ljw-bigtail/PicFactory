import GIF from "gif.js";
import { saveAs } from 'file-saver';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { dateFmt } from "./utils";
import { CanvasFactory } from "../utils/CanvasFactory";

import { Frame } from "../type/video";

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
  frames: Frame
}

const ffmpeg = createFFmpeg({
  log: true,
});

export class PaintsFactory {
  frames: Frame[]
  options: Option
  blob: Blob | null
  buffer: ArrayBufferLike|null
  ffmpeg: any
  constructor() {
    this.frames = []
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
  _paintFrame(imgLoadObject: ImageOption): CanvasImageSource {
    const { width, height, rule,background } = this.options;
    const { img, frames } = imgLoadObject
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
      //   _scale = rotateY / 180 * 2 - 3
      // }
      const _scale = rotateY == 180 ? -1 : 1 
      // 坐标参考调整
      ctx.translate((canvas.width - img.width * _scale) / 2, 0);
      ctx.scale(_scale, 1);
      ctx.drawImage(img, ...position)
      // 坐标参考还原
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    flipX(ctx, frames.rotateY)
    return canvas
  }
  toBlob(){
    const that = this
    const { delay } = this.options;
    const gif = new GIF(
      Object.assign(
        {
          workers: 2,
          quality: 10,
          repeat: 0, // -1 never 0 ever or number
          background: "#FFFFFF",
          // debug: true,
          dither: false, // 抖动方法 // FloydSteinberg FalseFloydSteinberg Stucki Atkinson
          workerScript: "static/gif.worker.js",
        },
        this.options
      )
    );
    return new Promise((res, rej) => {
      if (this.frames.length == 0) {
        this.blob = null;
        rej("数据为空");
      }
      Promise.all(
        this.frames.map((frames) => {
          return new Promise((_res) => {
            const img = new Image();
            img.src = window.URL.createObjectURL(frames.file);
            img.onload = function() {
              _res({
                img,
                frames
              });
            };
          });
        })
      )
      .then((imgs) => {
        (imgs as ImageOption[]).forEach((imgLoadObjectas) => {
          const frame =  that._paintFrame(imgLoadObjectas)
          gif.addFrame(frame, {
            delay: delay, // 延迟时间
            copy: true,
          });
        });
      })
      .then(()=>{
        gif.render();
        gif.on("finished", function (blob) {
          that.blob = blob;
          res(blob);
        });
      })
      .catch((e) => rej(e));
    });
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


  // TODO
  setFrame(frames:Frame[]){
    this.frames = frames
    return this
  }
} 
