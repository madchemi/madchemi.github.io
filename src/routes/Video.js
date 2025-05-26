// src/components/HealthAnalysisROM.js (또는 Video.js)

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext'; // AuthContext 경로가 올바른지 확인해주세요.

// --- 백엔드 API 주소 ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// --- 유틸리티 함수 ---
function calcAngle(A, B, C) {
    if (!A || !B || !C ||
        typeof A.x !== 'number' || typeof A.y !== 'number' || typeof A.z !== 'number' ||
        typeof B.x !== 'number' || typeof B.y !== 'number' || typeof B.z !== 'number' ||
        typeof C.x !== 'number' || typeof C.y !== 'number' || typeof C.z !== 'number') {
        // console.warn("calcAngle: Invalid landmark data", {A, B, C});
        return 0; // 숫자를 반환하도록 보장
    }
    const AB = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };
    const CB = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
    const dot = AB.x * CB.x + AB.y * CB.y + AB.z * CB.z;
    const magAB = Math.hypot(AB.x, AB.y, AB.z);
    const magCB = Math.hypot(CB.x, CB.y, CB.z);
    if (magAB === 0 || magCB === 0) return 0; // 숫자를 반환하도록 보장
    const acosValue = Math.min(Math.max(dot / (magAB * magCB), -1), 1);
    const angle = (Math.acos(acosValue) * 180) / Math.PI;
    return isNaN(angle) ? 0 : angle; // NaN 경우 0 반환 보장
}

