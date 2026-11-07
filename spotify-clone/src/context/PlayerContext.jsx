import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';


export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const url = 'http://localhost:4000';
    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);


    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0

        },
        totalTime: {
            second: 0,
            minute: 0
        }
    })

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true)
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false)
    }
    const playWithId = async (id) => {
        await songsData.map((item) => {
            if (id === item._id) {
                setTrack(item);
            }
        })
        await audioRef.current.play();
        setPlayStatus(true);

    }
    const previous = async () => {
       songsData.map(async(item,index)=>{
        if(track._id ==item._id && index>0){
            await setTrack(songsData[index-1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }

       })
    }

    const next = async () => {
        songsData.map(async(item,index)=>{
        if(track._id ==item._id && index< songsData.length){
            await setTrack(songsData[index+1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }

       })
      
    }


    const seekSong = (e) => {
        let width = seekBg.current.getBoundingClientRect().width;

        let offsetX = e.clientX - seekBg.current.getBoundingClientRect().left;

        let percentage = (offsetX / width) * 100;

        audioRef.current.currentTime =
            (percentage / 100) * audioRef.current.duration;
    }
    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);

            const songs = response.data.songs || [];

            setSongsData(songs);
            setTrack(songs[0] || null);

        } catch (error) {
            console.log("Songs Fetch Error:", error);
        }
    }
    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`)
            setAlbumsData(response.data.albums);
        } catch (error) {

        }
    }

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const updateTime = () => {
            if (!seekBar.current) return;

            const current = audio.currentTime;
            const duration = audio.duration;

            if (Number.isFinite(duration) && duration > 0) {
                seekBar.current.style.width =
                    `${(current / duration) * 100}%`;
            }

            setTime({
                currentTime: {
                    second: Math.floor(current % 60),
                    minute: Math.floor(current / 60)
                },
                totalTime: {
                    second: Number.isFinite(duration)
                        ? Math.floor(duration % 60) : 0,
                    minute: Number.isFinite(duration)
                        ? Math.floor(duration / 60) : 0
                }
            });
        };

        audio.addEventListener('timeupdate', updateTime);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
        };

    }, []);

    useEffect(() => {
        getSongsData(); getAlbumsData();
    }, [])

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track,
        setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        songsData, albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
