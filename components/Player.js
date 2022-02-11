import { useSession } from "next-auth/react";
import useSpotify from "../hooks/useSpotify";
import {
  currentTrackIdState,
  isPlayingState,
  playDevice,
} from "../atoms/songAtom";
import { playlistState } from "../atoms/playlistAtom";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useSongInfo from "../hooks/useSongInfo";
import {
  VolumeUpIcon as VolumeDownIcon,
  VolumeUpIcon,
} from "@heroicons/react/outline";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  RewindIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
import { debounce } from "lodash";

function Player() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [prevTrackId, setPrevTrackId] = useState("");
  const [nextTrackId, setNextTrackId] = useState("");
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);
  const playlist = useRecoilValue(playlistState);
  const myDevice = useRecoilValue(playDevice);
  const songInfo = useSongInfo();

  const fetchCurrentSongInfo = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  const getPrevAndNextId = () => {
    const items = playlist?.tracks.items;
    const len = items?.length;
    for (let i = 0; i < len; i++) {
      if (items[i].track.id == currentTrackId) {
        setPrevTrackId(!items[i - 1] ? "" : items[i - 1].track.id);
        setNextTrackId(!items[i + 1] ? "" : items[i + 1].track.id);
      }
    }
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSongInfo();
      getPrevAndNextId();
      setVolume(50);
    }
  }, [currentTrackId, spotifyApi, session]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data?.body) return;
      if (data.body.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  useEffect(() => {
    if (volume > 0 && volume < 100 && myDevice.length > 0) {
      debounceAdjustVolume(volume);
    }
  }, [volume]);

  const debounceAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume);
    }, 500),
    []
  );

  useEffect(() => {
    if (songInfo && isPlaying && myDevice.length > 0) {
      getPrevAndNextId();
      spotifyApi.play({
        uris: [songInfo.uri],
        position_ms: 0,
      });
    }
  }, [songInfo]);

  const skipToNext = () => {
    getPrevAndNextId();
    if (nextTrackId && myDevice.length > 0) {
      setCurrentTrackId(nextTrackId);
      setIsPlaying(true);
    }
  };

  const skipToPrev = () => {
    getPrevAndNextId();
    if (prevTrackId && myDevice.length > 0) {
      setCurrentTrackId(prevTrackId);
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="h-24 bg-gradient-to-b from-black to-gray-900 text-white
            grid grid-cols-3 text-xs md:text-base px-2 md:px-8"
    >
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline w-10 h-10"
          src={songInfo?.album?.images?.[0].url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon className="button" onClick={skipToPrev} />
        {isPlaying ? (
          <PauseIcon className="button w-10 h-10" onClick={handlePlayPause} />
        ) : (
          <PlayIcon className="button w-10 h-10" onClick={handlePlayPause} />
        )}
        <FastForwardIcon className="button" onClick={skipToNext} />
        <ReplyIcon className="button" />
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeDownIcon
          onClick={() => {
            if (volume > 0) setVolume(volume - 10);
          }}
          className="button"
        />
        <input
          className="w-14 md:w-28"
          type="range"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          max={100}
        />
        <VolumeUpIcon
          onClick={() => {
            if (volume < 100) setVolume(volume + 10);
          }}
          className="button"
        />
      </div>
    </div>
  );
}

export default Player;
