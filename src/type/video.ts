import {Img} from './img'

type Frame = Img & {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type VideoOption = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
  quality: number;
};

type MusicOption = {
  start: number;
  file?: File
};

export type {
  Img,
  Frame,
  VideoOption,
  MusicOption,
}
