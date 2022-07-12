// import GIF from "gif.js";
import { saveAs } from "file-saver";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { dateFmt } from "./utils";

import { Frame, VideoOption } from "../type/video";

export class PaintsFactory {
  frames: Frame[];
  options: VideoOption;
  // blob: Blob | null;
  buffer: ArrayBufferLike | null;
  ffmpeg: any;
  constructor() {
    this.frames = [];
    // this.blob = null;
    this.buffer = null;
    this.options = {
      width: 900,
      height: 1600,
      repeat: 0,
      delay: 750,
      background: "#FFFFFF",
      rule: 3,
      quality: 0.5,
    };
    this.ffmpeg = createFFmpeg({
      log: true,
      progress: p => console.log(p)
    });
    console.log(this.ffmpeg);
  }
  setOpt(opt: {}) {
    this.options = Object.assign(this.options, opt);
    return this;
  }
  setFrame(frames: Frame[]) {
    this.frames = frames;
    return this;
  }
  // TODO 优化：进度条
  setProgress({ ratio }: {ratio: number}) {
    console.log(ratio, 'ratio');
    /*
    * ratio is a float number between 0 to 1.
    */
  }
  async toPreView() {
    // if(!this.blob) return ''
    await this._mixinMusic();
    // 生成预览
    if (!this.buffer) return "";
    return URL.createObjectURL(new Blob([this.buffer], { type: "video/mp4" }));
  }
  async toFile(fileType: "gif" | "mp4") {
    const fileName = `${fileType}-${dateFmt()}.${fileType}`;
    if (!this.buffer) {
      // 生成mp4
      await this._mixinMusic();
    }
    if (this.buffer) {
      let type = ''
      switch (fileType) {
        case "gif": type = "image/gif"; break;
        case "mp4": type = "video/mp4"; break;
      }
      saveAs(new Blob([this.buffer], { type }), fileName);
    }
    this.buffer = null;
  }
  async _mixinMusic() {
    if (!this.ffmpeg.isLoaded()) {
      await this.ffmpeg.load();
    }
    

    const outFile = "out.mp4";
    const { delay, quality } = this.options;
    
    const frameRate = 1000 / delay; // delay 帧率 1s钟 X 张图
    const _quality = 17 + Math.round(quality * 10); // quality ffmpeg的默认值是23，建议的取值范围是17-28。

    // 逐帧添加图像
    this.frames.forEach(async (frames, index) => {
      // TODO image =》 canvas =》 image
      // TODO 根据配置写 图片大小
      // TODO 根据帧属性 添加对应的处理
      this.ffmpeg.FS("writeFile", `${index}.jpg`, await fetchFile(frames.file));
    });

    // ffmpeg.FS('writeFile', inFile, await fetchFile(this.blob));
    // ffmpeg.FS('writeFile', inFile, await fetchFile(testFile));
    // ffmpeg.FS('writeFile', 'music.mp3', await fetchFile('../assets/music.mp3'));

    // ffmpeg -f image2 -i %d.jpeg output.mp4
    await this.ffmpeg.run( "-r", `${frameRate}`, "-f", "image2", "-i", "%d.jpg", "-crf", `${_quality}`, outFile);
    // ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 output.mp4
    // await ffmpeg.run('-i', 'bj.mp4', '-i', 'music.mp3', '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', '-map', '0:v:0', '-map', '1:a:0', 'output.mp4');
    // await ffmpeg.run('-i', inFile, outFile);

    this.buffer = this.ffmpeg.FS("readFile", outFile).buffer;
  }
}
