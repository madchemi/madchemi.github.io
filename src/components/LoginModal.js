// src/components/LoginModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { COLORS } from '../constants'; // 경로 수정

export default function LoginModal({ show, handleClose, handleActualLogin }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{color: COLORS.secondary, fontWeight: 500}}>로그인</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <p style={{color: COLORS.text_medium, fontSize: '0.95rem'}}>AiBLE 맞춤형 재활 서비스를 이용하려면 로그인이 필요합니다.</p>
        <Button 
            variant="primary" 
            onClick={handleActualLogin} 
            className="w-100 mt-3 py-2"
            style={{backgroundColor: COLORS.primary, borderColor: COLORS.primary, fontWeight: 500}}
        >
            게스트로 시작하기 (익명 로그인)
        </Button>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0">
        <p style={{fontSize: '0.8rem', color: COLORS.text_light}}>
            계정이 없으신가요? 게스트 로그인은 별도 가입 없이 이용 가능합니다.
        </p>
      </Modal.Footer>
    </Modal>
  );
}
