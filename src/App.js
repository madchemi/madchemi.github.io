// 캔버스에 작성된 코드 - 복사하여 사용하세요.
// src/App.js

import React from 'react';
import './App.css';
import {Nav, Navbar, Row, Col, Card, Button, Form, NavDropdown, Container} from 'react-bootstrap';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import data from './data.js';
import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';

// 라우트 컴포넌트 import
import Detail from './routes/Detail';
import Cart from './routes/Cart';
import Survey from './routes/Form.js';
import Login from './routes/Login.js';
import RehabService from './routes/LoginTest.js';
import Preliminary from './routes/Preliminary.js';
import { Teraphy } from './routes/Teraphy.js';
import VideoCall from './routes/VideoCall.js';
import HealthAnalysisPage from './routes/HealthAnalysisPage.js';
import VideoROM from './routes/Video.js';
import ExerciseExecutionPage from './routes/ExerciseProgram.js';
import MyRehabProgramPage from './routes/MyRehabProgramPage.js';
import MyExerciseLogPage from './routes/MyExerciseLogPage.js';
import MyProgressPage from './routes/MyProgressPage.js';
import { ExerciseDetailPage } from './routes/ExerciseDetailPage.js';

import { HiArrowRight } from "react-icons/hi2";
import { useAuth } from './AuthContext';

