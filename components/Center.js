import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCirclePlay,
  faCirclePause,
} from "@fortawesome/free-solid-svg-icons";
import { playlistIdState, playlistState } from "../atoms/playlistAtom";
import {
  isPlayingState,
  currentTrackIdState,
  playPosition,
  playOffset,
} from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify";
import Songs from "./Songs";
import { shuffle } from "lodash";

const colors = [
  "from-red-400",
  "from-pink-400",
  "from-indigo-400",
  "from-yellow-400",
  "from-green-400",
  "from-blue-400",
  "from-purple-400",
];

function Center() {
  const { data: session } = useSession();
  const [color, setColor] = useState("from-pink-400");
  const currentPlaylistId = useRecoilValue(playlistIdState);
  const [playlist, setPlaylist] = useRecoilState(playlistState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const setCurrentTrackId = useSetRecoilState(currentTrackIdState);
  const setPosition = useSetRecoilState(playPosition);
  const setOffset = useSetRecoilState(playOffset);
  const spotifyApi = useSpotify();

  useEffect(() => {
    setColor(shuffle(colors).pop());
    if (isPlaying) {
      spotifyApi.pause().then(setIsPlaying(false));
    }
  }, [currentPlaylistId]);

  useEffect(() => {
    spotifyApi
      .getPlaylist(currentPlaylistId)
      .then((data) => setPlaylist(data.body))
      .catch((error) => console.log("Opps!There are somthing wrong, ", error));
  }, [spotifyApi, currentPlaylistId]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (!data?.body) return;
      if (isPlaying) {
        spotifyApi.pause().then(() => {
          setPosition(data.body.progress_ms);
          setIsPlaying(false);
        });
      } else {
        spotifyApi
          .play({
            context_uri: playlist.uri,
            offset: {
              position: 0,
            },
            position_ms: 0,
          })
          .then(() => {
            setCurrentTrackId(playlist.tracks.items[0].track.id);
            setPosition(0);
            setOffset(0);
            setIsPlaying(true);
          });
      }
    });
  };

  return (
    <div className="flex-grow text-white h-screen overflow-y-scroll scrollbar-hide">
      <header className="absolute top-5 right-8">
        <div
          className="flex items-center bg-gray-600 space-x-3 opacity-70 hover:opacity-50 cursor-pointer rounded-full p-1 pr-2"
          onClick={signOut}
        >
          <img
            className="rounded-full w-190 h-10"
            src={session?.user.image}
            alt="avatar"
          />
          <h2>{session?.user.name}</h2>
          <FontAwesomeIcon icon={faChevronDown} className="h-5 w-5" />
        </div>
      </header>
      <section
        className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 w-full text-white p-8`}
      >
        <img
          className="h-44 w-44 shadow-2xl"
          src={playlist?.images?.[0]?.url}
          alt="album picture"
        />
        <div>
          <p>Playlist</p>
          <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold">
            {playlist?.name}
          </h1>
        </div>
      </section>
      <section>
        <div>
          {isPlaying ? (
            <FontAwesomeIcon
              icon={faCirclePause}
              className="button w-16 h-16 ml-10 text-green-600"
              onClick={handlePlayPause}
            />
          ) : (
            <FontAwesomeIcon
              icon={faCirclePlay}
              className="button w-16 h-16 ml-10 text-green-600"
              onClick={handlePlayPause}
            />
          )}
        </div>
        <Songs />
      </section>
    </div>
  );
}

export default Center;
