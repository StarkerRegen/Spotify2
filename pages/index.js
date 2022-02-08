import { getSession } from "next-auth/react";
import Head from "next/head";
import Sidebar from "../components/Sidebar";
import Center from "../components/Center";
import Player from "../components/Player";

export default function Home() {
  return (
    <div className="">
      <Head>
        <title>Spotify 2.0</title>
      </Head>
      <main className="flex bg-black h-screen overflow-hidden">
        <Sidebar />
        <Center />
      </main>
      <div className="sticky bottom-0">
        <Player />
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
}
