import typeimg1 from "../assets/canvasTypePic/type1.png";
import typeimg2 from "../assets/canvasTypePic/type2.png";
import typeimg3 from "../assets/canvasTypePic/type3.png";
// import typeimg4 from "../assets/canvasTypePic/type4.png";
import typeimg5 from "../assets/canvasTypePic/type5.png";
import typeimg6 from "../assets/canvasTypePic/type6.png";
import typeimg7 from "../assets/canvasTypePic/type7.png";
import typeimg8 from "../assets/canvasTypePic/type8.png";

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
    // qty: [5, 2],
    // cells: [
    //   [[0, 0], [3, 2]],
    //   [[3, 0], [5, 1]],
    //   [[3, 1], [5, 2]],
    // ],
    qty: [3, 2],
    cells: [
      [[0, 0], [2, 2]],
      [[2, 0], [3, 1]],
      [[2, 1], [3, 2]],
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
      [[2, 2], [3, 3]],
      [[3, 2], [4, 3]],
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
      [[3, 2], [4, 3]],
    ],
  },
  {
    src: typeimg8,
    qty: [1, 1],
    cells: [
      [[0, 0], [1, 1]],
    ],
    default:{
      height: 1080,
      width: 1080,
    }
  },
];

export const DefaultCellOptions = {
  min_box_padding: 20, // px editor__box ??? editor__element ??????????????? (?????????????????????????????????)
  element_padding: 30, // px editor__element ??? padding ??? options.padding = 100% ?????????
  cell_margin: 30, // px editor__cell ??? margin ??? options.margin = 100% ?????????
  element_radius: .5, // 50% ??????????????????????????? editor__element ??? border-radius ??? options.radius = 100% ?????????
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
export const DefaultCanvasStickerOptions = {
  scale: 0.5,
  width: 120,
  height: 120,
};
export const DefaultCanvasTextOptions = {
  size: 0,
  color: "#000000",
};

import sticker_1_1 from "../assets/sticker/pixel/1.svg";
import sticker_1_2 from "../assets/sticker/pixel/2.svg";
import sticker_1_3 from "../assets/sticker/pixel/3.svg";
import sticker_1_4 from "../assets/sticker/pixel/4.svg";
import sticker_1_5 from "../assets/sticker/pixel/5.svg";
import sticker_1_6 from "../assets/sticker/pixel/6.svg";
import sticker_1_7 from "../assets/sticker/pixel/7.svg";

import sticker_2_1 from "../assets/sticker/clothes/1.svg";
import sticker_2_2 from "../assets/sticker/clothes/2.svg";
import sticker_2_3 from "../assets/sticker/clothes/3.svg";
import sticker_2_4 from "../assets/sticker/clothes/4.svg";
import sticker_2_5 from "../assets/sticker/clothes/5.svg";
import sticker_2_6 from "../assets/sticker/clothes/6.svg";
import sticker_2_7 from "../assets/sticker/clothes/7.svg";
import sticker_2_8 from "../assets/sticker/clothes/8.svg";
import sticker_2_9 from "../assets/sticker/clothes/9.svg";

export const stickerArr = [
  {
    seriesName: '??????',
    key: 'pixel',
    src: [sticker_1_1,sticker_1_2,sticker_1_3,sticker_1_4,sticker_1_5,sticker_1_6,sticker_1_7]
  },
  {
    seriesName: '??????',
    key: 'clothes',
    src: [sticker_2_1,sticker_2_2,sticker_2_3,sticker_2_4,sticker_2_5,sticker_2_6,sticker_2_7,sticker_2_8,sticker_2_9]
  },
]


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
      throw new Error("???????????????" + id);
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
    // Error loading image : ??????image????????????src???????????????
    const canvas = this._copyCanvas()
    if (!canvas) return;
    html2canvas(canvas, {
      // logging: true,
      logging: false,
      width: this.width,
      height: this.height,
      scale: 1, // ?????? window.devicePixelRatio 
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
