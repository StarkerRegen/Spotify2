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
