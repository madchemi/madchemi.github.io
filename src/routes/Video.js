import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

function Video() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angleData, setAngleData] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("웹캠 접근 실패:", error);
      }
    };
    startCamera();
  }, []);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg"); // Base64 인코딩된 이미지
    sendFrameToServer(imageData);
  };

  const sendFrameToServer = async (imageData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_RAILWAY_URL}/process_frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      setAngleData(data); // 각도 데이터를 상태로 저장
    } catch (error) {
      console.error("서버 요청 실패:", error);
    }
  };

  return (
    <div>
      <h2>웹캠 기반 관절 각도 측정</h2>
      <div className="flex flex-col items-center space-y-4 p-4">
        <video ref={videoRef} autoPlay playsInline className="webcam" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      
      
      <button onClick={captureFrame}>측정 시작</button>

      {angleData && (
        <div>
          <h3>측정 결과</h3>
          <pre>{JSON.stringify(angleData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Video;
