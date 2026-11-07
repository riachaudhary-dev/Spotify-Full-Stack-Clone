import { v2 as cloudinary } from 'cloudinary';
import songModel from "../models/SongModel.js";

const addSong = async (req, res) => {
    try {
        const { name, desc, album } = req.body;

        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        const audioUpload = await cloudinary.uploader.upload(
            audioFile.path,
            { resource_type: "video" }
        );

        const imageUpload = await cloudinary.uploader.upload(
            imageFile.path,
            { resource_type: "image" }
        );
        const duration = `${Math.floor(audioUpload.duration / 60)}: ${Math.floor(audioUpload.duration % 60)}`


        const songData = {
            name,
            desc,
            album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration
        };


        const song = new songModel(songData);
        await song.save();

        res.status(201).json({
            success: true,
            message: "Song Added Successfully",
            song
        });

    } catch (error) {
        console.error("Song Upload Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({});

        res.status(200).json({
            success: true,
            songs: allSongs
        });

    } catch (error) {
        console.error("List Song Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeSong = async(req, res)=>{

    try {
        
        await songModel.findByIdAndDelete(req.body.id);
        res.json(
            {success:true, message:"song removed"}
        )
    } catch (error) {
        res.json({
            success:false,
            message: error.message
        })
        
    }

}

export { addSong, listSong, removeSong };
