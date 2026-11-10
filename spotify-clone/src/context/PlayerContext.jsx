
import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef(null);
    const seekBg = useRef(null);
    const seekBar = useRef(null);
    const pendingAutoplay = useRef(false);

    const url = "http://localhost:4000";

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
    });

    // Play current song
    const play = async () => {
        if (!audioRef.current || !track) return;

        try {
            await audioRef.current.play();
            setPlayStatus(true);
        } catch (error) {
            console.error("Playback Error:", error);
            setPlayStatus(false);
        }
    };

    // Pause current song
    const pause = () => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        setPlayStatus(false);
    };

    // Select and play a song by ID
    const playWithId = (id) => {

        const selectedSong = songsData.find(
            (item) => String(item._id) === String(id)
        );

        if (!selectedSong) {
            console.error("Song not found:", id);
            return;
        }

        if (!selectedSong.file) {
            console.error("Audio URL missing:", selectedSong);
            return;
        }

        if (track?._id === selectedSong._id) {
            play();
            return;
        }

        pendingAutoplay.current = true;
        setTrack(selectedSong);
    };

    // Play after the new audio source is ready
    useEffect(() => {

        const audio = audioRef.current;

        if (!audio || !track) return;
        if (!pendingAutoplay.current) return;

        pendingAutoplay.current = false;

        audio.pause();
        audio.currentTime = 0;

        const startPlayback = async () => {
            try {
                await audio.play();
                setPlayStatus(true);
            } catch (error) {
                console.error("Unable to play selected song:", error);
                setPlayStatus(false);
            }
        };

        const handleCanPlay = () => {
            audio.removeEventListener("canplay", handleCanPlay);
            startPlayback();
        };

        audio.addEventListener("canplay", handleCanPlay);

        audio.load();

        // Handle cases where the audio is already ready
        if (audio.readyState >= 3) {
            handleCanPlay();
        }

        return () => {
            audio.removeEventListener("canplay", handleCanPlay);
        };

    }, [track]);

    // Previous song
    const previous = () => {

        if (!track || songsData.length === 0) return;

        const currentIndex = songsData.findIndex(
            (item) => item._id === track._id
        );

        if (currentIndex > 0) {
            pendingAutoplay.current = true;
            setTrack(songsData[currentIndex - 1]);
        }
    };

    // Next song
    const next = () => {

        if (!track || songsData.length === 0) return;

        const currentIndex = songsData.findIndex(
            (item) => item._id === track._id
        );

        if (
            currentIndex !== -1 &&
            currentIndex < songsData.length - 1
        ) {
            pendingAutoplay.current = true;
            setTrack(songsData[currentIndex + 1]);
        }
    };

    // Seek song
    const seekSong = (e) => {

        if (!audioRef.current || !seekBg.current) return;

        const width = seekBg.current.getBoundingClientRect().width;

        if (width <= 0) return;

        const offsetX =
            e.clientX - seekBg.current.getBoundingClientRect().left;

        const percentage = Math.max(
            0,
            Math.min(100, (offsetX / width) * 100)
        );

        if (Number.isFinite(audioRef.current.duration)) {
            audioRef.current.currentTime =
                (percentage / 100) * audioRef.current.duration;
        }
    };

    // Fetch songs
    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);

            const songs = response.data.songs || [];

            setSongsData(songs);
            setTrack(songs[0] || null);

        } catch (error) {
            console.error("Songs Fetch Error:", error);
        }
    };

    // Fetch albums
    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);

            setAlbumsData(response.data.albums || []);

        } catch (error) {
            console.error("Albums Fetch Error:", error);
        }
    };

    // Update song duration and seek bar
    useEffect(() => {

        const audio = audioRef.current;

        if (!audio) return;

        const updateTime = () => {

            const current = audio.currentTime;
            const duration = audio.duration;

            if (seekBar.current) {
                seekBar.current.style.width =
                    Number.isFinite(duration) && duration > 0
                        ? `${(current / duration) * 100}%`
                        : "0%";
            }

            setTime({
                currentTime: {
                    second: Math.floor(current % 60),
                    minute: Math.floor(current / 60)
                },
                totalTime: {
                    second: Number.isFinite(duration)
                        ? Math.floor(duration % 60)
                        : 0,
                    minute: Number.isFinite(duration)
                        ? Math.floor(duration / 60)
                        : 0
                }
            });
        };

        const resetTime = () => {

            if (seekBar.current) {
                seekBar.current.style.width = "0%";
            }

            setTime({
                currentTime: {
                    second: 0,
                    minute: 0
                },
                totalTime: {
                    second: 0,
                    minute: 0
                }
            });
        };

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateTime);
        audio.addEventListener("emptied", resetTime);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateTime);
            audio.removeEventListener("emptied", resetTime);
        };

    }, []);

    // Load songs and albums
    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track,
        setTrack,
        playStatus,
        setPlayStatus,
        time,
        setTime,
        play,
        pause,
        playWithId,
        previous,
        next,
        seekSong,
        songsData,
        albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
