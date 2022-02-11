import { useRecoilValue } from "recoil";
import { ClockIcon } from "@heroicons/react/outline";
import { playlistState } from "../atoms/playlistAtom";
import Song from "./Song";

function Songs() {
  const playlist = useRecoilValue(playlistState);

  return (
    <div className="px-8 flex flex-col space-y-1 pb-28 text-white">
      <div className="grid grid-cols-2 bg-black px-5 py-4 text-gray-500">
        <p className="pl-1 pr-1">{"#Title"}</p>
        <div className="flex items-center justify-between ml-auto md:ml-0">
          <p className="w-40 hidden md:inline">{"#Album"}</p>
          <ClockIcon className="button" />
        </div>
      </div>
      <hr />
      <div>
        {playlist?.tracks.items.map((track, i) => (
          <Song key={track.track.id} track={track} order={i} />
        ))}
      </div>
    </div>
  );
}

export default Songs;
