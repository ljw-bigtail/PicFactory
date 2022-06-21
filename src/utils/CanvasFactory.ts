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
    qty: [2, 2],
    cells: [
      [[0, 0], [1, 2]],
      [[1, 0], [2, 1]],
      [[1, 1], [2, 2]],
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
};

import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

export class CanvasFactory {
  box: Element | null;
  constructor(data: { id: string }) {
    this.box = null;
    this._init(data.id);
  }
  _init(id: string) {
    const box = document.querySelector("#" + id);
    if (!box) {
      throw new Error("未找到元素" + id);
    }
    this.box = box;
  }
  toFile(fileType: "png" | "jpg") {
    if (!this.box) return;
    // Error loading image : 由于image存在没有src属性的情况
    html2canvas(this.box as HTMLElement, {
      // logging: true,
      logging: false,
    })
      .then((canvas: any) => {
        canvas.toBlob(
          function (blob: Blob) {
            saveAs(blob, "image." + fileType);
          },
          fileType == "png" ? "image/png" : "image/jpeg"
        );
      })
      .catch((e) => {
        console.log("aaaaaaaa");
      });
  }
}
