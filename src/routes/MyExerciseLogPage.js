// src/routes/MyExerciseLogPage.js
import React from 'react';
import { Container, Alert }
from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import './MyExerciseLogPage.css'; // CSS 파일 임포트

function MyExerciseLogPage() {
  const { userId } = useParams();

  // TODO: userId를 기반으로 사용자의 운동 일지 데이터를 불러오는 로직 추가

  return (
    <Container className="my-exercise-log-page py-4">
      <h1 className="main-title mb-4">나의 운동 일지</h1>
      {userId && <p className="lead text-muted mb-4">{userId}님의 운동 기록입니다.</p>}

      <Alert variant="info">
        현재 개발 중인 페이지입니다. 곧 운동 일지 기능을 사용하실 수 있습니다.
      </Alert>

      {/* 예시: 달력 또는 리스트 형태로 운동 기록 표시 */}
      {/*
      <div>
        <h4>2025년 5월</h4>
        <ul>
          <li>2025-05-25: 어깨 스트레칭 (완료)</li>
          <li>2025-05-24: 무릎 강화 운동 (3세트)</li>
        </ul>
      </div>
      */}
    </Container>
  );
}

export default MyExerciseLogPage;
