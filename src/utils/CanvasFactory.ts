import GIF from "gif.js";
import { saveAs } from "file-saver";

type GIFOption = {
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
  gif: null;
  list: never[];
  formDom: null;
  blob: Blob | null;
  gifOpt: GIFOption;
  constructor() {
    this.gif = null;
    this.list = [];
    this.formDom = null;
    this.blob = null;

    this.gifOpt = {
      width: 900,
      height: 1600,
      repeat: 0,
      delay: 750,
      background: "#FFFFFF",
      rule: 3,
    };
  }
  setOpt(opt: {}) {
    this.gifOpt = Object.assign(this.gifOpt, opt);
  }
  _loadPaint(data: FileObject[]) {
    const opt = this.gifOpt;
    return Promise.all(
      data.map((item) => {
        return new Promise((res, rej) => {
          const canvas = document.createElement("canvas");
          canvas.width = opt.width;
          canvas.height = opt.height;

          const img = new Image();
          img.src = window.URL.createObjectURL(item.file);
          img.onload = function (e) {
            const _img: ImageObject = {
              canvas,
              img,
            };
            res(_img);
          };
        });
      })
    );
  }
  _paintFrame(imgLoadObject: ImageObject): CanvasImageSource | undefined {
    const opt = this.gifOpt;
    const { img, canvas } = imgLoadObject;
    const ctx = canvas.getContext("2d");
    if (!canvas || !img || !ctx) return;
    // 背景色
    ctx.fillStyle = opt.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 处理图片
    const { width: imgwidth, height: imgheight } = img;
    const { width: canvaswidth, height: canvasheight } = canvas;
    const scale = imgheight / imgwidth;
    if (opt.rule == 1) {
      // 图片覆盖canvas
      ctx.drawImage(img, 0, 0, canvaswidth, canvasheight);
    } else if (opt.rule == 2) {
      // 图片等比缩放放在canvas里 即 按照宽高比例缩放 剩余部分留白
      const heightScale =
        canvasheight >= imgheight ? canvasheight / imgheight : 1;
      const widthScale = canvaswidth >= imgwidth ? canvaswidth / imgwidth : 1;
      const endScale = Math.min(heightScale, widthScale);
      let startPoint: [number, number] = [0, 0];
      if (endScale == heightScale) {
        startPoint = [(canvaswidth - imgwidth * endScale) / 2, 0];
      } else {
        // endScale == widthScale
        startPoint = [0, (canvasheight - imgheight * endScale) / 2];
      }
      const endPoint: [number, number] = [
        imgwidth * endScale,
        imgwidth * endScale * scale,
      ];
      ctx.drawImage(img, ...startPoint, ...endPoint);
    } else if (opt.rule == 3) {
      // 等比放大 截取中间部分
      const heightScale =
        canvasheight >= imgheight ? canvasheight / imgheight : 1;
      const widthScale = canvaswidth >= imgwidth ? canvaswidth / imgwidth : 1;
      const endScale = Math.max(heightScale, widthScale);
      let startPoint: [number, number] = [0, 0];
      if (endScale == heightScale) {
        startPoint = [(canvaswidth - imgwidth * endScale) / 2, 0];
      } else {
        // endScale == widthScale
        startPoint = [0, (canvasheight - imgheight * endScale) / 2];
      }
      const endPoint: [number, number] = [
        imgwidth * endScale,
        imgwidth * endScale * scale,
      ];
      ctx.drawImage(img, ...startPoint, ...endPoint);
    }
    return canvas;
  }
  toBlob(data: FileObject[]) {
    const that = this;
    return new Promise((res, rej) => {
      if (data.length == 0) {
        this.blob = null;
        rej("数据为空");
      }
      if (this.blob) {
        res(this.blob);
        return;
      }
      const opt = that.gifOpt;
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
          opt
        )
      );
      that
        ._loadPaint(data)
        .then((imgs) => {
          imgs.forEach((imgLoadObjectas) => {
            const cancas = that._paintFrame(imgLoadObjectas as ImageObject);
            if (cancas) {
              gif.addFrame(cancas, {
                delay: opt.delay, // 延迟时间
                copy: true,
              });
            }
          });
        })
        .then((res) => {
          gif.render();
        })
        .catch((e) => rej);
      gif.on("finished", function (blob) {
        that.blob = blob;
        res(blob);
      });
    });
  }
  toPreView() {
    if (!this.blob) return "";
    // 生成预览
    return URL.createObjectURL(this.blob);
  }
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

export const templateArr = [
  {
    src: "img/type1.png",
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
