import React from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  currentTrackIdState,
  isPlayingState,
  playDevice,
} from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import { millisecondToMinutesAndSeconds } from "../lib/time";

function Song({ track, order }) {
  const spotifyApi = useSpotify();
  const setCurrentTrackId = useSetRecoilState(currentTrackIdState);
  const setIsPlaying = useSetRecoilState(isPlayingState);
  const [myDevice, setMyDevice] = useRecoilState(playDevice);
  const getAvailableDevice = () => {
    spotifyApi.getMyDevices().then((data) => {
      const devices = data?.body?.devices;
      if (devices.length > 0) {
        setMyDevice([devices[0].id]);
      }
    });
    if (myDevice.length > 0) {
      spotifyApi
        .transferMyPlayback(myDevice)
        .then(() => console.log("Activate!"))
        .catch((err) => console.error(err));
    }
  };
  const playSong = () => {
    getAvailableDevice();
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

  return (
    <div className="grid grid-cols-2 text-gray-500 px-5 py-4 hover:bg-gray-800 rounded-lg cursor-pointer">
      <div className="flex items-center space-x-4" onClick={playSong}>
        <p>{order + 1}</p>
        <img
          className="h-10 w-10"
          src={track.track.album.images[0].url}
          alt={track.track.album.name}
        />
        <div>
          <p className="w-36 lg:w-64 truncate text-white">{track.track.name}</p>
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
