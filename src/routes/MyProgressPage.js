// src/routes/MyProgressPage.js
import React from 'react';
import { Container, Alert, ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import './MyProgressPage.css'; // CSS 파일 임포트

function MyProgressPage() {
  const { userId } = useParams();

  // TODO: userId를 기반으로 사용자의 재활 진행 상태 데이터를 불러오는 로직 추가

  return (
    <Container className="my-progress-page py-4">
      <h1 className="main-title mb-4">재활 진행 상태</h1>
      {userId && <p className="lead text-muted mb-4">{userId}님의 재활 회복 여정입니다.</p>}
      
      <Alert variant="info">
        현재 개발 중인 페이지입니다. 곧 재활 진행 상태를 그래프 등으로 확인하실 수 있습니다.
      </Alert>

      {/* 예시: 진행도 표시 */}
      {/*
      <div className="mt-4">
        <h5>관절 가동범위 회복률</h5>
        <ProgressBar now={75} label="75%" variant="success" animated />
        <h5 className="mt-3">근력 회복률</h5>
        <ProgressBar now={60} label="60%" variant="info" animated />
      </div>
      */}
    </Container>
  );
}

export default MyProgressPage;
