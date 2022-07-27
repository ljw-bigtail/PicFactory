import { saveAs } from "file-saver";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { dateFmt } from "./utils";

import { Frame, VideoOption, MusicOption } from "../type/video";

import { ImageFactory } from "./ImageFactory";

export class PaintsFactory {
  buffer: {
    gif: ArrayBufferLike | null,
    mp4: ArrayBufferLike | null
  };
  frames: Frame[];
  options: VideoOption;
  music: MusicOption;
  ffmpeg: any;
  constructor() {
    this.buffer = {
      gif: null,
      mp4: null
    }
    this.frames = [];
    this.options = {
      width: 900,
      height: 1600,
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
      log: true,
      progress: p => console.log(p)
    });
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
  // TODO 优化：进度条
  setProgress({ ratio }: {ratio: number}) {
    console.log(ratio, 'ratio');
    /*
    * ratio is a float number between 0 to 1.
    */
  }
  async toPreView() {
    this.buffer = {
      gif: null,
      mp4: null
    }
    await this._mixinMusic();
    // 生成预览
    if (!this.buffer.mp4) return "";
    return URL.createObjectURL(new Blob([this.buffer.mp4], { type: "video/mp4" }));
  }
  async toFile(fileType: "gif" | "mp4") {
    const fileName = `${fileType}-${dateFmt()}.${fileType}`;
    let type = ''
    switch (fileType) {
      case "gif": type = "image/gif"; break;
      case "mp4": type = "video/mp4"; break;
    }
    if (!this.buffer[fileType]) return "";
    saveAs(new Blob([this.buffer[fileType] as ArrayBufferLike], { type }), fileName);
  }
  _toTime(sec: number){
    const _sec = sec % 60
    const _min = (sec - _sec) / 60
    return `00:${_min.toString().padStart(2, '0')}:${_sec.toString().padStart(2, '0')}`
  }
  async _mixinMusic() {
    if(this.frames.length == 0){
      return
    }

    if (!this.ffmpeg.isLoaded()) {
      await this.ffmpeg.load();
    }

    const outFile = "out.mp4";
    const outFileGif = "out.gif"
    const musicFile = "music.mp3";
    const { delay, quality } = this.options;
    const { file: musicfile, start } = this.music;
    
    const frameRate = 1000 / delay; // delay 帧率 1s钟 X 张图
    const _quality = 17 + Math.round(quality * 10); // quality ffmpeg的默认值是23，建议的取值范围是17-28。
    const time = delay / 1000 * this.frames.length

    // 图像根据属性处理
    const imageFactory = new ImageFactory(this.options)
    const files = await imageFactory.transforms(this.frames)

    // 逐帧添加图像
    files.forEach(async (file, index) => {
      this.ffmpeg.FS("writeFile", `${index}.jpg`, await fetchFile(file));
    });

    // mp4 buffer
    if(musicfile){
      // 处理背景音乐
      this.ffmpeg.FS("writeFile", musicFile, await fetchFile(musicfile));
      
      // 图+声音
      const startTime = this._toTime(start)
      await this.ffmpeg.run( 
        "-r", `${frameRate}`,  //
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

    // gif buffer
    await this.ffmpeg.run("-i", outFile, outFileGif);
    const buffer_gif = this.ffmpeg.FS("readFile", outFileGif).buffer;

    // out
    this.buffer = {
      gif: buffer_gif,
      mp4: buffer_mp4
    }
  }
}
