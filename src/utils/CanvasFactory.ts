import typeimg1 from "../assets/canvasTypePic/type1.png";
import typeimg2 from "../assets/canvasTypePic/type2.png";
import typeimg3 from "../assets/canvasTypePic/type3.png";
import typeimg4 from "../assets/canvasTypePic/type4.png";
import typeimg5 from "../assets/canvasTypePic/type5.png";
import typeimg6 from "../assets/canvasTypePic/type6.png";
import typeimg7 from "../assets/canvasTypePic/type7.png";

export const templateArr = [
  {
    src: typeimg1,
    qty: [2, 2],
    cells: [
      [[0, 0], [1, 1]],
      [[0, 1], [1, 2]],
      [[1, 0], [2, 1]],
      [[1, 1], [2, 2]],
    ],
  },
  {
    src: typeimg2,
    qty: [5, 2],
    cells: [
      [[0, 0], [3, 2]],
      [[3, 0], [5, 1]],
      [[3, 1], [5, 2]],
    ],
  },
  {
    src: typeimg3,
    qty: [2, 2],
    cells: [
      [[0, 0], [1, 2]],
      [[1, 0], [2, 2]],
    ],
  },
  // {
  //   src: typeimg4,
  //   qty: [2, 2],
  //   cells: [
  //     [[0, 0], [1, 1]],
  //     [[0, 1], [1, 2]],
  //     [[1, 0], [2, 2]],
  //   ],
  // },
  {
    src: typeimg5,
    qty: [4, 3],
    cells: [
      [[0, 0], [2, 2]],
      [[0, 2], [1, 3]],
      [[1, 2], [2, 3]],
      [[2, 0], [4, 2]],
      [[2, 2], [3, 4]],
      [[3, 2], [4, 4]],
    ],
  },
  {
    src: typeimg6,
    qty: [4, 3],
    cells: [
      [[0, 0], [2, 2]],
      [[0, 2], [1, 3]],
      [[1, 2], [2, 3]],
      [[2, 0], [3, 1]],
      [[3, 0], [4, 1]],
      [[2, 1], [4, 3]],
    ],
  },
  {
    src: typeimg7,
    qty: [4, 3],
    cells: [
      [[0, 0], [1, 1]],
      [[1, 0], [2, 1]],
      [[0, 1], [2, 3]],
      [[2, 0], [4, 2]],
      [[2, 2], [3, 3]],
      [[3, 2], [4, 4]],
    ],
  },
];

export const DefaultCellOptions = {
  min_box_padding: 20, // px editor__box 与 editor__element 的最小间距 (编辑框与外部的最小间距)
  element_padding: 30, // px editor__element 的 padding 在 options.padding = 100% 时的值
  cell_margin: 30, // px editor__cell 的 margin 在 options.margin = 100% 时的值
  element_radius: .5, // 50% 最大为短边圆角拉满 editor__element 的 border-radius 在 options.radius = 100% 时的值
};

export const DefaultCanvasFactoryOptions = {
  width: 1200,
  height: 1200,
  padding: 0,
  margin: 0.2,
  radius: 0,
  template: 0,
  rule: 2,
};

export const DefaultCanvasImgOptions = {
  scale: 0,
};


import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

type CanvasOptions = {
  width: number, 
  height: number
}

export class CanvasFactory {
  box: Element | null;
  width: number;
  height: number;
  constructor(data: { id: string, options: CanvasOptions }) {
    this.box = null;
    this.width = data.options.width
    this.height = data.options.height
    this._init(data.id);
  }
  _init(id: string) {
    const box = document.querySelector("#" + id);
    if (!box) {
      throw new Error("未找到元素" + id);
    }
    this.box = box;
  }
  _copyCanvas(){
    if (!this.box) return;
    const canvas = document.createElement('div')
    canvas.innerHTML = this.box.outerHTML
    const scaleWidth = canvas.firstElementChild?.getAttribute('style')?.replace(/^width: ([0-9]*)px; height: ([0-9]*)px;*/, '$1')
    if(!scaleWidth) return
    const scale = this.width / parseInt(scaleWidth)
    canvas.style.transform = `scale(${scale})`
    // canvas.style.position = 'fixed'
    // canvas.style.left = '-10000%'
    // canvas.style.top = '-10000%'
    document.body.appendChild(canvas)
    return canvas
  }
  toFile(fileType: "png" | "jpg") {
    // Error loading image : 由于image存在没有src属性的情况
    const canvas = this._copyCanvas()
    if (!canvas) return;
    html2canvas(canvas, {
      // logging: true,
      logging: false,
      width: this.width,
      height: this.height,
      scale: 1, // 默认 window.devicePixelRatio 
    })
      .then((canvas: any) => {
        canvas.toBlob(
          function (blob: Blob) {
            saveAs(blob, "image." + fileType);
          },
          fileType == "png" ? "image/png" : "image/jpeg"
        );
      });
    document.body.removeChild(canvas)
  }
}
