import { dropFileType } from './dropFile'

type Frame = dropFileType & {
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

type outType = "gif" | "mp4"

export type {
  dropFileType,
  Frame,
  VideoOption,
  MusicOption,
  outType
}
