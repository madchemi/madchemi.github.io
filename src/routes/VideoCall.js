import React, { useRef, useState, useEffect } from "react";
import SimplePeer from "simple-peer";

const socket = new WebSocket("ws://localhost:8000/ws");

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "offer") {
        handleOffer(data.offer);
      } else if (data.type === "answer") {
        peerRef.current.signal(data.answer);
      } else if (data.type === "ice-candidate") {
        peerRef.current.signal(data.candidate);
      }
    };

    return () => socket.close();
  }, []);

  const startCall = async () => {
    setIsCalling(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    peerRef.current = new SimplePeer({ initiator: true, trickle: false, stream });

    peerRef.current.on("signal", (data) => {
      socket.send(JSON.stringify({ type: "offer", offer: data }));
    });

    peerRef.current.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
  };

  const handleOffer = async (offer) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    peerRef.current = new SimplePeer({ initiator: false, trickle: false, stream });

    peerRef.current.signal(offer);

    peerRef.current.on("signal", (data) => {
      socket.send(JSON.stringify({ type: "answer", answer: data }));
    });

    peerRef.current.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
  };

  const endCall = () => {
    setIsCalling(false);
    if (peerRef.current) peerRef.current.destroy();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-48 rounded-xl bg-black" />
        <video ref={localVideoRef} autoPlay playsInline className="webcam" />
      </div>
      <div className="flex space-x-4">
        <button onClick={startCall} disabled={isCalling} className="bg-green-500 hover:bg-green-600">Start Call</button>
        <button onClick={endCall} disabled={!isCalling} className="bg-red-500 hover:bg-red-600">End Call</button>
      </div>
    </div>
  );
};

export default VideoCall;
