// src/routes/ExerciseDetailPage.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Breadcrumb, ListGroup, ProgressBar, Badge } from 'react-bootstrap';

import './ExerciseDetailPage.css';
import { useAuth } from '../AuthContext';

// (allExercisesData, exerciseTTSScenarios, calculateAngle 함수는 기존과 동일하게 유지)
const allExercisesData = {
    'demo-wrist-stretch': { 
        id: 'demo-wrist-stretch', 
        name: '손목 폄근 스트레칭 (Wrist Extensor Stretch)', 
        type: 'stretch', 
        local_video_src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: '/img/demo_wrist_stretch.png', 
        intensity_settings: { 
            low: {sets: 2, reps: 1, rest: 30, holdDuration: 15}, 
            medium: {sets: 2, reps: 1, rest: 30, holdDuration: 20}, 
            high: {sets: 3, reps: 1, rest: 30, holdDuration: 30}
        }, 
        instructions: ['한쪽 팔을 앞으로 곧게 폅니다. 손바닥이 아래를 향하게 합니다.', '반대쪽 손으로 편 손의 손가락을 잡고 몸쪽으로 부드럽게 당깁니다.', '아래팔 윗부분과 팔꿈치 바깥쪽이 당겨지는 것을 느낍니다.', '통증이 없는 범위에서 설정된 시간동안 유지 후, 반대쪽도 동일하게 반복합니다.'] 
    },
    'demo-triceps-stretch': { 
        id: 'demo-triceps-stretch', 
        name: '삼두근 스트레칭 (Triceps Stretch)', 
        type: 'stretch', 
        local_video_src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        image: '/img/demo_triceps_stretch.png', 
        intensity_settings: { 
            low: {sets: 2, reps: 1, rest: 30, holdDuration: 15}, 
            medium: {sets: 2, reps: 1, rest: 30, holdDuration: 20}, 
            high: {sets: 3, reps: 1, rest: 30, holdDuration: 30}
        }, 
        instructions: ['한쪽 팔을 들어 머리 뒤로 구부립니다.', '반대쪽 손으로 구부린 팔의 팔꿈치를 잡습니다.', '팔꿈치를 부드럽게 아래로 당겨 스트레칭합니다.', '반대쪽 팔도 동일하게 반복합니다.'] 
    },
    'demo-calf-stretch': { 
        id: 'demo-calf-stretch', 
        name: '종아리 스트레칭 (Calf Stretch)', 
        type: 'stretch', 
        local_video_src: 'https://www.w3schools.com/html/mov_bbb.mp4', 
        image: '/img/demo_calf_stretch.png', 
        intensity_settings: { 
            low: {sets: 2, reps: 1, rest: 30, holdDuration: 20}, 
            medium: {sets: 2, reps: 1, rest: 30, holdDuration: 30}, 
            high: {sets: 3, reps: 1, rest: 30, holdDuration: 30}
        }, 
        instructions: ['벽을 보고 서서 손을 벽에 댑니다.', '한 발을 뒤로 크게 뻗어 뒤꿈치를 바닥에 붙입니다.', '앞쪽 무릎을 구부리며 뒤쪽 다리의 종아리가 당겨지는 것을 느낍니다.', '설정된 시간동안 유지 후 반대쪽도 동일하게 반복합니다.'] 
    },
};

