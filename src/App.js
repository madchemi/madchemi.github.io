import React from 'react';
import './App.css';
import {Nav, Navbar, Row, Col, Card, Button, Form, NavDropdown, Container} from 'react-bootstrap';
import bg from './img/bg.png'
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import data from './data.js';
import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';


import Detail from './routes/Detail';
import Cart from './routes/Cart';
import Video from './routes/Video.js';
import FormTextExample from './routes/LoginTest.js';
import Survey from './routes/Form.js';
import Login from './routes/Login.js';
import RehabService from './routes/LoginTest.js';
import Preliminary from './routes/Preliminary.js';
import { Teraphy } from './routes/Teraphy.js';
import VideoCall from './routes/VideoCall.js';

import { HiArrowRight } from "react-icons/hi2";
function App() {

  useEffect(()=>{
    localStorage.setItem('watched', JSON.stringify([]))
    updateVisibleCards(); // 초기 실행 시 카드 개수 감지
    window.addEventListener('resize', updateVisibleCards); // 화면 크기 변경 감지
    return () => window.removeEventListener('resize', updateVisibleCards);
  },[])

  let [plan, setPlan] = useState(data);
  let [num, setNum] = useState(2);
  let [modalOpen, setModalOpen] = useState(false);
  let navigate = useNavigate();
  let location = useLocation();

  let slides = [
    { id: 0, title: '자가 재활 프로그램', text:(<>AI 맞춤 피드백으로 스스로 관리하는 스마트 재활! <br/> 개인별 운동 데이터 분석으로 효과적인 회복을 경험하세요.</>), img: '/재활.png' },
    { id: 1, title: '자가 재활 콘텐츠', text: (<>지루한 재활은 그만! 게임처럼 즐기는 재미있는 재활 치료 <br/> 몰입감 있는 콘텐츠로 운동 지속력을 높여보세요~</>), img: '/게임.png' },
    { id: 2, title: '1대1', text: (<>지루한 재활은 그만! 게임처럼 즐기는 재미있는 재활 치료 <br/> 몰입감 있는 콘텐츠로 운동 지속력을 높여보세요~</>), img: '/1대1.png' },
  ];

  let [slideIndex, setSlideIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);
  const sliderRef = useRef(null);

  // **현재 화면 크기에 따라 한 번에 보이는 카드 수 계산**
  const updateVisibleCards = () => {
    if (!sliderRef.current) return;
    const sliderWidth = sliderRef.current.offsetWidth; // 슬라이드 컨테이너 너비
    const cardWidth = sliderRef.current.children[0]?.offsetWidth || sliderWidth; // 개별 카드 너비
    const newVisibleCards = Math.floor(sliderWidth / cardWidth); // 몇 개 보이는지 계산
    setVisibleCards(newVisibleCards);
  };

  function next(){
    if(slideIndex < slides.length - visibleCards -1){
      setSlideIndex(prev => prev + 1)
    }
    else{
      setSlideIndex(0);
    }
    
  }
  return (
    <div className="App">
      <div className='header'>
        <Navbar collapseOnSelect expand="lg">
            <Navbar.Brand>Aible</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto" >
                <Nav.Link className={location.pathname === "/" ? "active" : ""} onClick={()=>{ navigate('/') }}>프로그램</Nav.Link>
                <Nav.Link className={location.pathname.startsWith("/detail") ? "active" : ""} onClick={()=>{ navigate('/detail/0') }}>나의 운동</Nav.Link>
                <Nav.Link className={location.pathname === "/video" ? "active" : ""} onClick={()=>{ navigate('/video') }}>운동 분석</Nav.Link>
                <Nav.Link className={location.pathname === "/teraphy" ? "active" : ""} onClick={()=>{ navigate('/teraphy') }}>치료사 추천</Nav.Link>
                <NavDropdown title="카테고리">
                  <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">
                    Another action
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action5">
                    Something else here
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
              
              <Nav className="d-flex flex-column flex-lg-row" style={{gap:'10px'}}>
                <Nav.Link onClick={()=>{ navigate('/form') }} className='order-1'>설문 조사</Nav.Link>
                <Nav.Link onClick={()=>{setModalOpen(true)}} className='order-2 me-4'>로그인</Nav.Link>
                <Form className="d-flex order-3 order-lg-0 mt-3 mt-lg-0">
                  <Form.Control 
                    type="search"
                    placeholder="운동 분석, 맞춤 커리큘럼 찾기"
                    className="me-2 search"
                    aria-label="Search"
                  />
                  <Button variant="outline-success" type="submit">Search</Button>
                </Form>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
      </div>
          
      <div className='content'>
      {modalOpen && <Login isOpen={modalOpen} onClose={() => setModalOpen(false)} />} 
      <Suspense fallback={<div>로딩중</div>}>
        <Routes>
        <Route path='/' element={
          <>
            <div className='alert-bar'>
              <p>알림바</p>
            </div>
            <div className='slide inner'>
              <div className='slide-track' ref={sliderRef}>
              {slides.map((slide) => (
                <div className='slide-card' style={{ flex: `0 0 ${100 / 2}%`,transform: `translateX(${slideIndex * -101.5}%)`}}>
                  <Card className="text-white main-card" >
                    <Card.Img src={slide.img} alt="Card image" />
                    <Card.ImgOverlay>
                      <Card.Title>{slide.title}</Card.Title>
                      <Card.Text>{slide.text}</Card.Text>
                      <Button variant="outline-light"  onClick={()=>{ navigate('/detail/'+ slide.id) }}>구독하기</Button>
                    </Card.ImgOverlay>
                  </Card>
                </div>
              ))}
              </div>
              <Card className="text-white next">
                <button className='arrow-bt' onClick={()=>{next()}}><HiArrowRight size={'1.6rem'}/></button>
              </Card>
            </div>
            <div className='inner'> 
            <h1 style={{fontSize: 'x-large',textAlign:'left', margin:'50px 10px'}}>추천 커리큘럼</h1>
            <div style={{display:'flex', justifyContent:'center', margin:'30px 0'}} >
                <Row style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', width:'100%', height:'auto'}}>
                { plan.map(function (a){
                    return( <CardList plan={a}/> )
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
                <tr>
                  <td>공지사항</td>
                  <td><b>개인정보 처리방침</b></td>
                  <td>사업차 정보 확인</td>
                </tr>
                <tr>
                  <td>전체 카테고리</td>
                  <td>이용약관</td>
                  <td>제휴 및 대외협력</td>
                </tr>
                <tr>
                  <td>자주 묻는 질문</td>
                  <td>기프트카드 및 캐시 이용약관</td>
                  <td>채용</td>
                </tr>
                <tr>
                  <td>지원 기기 및 이용환경</td>
                  <td>환불 정책</td>
                </tr>
              </table>
            </div>
          </>
        }/>
        <Route path='/detail/:id' element={<Detail plan={plan}/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/video' element={<Video/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/form' element={<Survey/>} />
        <Route path='/example' element={<RehabService/>} />
        <Route path='/teraphy' element={<Teraphy/>} />
        <Route path='/preliminary' element={<Preliminary/>} />
        <Route path='/videocall' element={<VideoCall/>} />
        <Route path='*' element={<div>없는 페이지입니다</div>}/>
      </Routes>
      </Suspense>
      </div>
    </div>
      
  );
}
function Slide(){
  return(
    <Card className="bg-dark text-white main-card">
      <Card.Img src="/게임.png" alt="Card image" />
      <Card.ImgOverlay>
        <Card.Title>자가 재활 콘텐츠</Card.Title>
        <Card.Text>
          지루한 재활은 그만! 게임처럼 즐기는 재미있는 재활 치료 <br/>
          몰입감 있는 콘텐츠로 운동 지속력을 높여보세요
        </Card.Text>
        <Button variant='outline-light'>구독하기</Button>
      </Card.ImgOverlay>
    </Card>
  )
}
function CardList(props){
  let navigate = useNavigate();

  return(
    <Col className='curriculum'>
      <Card className='mb-2' > 
      <Card.Body style={{display: 'block', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Card.Title style={{fontWeight:'bold'}}># {props.plan.title} <a className='mint'>{props.plan.extra}</a></Card.Title>
        <Card.Img src='/cardImg.png'/>
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
