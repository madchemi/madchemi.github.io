import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Tabs, Tab, ProgressBar, Button, Alert, ListGroup } from 'react-bootstrap';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import './HealthAnalysisPage.css'; // 커스텀 CSS 파일
import humanBodySilhouette from '../../src/img/human_body_silhouette.png'; // 이미지 경로 확인 필요

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ExerciseDetailPage.js의 allExercisesData 내용을 HealthAnalysisPage.js로 직접 이동
const allExercisesDataFromDetailPage = {
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


const getMockAnalysisData = (userId) => {
  // allExercisesDataFromDetailPage를 HealthAnalysisPage가 사용하는 형식으로 변환
  const transformedRecommendedExercises = Object.values(allExercisesDataFromDetailPage).map(exDetail => {
    const defaultIntensity = 'medium'; // 기본 강도로 'medium' 사용 또는 다른 로직으로 선택
    const intensitySettings = exDetail.intensity_settings?.[defaultIntensity] || 
                              exDetail.intensity_settings?.low || 
                              { sets: 'N/A', reps: 'N/A', rest: 'N/A', holdDuration: 'N/A' };
    
    let durationOrRepsDetail;
    if (exDetail.type === 'stretch' && intensitySettings.holdDuration) {
      durationOrRepsDetail = `${intensitySettings.holdDuration}초 유지`;
    } else if (intensitySettings.reps) {
      durationOrRepsDetail = `${intensitySettings.reps}회 반복`;
    } else {
      durationOrRepsDetail = '정보 없음';
    }

    return {
      id: exDetail.id,
      name: exDetail.name,
      description: exDetail.instructions?.join('\n') || '운동에 대한 상세 설명이 없습니다.',
      target_areas: exDetail.target_areas || ['주요 운동 부위 정보 없음'], 
      equipment: exDetail.equipment || ['필요 장비 정보 없음'],
      min_functional_level: exDetail.min_functional_level || '정보 없음',
      online_suitability: exDetail.online_suitability || '정보 없음',
      image: exDetail.image || '/img/default_exercise.png',
      duration_per_set: durationOrRepsDetail,
      sets: `${intensitySettings.sets} 세트`
    };
  });

  // 사용자 요청에 따라 제공된 baseRecommendations 구조 사용
  const baseRecommendations = {
    recommended_exercises: transformedRecommendedExercises, // 여기서 교체됩니다!
    precautions_and_notes: [
      "운동 중 통증이 발생하면 즉시 중단하고 전문가와 상담하세요.",
      "모든 운동은 정확한 자세로 천천히 수행하는 것이 중요합니다.",
      "고령자의 경우 낙상에 주의하며 안전한 환경에서 운동하세요."
    ],
    consultation_required: userId === 'user_needs_consult',
    fitt_guidelines: [
      "**운동 빈도:** 주 3-5회",
      "**운동 강도:** 약간 힘들다고 느껴지는 정도 (대화 가능 수준)",
      "**운동 시간:** 한 번에 20-30분 (준비운동 및 마무리운동 포함)",
      "**운동 종류:** 추천된 근력 및 유연성 운동을 중심으로 구성"
    ]
  };

  return {
    userId: userId,
    userName: userId, 
    analysisDate: new Date().toLocaleDateString(),
    romData: [ 
      { name: '오른쪽 어깨 (굴곡)', current: 150, max: 180, idealMin: 170, idealMax: 180, unit: '도' },
      { name: '왼쪽 어깨 (굴곡)', current: 165, max: 180, idealMin: 170, idealMax: 180, unit: '도' },
      { name: '오른쪽 무릎 (굴곡)', current: 120, max: 140, idealMin: 130, idealMax: 140, unit: '도' },
      { name: '왼쪽 무릎 (굴곡)', current: 130, max: 140, idealMin: 130, idealMax: 140, unit: '도' },
    ],
    bodyBalanceData: { 
      labels: ['상체 근력', '하체 근력', '코어 안정성', '유연성', '좌우 균형', '전후방 균형'],
      datasets: [
        {
          label: '나의 현재 상태',
          data: [65, 70, 60, 55, 75, 65],
          backgroundColor: 'rgba(255, 160, 63, 0.3)', 
          borderColor: 'rgba(255, 160, 63, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 160, 63, 1)',
        },
        {
          label: '권장 목표치',
          data: [80, 80, 75, 70, 85, 80],
          backgroundColor: 'rgba(53, 208, 186, 0.3)', 
          borderColor: 'rgb(53, 208, 186)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(53, 208, 186)',
        },
      ],
    },
    highlightedBodyParts: [ 
      { part: 'right_shoulder', status: '주의' }, 
      { part: 'left_knee', status: '양호' },    
    ],
    ...baseRecommendations,
  };
};
// --- End of Mock Data Section ---

function HealthAnalysisPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = getMockAnalysisData(userId);
      setAnalysisData(data);
      setLoading(false);
    }, 1000);
  }, [userId]);

  if (loading) {
    return <div className="loading-container"><div className="loader"></div><p>분석 결과를 불러오는 중입니다...</p></div>;
  }

  if (!analysisData) {
    return <Container className="text-center py-5"><Alert variant="danger">분석 데이터를 불러오지 못했습니다.</Alert></Container>;
  }

  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
        suggestedMin: 0,
        suggestedMax: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: { font: { size: 13 }, color: '#333' },
        ticks: { backdropColor: 'transparent', color: '#555', stepSize: 20 }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#333', font: { size: 13 } }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.r !== null) {
              label += context.parsed.r;
            }
            return label;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  const getBodyPartStyle = (partName) => {
    const partData = analysisData.highlightedBodyParts?.find(p => p.part === partName);
    if (partData) {
      if (partData.status === '주의') return { fill: 'rgba(255, 160, 63, 0.7)', stroke: 'rgba(255, 160, 63, 1)', strokeWidth: '2px' };
      if (partData.status === '양호') return { fill: 'rgba(53, 208, 186, 0.6)', stroke: 'rgb(53, 208, 186)', strokeWidth: '1px' };
    }
    return { fill: 'rgba(0, 0, 0, 0.1)' };
  };


  return (
    <Container fluid="lg" className="health-analysis-page py-4">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h1 className="main-title">건강상태 분석 결과</h1>
          <p className="lead text-muted">안녕하세요, <span className="user-name">{analysisData.userName}</span>님! AIBLE이 분석한 회원님의 건강 리포트입니다.</p>
        </Col>
        <Col md={4} className="text-md-end">
          <p className="text-muted small">분석일: {analysisData.analysisDate}</p>
        </Col>
      </Row>

      {analysisData.consultation_required && (
        <Alert variant="warning" className="mb-4 impactful-alert">
          <Alert.Heading><i className="bi bi-exclamation-triangle-fill me-2"></i>전문가 상담 권장</Alert.Heading>
          <p>분석 결과, 운동 시작 전 또는 프로그램 조정과 관련하여 의사 또는 물리치료사와의 상담이 권장됩니다. 자세한 내용은 아래 주의사항을 확인해주세요.</p>
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="analysis-tabs" className="mb-4 custom-tabs">
        <Tab eventKey="overall" title={<><i className="bi bi-clipboard2-data-fill me-1"></i>종합 분석</>} className="tab-content-area">
          <Row>
            <Col md={7} className="mb-4">
              <h4 className="section-title">주요 분석 요약</h4>
              <Card className="p-3 shadow-sm summary-card">
                 <p>이곳에 사용자의 주요 건강 지표 요약 (예: 전반적인 신체 점수, 가장 개선이 필요한 부분) 또는 환영 메시지 등을 추가할 수 있습니다.</p>
                 <p className="mt-3"><strong>추천 운동 프로그램이 준비되었습니다.</strong> 아래 '맞춤 운동 추천' 탭에서 확인하세요.</p>
                 <hr/>
                 <h5 className="mt-3">주요 참고사항</h5>
                 <ListGroup variant="flush">
                    {analysisData.precautions_and_notes?.slice(0, 3).map((note, index) => ( 
                        <ListGroup.Item key={index} className="small">{note.startsWith("🚨") ? <strong>{note}</strong> : note}</ListGroup.Item>
                    ))}
                 </ListGroup>
              </Card>
            </Col>
            <Col md={5} className="mb-4">
              <h4 className="section-title">신체 상태 시각화</h4>
              <Card className="p-3 shadow-sm body-silhouette-card text-center">
                <img src={humanBodySilhouette} alt="인체 실루엣" className="body-image-placeholder" />
                <p className="small text-muted mt-2">표시된 부위는 AI 분석에 따른 관심 영역입니다.</p>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="rom" title={<><i className="bi bi-arrows-angle-expand me-1"></i>관절 가동 범위</>} className="tab-content-area">
          <h4 className="section-title">관절 가동 범위 (ROM) 분석</h4>
          {analysisData.romData?.map((item, index) => (
            <div key={index} className="rom-item mb-3">
              <div className="d-flex justify-content-between">
                <span>{item.name}</span>
                <span>현재: {item.current}{item.unit} / 최대: {item.max}{item.unit}</span>
              </div>
              <ProgressBar className="mt-1 rom-progress-bar">
                <ProgressBar now={(item.current / item.max) * 100} label={`${Math.round((item.current / item.max) * 100)}%`} visuallyHidden />
                {item.idealMin && item.idealMax && (
                  <div className="ideal-range" style={{
                    left: `${(item.idealMin / item.max) * 100}%`,
                    width: `${((item.idealMax - item.idealMin) / item.max) * 100}%`
                  }}></div>
                )}
              </ProgressBar>
               <div className="d-flex justify-content-between text-muted small mt-1">
                <span>0</span>
                {item.idealMin && item.idealMax && <span className="ideal-range-label">권장 범위</span>}
                <span>{item.max}</span>
              </div>
            </div>
          ))}
        </Tab>

        <Tab eventKey="balance" title={<><i className="bi bi-bullseye me-1"></i>신체 밸런스</>} className="tab-content-area">
          <h4 className="section-title">신체 밸런스 분석</h4>
          <Card className="p-3 shadow-sm radar-chart-card">
            <div style={{ height: '400px', width: '100%' }}> 
                <Radar data={analysisData.bodyBalanceData} options={radarOptions} />
            </div>
          </Card>
        </Tab>

        <Tab eventKey="recommendations" title={<><i className="bi bi-person-walking me-1"></i>맞춤 운동 추천</>} className="tab-content-area">
          <h4 className="section-title">회원님을 위한 맞춤 운동 프로그램</h4>
          <Row xs={1} md={2} lg={3} className="g-4">
            {analysisData.recommended_exercises?.map(ex => (
              <Col key={ex.id} className="exercise-card-col">
                <Card className="h-100 shadow-sm exercise-card">
                  {ex.image && <Card.Img variant="top" src={ex.image} alt={ex.name} className="exercise-card-img"/>}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h5" className="exercise-title">{ex.name}</Card.Title>
                    <Card.Text className="small text-muted exercise-desc flex-grow-1" style={{ maxHeight: '100px', overflowY: 'auto' }}>{ex.description}</Card.Text>
                    <ListGroup variant="flush" className="my-2 small">
                        <ListGroup.Item><strong>타겟 부위:</strong> {ex.target_areas.join(', ')}</ListGroup.Item>
                        <ListGroup.Item><strong>필요 장비:</strong> {ex.equipment.join(', ') || '없음'}</ListGroup.Item>
                        <ListGroup.Item><strong>수행:</strong> {ex.duration_per_set}, {ex.sets}</ListGroup.Item>
                    </ListGroup>
                    <Button variant="primary" className="mt-auto w-100 exercise-action-btn" onClick={() => navigate(`/exercise/${ex.id}`)}> 
                      운동 시작하기 <i className="bi bi-play-circle-fill ms-1"></i>
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {(!analysisData.recommended_exercises || analysisData.recommended_exercises.length === 0) && (
            <Alert variant="info">현재 조건에 맞는 추천 운동이 없습니다. 실제로는 백엔드 분석 결과가 여기에 표시됩니다.</Alert>
          )}

          {analysisData.fitt_guidelines && analysisData.fitt_guidelines.length > 0 && (
            <Card className="mt-4 p-3 shadow-sm guidelines-card">
              <Card.Header as="h5">FITT 운동 가이드라인</Card.Header>
              <ListGroup variant="flush">
                {analysisData.fitt_guidelines.map((guideline, index) => (
                  <ListGroup.Item key={index} dangerouslySetInnerHTML={{ __html: guideline.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {analysisData.precautions_and_notes && analysisData.precautions_and_notes.length > 0 && (
            <Card className="mt-4 p-3 shadow-sm precautions-card">
              <Card.Header as="h5" className="text-danger"><i className="bi bi-shield-fill-exclamation me-2"></i>주의사항 및 참고사항</Card.Header>
              <ListGroup variant="flush">
                {analysisData.precautions_and_notes.map((note, index) => (
                  <ListGroup.Item key={index} className={note.startsWith("🚨") ? 'fw-bold text-danger' : ''}>
                    {note.startsWith("🚨") ? note : <><i className="bi bi-info-circle-fill me-2 text-primary"></i>{note}</>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Tab>
      </Tabs>
      <div className="text-center mt-4">
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
            <i className="bi bi-house-door-fill me-1"></i> 홈으로 돌아가기
        </Button>
      </div>
    </Container>
  );
}

export default HealthAnalysisPage;