import { atom } from "recoil";

export const currentTrackIdState = atom({
  key: "currentTrackIdState",
  default: null,
});

export const isPlayingState = atom({
  key: "isPlayingState",
  default: null,
});

export const playDevice = atom({
  key: "playDevice",
  default: [],
});

export const playPosition = atom({
  key: "playPosition",
  default: 0,
});

export const playOffset = atom({
  key: "playOffset",
  default: 0,
});