const exerciseTTSScenarios = {
    common: {
        page_intro: (exerciseName) => ({ text: `${exerciseName} 운동 페이지입니다. 아래에서 운동 강도를 선택해주세요.`, speed: 1.5, id: 'intro_page' }),
        preparation_general: (intensity, sets, reps) => ({ text: `강도 ${intensity}, ${sets}세트 ${reps}회로 운동을 시작합니다. 데모 영상을 참고하여 자세를 준비해주세요.`, speed: 1.5, id: 'prep_general' }),
        webcam_permission_guide: { text: "정확한 자세 분석을 위해 웹캠 사용이 필요합니다. 카메라 접근 권한을 허용해주세요.", speed: 1.5, id: 'perm_webcam' },
        webcam_error: { text: "웹캠 연결에 문제가 발생했습니다. 권한을 확인하거나 페이지를 새로고침 해주세요.", speed: 1.5, id: 'err_webcam' },        webcam_unsupported: { text: "현재 브라우저에서는 웹캠을 지원하지 않습니다.", speed: 1.5, id: 'err_unsupported_webcam' },
        mediapipe_loading: { text: "자세 분석 모델을 로딩하고 있습니다. 잠시만 기다려주세요.", speed: 1.5, id: 'loading_mediapipe' },
        mediapipe_preparing: { text: "자세 분석 준비가 완료되었습니다. 카메라 중앙에 전신이 나오도록 서주세요. 잠시 후 카운트다운이 시작됩니다.", speed: 1.5, id: 'prep_mediapipe' },
        mediapipe_countdown: (sec) => ({ text: `${sec}초 전.`, speed: 1.8, id: `prep_countdown_${sec}` }),
        start_exercise_general: { text: "운동 시작!", speed: 1.5, id: 'start_exercise' }, 
        rep_count_feedback: (count) => ({ text: `${count}`, speed: 1.8, id: `rep_count_${count}` }),
        last_rep_feedback: (count) => ({ text: `${count}! 마지막!`, speed: 1.8, id: `rep_count_last_${count}` }),
        set_complete: (set, restTime) => ({ text: `${set}세트 완료! ${restTime}초간 휴식합니다.`, speed: 1.5, id: `set_complete_${set}` }),
        next_set_preparation: (nextSet) => ({ text: `자, 이제 ${nextSet}세트 준비하세요.`, speed: 1.5, id: `prep_next_set_${nextSet}` }),
        exercise_finished_praise: { text: "모든 운동을 완료했습니다! 정말 수고 많으셨습니다!", speed: 1.5, id: 'finish_praise' },
        stretch_get_ready: (exerciseName, holdDuration) => ({ text: `${exerciseName}. 스트레칭 자세를 취해주세요. 자세가 감지되면 ${holdDuration}초 유지합니다.`, speed: 1.5, id: 'stretch_get_ready'}),
        stretch_hold_activated: (holdDuration) => ({ text: `자세 좋습니다! ${holdDuration}초간 유지합니다.`, speed: 1.5, id: 'stretch_hold_activated'})
    }
};

function calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

export const ExerciseDetailPage = () => {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); 

    // States
    const [isPoseReady, setIsPoseReady] = useState(false);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [webcamStreamReady, setWebcamStreamReady] = useState(false);
    const [_exercisePhase, _setExercisePhase] = useState('intensitySelection');
    const [feedbackMessage, setFeedbackMessage] = useState("운동 강도를 선택해주세요.");
    const [selectedIntensity, setSelectedIntensity] = useState('medium');
    const [currentSet, setCurrentSet] = useState(1);
    const [repsDoneInSet, setRepsDoneInSet] = useState(0);
    const [totalRepsGoal, setTotalRepsGoal] = useState(0);
    const [totalSetsGoal, setTotalSetsGoal] = useState(0);
    const [restTimeGoal, setRestTimeGoal] = useState(30);
    const [uiTimer, setUiTimer] = useState(0); 
    const [holdTimer, setHoldTimer] = useState(0);
    const [isHoldingStretch, setIsHoldingStretch] = useState(false);
    const [exerciseDetails, setExerciseDetails] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [leftKneeAngleDisplay, setLeftKneeAngleDisplay] = useState('N/A');
    const [rightKneeAngleDisplay, setRightKneeAngleDisplay] = useState('N/A');
    const [leftShoulderAngleDisplay, setLeftShoulderAngleDisplay] = useState('N/A');
    const [rightShoulderAngleDisplay, setRightShoulderAngleDisplay] = useState('N/A');
    const [leftElbowAngleDisplay, setLeftElbowAngleDisplay] = useState('N/A');
    const [rightElbowAngleDisplay, setRightElbowAngleDisplay] = useState('N/A');
    const [leftWristAngleDisplay, setLeftWristAngleDisplay] = useState('N/A');
    const [rightWristAngleDisplay, setRightWristAngleDisplay] = useState('N/A');

    // Refs
    const isHoldingStretchRef = useRef(false); 
    const webcamRef = useRef(null);
    const demoVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const holisticRef = useRef(null); // holistic 모델을 담을 Ref
    const animationFrameId = useRef(null);
    const allTimers = useRef([]);
    const exercisePhaseRef = useRef('intensitySelection');
    const onPoseResultsCallbackRef = useRef(null);

    useEffect(() => { isHoldingStretchRef.current = isHoldingStretch; }, [isHoldingStretch]);
    useEffect(() => { exercisePhaseRef.current = _exercisePhase; }, [_exercisePhase]);

    // Callbacks
    const clearAllTimers = useCallback(() => {
        allTimers.current.forEach(timerId => {
            if (typeof timerId === 'number') clearTimeout(timerId);
            else clearInterval(timerId);
        });
        allTimers.current = [];
    }, []);

    const setExercisePhase = useCallback((phase) => {
        console.log(`Phase changing from ${exercisePhaseRef.current} to ${phase}`);
        clearAllTimers();
        _setExercisePhase(phase);
    }, [_setExercisePhase, clearAllTimers]);
    
    const say = useCallback((speechObject) => {
        console.log("TTS (simulated):", speechObject.text); 
        setFeedbackMessage(speechObject.text);
    }, []);

