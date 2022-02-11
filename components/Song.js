import React from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { MusicNoteIcon } from "@heroicons/react/solid";
import {
  currentTrackIdState,
  isPlayingState,
  playDevice,
} from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import { millisecondToMinutesAndSeconds } from "../lib/time";

function Song({ track, order }) {
  const spotifyApi = useSpotify();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const setIsPlaying = useSetRecoilState(isPlayingState);
  const myDevice = useRecoilValue(playDevice);
  const playSong = () => {
    if (myDevice.length > 0) {
      setCurrentTrackId(track.track.id);
      setIsPlaying(true);
      spotifyApi.play({
        uris: [track.track.uri],
      });
    } else {
      alert("Please open your Spotify App");
    }
  };

  const bgColor =
    track.track.id == currentTrackId ? "bg-gray-800" : "bg-black-700";
  const textColor =
    track.track.id == currentTrackId ? "text-green-600" : "text-white";

  return (
    <div
      className={`grid grid-cols-2 ${bgColor} px-5 py-4 hover:bg-gray-500 rounded-lg cursor-pointer`}
    >
      <div className="flex items-center space-x-4" onClick={playSong}>
        {track.track.id == currentTrackId ? (
          <MusicNoteIcon className="h-4 w-4 text-green-600" />
        ) : (
          <p className="pl-1 pr-1">{order + 1}</p>
        )}

        <img
          className="h-10 w-10"
          src={track.track.album.images[0].url}
          alt={track.track.album.name}
        />
        <div>
          <p className={`w-36 lg:w-64 truncate ${textColor}`}>
            {track.track.name}
          </p>
          <p>{track.track.artists[0].name}</p>
        </div>
      </div>
      <div className="flex items-center justify-between ml-auto md:ml-0">
        <p className="w-40 hidden md:inline">{track.track.album.name}</p>
        <p>{millisecondToMinutesAndSeconds(track.track.duration_ms)}</p>
      </div>
    </div>
  );
}

export default Song;
