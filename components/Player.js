import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeLow,
  faVolumeHigh,
  faCirclePlay,
  faCirclePause,
  faBackwardStep,
  faForwardStep,
  faRepeat,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import {
  currentTrackIdState,
  isPlayingState,
  playDevice,
  playOffset,
  playPosition,
} from "../atoms/songAtom";
import { playlistState } from "../atoms/playlistAtom";
import useSpotify from "../hooks/useSpotify";
import useSongInfo from "../hooks/useSongInfo";
import { millisecondToMinutesAndSeconds } from "../lib/time";

function Player() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const playlist = useRecoilValue(playlistState);
  //timer
  const [position, setPosition] = useRecoilState(playPosition);

  //range
  const [range, setRange] = useState(0);

  const [volume, setVolume] = useState(50);
  const [offset, setOffset] = useRecoilState(playOffset);
  const [repeatMode, setRepeatMode] = useState("off");
  const myDevice = useRecoilValue(playDevice);
  const songInfo = useSongInfo();

  const fetchCurrentSongInfo = (b = false) => {
    if (!songInfo || b) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
        setPosition(data.body?.progress_ms);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
          setRepeatMode(data.body?.repeat_state);
        });
      });
    }
  };

  const getPrevAndNextId = () => {
    let items = playlist?.tracks.items;
    const len = items?.length;
    for (let i = 0; i < len; i++) {
      if (items[i].track.id == currentTrackId) {
        setOffset(i);
        const prev = !items[i - 1] ? "" : items[i - 1].track.id;
        const next = !items[i + 1] ? "" : items[i + 1].track.id;
        if (repeatMode == "context" && !next) {
          next = items[0].track.id;
        }
        if (repeatMode == "context" && !prev) {
          prev = items[len - 1].track.id;
        }
        return [i, prev, next, len];
      }
    }
    return [-1, "", "", 0];
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSongInfo();
      setVolume(50);
    }
  }, [currentTrackId, spotifyApi, session]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data?.body) return;
      if (data.body.is_playing) {
        spotifyApi.pause().then(() => {
          setPosition(data.body.progress_ms);
          setIsPlaying(false);
        });
      } else {
        spotifyApi
          .play({
            position_ms: position,
          })
          .then(() => {
            setIsPlaying(true);
          });
      }
    });
  };

  // change volume
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

  // change position
  const debounceAdjustRange = useCallback(
    debounce((p) => {
      spotifyApi.seek(p);
      setPosition(p);
    }, 500),
    []
  );

  useEffect(() => {
    if (
      songInfo &&
      range >= 0 &&
      range <= songInfo.duration_ms &&
      myDevice.length > 0
    ) {
      debounceAdjustRange(range);
    }
  }, [range]);

  // change song info
  useEffect(() => {
    if (!songInfo || !myDevice || !isPlaying) return;
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data?.body) return;
      const b = data.body.is_playing;
      if (b) {
        spotifyApi.pause().then(() => {
          spotifyApi
            .play({
              context_uri: playlist.uri,
              offset: {
                position: offset,
              },
              position_ms: 0,
            })
            .then(() => {
              setPosition(0);
              setIsPlaying(true);
            });
        });
      } else {
        spotifyApi
          .play({
            context_uri: playlist.uri,
            offset: {
              position: offset,
            },
            position_ms: 0,
          })
          .then(() => {
            setPosition(0);
            setIsPlaying(true);
          });
      }
    });
  }, [songInfo]);

  //timer
  let intervalRef = useRef();
  useEffect(() => {
    if (!songInfo || !isPlaying) return;
    intervalRef.current = setInterval(
      () => setPosition((prev) => prev + 1000),
      1000
    );
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (!songInfo || !isPlaying) return;
    if (position + 500 >= songInfo.duration_ms) {
      const next = skipToNext();
      if (!next) {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          if (!data?.body) return;
          if (data.body.is_playing) {
            spotifyApi.pause().then(() => {
              setIsPlaying(false);
            });
          }
        });
      }
    }
  }, [position]);

  const skipToNext = () => {
    if (!isPlaying) return;
    const [offset, , next, len] = getPrevAndNextId();
    if (offset < len - 1) {
      setCurrentTrackId(next);
      setOffset(offset + 1);
    } else if (next) {
      setCurrentTrackId(next);
      setOffset(0);
    }
    return next;
  };

  const skipToPrev = () => {
    if (!isPlaying) return;
    const [offset, prev, , len] = getPrevAndNextId();
    if (offset > 0) {
      setCurrentTrackId(prev);
      setOffset(offset - 1);
      return;
    }
    if (prev) {
      setCurrentTrackId(prev);
      setOffset(len - 1);
    }
  };

  const changeRepeatMode = () => {
    if (myDevice.length > 0) {
      const mode = repeatMode === "off" ? "context" : "off";
      setRepeatMode(mode);
      spotifyApi.setRepeat(mode);
    }
  };

  const repeatIconColor =
    repeatMode === "context" ? "text-white" : "text-gray-500";

  return (
    <div
      className="h-24 bg-gradient-to-b from-black to-gray-900 text-white
            grid grid-cols-3 text-xs md:text-base px-2 md:px-8"
    >
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline w-10 h-10"
          src={songInfo?.album?.images?.[0].url}
          alt="album image"
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center justify-evenly">
          <FontAwesomeIcon
            icon={faRepeat}
            className={`button ${repeatIconColor}`}
            onClick={changeRepeatMode}
          />
          <FontAwesomeIcon
            icon={faBackwardStep}
            className="button"
            onClick={skipToPrev}
          />
          {isPlaying ? (
            <FontAwesomeIcon
              icon={faCirclePause}
              className="button w-8 h-8"
              onClick={handlePlayPause}
            />
          ) : (
            <FontAwesomeIcon
              icon={faCirclePlay}
              className="button w-8 h-8"
              onClick={handlePlayPause}
            />
          )}
          <FontAwesomeIcon
            icon={faForwardStep}
            className="button"
            onClick={skipToNext}
          />
          <FontAwesomeIcon icon={faShuffle} className="button text-gray-500" />
        </div>
        <div className="flex items-center space-x-3 md:space-x-4 justify-end text-gray-500 text-sm">
          <p>{millisecondToMinutesAndSeconds(position)}</p>
          <input
            className="form-range
            appearance-none
            w-full
            h-[3px]
            p-0
            bg-gray-600
            focus:outline-none focus:ring-0 focus:shadow-none"
            type="range"
            value={position}
            step={5000}
            onChange={(e) => setRange(Number(e.target.value))}
            min={0}
            max={songInfo?.duration_ms}
          />
          <p>
            {songInfo
              ? millisecondToMinutesAndSeconds(songInfo.duration_ms)
              : "00:00"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <FontAwesomeIcon
          icon={faVolumeLow}
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
        <FontAwesomeIcon
          icon={faVolumeHigh}
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
