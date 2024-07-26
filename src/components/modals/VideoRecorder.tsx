import React, { useState, useRef, useEffect } from "react";
//import { AWS } from "../AWSconfig"; // Adjust the import path based on your project structure


const VideoRecorder: React.FC<{ setVideoUploaded: (value: boolean) => void, email: string }> = ({ setVideoUploaded, email }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    if (recording) return;

    // Clear any previous video chunks
    setChunks([]);
    setUploadSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute during recording
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const stopRecording = () => {
    if (!recording || !mediaRecorder) return;

    mediaRecorder.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const saveRecording = async () => {
    if (chunks.length === 0) return;

    const blob = new Blob(chunks, { type: "video/mp4" });
    const file = new File([blob], "recording.mp4", { type: "video/mp4" });

    setUploading(true);

    // Configure AWS S3
    //const s3 = new AWS.S3();
    const date = new Date().toISOString();
    const params = {
      Bucket: "optimatrade-recordings",
      Key: `${email}-${date}`,
      Body: file,
      ContentType: "video/mp4",
    };

    try {
      //await s3.upload(params).promise();
      setUploadSuccess(true);
      setVideoUploaded(true);
      console.log("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!recording && chunks.length > 0 && recordedVideoRef.current) {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const videoURL = URL.createObjectURL(blob);
      recordedVideoRef.current.src = videoURL;
      recordedVideoRef.current.load();
    }
  }, [recording, chunks]);

  if (uploading) {
    return <div className="text-center animate-pulse">Uploading...</div>;
  }

  return (
    <div className="text-sky-100 font-thin m-2">
      {uploadSuccess ? (
        <div>
          <p className="font-light text-gray-900">Video uploaded successfully!</p>
        </div>
      ) : (
        <div>
          <div className="bg-black w-full rounded-t-lg flex justify-end pb-5 mt-5">
            <div className={`m-2 h-3 w-3 rounded-full ${recording ? "bg-rose-500 animate-pulse" : "border border-rose-500"}`}></div>
          </div>
          <div className={`bg-black w-full rounded-b-lg pb-10`}>
            <video
              ref={videoRef}
              width="640"
              height="480"
              controls
              playsInline
              muted
              style={{ display: recording ? 'block' : 'none' }}
              className="rounded-lg mx-auto"
            ></video>
            <div>
              {!recording && chunks.length === 0 && (
                <div>
                  <button className="text-center w-full" onClick={startRecording}>Start Recording</button>
                </div>
              )}
              {recording && (
                <button className="text-center w-full" onClick={stopRecording}>Stop Recording</button>
              )}
            </div>
            {chunks.length > 0 && (
              <div className="p-2">
                <button className="text-center w-full" onClick={startRecording}>Redo Recording</button>
                <video
                  ref={recordedVideoRef}
                  width="640"
                  height="480"
                  controls
                  playsInline
                  className="rounded-lg mx-auto"
                ></video> 
              </div>
            )}
          </div>
          {chunks.length > 0 && !uploadSuccess && (
            <div className="mt-2">
              <button className="rounded-lg py-1 text-center w-full bg-teal-500 hover:bg-teal-300 text-slate-900 font-normal" onClick={saveRecording}>Save Recording</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;