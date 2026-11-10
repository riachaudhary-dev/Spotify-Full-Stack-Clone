
import { useContext } from "react";
import { PlayerContext } from "./context/PlayerContext";
import Display from "./components/Display";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";

const App = () => {

    const { audioRef, track, songsData } = useContext(PlayerContext);

    return (
        <div className="h-screen bg-black">
            {
                songsData.length !== 0
                    ? <>
                        <div className="h-[90%] flex">
                            <Sidebar />
                            <Display />
                        </div>

                        <Player />
                    </>
                    : null
            }


            <audio
                ref={audioRef}
                src={track?.file || undefined}
                preload="auto"
            ></audio>
        </div>
    );
};

export default App;
