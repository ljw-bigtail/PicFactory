import { saveAs } from "file-saver";

export const DefaultCanvasFactoryOptions = {
  width: 1200,
  height: 1200,
  padding: 0.25,
  margin: 0.4,
  radius: 0,
  template: 0,
};

import typeimg1 from "../assets/canvasTypePic/type1.png";
import typeimg2 from "../assets/canvasTypePic/type2.png";
import typeimg3 from "../assets/canvasTypePic/type3.png";
import typeimg4 from "../assets/canvasTypePic/type4.png";

export const templateArr = [
  {
    src: typeimg1,
    cells: [
      {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0,
      },
      {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0,
      },
      {
        width: 0.5,
        height: 0.5,
        x: 0,
        y: 0.5,
      },
      {
        width: 0.5,
        height: 0.5,
        x: 0.5,
        y: 0.5,
      },
    ],
  },
  {
    src: typeimg2,
  },
  {
    src: typeimg3,
  },
  {
    src: typeimg4,
  },
];

type Option = {
  width: number;
  height: number;
  padding: number;
  margin: number;
  radius: number;
  template: number;
};
type FileOption = { id: number; src: string; file: File };
type ImageOption = {
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
};

export class CanvasFactory {
  options: Option;
  canvas: null;
  blob: Blob | null;
  constructor(data: { id: string }) {
    this._init(data.id);
    this.blob = null;
    this.canvas = null;
    this.options = DefaultCanvasFactoryOptions;
    console.log(this.canvas);
  }
  _init(id: string) {
    const box = document.querySelector("#" + id);
    if (!box) {
      throw new Error("未找到元素" + id);
    }
    // const canvasDom = document.createElement("canvas")
    // canvasDom.id = id + "__canvas"
    // box.appendChild(canvasDom)
    // const cxt = this.canvas.getContext("2d");
    // const canvasDom = document.createElement("canvas")
    // canvasDom.id = id + "__canvas"
    // box.appendChild(canvasDom)
    // return {
    //   canvas:
    // }
  }
  setOpt(opt: {}) {
    this.options = Object.assign(this.options, opt);
  }
  render() {}
  toFile(fileType: "gif" | "mp4") {
    if (!this.blob) return;
    if (fileType == "gif") {
      // 生成下载
      saveAs(this.blob, "image.gif");
    } else if (fileType == "mp4") {
      // 生成mp4
      // this.blob.type = 'video/mp4'
      saveAs(this.blob, "video.mp4");
    }
    this.blob = null;
  }
}
