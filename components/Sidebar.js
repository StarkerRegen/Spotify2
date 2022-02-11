import { signOut, useSession } from "next-auth/react";
import {
  HomeIcon,
  LibraryIcon,
  PlusCircleIcon,
  SearchIcon,
  HeartIcon,
  RssIcon,
  LogoutIcon,
  VolumeUpIcon,
} from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import useSpotify from "../hooks/useSpotify";
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistIdState } from "../atoms/playlistAtom";
import { isPlayingState } from "../atoms/songAtom";

function Sidebar() {
  const { data: session } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylistId, setCurrentPlaylistId] =
    useRecoilState(playlistIdState);
  const isPlaying = useRecoilValue(isPlayingState);
  const spotifyApi = useSpotify();

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      spotifyApi.getUserPlaylists().then((data) => {
        setPlaylists(data.body.items);
      });
    }
  }, [session, spotifyApi]);

  return (
    <div
      className="text-gray-500 p-5 text-xs lg:text-sm border-r border-gray-900 
      h-screen overflow-y-scroll scrollbar-hide sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex"
    >
      <div className="space-y-4">
        <button
          className="flex items-center space-x-2 hover:text-white"
          onClick={() => signOut()}
        >
          <LogoutIcon className="h-5 w-5" />
          <p>Log Out</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <HomeIcon className="h-5 w-5" />
          <p>Home</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <SearchIcon className="h-5 w-5" />
          <p>Search</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <LibraryIcon className="h-5 w-5" />
          <p>Your Library</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900"></hr>

        <button className="flex items-center space-x-2 hover:text-white">
          <PlusCircleIcon className="h-5 w-5" />
          <p>Create Playlist</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <HeartIcon className="h-5 w-5" />
          <p>Liked Songs</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <RssIcon className="h-5 w-5" />
          <p>Your episodes</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900"></hr>

        {playlists.map((playlist) => {
          const color =
            playlist.id === currentPlaylistId && isPlaying
              ? "text-green-600"
              : "text-gray-500";
          return (
            <p
              key={playlist.id}
              className={`${color} cursor-pointer hover:text-white`}
              onClick={() => setCurrentPlaylistId(playlist.id)}
            >
              {playlist.name}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
