// src/routes/MyRehabProgramPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Spinner } from 'react-bootstrap';
import './MyRehabProgramPage.css';
import { API_BASE_URL } from '../constants';
import { useAuth } from '../AuthContext';

// ▼▼▼ [수정] '벽 미끄러지기'를 '손목 폄근 스트레칭'으로 변경 ▼▼▼
const demoExercises = [
  {
    id: 'demo-wrist-stretch',
    name: '손목 폄근 스트레칭 (Wrist Extensor Stretch)',
    description: '팔꿈치 바깥쪽과 아래팔 근육의 긴장을 풀어주는 스트레칭입니다. 컴퓨터 사용이 잦거나 팔꿈치에 가벼운 통증이 있을 때 도움이 됩니다.',
    target_areas: ['아래팔', '손목', '팔꿈치 바깥쪽'],
    equipment: ['없음'],
    duration_per_set: '15-30초 유지',
    sets: '2-3 세트',
    image: '/img/demo_wrist_stretch.png'
  },
  {
    id: 'demo-triceps-stretch',
    name: '삼두근 스트레칭 (Triceps Stretch)',
    description: '팔 뒤쪽 근육인 삼두근의 유연성을 높여주는 스트레칭입니다. 어깨 통증 완화에도 도움이 됩니다.',
    target_areas: ['팔 뒤쪽 (삼두근)', '어깨'],
    equipment: ['없음'],
    duration_per_set: '15-30초 유지',
    sets: '2-3회 반복 (각 팔)',
    image: '/img/demo_triceps_stretch.png'
  },
  {
    id: 'demo-calf-stretch',
    name: '종아리 스트레칭 (Calf Stretch)',
    description: '종아리 근육의 유연성을 향상시키고 긴장을 완화하는 스트레칭입니다. 벽이나 의자를 지지하고 수행할 수 있습니다.',
    target_areas: ['종아리 (비복근, 가자미근)'],
    equipment: ['벽 또는 의자 (선택 사항)'],
    duration_per_set: '15-30초 유지',
    sets: '2-3회 반복 (각 다리)',
    image: '/img/demo_calf_stretch.png'
  }
];
// ▲▲▲ [수정] '벽 미끄러지기'를 '손목 폄근 스트레칭'으로 변경 ▲▲▲

function MyRehabProgramPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      if (!userId) {
        setError("사용자 ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }
      if (user && user.username !== userId) {
        setError("접근 권한이 없습니다. 요청한 사용자의 프로그램이 아닙니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError("인증 토큰이 없습니다. 로그인이 필요합니다.");
          setLoading(false);
          navigate('/'); 
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/survey/analysis/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `서버 오류 (상태 코드: ${response.status}) 또는 응답 파싱 실패` }));
          throw new Error(errorData.detail || `데이터를 불러오는데 실패했습니다. (상태 코드: ${response.status})`);
        }

        const data = await response.json();
        setProgramData(data);
      } catch (err) {
        console.error("재활 프로그램 데이터 로딩 실패:", err);
        setError(err.message || "데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.");
        setProgramData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
  }, [userId, navigate, user]);

  if (loading) {
    return (
      <Container className="text-center py-5 loading-container">
        <Spinner animation="border" variant="primary" className="loader-rehab" />
        <p className="mt-3">나의 맞춤 재활 프로그램을 불러오는 중입니다...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="text-center py-5"><Alert variant="danger">오류: {error}</Alert></Container>;
  }

  if (!programData) {
    return <Container className="text-center py-5"><Alert variant="info">표시할 재활 프로그램 데이터가 없습니다.</Alert></Container>;
  }

  const { 
    recommended_exercises, 
    fitt_guidelines, 
    precautions_and_notes,
    consultation_required, 
    userName, 
    analysisDate 
  } = programData;

  const exercisesToDisplay = (recommended_exercises && recommended_exercises.length > 0) 
    ? recommended_exercises 
    : demoExercises;

  return (
    <Container fluid="lg" className="my-rehab-program-page py-4">
      <Row className="mb-4 align-items-center page-header-row">
        <Col>
          <h1 className="main-title">나의 맞춤 재활 프로그램</h1>
          <p className="lead text-muted">안녕하세요, <span className="user-name">{userName || userId}</span>님! AIBLE이 회원님을 위해 준비한 운동 프로그램입니다.</p>
        </Col>
        <Col md="auto" className="text-md-end">
            <p className="text-muted small">기준일: {analysisDate || new Date().toLocaleDateString()}</p>
        </Col>
      </Row>

      {consultation_required && (
        <Alert variant="warning" className="mb-4 impactful-alert">
          <Alert.Heading><i className="bi bi-exclamation-triangle-fill me-2"></i>전문가 상담 권장</Alert.Heading>
          <p>분석 결과, 운동 시작 전 또는 프로그램 조정과 관련하여 의사 또는 물리치료사와의 상담이 권장됩니다. 자세한 내용은 아래 주의사항을 확인해주세요.</p>
        </Alert>
      )}

      <div className="program-section mb-5">
        <h4 className="section-title">회원님을 위한 맞춤 운동 프로그램</h4>
        <Row xs={1} md={2} lg={3} className="g-4">
          {exercisesToDisplay && exercisesToDisplay.length > 0 ? exercisesToDisplay.map((ex, index) => (
            <Col key={ex.id || `ex-${index}`} className="exercise-card-col">
              <Card className="h-100 shadow-sm exercise-card">
                {ex.image && <Card.Img variant="top" src={ex.image.startsWith('http') ? ex.image : `${process.env.PUBLIC_URL}${ex.image}`} alt={ex.name} className="exercise-card-img"/>}
                <Card.Body className="d-flex flex-column">
                  <Card.Title as="h5" className="exercise-title">{ex.name}</Card.Title>
                  <Card.Text className="small text-muted exercise-desc flex-grow-1">{ex.description}</Card.Text>
                  <ListGroup variant="flush" className="my-2 small">
                    <ListGroup.Item><strong>타겟 부위:</strong> {ex.target_areas?.join(', ')}</ListGroup.Item>
                    <ListGroup.Item><strong>필요 장비:</strong> {ex.equipment?.join(', ') || '없음'}</ListGroup.Item>
                    <ListGroup.Item><strong>수행:</strong> {ex.duration_per_set || '정보 없음'}, {ex.sets || '정보 없음'}</ListGroup.Item>
                  </ListGroup>
                  <Button 
                    variant="primary" 
                    className="mt-auto w-100 exercise-action-btn" 
                    onClick={() => navigate(`/exercise-detail/${ex.id || index}`)}
                  >
                    운동 시작하기 <i className="bi bi-play-circle-fill ms-1"></i>
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )) : (
             <Col><Alert variant="light" className="text-center p-4">추천 드릴 운동 프로그램이 준비 중입니다. 곧 만나보실 수 있습니다.</Alert></Col>
          )}
        </Row>
      </div>

      {fitt_guidelines && fitt_guidelines.length > 0 && (
        <div className="program-section mb-5">
          <h4 className="section-title">FITT 운동 가이드라인</h4>
          <Card className="p-3 shadow-sm guidelines-card">
            <ListGroup variant="flush">
              {fitt_guidelines.map((guideline, index) => (
                <ListGroup.Item key={`fitt-${index}`} dangerouslySetInnerHTML={{ __html: guideline.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </div>
      )}

      {precautions_and_notes && precautions_and_notes.length > 0 && (
          <div className="program-section">
            <h4 className="section-title text-danger">주의사항 및 참고사항</h4>
            <Card className="p-3 shadow-sm precautions-card">
              <ListGroup variant="flush">
                {precautions_and_notes.map((note, index) => (
                  <ListGroup.Item key={`prec-myprogram-${index}`} className={note.startsWith("🚨") ? 'fw-bold text-danger' : ''}>
                    {note.startsWith("🚨") ? note : <><i className="bi bi-info-circle-fill me-2 text-primary"></i>{note}</>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </div>
        )}

      <div className="text-center mt-5">
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          <i className="bi bi-house-door-fill me-1"></i> 홈으로 돌아가기
        </Button>
      </div>
    </Container>
  );
}

export default MyRehabProgramPage;