// --- UI 컴포넌트 ---
const AngleGauge = ({ label, angle, maxAngle = 180 }) => {
    const angleNormalized = Math.min(Math.max(Number(angle) || 0, 0), maxAngle);
    const progress = (angleNormalized / maxAngle) * 100;

    return (
        <div className="w-full my-2">
            <div className="flex justify-between items-center mb-1 text-sm text-gray-300">
                <span>{label}</span>
                <span className="font-semibold text-white">{`${angleNormalized.toFixed(0)}°`}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                <div
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

// --- 메인 컴포넌트 ---
export default function HealthAnalysisROM() {
    const { user, token } = useAuth();

    const videoRef = useRef(null);
    const skeletonCanvasRef = useRef(null);
    const liveCanvasRef = useRef(null);
    const poseInstanceRef = useRef(null);
    const measurementTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    
    const isMediaPipeInitialized = useRef(false);
    const animationFrameId = useRef(null);

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('AI 모델 및 라이브러리를 준비 중입니다...');
    const [angles, setAngles] = useState({
        leftShoulder: 0, rightShoulder: 0, leftElbow: 0, rightElbow: 0,
        leftWrist: 0, rightWrist: 0, leftHip: 0, rightHip: 0,
        leftKnee: 0, rightKnee: 0, leftAnkle: 0, rightAnkle: 0,
    });
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [finalAngles, setFinalAngles] = useState(null);
    const [mediaPipeReady, setMediaPipeReady] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const sendAngleDataHttp = useCallback(async (payload) => {
        if (!token) {
            setMessage('인증 토큰이 없습니다. 다시 로그인해주세요.');
            setStatus('error');
            return;
        }
        const url = `${API_BASE_URL}/api/v1/rom-analysis`;
        
        console.log("서버로 전송될 최종 payload 객체 (sendAngleDataHttp):", payload);
        console.log("서버로 전송될 JSON 문자열 (sendAngleDataHttp):", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                if (!response.ok) {
                    setMessage(responseText || `서버 응답 오류: ${response.status}`);
                } else {
                    setMessage('서버로부터 예상치 못한 응답을 받았습니다. (JSON 파싱 실패)');
                }
                setStatus('error');
                return;
            }

            if (response.ok) {
                setMessage(`데이터 저장 완료 (ID: ${responseData.id}).`);
                setStatus('finished');
            } else {
                const errorDetail = responseData.detail;
                let userFriendlyErrorMessage = `서버 오류 (${response.status})`;
                if (typeof errorDetail === 'string') {
                    userFriendlyErrorMessage = errorDetail;
                } else if (Array.isArray(errorDetail) && errorDetail.length > 0 && errorDetail[0].msg) {
                    userFriendlyErrorMessage = errorDetail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('; ');
                } else if (typeof errorDetail === 'object' && errorDetail !== null && errorDetail.msg) {
                    userFriendlyErrorMessage = errorDetail.msg;
                } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                    userFriendlyErrorMessage = `상세 오류: ${JSON.stringify(errorDetail)}`;
                }
                setMessage(userFriendlyErrorMessage);
                setStatus('error');
            }
        } catch (error) {
            setMessage(error.message || '데이터 전송 중 네트워크 오류가 발생했습니다.');
            setStatus('error');
        }
    }, [token]);
    
    const onPoseResults = useCallback((results) => {
        const videoElement = videoRef.current;
        const skeletonCanvas = skeletonCanvasRef.current;
        const liveCanvas = liveCanvasRef.current;

        if (!videoElement || !skeletonCanvas || !liveCanvas || !results || !window.drawLandmarks || !window.POSE_CONNECTIONS) {
            return;
        }
        
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        if (videoWidth > 0 && videoHeight > 0) {
            [skeletonCanvas, liveCanvas].forEach(canvas => {
                if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
                     canvas.width = videoWidth;
                     canvas.height = videoHeight;
                }
            });
        } else {
            return;
        }

        const skeletonCtx = skeletonCanvas.getContext("2d");
        const liveCtx = liveCanvas.getContext("2d");

        skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
        liveCtx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);

        if (results.poseLandmarks) {
            window.drawLandmarks(skeletonCtx, results.poseLandmarks, { color: '#FFFF00', radius: 4 });
            window.drawConnectors(skeletonCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
            window.drawLandmarks(liveCtx, results.poseLandmarks, { color: '#00A1E0', radius: 4 });
            window.drawConnectors(liveCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
            
            const lm = results.poseLandmarks;
            setAngles({
                rightShoulder: calcAngle(lm[14], lm[12], lm[24]), leftShoulder: calcAngle(lm[13], lm[11], lm[23]),
                rightElbow: calcAngle(lm[12], lm[14], lm[16]), leftElbow: calcAngle(lm[11], lm[13], lm[15]),
                rightWrist: calcAngle(lm[14], lm[16], lm[20]), leftWrist: calcAngle(lm[13], lm[15], lm[19]),
                rightHip: calcAngle(lm[12], lm[24], lm[26]), leftHip: calcAngle(lm[11], lm[23], lm[25]),
                rightKnee: calcAngle(lm[24], lm[26], lm[28]), leftKnee: calcAngle(lm[23], lm[25], lm[27]),
                rightAnkle: calcAngle(lm[26], lm[28], lm[32]), leftAnkle: calcAngle(lm[25], lm[27], lm[31]),
            });
        }
    }, []);

    useEffect(() => {
        if (isMediaPipeInitialized.current) return;
        isMediaPipeInitialized.current = true;

        const loadScript = (src, id) => new Promise((resolve, reject) => {
            if (document.getElementById(id)) {
                console.log(`${id} 스크립트 태그 이미 존재함.`);
                resolve(); return;
            }
            const script = document.createElement('script');
            script.id = id; script.src = src; script.crossOrigin = 'anonymous'; script.async = true;
            script.onload = () => { console.log(`${src} 스크립트 로드 성공.`); resolve(); };
            script.onerror = (errorEvent) => { 
                console.error(`${src} 스크립트 로드 실패:`, errorEvent);
                reject(new Error(`${src} 스크립트 로드 실패`));
            };
            document.head.appendChild(script);
        });

        const initializeMediaPipe = async () => {
            setMessage('AI 모델 라이브러리 로딩 중...'); setStatus('loading');
            try {
                await Promise.all([
                    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js', 'mediapipe-pose-script'),
                    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js', 'mediapipe-drawing-script')
                ]);

                if (!window.Pose || !window.drawLandmarks || !window.POSE_CONNECTIONS) {
                    console.error("window.Pose:", window.Pose, "window.drawLandmarks:", window.drawLandmarks, "window.POSE_CONNECTIONS:", window.POSE_CONNECTIONS);
                    throw new Error('MediaPipe 또는 DrawingUtils 스크립트가 window 객체에 올바르게 로드되지 않았습니다.');
                }

                const pose = new window.Pose({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
                });
                pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
                pose.onResults(onPoseResults);
                if (typeof pose.initialize === 'function') await pose.initialize();
                
                poseInstanceRef.current = pose;
                setMediaPipeReady(true); 
            } catch (error) {
                console.error("MediaPipe 초기화 중 최종 에러:", error);
                setStatus('error');
                setMessage(error.message || 'AI 모델 초기화에 실패했습니다. 페이지를 새로고침 해보세요.');
            }
        };
        initializeMediaPipe();
        return () => {
            console.log("MediaPipe 초기화 useEffect 클린업: poseInstance 해제 시도");
            poseInstanceRef.current?.close();
            poseInstanceRef.current = null;
            // isMediaPipeInitialized.current = false; // 필요에 따라 주석 해제
        };
    }, [onPoseResults]);

    useEffect(() => {
        if (!mediaPipeReady) return;
        const videoElementForCleanup = videoRef.current;
        // animationFrameId는 이제 useRef를 통해 관리되므로, useEffect 스코프 내 지역 변수 불필요
        // let localAnimFrameId = null; 

        const predictWebcam = async () => {
            const pose = poseInstanceRef.current;
            const video = videoRef.current;
            if (pose && video && video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && !video.paused) {
                try { await pose.send({ image: video }); } 
                catch (error) { console.error("pose.send() 에러:", error); }
            }
            animationFrameId.current = requestAnimationFrame(predictWebcam); // useRef 사용
        };

        setStatus('loading'); setMessage('웹캠을 준비 중입니다...');
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then(stream => {
                const videoElement = videoRef.current;
                if (videoElement) {
                    videoElement.srcObject = stream;
                    videoElement.onloadeddata = () => {
                        videoElement.play()
                            .then(() => {
                                console.log("웹캠 시작 및 예측 루프 시작");
                                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); // 기존 루프 취소
                                animationFrameId.current = requestAnimationFrame(predictWebcam); // 새 루프 시작
                                setStatus('ready'); setMessage('준비 완료! 측정을 시작할 수 있습니다.');
                            })
                            .catch(playError => { setStatus('error'); setMessage(`비디오 재생 오류: ${playError.message}`); });
                    };
                }
            })
            .catch(err => { setStatus('error'); setMessage(`웹캠 시작 오류: ${err.message}. 카메라 권한을 확인해주세요.`); });
        return () => {
            console.log("웹캠 useEffect 클린업: animation frame 및 비디오 스트림 정리");
            if (animationFrameId.current) { // useRef 사용
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            if (videoElementForCleanup?.srcObject) {
                videoElementForCleanup.srcObject.getTracks().forEach(track => track.stop());
                videoElementForCleanup.srcObject = null;
            }
        };
    }, [mediaPipeReady]);

    const handleMeasurement = () => {
        if (!user || !token) { setMessage('측정을 위해서는 로그인이 필요합니다.'); return; }
        if (status !== 'ready' && status !== 'finished') { setMessage('AI 모델 또는 웹캠이 아직 준비되지 않았습니다.'); return; }

        if (isMeasuring) {
            setIsMeasuring(false); clearTimeout(measurementTimeoutRef.current); clearInterval(countdownIntervalRef.current);
            setMessage('측정이 중단되었습니다.'); setStatus('ready'); 
            setFinalAngles(null); setCountdown(0);
        } else {
            setIsMeasuring(true); setStatus('countdown'); setFinalAngles(null); setCountdown(5);
            setMessage('측정을 준비하세요...');
            countdownIntervalRef.current = setInterval(() => setCountdown(prev => prev - 1), 1000);
            measurementTimeoutRef.current = setTimeout(() => {
                clearInterval(countdownIntervalRef.current); setStatus('measuring');
                setMessage('5초 동안 자세를 유지해주세요...');
                measurementTimeoutRef.current = setTimeout(() => {
                    setIsMeasuring(false); setStatus('sending');
                    setMessage('측정 완료. 데이터 전송 중...');
                    
                    // [핵심 수정] user_id를 문자열로 변환하여 전송
                    const payloadToSend = {
                        user_id: user?.id ? String(user.id) : null, 
                        measured_at: new Date().toISOString(),
                        data: { ...angles }
                    };
                    console.log("handleMeasurement에서 생성된 payloadToSend:", payloadToSend);
                    setFinalAngles(payloadToSend.data);
                    sendAngleDataHttp(payloadToSend);
                }, 5000);
            }, 5000);
        }
    };
    
    return (
        <div className="bg-gray-800 min-h-screen w-full flex flex-col items-center p-6 font-sans">
            <nav className="w-full max-w-6xl mb-8 p-4 bg-gray-900 text-white rounded-lg shadow-md flex justify-between items-center">
                <div className="text-xl font-bold">Aible</div>
                <div>{user ? `${user.username || '사용자'}님 환영합니다!` : "로그인이 필요합니다."}</div>
            </nav>
            <header className="w-full max-w-6xl mb-6 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white border-b-2 border-gray-600 pb-3">관절 가동범위(ROM) 분석</h1>
            </header>
            <main className="w-full max-w-6xl bg-gray-900 p-6 sm:p-8 rounded-lg shadow-2xl">
                <div className="text-center mb-6">
                    <p className="text-lg text-gray-300">웹캠에 전신이 나오도록 서주세요.</p>
                    <p className="text-md text-gray-400">준비가 되면 '측정 시작' 버튼을 눌러주세요.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="relative w-full aspect-video bg-black rounded-lg shadow-lg border border-blue-500 overflow-hidden">
                        <canvas ref={skeletonCanvasRef} className="w-full h-full" />
                        {status === 'countdown' && countdown > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
                                <span className="text-8xl font-bold">{countdown}</span>
                            </div>
                        )}
                        {(status === 'loading' || (status !== 'error' && !mediaPipeReady)) && (
                            <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-70">
                                <p>{message}</p>
                            </div>
                        )}
                    </div>
                    <div className="relative w-full aspect-video rounded-lg shadow-lg overflow-hidden">
                        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                        <canvas ref={liveCanvasRef} className="absolute inset-0 w-full h-full" />
                        {status === 'error' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-800 bg-opacity-90 text-white p-4 text-center">
                                <h3 className="text-lg font-semibold">오류 발생</h3>
                                <p className="text-sm mt-2 whitespace-pre-wrap">{typeof message === 'object' && message !== null ? JSON.stringify(message) : message}</p>
                                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">페이지 새로고침</button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-2 mb-8">
                    <AngleGauge label="오른쪽 어깨" angle={angles.rightShoulder} /> <AngleGauge label="왼쪽 어깨" angle={angles.leftShoulder} />
                    <AngleGauge label="오른쪽 팔꿈치" angle={angles.rightElbow} /> <AngleGauge label="왼쪽 팔꿈치" angle={angles.leftElbow} />
                    <AngleGauge label="오른쪽 손목" angle={angles.rightWrist} /> <AngleGauge label="왼쪽 손목" angle={angles.leftWrist} />
                    <AngleGauge label="오른쪽 고관절" angle={angles.rightHip} /> <AngleGauge label="왼쪽 고관절" angle={angles.leftHip} />
                    <AngleGauge label="오른쪽 무릎" angle={angles.rightKnee} /> <AngleGauge label="왼쪽 무릎" angle={angles.leftKnee} />
                    <AngleGauge label="오른쪽 발목" angle={angles.rightAnkle} /> <AngleGauge label="왼쪽 발목" angle={angles.leftAnkle} />
                </div>
                
                <div className="text-center mb-4">
                    <button
                        onClick={handleMeasurement}
                        disabled={!user || !token || (status !== 'ready' && status !== 'finished')}
                        className={`px-8 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75
                            ${isMeasuring ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400'
                                : (status === 'ready' || status === 'finished') ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed focus:ring-gray-500'}`}
                    >
                        {isMeasuring ? `측정 중단 (${countdown > 0 ? countdown : ''})` : 
                         status === 'countdown' ? `준비... ${countdown}` :
                         status === 'measuring' ? '측정 중...' :
                         status === 'sending' ? '전송 중...' :
                         (status === 'ready' || status === 'finished') ? '측정 시작' : '준비 중...'}
                    </button>
                </div>
                 <p className={`mt-4 text-center text-sm ${
                     status === 'error' ? 'text-red-400' : status === 'sending' ? 'text-blue-400 animate-pulse' :
                     (status === 'finished' && message && message.includes('완료')) ? 'text-green-400' :
                     (status === 'finished' && message && !message.includes('완료')) ? 'text-red-400' : 'text-gray-400'}`}>
                     {typeof message === 'object' && message !== null ? JSON.stringify(message) : message}
                 </p>
                {finalAngles && status === 'finished' && (
                    <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-2 text-center">최종 측정 결과:</h4>
                        <ul className="text-gray-300 text-sm space-y-1 grid grid-cols-2 md:grid-cols-4 text-center">
                           <li>오른쪽 어깨: {finalAngles.rightShoulder.toFixed(1)}°</li> <li>왼쪽 어깨: {finalAngles.leftShoulder.toFixed(1)}°</li>
                           <li>오른쪽 팔꿈치: {finalAngles.rightElbow.toFixed(1)}°</li> <li>왼쪽 팔꿈치: {finalAngles.leftElbow.toFixed(1)}°</li>
                           <li>오른쪽 손목: {finalAngles.rightWrist.toFixed(1)}°</li> <li>왼쪽 손목: {finalAngles.leftWrist.toFixed(1)}°</li>
                           <li>오른쪽 고관절: {finalAngles.rightHip.toFixed(1)}°</li> <li>왼쪽 고관절: {finalAngles.leftHip.toFixed(1)}°</li>
                           <li>오른쪽 무릎: {finalAngles.rightKnee.toFixed(1)}°</li> <li>왼쪽 무릎: {finalAngles.leftKnee.toFixed(1)}°</li>
                           <li>오른쪽 발목: {finalAngles.rightAnkle.toFixed(1)}°</li> <li>왼쪽 발목: {finalAngles.leftAnkle.toFixed(1)}°</li>
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}