const onPoseResultsCallback = useCallback((results) => {
        if (!canvasRef.current || !webcamRef.current || !webcamRef.current.videoWidth || !exerciseDetails) {
            return;
        }
        const canvasEl = canvasRef.current;
        const canvasCtx = canvasEl.getContext('2d');
        
        canvasEl.width = webcamRef.current.clientWidth;
        canvasEl.height = webcamRef.current.clientHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);
        
        // Holistic 모델 랜드마크 드로잉
        if (window.drawConnectors) {
            if (results.poseLandmarks && window.POSE_CONNECTIONS) {
                window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            }
            if (results.leftHandLandmarks && window.HAND_CONNECTIONS) {
                window.drawConnectors(canvasCtx, results.leftHandLandmarks, window.HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 2 });
                window.drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#FF0000', lineWidth: 2 });
            }
            if (results.rightHandLandmarks && window.HAND_CONNECTIONS) {
                window.drawConnectors(canvasCtx, results.rightHandLandmarks, window.HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 2 });
                window.drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#00FF00', lineWidth: 2 });
            }
        }
        
        const poseLandmarks = results.poseLandmarks;

        if (poseLandmarks && poseLandmarks.length > 0) {
            const visibilityThreshold = 0.5;
            
            const lWristFromHand = results.leftHandLandmarks ? results.leftHandLandmarks[0] : null;
            const rWristFromHand = results.rightHandLandmarks ? results.rightHandLandmarks[0] : null;
            const lIndexFromHand = results.leftHandLandmarks ? results.leftHandLandmarks[8] : null; // 8: INDEX_FINGER_TIP
            const rIndexFromHand = results.rightHandLandmarks ? results.rightHandLandmarks[8] : null;

            const p = { 
                lShoulder: poseLandmarks[11], rShoulder: poseLandmarks[12], 
                lElbow: poseLandmarks[13], rElbow: poseLandmarks[14],
                lHip: poseLandmarks[23], rHip: poseLandmarks[24],
                lKnee: poseLandmarks[25], rKnee: poseLandmarks[26], 
                lAnkle: poseLandmarks[27], rAnkle: poseLandmarks[28],
                lWrist: (lWristFromHand && lWristFromHand.visibility > visibilityThreshold) ? lWristFromHand : poseLandmarks[15], 
                rWrist: (rWristFromHand && rWristFromHand.visibility > visibilityThreshold) ? rWristFromHand : poseLandmarks[16],
                lIndex: (lIndexFromHand && lIndexFromHand.visibility > visibilityThreshold) ? lIndexFromHand : poseLandmarks[19], 
                rIndex: (rIndexFromHand && rIndexFromHand.visibility > visibilityThreshold) ? rIndexFromHand : poseLandmarks[20],
            };
            const allVisible = (...points) => points.every(point => point && point.visibility && point.visibility > visibilityThreshold);
            
            let leftWristAngle, rightWristAngle; 

            // UI 표시용 각도 계산 (다른 각도들도 필요하면 여기에 추가)
            if (allVisible(p.lHip, p.lKnee, p.lAnkle)) { setLeftKneeAngleDisplay(Math.round(calculateAngle(p.lHip, p.lKnee, p.lAnkle)) + "°"); } else { setLeftKneeAngleDisplay('N/A'); }
            if (allVisible(p.rHip, p.rKnee, p.rAnkle)) { setRightKneeAngleDisplay(Math.round(calculateAngle(p.rHip, p.rKnee, p.rAnkle)) + "°"); } else { setRightKneeAngleDisplay('N/A'); }
            if (allVisible(p.lHip, p.lShoulder, p.lElbow)) { setLeftShoulderAngleDisplay(Math.round(calculateAngle(p.lHip, p.lShoulder, p.lElbow)) + "°"); } else { setLeftShoulderAngleDisplay('N/A'); }
            if (allVisible(p.rHip, p.rShoulder, p.rElbow)) { setRightShoulderAngleDisplay(Math.round(calculateAngle(p.rHip, p.rShoulder, p.rElbow)) + "°"); } else { setRightShoulderAngleDisplay('N/A'); }
            if (allVisible(p.lShoulder, p.lElbow, p.lWrist)) { setLeftElbowAngleDisplay(Math.round(calculateAngle(p.lShoulder, p.lElbow, p.lWrist)) + "°"); } else { setLeftElbowAngleDisplay('N/A'); }
            if (allVisible(p.rShoulder, p.rElbow, p.rWrist)) { setRightElbowAngleDisplay(Math.round(calculateAngle(p.rShoulder, p.rElbow, p.rWrist)) + "°"); } else { setRightElbowAngleDisplay('N/A'); }
            
            if (allVisible(p.lElbow, p.lWrist, p.lIndex)) { 
                leftWristAngle = calculateAngle(p.lElbow, p.lWrist, p.lIndex); 
                setLeftWristAngleDisplay(Math.round(leftWristAngle) + "°"); 
            } else { 
                setLeftWristAngleDisplay('N/A'); 
                leftWristAngle = null; 
            }
            if (allVisible(p.rElbow, p.rWrist, p.rIndex)) { 
                rightWristAngle = calculateAngle(p.rElbow, p.rWrist, p.rIndex); 
                setRightWristAngleDisplay(Math.round(rightWristAngle) + "°"); 
            } else { 
                setRightWristAngleDisplay('N/A'); 
                rightWristAngle = null; 
            }
            
            if (exerciseDetails.id === 'demo-wrist-stretch' && exercisePhaseRef.current === 'exercising' && !isHoldingStretchRef.current) {
                // ▼▼▼ 요청하신 대로 디버깅을 위해 임계값을 매우 관대하게 수정 ▼▼▼
                const wristAngleThreshold = 179; // 거의 180도에 가깝게 설정 (아주 살짝만 꺾여도 인식되도록)

                const isLeftPoseCorrect = leftWristAngle !== null && leftWristAngle < wristAngleThreshold;
                const isRightPoseCorrect = rightWristAngle !== null && rightWristAngle < wristAngleThreshold;
                // ▲▲▲ 디버깅을 위해 임계값을 매우 관대하게 수정 ▲▲▲

                if (isLeftPoseCorrect || isRightPoseCorrect) {
                    const holdDuration = exerciseDetails.intensity_settings[selectedIntensity].holdDuration;
                    say(exerciseTTSScenarios.common.stretch_hold_activated(holdDuration));
                    setIsHoldingStretch(true);
                }
            }
        } else {
            setLeftKneeAngleDisplay('N/A'); setRightKneeAngleDisplay('N/A');
            setLeftShoulderAngleDisplay('N/A'); setRightShoulderAngleDisplay('N/A');
            setLeftElbowAngleDisplay('N/A'); setRightElbowAngleDisplay('N/A');
            setLeftWristAngleDisplay('N/A'); setRightWristAngleDisplay('N/A');
        }
        canvasCtx.restore();
    }, [exerciseDetails, selectedIntensity, say, setIsHoldingStretch]);
    
    useEffect(() => {
        onPoseResultsCallbackRef.current = onPoseResultsCallback;
    });
    
    // ▼▼▼ MediaPipe Holistic 초기화 로직 수정 ▼▼▼
    useEffect(() => {
        const initializeHolistic = async () => {
            const loadScript = (src) => new Promise((resolve, reject) => {
                const existingScript = document.querySelector(`script[src="${src}"]`);
                if (existingScript && existingScript.loaded) { resolve(); return; }
                if (existingScript) { 
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)));
                    return; 
                }
                const script = document.createElement('script');
                script.src = src; script.crossOrigin = 'anonymous'; script.async = true;
                script.onload = () => { script.loaded = true; console.log(`Script ${src} loaded successfully.`); resolve(); };
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });

            try {
                await Promise.all([
                    // 1. holistic.js 스크립트 로드
                    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js'),
                    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
                ]);
                
                // 2. new Holistic()으로 모델 인스턴스 생성
                console.log("Initializing MediaPipe Holistic instance...");
                const holistic = new window.Holistic({locateFile: (file) => 
                    // 3. 파일 경로 수정
                    `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
                });
                holistic.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });
                holistic.onResults((results) => onPoseResultsCallbackRef.current?.(results));
                
                holisticRef.current = holistic; // Ref에 모델 저장
                setIsPoseReady(true); 
                console.log("MediaPipe Holistic instance ready.");
            } catch (err) { 
                console.error("Error initializing MediaPipe:", err); 
                setError("운동 분석 라이브러리 초기화에 실패했습니다."); 
            }
        };
        
        initializeHolistic();

        return () => { 
            if (holisticRef.current) { 
                console.log("Closing Holistic instance.");
                holisticRef.current.close().catch(e => console.error("Error closing Holistic instance:", e)); 
                holisticRef.current = null; 
            }
        };
    }, []); // 컴포넌트 마운트 시 한 번만 실행
    
    const stopPoseDetection = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    }, []);

    const poseDetectionLoop = useCallback(async () => {
        if (holisticRef.current && webcamRef.current?.readyState >= 4) {
            try {
                await holisticRef.current.send({ image: webcamRef.current });
            } catch (error) { 
                console.error("Error sending image to Holistic in loop:", error); 
                stopPoseDetection();
            }
        }
        animationFrameId.current = requestAnimationFrame(poseDetectionLoop);
    }, [stopPoseDetection]);

    const startPoseDetection = useCallback(() => {
        if (!animationFrameId.current && holisticRef.current && webcamStreamReady) {
            console.log("Starting holistic detection loop.");
            animationFrameId.current = requestAnimationFrame(poseDetectionLoop);
        }
    }, [poseDetectionLoop, webcamStreamReady]);

    useEffect(() => {
        const activePhases = ['mediapipe_preparing', 'exercising', 'resting'];
        if (isWebcamActive && isPoseReady && webcamStreamReady && activePhases.includes(_exercisePhase)) {
            startPoseDetection();
        } else {
            stopPoseDetection();
        }
    }, [isWebcamActive, isPoseReady, webcamStreamReady, _exercisePhase, startPoseDetection, stopPoseDetection]);
    
    // (이하 나머지 모든 로직은 기존과 동일)

    useEffect(() => {
        let stream = null;
        const stopCamera = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                if (webcamRef.current) webcamRef.current.srcObject = null;
            }
        };

        if (isWebcamActive) {
            setWebcamStreamReady(false);
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
                    .then(str => {
                        stream = str;
                        if (webcamRef.current) {
                            webcamRef.current.srcObject = stream;
                            webcamRef.current.onloadedmetadata = () => {
                                webcamRef.current.play().catch(e => console.error("Webcam play error:", e));
                                setWebcamStreamReady(true);
                            };
                        }
                    })
                    .catch(err => { 
                        setError(`웹캠 접근 오류: ${err.name}. 카메라 권한을 확인해주세요.`);
                        setIsWebcamActive(false); 
                    });
            } else {
                setError("웹캠을 지원하지 않는 브라우저입니다.");
                setIsWebcamActive(false);
            }
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isWebcamActive]);


    const startExercise = useCallback(() => {
        if (!isPoseReady) {
            setError("자세 분석 모델이 아직 준비되지 않았습니다.");
            say({ text: "자세 분석 모델이 준비 중입니다. 잠시 후 다시 시도해주세요." });
            return;
        }
        say({ text: "카메라를 준비하고 있습니다..." });
        setExercisePhase('mediapipe_preparing'); 
    }, [isPoseReady, setExercisePhase, say]);

    useEffect(() => {
        const activePhases = ['mediapipe_preparing', 'exercising', 'resting'];
        if (activePhases.includes(_exercisePhase) && !isWebcamActive) {
            setIsWebcamActive(true);
        } else if (!activePhases.includes(_exercisePhase) && isWebcamActive) {
            setIsWebcamActive(false); 
        }
    }, [_exercisePhase, isWebcamActive]);

    const cleanupAndNavigate = useCallback((path) => {
        setExercisePhase('intensitySelection'); 
        navigate(path);
    }, [navigate, setExercisePhase]);
    
    useEffect(() => {
        if(!exerciseId) return;
        setLoading(true); setError(null);   
        const data = allExercisesData[exerciseId];
        if (data) { 
            setExerciseDetails(data); 
            const settings = data.intensity_settings[selectedIntensity];
            if(settings) {
                setTotalSetsGoal(settings.sets);
                setTotalRepsGoal(settings.reps);
                setRestTimeGoal(settings.rest);
            }
            if (_exercisePhase === 'intensitySelection') {
                 say(exerciseTTSScenarios.common.page_intro(data.name));
            }
        } else { 
            setError("운동 정보를 찾을 수 없습니다."); 
            setExerciseDetails(null); 
        }
        setLoading(false); 
    }, [exerciseId, _exercisePhase, say, selectedIntensity]);

    useEffect(() => {
        if (isHoldingStretch) {
            const settings = exerciseDetails?.intensity_settings[selectedIntensity];
            if (!settings) return;

            setHoldTimer(settings.holdDuration);

            const timerId = setInterval(() => {
                setHoldTimer(prevTimer => {
                    const newTimerValue = prevTimer - 1;
                    if (newTimerValue < 0) { // 0초까지 표시 후 종료
                        clearInterval(timerId);
                        
                        const newRepsDone = repsDoneInSet + 1;
                        setRepsDoneInSet(newRepsDone);
                        setIsHoldingStretch(false);

                        if (newRepsDone >= totalRepsGoal) {
                            if (currentSet >= totalSetsGoal) {
                                say(exerciseTTSScenarios.common.exercise_finished_praise);
                                setExercisePhase('finished');
                            } else {
                                say(exerciseTTSScenarios.common.set_complete(currentSet, restTimeGoal));
                                setExercisePhase('resting');
                            }
                        }
                        return 0;
                    }
                    return newTimerValue;
                });
            }, 1000);
            allTimers.current.push(timerId);
        }
    }, [isHoldingStretch, exerciseDetails, selectedIntensity, repsDoneInSet, totalRepsGoal, currentSet, totalSetsGoal, restTimeGoal, setExercisePhase, say, setRepsDoneInSet, setIsHoldingStretch]);

    useEffect(() => {
        let timerId;
        if (_exercisePhase === 'mediapipe_preparing' && isPoseReady && webcamStreamReady) {
            say(exerciseTTSScenarios.common.mediapipe_preparing);
            const countdownDuration = 5;
            setUiTimer(countdownDuration); 
            let currentCountdown = countdownDuration;

            timerId = setInterval(() => {
                currentCountdown--;
                setUiTimer(currentCountdown);
                if (currentCountdown > 0) {
                    say(exerciseTTSScenarios.common.mediapipe_countdown(currentCountdown));
                } else if (currentCountdown === 0) {
                    clearInterval(timerId);
                    if (exercisePhaseRef.current === 'mediapipe_preparing') {
                        setExercisePhase('exercising');
                    }
                }
            }, 1000);
            allTimers.current.push(timerId);

        } else if (_exercisePhase === 'exercising' && !isHoldingStretchRef.current) {
            if (exerciseDetails?.type === 'stretch') {
                const settings = exerciseDetails.intensity_settings[selectedIntensity];
                say(exerciseTTSScenarios.common.stretch_get_ready(exerciseDetails.name, settings.holdDuration));
            } else {
                say(exerciseTTSScenarios.common.start_exercise_general);
            }

        } else if (_exercisePhase === 'resting') {
            setUiTimer(restTimeGoal);
            let currentRestTime = restTimeGoal;
            timerId = setInterval(() => {
                currentRestTime--;
                setUiTimer(currentRestTime);
                if (currentRestTime < 0) {
                    clearInterval(timerId);
                    if (exercisePhaseRef.current === 'resting') {
                        const nextSet = currentSet + 1;
                        setCurrentSet(nextSet);
                        setRepsDoneInSet(0);
                        say(exerciseTTSScenarios.common.next_set_preparation(nextSet));
                        setExercisePhase('mediapipe_preparing');
                    }
                }
            }, 1000);
            allTimers.current.push(timerId);
        }
        
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [_exercisePhase, isPoseReady, webcamStreamReady, exerciseDetails, selectedIntensity, say, restTimeGoal, currentSet, setExercisePhase]);

    const handleIntensitySelection = useCallback((intensity) => {
        setSelectedIntensity(intensity);
        if(!exerciseDetails) return;
        const settings = exerciseDetails.intensity_settings[intensity];
        setExercisePhase('preparation');
        say(exerciseTTSScenarios.common.preparation_general(intensity, settings.sets, settings.reps));
    }, [exerciseDetails, setExercisePhase, say]);

    const handleSaveResults = () => { 
        console.log("운동 결과 저장 (시뮬레이션)");
        say({text: "운동 결과가 저장되었습니다."});
        cleanupAndNavigate('/');
    };
    
    const handleSkipRest = () => {
        const nextSet = currentSet + 1;
        setCurrentSet(nextSet);
        setRepsDoneInSet(0);
        say(exerciseTTSScenarios.common.next_set_preparation(nextSet));
        setExercisePhase('mediapipe_preparing');
    };
    
    if (loading) { 
        return <Container className="text-center py-5 vh-100 d-flex flex-column justify-content-center align-items-center"><Spinner animation="border" /><p className="mt-3">운동 정보 로딩 중...</p></Container>;
    }
    
    if (!exerciseDetails) { 
        return <Container className="text-center py-5 vh-100 d-flex flex-column justify-content-center align-items-center"><Alert variant="warning">운동 정보를 불러올 수 없습니다. URL을 확인해주세요.</Alert><Button onClick={()=>navigate('/')}>홈으로</Button></Container>;
    }

    return (
        <Container fluid className="exercise-detail-page py-3 d-flex flex-column" style={{minHeight: 'calc(100vh - 56px)'}}> 
            <Row>
                <Col>
                    <Breadcrumb>
                        <Breadcrumb.Item onClick={() => navigate('/')}>홈</Breadcrumb.Item>
                        <Breadcrumb.Item onClick={() => navigate(user ? `/my-program/${user.username}` : '/')}>나의 재활</Breadcrumb.Item>
                        <Breadcrumb.Item active>{exerciseDetails.name}</Breadcrumb.Item>
                    </Breadcrumb>
                    <h1 className="exercise-main-title mb-3 text-center">{exerciseDetails.name}</h1>
                    {error && <Alert variant="danger" className="feedback-alert text-center py-2 mb-3">{error}</Alert>}
                    {feedbackMessage && !error && <Alert variant={"info"} className="feedback-alert text-center py-2 mb-3">{feedbackMessage}</Alert>}
                </Col>
            </Row>

            {_exercisePhase === 'intensitySelection' && (
                 <Row className="justify-content-center align-items-center flex-grow-1">
                    <Col md={8} lg={6}>
                        <Card className="shadow-sm text-center">
                            <Card.Header as="h5" className="bg-light py-3">운동 강도 선택</Card.Header>
                            <Card.Body className="p-4">
                                <p className="lead mb-4">진행하실 운동의 강도를 선택해주세요.</p>
                                <div className="d-grid gap-3">
                                    {['low', 'medium', 'high'].map(level => (
                                        <Button key={level} variant="primary" onClick={() => handleIntensitySelection(level)} size="lg">
                                            {level === 'low' ? '쉬움 😊' : level === 'medium' ? '보통 🙂' : '어려움 😬'}
                                        </Button>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {_exercisePhase !== 'intensitySelection' && (
                <>
                    <Row className="mb-3 video-webcam-row flex-grow-1"> 
                        <Col md={6} className="mb-3 mb-md-0 d-flex flex-column">
                            <Card className="h-100 shadow-sm">
                                <Card.Header as="h5" className="text-center bg-light">데모 영상</Card.Header>
                                <Card.Body className="p-2 d-flex justify-content-center align-items-center">
                                    <video ref={demoVideoRef} src={exerciseDetails.local_video_src} controls playsInline className="exercise-video mw-100 mh-100" />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} className="d-flex flex-column">
                            <Card className="h-100 shadow-sm">
                                <Card.Header as="h5" className="text-center bg-light">실시간 웹캠</Card.Header>
                                <Card.Body className="p-0 d-flex flex-column position-relative bg-dark">
                                    {_exercisePhase === 'preparation' && !isWebcamActive && (
                                        <div className="text-center p-3 d-flex flex-column justify-content-center align-items-center h-100">
                                            <p className="mb-0 text-white">운동 시작 버튼을 누르면 웹캠이 여기에 표시됩니다.</p>
                                            <i className="bi bi-camera-video" style={{fontSize: '3rem', color: '#6c757d'}}></i>
                                        </div>
                                    )}
                                    {isWebcamActive && !webcamStreamReady && _exercisePhase !== 'preparation' && (
                                         <div className="text-center p-3 d-flex flex-column justify-content-center align-items-center h-100">
                                            <Spinner animation="border" variant="light" className="mb-2"/> <p className="mb-0 text-white">웹캠 로딩 중...</p>
                                        </div>
                                    )}
                                    <div className="webcam-container w-100" style={{ 
                                        visibility: isWebcamActive && webcamStreamReady ? 'visible' : 'hidden', 
                                        flexGrow: 1, 
                                        position: 'relative' 
                                    }}>
                                        <video ref={webcamRef} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} autoPlay playsInline muted />
                                        <canvas ref={canvasRef} className="webcam-overlay position-absolute top-0 start-0" />
                                    </div>
                                    {isWebcamActive && isPoseReady && webcamStreamReady && (
                                        <div className="angle-display p-1 bg-dark text-white w-100" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                                            <Row className="g-1"> 
                                                <Col xs={6}>
                                                    <div>좌측 무릎: {leftKneeAngleDisplay}</div>
                                                    <div>좌측 어깨: {leftShoulderAngleDisplay}</div>
                                                    <div>좌측 팔꿈치: {leftElbowAngleDisplay}</div>
                                                    <div>좌측 손목: {leftWristAngleDisplay}</div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div>우측 무릎: {rightKneeAngleDisplay}</div>
                                                    <div>우측 어깨: {rightShoulderAngleDisplay}</div>
                                                    <div>우측 팔꿈치: {rightElbowAngleDisplay}</div>
                                                    <div>우측 손목: {rightWristAngleDisplay}</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    
                    <Row className="mb-3"> 
                        <Col md={6} className="mb-3 mb-md-0">
                            <Card className="shadow-sm">
                                <Card.Header as="h5" className="bg-light">운동 주의사항</Card.Header>
                                <ListGroup variant="flush">
                                    {exerciseDetails.instructions?.map((step, index) => (
                                        <ListGroup.Item key={index} className="d-flex"><Badge bg="secondary" pill className="me-2 mt-1 align-self-start">{index + 1}</Badge><span>{step}</span></ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Card>
                        </Col>
                        <Col md={6}>
                           {(_exercisePhase === 'mediapipe_preparing' || _exercisePhase === 'exercising' || _exercisePhase === 'resting' || _exercisePhase === 'finished') && (
                                <Card className="shadow-sm text-center h-100">
                                    <Card.Header as="h5" className="bg-light py-3">
                                        {_exercisePhase === 'mediapipe_preparing' ? '자세 분석 준비 중...' : 
                                         _exercisePhase === 'exercising' ? (exerciseDetails.type === 'stretch' ? (isHoldingStretch ? '스트레칭 유지 중 💪' : '스트레칭 자세를 취해주세요...') : '운동 진행 중 🏃') : 
                                         _exercisePhase === 'resting' ? '휴식 시간 🧘' : '운동 완료!'}
                                    </Card.Header>
                                    <Card.Body className="p-4 d-flex flex-column justify-content-center">
                                        {_exercisePhase === 'mediapipe_preparing' && (<><Spinner animation="border" className="mb-3 mx-auto"/><p className="mb-0">카메라를 보며 자세를 잡아주세요.<br/>{uiTimer > 0 ? `약 ${uiTimer}초 후 시작합니다.` : "잠시 후 시작합니다."}</p></>)}
                                        
                                        {_exercisePhase === 'exercising' && exerciseDetails.type === 'stretch' && (
                                            <>
                                                <h4>세트: {currentSet} / {totalSetsGoal}</h4>
                                                <h5>{isHoldingStretch ? `남은 유지 시간: ${holdTimer} 초` : "자세를 잡아주세요."}</h5>
                                                {isHoldingStretch && <ProgressBar 
                                                    variant="success" 
                                                    now={exerciseDetails.intensity_settings[selectedIntensity].holdDuration > 0 ? ((exerciseDetails.intensity_settings[selectedIntensity].holdDuration - holdTimer) / exerciseDetails.intensity_settings[selectedIntensity].holdDuration) * 100 : 0} 
                                                    className="my-3" style={{ height: "25px" }} 
                                                    label={`${holdTimer}초`} />}
                                            </>
                                        )}

                                        {_exercisePhase === 'exercising' && exerciseDetails.type !== 'stretch' && (
                                            <>
                                                <h4>세트: {currentSet} / {totalSetsGoal}</h4>
                                                <h5>반복: {repsDoneInSet} / {totalRepsGoal}</h5>
                                                <ProgressBar animated variant="success" now={totalRepsGoal > 0 ? (repsDoneInSet / totalRepsGoal) * 100 : 0} className="my-3" style={{ height: "25px" }} label={`${Math.round(totalRepsGoal > 0 ? (repsDoneInSet / totalRepsGoal) * 100 : 0)}%`} />
                                            </>
                                        )}

                                        {_exercisePhase === 'resting' && (<><h4 className="mb-3">{uiTimer > 0 ? `${uiTimer}초 남음` : "휴식 완료!"}</h4><ProgressBar variant="info" now={restTimeGoal > 0 ? (uiTimer / restTimeGoal) * 100 : 0} className="my-3" style={{ height: "25px" }} /><Button variant="outline-secondary" size="sm" onClick={handleSkipRest}>휴식 건너뛰기</Button></>)}
                                        
                                        {_exercisePhase === 'finished' && (
                                            <div className='p-3'>
                                                <i className="bi bi-check-circle-fill text-success" style={{fontSize: '3rem'}}></i>
                                                <h4 className='mt-3'>수고하셨습니다!</h4>
                                                <p>모든 운동을 성공적으로 완료했습니다.</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                           )}
                        </Col>
                    </Row>

                    <Row className="justify-content-center mt-3">
                        <Col md={8} lg={6}>
                            {_exercisePhase === 'preparation' && (
                                <div className="d-grid">
                                    <Button onClick={startExercise} variant="success" size="lg" className="px-5 py-3" disabled={!isPoseReady}><i className="bi bi-play-circle-fill me-2"></i>운동 시작</Button>
                                </div>
                            )}
                            {(_exercisePhase !== 'intensitySelection' && _exercisePhase !== 'preparation' && _exercisePhase !== 'finished') && (
                                <Button onClick={() => cleanupAndNavigate('/')} variant="danger" size="lg" className="w-100 py-3"><i className="bi bi-stop-circle-fill me-2"></i>운동 중단</Button>
                            )}
                            {_exercisePhase === 'finished' && (
                                <div className="d-grid gap-2">
                                    <Button onClick={handleSaveResults} variant="primary" size="lg" className="py-3"><i className="bi bi-check2-circle me-2"></i>결과 저장</Button>
                                    <Button onClick={() => cleanupAndNavigate(user ? `/my-program/${user.username}` : '/')} variant="outline-secondary" size="lg" className="py-3">프로그램 목록으로</Button>
                                </div>
                            )}
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default ExerciseDetailPage;