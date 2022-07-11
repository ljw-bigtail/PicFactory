import {Img} from './img'

type Frame = Img & {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

export type {
  Img,
  Frame
}