function App() {
  const { user, logout } = useAuth();
  const [plan, setPlan] = useState(data);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const slides = [
    { id: 0, title: '자가 재활 프로그램', text:(<>AI 맞춤 피드백으로 스스로 관리하는 스마트 재활! <br/> 개인별 운동 데이터 분석으로 효과적인 회복을 경험하세요.</>), img: '/reheb.png' },
    { id: 1, title: '자가 재활 콘텐츠', text: (<>지루한 재활은 그만! 게임처럼 즐기는 재미있는 재활 치료 <br/> 몰입감 있는 콘텐츠로 운동 지속력을 높여보세요~</>), img: '/game.png' },
    { id: 2, title: '1대1 맞춤 관리', text: (<>전문 치료사와 함께하는 1:1 맞춤 재활 프로그램으로 <br/> 보다 체계적이고 효과적인 회복을 경험하세요.</>), img: '/onetoone.png' },
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const sliderRef = useRef(null);

  useEffect(()=>{
    if (!localStorage.getItem('watched')) {
      localStorage.setItem('watched', JSON.stringify([]));
    }
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  },[]);

  const updateVisibleCards = () => {
      if (!sliderRef.current || !sliderRef.current.children[0]) return;
      const sliderWidth = sliderRef.current.offsetWidth;
      const cardWidth = sliderRef.current.children[0].offsetWidth;
      if (cardWidth > 0) {
        const newVisibleCards = Math.max(1, Math.floor(sliderWidth / cardWidth));
        setVisibleCards(newVisibleCards);
      }
  };
  
  function nextSlide(){
    if (slides && slides.length > 0 && visibleCards > 0) {
      if(slideIndex < slides.length - visibleCards ){
        setSlideIndex(prev => prev + 1);
      } else {
        setSlideIndex(0);
      }
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    alert('로그아웃 되었습니다.');
  };

  const navigateToUserSpecificPage = (pathWithoutUserId) => {
    if (user && user.username) {
      navigate(`${pathWithoutUserId}/${user.username}`);
    } else {
      alert("로그인이 필요한 서비스입니다.");
      setModalOpen(true);
    }
  };

return (
    <div className="App">
      <div className='header'>
        <Navbar collapseOnSelect expand="lg">
            <Navbar.Brand onClick={() => navigate('/')} style={{cursor:'pointer'}}>Aible</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto" >
                <Nav.Link className={location.pathname === "/" ? "active" : ""} onClick={()=>{ navigate('/') }}>프로그램</Nav.Link>
                <NavDropdown 
                  title="나의 운동" 
                  id="my-exercise-dropdown" 
                  className={
                    location.pathname.startsWith("/analysis") ||
                    location.pathname.startsWith("/my-program") ||
                    location.pathname.startsWith("/my-log") ||
                    location.pathname.startsWith("/my-progress") ||
                    location.pathname.startsWith("/exercise-detail") // 운동 상세 페이지 경로 추가
                    ? "active" : ""
                  }
                >
                  <NavDropdown.Item onClick={() => navigateToUserSpecificPage('/analysis')}>
                    나의 건강상태
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateToUserSpecificPage('/my-program')}>
                    나의 재활 프로그램
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateToUserSpecificPage('/my-log')}>
                    나의 운동 일지
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigateToUserSpecificPage('/my-progress')}>
                    재활 진행 상태
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link className={location.pathname === "/video" ? "active" : ""} onClick={()=>{ navigate('/video') }}>운동 분석</Nav.Link>
                <Nav.Link className={location.pathname === "/teraphy" ? "active" : ""} onClick={()=>{ navigate('/teraphy') }}>치료사 추천</Nav.Link>
                <NavDropdown title="카테고리">
                  <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav className="d-flex flex-column flex-lg-row align-items-center" style={{gap:'10px'}}>
                <Nav.Link onClick={()=>{ navigate('/form') }} className='order-1'>설문 조사</Nav.Link>
                {user ? (
                  <>
                    <Nav.Link disabled className='order-2'>환영합니다, {user.username}님</Nav.Link>
                    <Nav.Link onClick={handleLogout} className='order-2 me-4'>로그아웃</Nav.Link>
                  </>
                ) : (
                  <Nav.Link onClick={()=>{setModalOpen(true)}} className='order-2 me-4'>로그인</Nav.Link>
                )}
                <Form className="d-flex order-3 order-lg-0 mt-3 mt-lg-0">
                  <Form.Control type="search" placeholder="운동 분석, 맞춤 커리큘럼 찾기" className="me-2 search" aria-label="Search" />
                  <Button variant="outline-success" type="submit">Search</Button>
                </Form>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
      </div>

      <div className='content'>
        {!user && modalOpen && <Login isOpen={modalOpen} onClose={() => setModalOpen(false)} />} 
        <Suspense fallback={<div style={{textAlign: 'center', padding: '50px'}}>로딩중...</div>}>        
          <Routes>
            <Route path='/' element={
              <>
                <div className='alert-bar' style={{backgroundColor: '#e9f5ff', padding: '12px 20px', textAlign: 'center', marginBottom: '20px', border: '1px solid #b3d7ff', borderRadius: '4px'}}>
                  <p style={{margin: 0, color: '#004085'}}>🔔 Aible의 새로운 맞춤 운동을 경험해보세요! <Link to="/form" style={{fontWeight:'bold', color: '#004085'}}>지금 설문 참여하기</Link></p>
                </div>
                <div className='slide inner'>
                  <div className='slide-track' ref={sliderRef}>
                  {slides.map((slide) => (
                    <div key={slide.id} className='slide-card' style={{ flex: `0 0 calc(${100 / (visibleCards || 1)}% - 10px)`, transform: `translateX(${slideIndex * (-100 / (visibleCards || 1) - (10 * ((visibleCards || 1) -1) / (visibleCards || 1) ) )}%)`, marginRight: '10px' }}>
                      <Card className="text-white main-card h-100" > 
                        <Card.Img src={process.env.PUBLIC_URL + slide.img} alt={slide.title} style={{height: '100%', objectFit: 'cover'}}/>
                        <Card.ImgOverlay className="d-flex flex-column justify-content-end">
                          <Card.Title>{slide.title}</Card.Title>
                          <Card.Text>{slide.text}</Card.Text>
                          <Button variant="outline-light" onClick={()=>{navigate(slide.id === 0 ? '/preliminary' : `/detail/${slide.id}`) }}>자세히 보기</Button>
                        </Card.ImgOverlay>
                      </Card>
                    </div>
                  ))}
                  </div>
                  {slides.length > visibleCards && (
                    <Card className="text-white next">
                      <button className=' arrow-bt' onClick={()=>{nextSlide()}}><HiArrowRight size={'1.6rem'}/></button>
                    </Card>
                  )}
                </div>
                <div className='inner'> 
                  <h1 style={{fontSize: 'x-large',textAlign:'left', margin:'50px 10px'}}>추천 커리큘럼</h1>
                  <div style={{display:'flex', justifyContent:'center', margin:'30px 0'}} >
                      <Row style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', width:'100%', height:'auto'}}>
                      { plan.map(function (a, i){
                          return( <CardList plan={a} key={i}/> )
                        })}
                      </Row>
                  </div>
                </div>
                <hr style={{width:'90%', margin:'0 auto'}}/>
                <div className='bottom'>
                  <p className='ask'>
                    <b>고객센터</b> <br/>
                    오전 10시 ~ 오후 6시 (주말, 공휴일 제외)<br/>
                    <button>문의하기</button>
                  </p>
                  <table style={{color:'rgba(55,55,55,0.8)'}}>
                    <tbody>
                      <tr><td>공지사항</td><td><b>개인정보 처리방침</b></td><td>사업차 정보 확인</td></tr>
                      <tr><td>전체 카테고리</td><td>이용약관</td><td>제휴 및 대외협력</td></tr>
                      <tr><td>자주 묻는 질문</td><td>기프트카드 및 캐시 이용약관</td><td>채용</td></tr>
                      <tr><td>지원 기기 및 이용환경</td><td>환불 정책</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            }/>
            
            <Route path='/detail/:id' element={<Detail plan={plan}/>} />
            <Route path='/cart' element={<Cart/>} />
            <Route path='/video' element={<VideoROM/>} />
            <Route path='/form' element={<Survey/>} />
            <Route path='/example' element={<RehabService/>} />
            <Route path='/teraphy' element={<Teraphy/>} />
            <Route path='/preliminary' element={<Preliminary/>} />
            <Route path='/videocall' element={<VideoCall/>} />
            <Route path='/analysis/:userId' element={<HealthAnalysisPage />} />
            <Route path='/my-program/:userId' element={<MyRehabProgramPage />} />
            <Route path='/my-log/:userId' element={<MyExerciseLogPage />} />
            <Route path='/my-progress/:userId' element={<MyProgressPage />} />
            
            {/* ▼▼▼ 운동 상세 페이지 라우트 추가 ▼▼▼ */}
            <Route path='/exercise-detail/:exerciseId' element={<ExerciseDetailPage />} />
            {/* ▲▲▲ 운동 상세 페이지 라우트 추가 ▲▲▲ */}

            <Route path='/exercise/:exerciseId' element={<ExerciseExecutionPage />} /> {/* 기존 운동 프로그램 실행 페이지 */}


            <Route path='*' element={<div style={{textAlign: 'center', padding: '50px'}}><h2>404</h2><p>요청하신 페이지를 찾을 수 없습니다.</p><Button variant="primary" onClick={() => navigate('/')}>홈으로 돌아가기</Button></div>}/>
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function CardList(props){
  let navigate = useNavigate();
  return(
    <Col className='curriculum'>
      <Card className='mb-2' > 
      <Card.Body style={{display: 'block', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Card.Title style={{fontWeight:'bold'}}># {props.plan.title} <a className='mint'>{props.plan.extra}</a></Card.Title>
        <Card.Img src={process.env.PUBLIC_URL + '/cardImg.png'}/>
      </Card.Body>
      </Card>
      <div style={{textAlign:'left'}}>
      {props.plan.content}<br/>
      <p className='sub-content'>{props.plan.category} | {props.plan.curriculum}</p>
      </div>
    </Col>
  )
}

export default App;
