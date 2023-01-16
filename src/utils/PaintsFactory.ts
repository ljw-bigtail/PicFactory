import { saveAs } from "file-saver";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import GIF from "gif.js";
import { dateFmt } from "./utils";

import { Frame, VideoOption, MusicOption, outType } from "@/type/video";

import { ImageFactory } from "./ImageFactory";

export class PaintsFactory {
  file: {
    gif: Blob | null,
    mp4: Blob | null
  };
  frames: Frame[];
  options: VideoOption;
  music: MusicOption;
  ffmpeg: any;
  ratio: number;
  constructor() {
    this.file = {
      gif: null,
      mp4: null
    }
    this.frames = [];
    this.options = {
      width: 800,
      height: 1000,
      repeat: 0,
      delay: 750,
      background: "#FFFFFF",
      rule: 3,
      quality: 0.5,
    };
    this.music = {
      start: 0
    }
    this.ffmpeg = createFFmpeg({
      // log: !import.meta.env.PROD,
      log: false,
    });
    this.ratio = 0
  }
  setOpt(opt: {}) {
    this.options = Object.assign(this.options, opt);
    return this;
  }
  setFrame(frames: Frame[]) {
    this.frames = frames;
    return this;
  }
  setMusic(music: MusicOption){
    this.music = music
    return this
  }
  logProgress(ratio: number, type: outType) {
    if(ratio < 0) return
    // 因为有两个生成 所以进度合并下
    const num = parseFloat((((type === 'gif' ? 1 : 0) + ratio) / 2).toFixed(4))
    if(num == this.ratio) return
    this.ratio = num
    // TODO 优化：进度条
    console.log(`生成进度：${this.ratio * 100}%`, this.ratio);
  }
  async toPreView() {
    this.file = {
      gif: null,
      mp4: null
    }
    // 处理图片
    if(this.frames.length == 0){
      return
    }
    // 图像根据属性处理
    const imageFactory = new ImageFactory(this.options)
    const imgBlob = await imageFactory.transforms(this.frames)
    // const imgCanvas = await imageFactory.transformsCanvas(this.frames)
    // 处理对应文件格式
    if (!this.ffmpeg.isLoaded()) {
      await this.ffmpeg.load();
    }
    await this._makeFile(imgBlob);
    // 生成预览
    if (!this.file.mp4 || !this.file.gif) return {};
    return {
      src: URL.createObjectURL(this.file.mp4),
      size_mp4: this.file.mp4.size,
      size_gif: this.file.gif.size,
    };
  }
  async toFile(fileType: outType) {
    const fileName = `${fileType}-${dateFmt()}.${fileType}`;
    let file = null
    switch (fileType) {
      case "gif": file = this.file.gif; break;
      case "mp4": file = this.file.mp4; break;
    }
    if(!file) return
    saveAs(file, fileName);
  }
  _toTime(sec: number){
    const _sec = sec % 60
    const _min = (sec - _sec) / 60
    return `00:${_min.toString().padStart(2, '0')}:${_sec.toString().padStart(2, '0')}`
  }
  async _makeFile(files:Blob[]) {
    // 逐帧添加图像，并缓存文件名
    const clearData: string[] = []
    files.forEach(async (file, index) => {
      this.ffmpeg.FS("writeFile", `${index}.jpg`, await fetchFile(file));
      clearData.push(`${index}.jpg`)
    });

    await this._makeMP4();
    await this._makeGIF();

    // 清除已加载的图片
    clearData.forEach(name => this.ffmpeg.FS('unlink', name))
  }
  async _makeMP4() {
    const outFile = "out.mp4";
    const musicFile = "music.mp3";
    const { delay, quality } = this.options;
    const { file: musicfile, start } = this.music;
    
    const frameRate = 1000 / delay; // delay 帧率 1s钟 X 张图
    /*
     * quality 8～28
     * ffmpeg的默认值是23（0～51），建议的取值范围是18-28
     */
    const _quality = 8 + Math.round((1 - quality) * 20);
    const time = delay / 1000 * this.frames.length

    this.ffmpeg.setProgress(({ ratio }: { ratio: number }) => this.logProgress(ratio, 'mp4'));
    // mp4 buffer
    if(musicfile){
      // 处理背景音乐
      this.ffmpeg.FS("writeFile", musicFile, await fetchFile(musicfile));
      
      // 图+声音
      const startTime = this._toTime(start)
      await this.ffmpeg.run( 
        "-r", `${frameRate}`,  // 抽帧
        "-f", "image2", "-i", "%d.jpg", // 加载图
        "-i", musicFile, "-ss", startTime,  "-t", `${time}`, // 加载音乐文件、音乐的截取部分
        "-crf", `${_quality}`, // 清晰度
        outFile
      );
    }else{
      // 仅图
      await this.ffmpeg.run( 
        "-r", `${frameRate}`, 
        "-f", "image2", "-i", "%d.jpg", 
        "-crf", `${_quality}`, 
        outFile
      );
    }
    const buffer_mp4 = this.ffmpeg.FS("readFile", outFile).buffer;

    // out
    this.file.mp4 = new Blob([buffer_mp4], { type: "video/mp4" })
  }
  async _makeGIF() {
    const outFile = "out.mp4";
    const outFileGif = "out.gif"
    const { repeat } = this.options;

    const _repeat = repeat == -1 ? 1 : 0

    this.ffmpeg.setProgress(({ ratio }: { ratio: number }) => this.logProgress(ratio, 'gif'));
    // gif buffer
    await this.ffmpeg.run(
      "-i", outFile,
      "-loop", `${_repeat}`, // 0 循环 1 不循环
      "-vf", "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse", // 高清 防栅格化
      outFileGif
    );
    const buffer_gif = this.ffmpeg.FS("readFile", outFileGif).buffer;

    // out
    this.file.gif = new Blob([buffer_gif], { type: "image/gif" })
  } 
}
