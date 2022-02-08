import { ChevronDownIcon } from "@heroicons/react/outline";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistIdState, playlistState } from "../atoms/playlistAtom";
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
  const spotifyApi = useSpotify();

  useEffect(() => {
    setColor(shuffle(colors).pop());
  }, [currentPlaylistId]);

  useEffect(() => {
    spotifyApi
      .getPlaylist(currentPlaylistId)
      .then((data) => setPlaylist(data.body))
      .catch((error) => console.log("Opps!There are somthing wrong, ", error));
  }, [spotifyApi, currentPlaylistId]);

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
          <ChevronDownIcon className="h-5 w-5" />
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
      <Songs />
    </div>
  );
}

export default Center;
