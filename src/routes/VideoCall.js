// 캔버스에 작성된 코드 - 복사하여 사용하세요.
// src/routes/VideoCall.js

import React, { useRef, useState, useEffect, useCallback } from "react";
import SimplePeer from "simple-peer";

const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
let socketInstance = null; // 소켓 인스턴스를 컴포넌트 외부에서 관리 (재연결 로직 등에 유리)

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null); // WebRTC peer 객체
  const localStreamRef = useRef(null); // 로컬 미디어 스트림 저장

  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // 연결 시도 중 상태
  const [mediaPipeReady, setMediaPipeReady] = useState(false); // MediaPipe 로드 상태
  const mediaPipeLoadIntervalRef = useRef(null);

  // MediaPipe 라이브러리 로드 확인 및 초기화 로직 (Video.js와 유사하게)
  const initializeMediaPipe = useCallback(() => {
    // VideoCall.js에서 MediaPipe를 실제로 사용하는 경우에만 이 로직이 의미가 있습니다.
    // 여기서는 Pose와 drawing_utils를 예시로 사용합니다.
    // 만약 VideoCall에서 MediaPipe를 사용하지 않는다면 이 함수 전체 및 관련 상태(mediaPipeReady)는 제거해도 됩니다.
    if (window.Pose && window.drawLandmarks && window.drawConnectors && window.POSE_CONNECTIONS) {
      console.log("VideoCall: MediaPipe Pose and drawing_utils are ready.");
      clearInterval(mediaPipeLoadIntervalRef.current);
      setMediaPipeReady(true);
      // 만약 VideoCall 내에서 MediaPipe 인스턴스 생성이 필요하다면 여기서 진행
      // 예: const pose = new window.Pose({...}); poseInstanceRef.current = pose;
    } else {
      console.log("VideoCall: Waiting for MediaPipe libraries to load...");
    }
  }, []);

  useEffect(() => {
    // MediaPipe 사용 여부에 따라 아래 로직 활성화/비활성화
    // mediaPipeLoadIntervalRef.current = setInterval(initializeMediaPipe, 500);

    return () => {
      clearInterval(mediaPipeLoadIntervalRef.current);
      // MediaPipe 인스턴스 정리 (필요시)
      // if (poseInstanceRef.current && typeof poseInstanceRef.current.close === 'function') {
      //   poseInstanceRef.current.close();
      // }
    };
  }, [initializeMediaPipe]);


  // WebSocket 연결 초기화 및 관리
  useEffect(() => {
    const connectWebSocket = () => {
      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        console.log("VideoCall: WebSocket is already connected.");
        return;
      }

      console.log(`VideoCall: Attempting to connect to WebSocket: ${wsUrl}`);
      socketInstance = new WebSocket(wsUrl);
      setIsConnecting(true);

      socketInstance.onopen = () => {
        console.log("VideoCall: WebSocket connected.");
        setIsConnecting(false);
      };

      socketInstance.onmessage = async (event) => {
        // peerRef가 없거나, 이미 다른 시그널 처리 중이면 무시 (예: 이미 통화 종료 후)
        if (!peerRef.current && !isCalling) { // isCalling 조건 추가하여 응답자 측 고려
          console.log("VideoCall: Peer not ready or not in call, ignoring message.");
          return;
        }
        try {
          const data = JSON.parse(event.data);
          if (data.type === "offer" && !peerRef.current) { // 이미 peer가 있으면 중복 오퍼 방지
            console.log("VideoCall: Received offer");
            await handleOffer(data.offer);
          } else if (data.type === "answer" && peerRef.current) {
            console.log("VideoCall: Received answer");
            peerRef.current.signal(data.answer);
          } else if (data.type === "ice-candidate" && peerRef.current) {
            console.log("VideoCall: Received ICE candidate");
            // SimplePeer는 trickle ICE를 true로 설정해야 candidate를 개별적으로 처리합니다.
            // 현재는 trickle: false이므로 이 부분은 호출되지 않을 가능성이 높습니다.
            // 만약 trickle: true를 사용한다면 이 부분이 필요합니다.
            if (data.candidate) {
                 peerRef.current.signal(data.candidate);
            }
          } else if (data.type === "hangup" && isCalling) {
            console.log("VideoCall: Received hangup signal. Ending call.");
            endCallCleanup(); // 상대방이 통화 종료 시 로컬 정리
          }
        } catch (error) {
          console.warn("VideoCall: Could not parse socket message or signal error:", event.data, error);
        }
      };

      socketInstance.onclose = () => {
        console.log("VideoCall: WebSocket disconnected.");
        setIsConnecting(false);
        // 필요시 자동 재연결 로직 추가 가능
      };

      socketInstance.onerror = (err) => {
        console.error("VideoCall: WebSocket error:", err);
        setIsConnecting(false);
      };
    };

    connectWebSocket(); // 컴포넌트 마운트 시 연결 시도

    // 컴포넌트 언마운트 시 소켓 연결 정리 (메시지 리스너만 제거, 소켓 자체는 유지 가능)
    return () => {
      if (socketInstance) {
        // onmessage 핸들러는 이 컴포넌트 인스턴스에만 국한되므로 제거하는 것이 안전합니다.
        // 다른 컴포넌트에서 동일한 socketInstance를 공유하지 않는다면 close도 고려할 수 있습니다.
        // 여기서는 메시지 핸들러만 제거합니다.
        socketInstance.onmessage = null; 
        // socketInstance.onclose = null; // 필요에 따라
        // socketInstance.onerror = null; // 필요에 따라
        console.log("VideoCall: Cleaned up WebSocket message listener for this component instance.");
      }
      endCallCleanup(false); // 컴포넌트 언마운트 시 통화 관련 리소스 정리
    };
  }, []); // 마운트 시 한 번만 실행 (isCalling 의존성 제거)

  const setupPeer = (initiator, stream) => {
    const peer = new SimplePeer({
      initiator: initiator,
      trickle: false, // SDP에 모든 ICE 후보를 포함 (단순화)
      stream: stream,
    });

    peer.on("signal", (data) => {
      if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
        const messageType = initiator ? "offer" : "answer";
        console.log(`VideoCall: Sending ${messageType} signal`);
        socketInstance.send(JSON.stringify({ type: messageType, [messageType]: data }));
      } else {
        console.error("VideoCall: WebSocket not connected. Cannot send signal.");
      }
    });

    peer.on("stream", (remoteStream) => {
      console.log("VideoCall: Received remote stream.");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on("connect", () => {
      console.log("VideoCall: Peer connection established.");
      setIsCalling(true); // 연결 성공 시 isCalling 상태 업데이트
    });
    
    peer.on("close", () => {
        console.log("VideoCall: Peer connection closed.");
        endCallCleanup();
    });

    peer.on('error', (err) => {
      console.error('VideoCall: Peer error:', err);
      // Peer 오류 시 통화 상태 초기화
      endCallCleanup();
      alert(`WebRTC 연결 오류: ${err.message}. 페이지를 새로고침하거나 네트워크 상태를 확인해주세요.`);
    });

    return peer;
  };


  const startCall = async () => {
    if (isCalling || isConnecting || (socketInstance && socketInstance.readyState !== WebSocket.OPEN)) {
        alert(isConnecting ? "WebSocket 연결 중입니다." : "WebSocket이 연결되지 않았거나 이미 통화 중입니다.");
        return;
    }
    console.log("VideoCall: Starting call...");
    setIsCalling(true); // UI 상으로 통화 시작 상태 표시 (실제 연결은 peer.on('connect')에서)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream; // 스트림 저장
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      peerRef.current = setupPeer(true, stream);
    } catch (error) {
      console.error("VideoCall: Error starting call (getUserMedia or Peer setup):", error);
      alert(`통화 시작 오류: ${error.message}. 카메라/마이크 권한을 확인해주세요.`);
      endCallCleanup(); // 오류 발생 시 정리
    }
  };

  const handleOffer = async (offer) => {
    if (isCalling || (socketInstance && socketInstance.readyState !== WebSocket.OPEN)) {
        console.log("VideoCall: Already in call or WebSocket not ready. Ignoring offer.");
        // 상대방에게 이미 통화 중임을 알리는 메시지를 보낼 수도 있습니다.
        // socketInstance.send(JSON.stringify({ type: "busy", to: "offerer_id_if_available" }));
        return;
    }
    console.log("VideoCall: Handling offer...");
    setIsCalling(true); // UI 상으로 통화 수락 상태 표시

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      peerRef.current = setupPeer(false, stream);
      peerRef.current.signal(offer); // 수신한 오퍼로 시그널링 시작
    } catch (error) {
      console.error("VideoCall: Error handling offer (getUserMedia or Peer setup):", error);
      alert(`오퍼 처리 오류: ${error.message}. 카메라/마이크 권한을 확인해주세요.`);
      endCallCleanup();
    }
  };

  // 통화 종료 및 리소스 정리 함수
  const endCallCleanup = (notifyServer = true) => {
    console.log("VideoCall: Cleaning up call resources.");
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsCalling(false);

    if (notifyServer && socketInstance && socketInstance.readyState === WebSocket.OPEN) {
      // 상대방에게 통화 종료 알림 (선택 사항)
      // socketInstance.send(JSON.stringify({ type: "hangup" }));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="border rounded-lg overflow-hidden shadow-lg">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-auto min-h-[200px] md:min-h-[300px] bg-black" />
            <p className="text-center text-sm text-gray-400 p-1 bg-gray-800">상대방 화면</p>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-auto min-h-[200px] md:min-h-[300px] bg-gray-700" />
            <p className="text-center text-sm text-gray-400 p-1 bg-gray-800">내 화면</p>
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        {!isCalling ? (
          <button 
            onClick={startCall} 
            disabled={isConnecting || (socketInstance && socketInstance.readyState !== WebSocket.OPEN)} 
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 text-lg font-semibold shadow-md"
          >
            {isConnecting ? "연결 중..." : "통화 시작"}
          </button>
        ) : (
          <button 
            onClick={() => endCallCleanup(true)} 
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 text-lg font-semibold shadow-md"
          >
            통화 종료
          </button>
        )}
      </div>
      {isConnecting && <p className="text-sm text-yellow-400">WebSocket 서버에 연결 중입니다...</p>}
      {socketInstance && socketInstance.readyState !== WebSocket.OPEN && !isConnecting &&
        <p className="text-sm text-red-400">WebSocket 서버에 연결되지 않았습니다. 새로고침하거나 서버 상태를 확인해주세요.</p>
      }
    </div>
  );
};

export default VideoCall;
