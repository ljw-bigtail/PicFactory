import { saveAs } from "file-saver";

type Option = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
};
type FileObject = { id: number; src: string; file: File };
type ImageObject = {
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
};

export class CanvasFactory {
  options: Option
  blob: Blob | null
  constructor() {
    this.blob = null
    this.options = {
      width: 900,
      height: 1600,
      repeat: 0,
      delay: 750,
      background: '#FFFFFF',
      rule: 3,
    }
  }
  setOpt(opt: {}) {
    this.options = Object.assign(this.options, opt);
  }
  toFile(fileType: 'gif' | 'mp4') {
    if(!this.blob) return
    if (fileType == 'gif') {
      // 生成下载
      saveAs(this.blob, 'image.gif');
    } else if (fileType == 'mp4') {
      // 生成mp4
      // this.blob.type = 'video/mp4'
      saveAs(this.blob, 'video.mp4');
    }
    this.blob = null
  }
}

export const templateArr = [
  {
    src: "img/type1.png",
  },
  {
    src: "img/type2.png",
  },
  {
    src: "img/type3.png",
  },
  {
    src: "img/type4.png",
  },
  // {
  //   src: "img/type1.png",
  // },
  // {
  //   src: "img/type1.png",
  // },
  // {
  //   src: "img/type1.png",
  // },
  // {
  //   src: "img/type1.png",
  // },
  // {
  //   src: "img/type1.png",
  // },
  // {
  //   src: "img/type1.png",
  // },
];
