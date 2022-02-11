import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTrackIdState, playDevice } from "../atoms/songAtom";
import useSpotify from "./useSpotify";

function useSongInfo() {
  const spotifyApi = useSpotify();
  const currentTrackId = useRecoilValue(currentTrackIdState);
  const [songInfo, setSongInfo] = useState(null);
  const [myDevice, setMyDevice] = useRecoilState(playDevice);

  useEffect(() => {
    const fetchSongInfo = async () => {
      if (currentTrackId) {
        const trackInfo = await fetch(
          `https://api.spotify.com/v1/tracks/${currentTrackId}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyApi.getAccessToken()}`,
            },
          }
        ).then((res) => res.json());
        setSongInfo(trackInfo);
      }
    };
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
    fetchSongInfo();
    getAvailableDevice();
  }, [currentTrackId, spotifyApi]);

  return songInfo;
}

export default useSongInfo;
