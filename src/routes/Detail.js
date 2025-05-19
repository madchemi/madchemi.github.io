import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Nav } from 'react-bootstrap'
import { useDispatch } from "react-redux";
import { addItem } from "../store";
import axios from "axios";
import { useUsername } from "../hooks/username";
import {Card} from 'react-bootstrap';

function Detail({plan}){
  useEffect(()=>{
    let data = JSON.parse(localStorage.getItem('watched'))
    data.push(찾은상품.id)
    data = new Set(data)
    localStorage.setItem('watched', JSON.stringify([...data]))
  },[])
  let [count, setCount] = useState(0);
  let {id} = useParams();
  let dispatch = useDispatch();
  let 찾은상품 = plan.find(x=>x.id == id);


  let username = useUsername()

  switch(id){
    case "0":
      return <DetailA/>;
    default:
      return <div className="detail">아직 구성중..ㅎㅎ</div>
  }

  return(
    <div className="detail">
      <DetailA/>
      {/* <button className="btn btn-danger" onClick={()=>{dispatch(addItem(
        {id : 찾은상품.id, name : 찾은상품.title, count: 1}))}}>주문하기</button> */}
    </div>
    
  )
}
function DetailA(){
  return(
    <div className="detail">
      <h1 style={{fontWeight:'bold'}}>자가 재활 프로그램</h1>
      <h3 style={{margin:'0.7em 0px', fontWeight:'bold'}}>나만을 위한 <span className="orange">맞춤형</span> 재활 운동!</h3>
      <p>AI가 사용자의 운동 데이터를 분석하여 <span className="orange">장애 유형과 재활 목표에 맞춘 맞춤형 커리큘럼</span>을 제공합니다.</p>
      <p>실시간 피드백으로 올바른 자세를 유지하여 효과적인 재활을 경험하세요.</p>
      <div className='slide inner' style={{padding:'0', lineHeight:'2em', justifyContent:'space-between'}}>
        <Card className="bg-dark text-white main-card detail-card">
        <Card.Img src="/detail1.png" alt="Card image" />
        <Card.ImgOverlay>
          <Card.Title>맞춤형 커리큘럼</Card.Title>
          <Card.Text style={{padding:'0'}}>
            AI가 사용자의 운동 데이터와 목표를 분석하여 <br/>
            최적의 재활 운동 계획을 자동 생성
          </Card.Text>
        </Card.ImgOverlay>
      </Card>
      <Card className="bg-dark text-white main-card detail-card ">
        <Card.Img src="/detail2.png" alt="Card image" />
        <Card.ImgOverlay>
          <Card.Title>단계별 피드백 제공</Card.Title>
          <Card.Text style={{padding:'0'}}>
            모션 인식을 활용한 실시간 피드백을 바탕으로 <br/>
            운동 수행도를 분석하고 개선 방향 제안
          </Card.Text>
        </Card.ImgOverlay>
      </Card>
      <Card className="bg-dark text-white main-card detail-card">
        <Card.Img src="/detail3.png" alt="Card image"/>
        <Card.ImgOverlay>
          <Card.Title>편리한 접근성</Card.Title>
          <Card.Text style={{padding:'0'}}>
            장소나 시간에 구애받지 않고, <br/>
            개인 맞춤형 재활 운동을 집에서 편리하게 진행
          </Card.Text>
        </Card.ImgOverlay>
      </Card>
      
      </div>
      
    </div>
  )
}

export default Detail;