import React from 'react';
import { useState } from 'react';
import styles from './Preliminary.module.css'
import axios from 'axios';

function Preliminary() {

  let [num, setNum] = useState(2);
  let [modalOpen, setModalOpen] = useState(false);
  let [user, setUser] = useState({email:"",age:"",gender:""});
        
  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_RAILWAY_URL}/pre`,  // URL 수정 (https)
        user,  // JSON 객체
        {
            headers: {
                "Content-Type": "application/json"  // 올바른 JSON 형식 지정
            }
        }
      );
      console.log("응답 데이터:", response.data);
      alert("사전 신청되었습니다!");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("⚠️ 이미 존재하는 이메일입니다.");
      }
      else console.error("설문 제출 오류:", error);
      alert("신청에 실패했습니다. 다시 시도해주세요");
    }
      
  };
  const handleChange = async (e) => {
    setUser({...user, [e.target.id]: e.target.value});
    console.log(user)
  };
  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.preh1}>내 몸에 꼭 맞는 정확한 재활 치료, <a style={{color:'aquamarine'}}>찾기 어렵지 않나요?</a></h1>
      </div>
      <div className={styles.box}>
        <p>
        🚨잘못된 재활 치료는 상태를 더 악화시킬 수 있습니다.🚨<br/>
          정확한 분석 없이 무분별한 운동을 하면 근육 경직, 신경 손상, 통증 약화 등으로
          재활이 아닌 오히려 <a style={{color:'aquamarine'}}>2차 장애를 초래</a>할 수 있습니다.<br/>
          내 몸에 꼭 맞는 정확한 재활 치료가 필요합니다.<br/>
          </p>
      </div>
      <div className={styles.speechBubble}>
        <p>
          병원마다 진단도 다르고, 직접 여러 병원을 옮겨 다니면서<br/>
          상담을 받다보면 <a style={{fontWeight:'bold'}}>재활 치료도 전에 지치는 것 같아요.</a>
        </p>
      </div>
      <div className={`${styles.speechBubble} ${styles.right}`} style={{height:'50px', marginLeft:'auto'}}>
        <p>
          어디서 어떤 치료를 받아야 할지 <a style={{fontWeight:'bold'}}>도저히 모르겠어요.</a>
        </p>
      </div>
      <div className={styles.speechBubble}>
        <p>
          상담도 길고 복잡한데, 결국 운동이 필요하다고만<br/>
          할 뿐 <a style={{fontWeight:'bold'}}>정확한 방법을 알려주진 않더라고요.</a>
        </p>
      </div>
      <div className={styles.bottom}>
        <h1 className={styles.preh1}>AiBLE</h1>
        <p>AI 모션 인식 기반 <a style={{color:'aquamarine'}}>재활 운동 추천</a> 
        & <a style={{color:'aquamarine'}}>재활 치료사 매칭 서비스</a></p>
        <div className={styles.outbox}>
          <p>
            ✔️ 카메라 ON → 간단한 동작 따라 하기 → 운동 특성 분석<br/>
            ✔️ 내 몸의 취약점을 AI가 정밀하게 분석하고, 필요한 재활 운동을 자동 추천<br/>
            ✔️ 장애 유형, 신체 상태, 운동 패턴까지 반영한 맞춤형 재활 치료사 매칭
          </p>
        </div>
        <h2 className={styles.preh2}>비대면과 방문 치료를 모두 지원하는 맞춤형 서비스</h2>
        <div className={styles.imglist}>
          <img src='/비대면.png'></img>
          <img src='/방문.png'></img>
        </div>
        <h2 className={styles.preh2}>비대면 & 방문 재활 치료로 편리함 <a style={{color:'aquamarine'}}>UP!</a> 부담감 <a style={{color:'aquamarine'}}>DOWN!</a></h2>
        
      </div>
      <div className={styles.middle}>
        <div className={styles.circle}>
          <p>
            <p>무엇을?</p>
            <a style={{color:'aquamarine'}}>내 몸에 필요한</a> <br/>
            재활 운동을 정확히 추천
          </p>
          <h3>잘못된 운동으로 인한 부작용을 최소화하고 최적의 재활 운동 코스 제공.</h3>
        </div>
        <div className={styles.dotline}></div>
        <div className={styles.circle}>
          <p style={{marginTop:'30px'}}>
          <p style={{top:'0', left:'-9rem'}}>어디서?</p>
            내<a style={{color:'aquamarine'}}>집</a>에서!
          </p>
          <h3>잘못된 운동으로 인한 부작용을 최소화하고 최적의 재활 운동 코스 제공.</h3>
        </div>
        <div className={styles.dotline}></div>
        <div className={styles.circle}>
          <p>
            <p>누구에게?</p>
            나에게 <a style={{color:'aquamarine'}}>꼭 맞는 <br/>전문</a> 재활 치료사에게!
          </p>
          <h3 style={{width:'120%'}}>
            단순 운동 지도가 아닌, 필요한 운동을<br/>
            정확히 분석하고 케어할 수 있는 치료사와 매칭.
          </h3>
        </div>
        <h1 className={styles.preh1} style={{fontSize:'0.9rem', marginTop:'80px', marginBottom:'40px'}}>사전 신청하고 가장 먼저 
          <a style={{color:'aquamarine'}}> AiBLE</a>을 만나보세요!</h1>
        <button className={styles.button} onClick={()=>{setModalOpen(true)}}>사전 신청하기</button>
        {
          modalOpen == true && (
          <div className={styles.modalContainer}>
              <label htmlFor="email" className='d-block'>이메일:</label>
              <input type="text" id="email" name="id" value={user.email} onChange={handleChange} required />
              <label htmlFor="gender" className='d-block'>성별:</label>
              <input type="text" id="gender" name="gender" value={user.gender} onChange={handleChange} required />
              <label htmlFor="age" className='d-block'>나이:</label>
              <input type="number" id="age" name="age" value={user.age} onChange={handleChange} required />
              <button onClick={handlesubmit} className={`${styles.button} d-block m-3` }>제출</button>
            
          </div>)
        }
        
      </div>
      
    </div>
  )
}
export default Preliminary;
