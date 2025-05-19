import { useState } from "react";
import axios from "axios";

export default function Survey(){
  let [step, setStep] = useState(0);
  let 세부장애유형 = ["상지기능장애", "하지기능장애", "상지관절장애", "하지관절장애"
    ,"척추장애", "절단장애", "중복장애"];
  let 전반적신체기능 = ["앉기 불가능", "등받이 대고 혼자 앉기 가능", "등받이 없이 혼자 앉기 가능",
    "서기 가능", "걷기 가능", "달리기 가능"];
  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    id: "",
    gender: "",
    age: "",
    smoking:"",
    smoking_avg:"",
    음주: "",
    음주평균: "",
    세부장애: {"상지기능장애":"", "하지기능장애":"", "상지관절장애":"", "하지관절장애":""
    ,"척추장애":"", "절단장애":"", "중복장애":""},
    disability: "",
    comments: "",
  });
  function nextStep(){
    setStep(step+1);
  }
  function prevStep(){
    setStep(step-1);
  }
  // 입력값 변경 핸들러
  const handleChange = (e) => {
    let data = {}
    if(e.target.name=="세부장애"){
      if(formData["세부장애"][e.target.id] != NaN)
        if((formData["세부장애"][e.target.id] == "왼쪽"
          || formData["세부장애"][e.target.id] == "오른쪽")
          && formData["세부장애"][e.target.id] != e.target.value
        ) data = {[e.target.id]: "양쪽"}
      else data = {[e.target.id]: e.target.value};
      data = {...formData["세부장애"], ...data};
      console.log(data)
      setFormData({...formData, [e.target.name]: data});
    }
    else setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/survey", formData);
      console.log("응답 데이터:", response.data);
      alert("설문이 제출되었습니다!");
    } catch (error) {
      console.error("설문 제출 오류:", error);
      alert("설문 제출에 실패했습니다.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4" 
      style={{textAlign:'left', marginLeft:'30px', fontWeight:'bold'}}>
        <p style={{display:'inline', color:'rgb(53,208,186)'}}>AiBLE</p> 사용자 조사</h2>
      <p style={{textAlign:'left', marginLeft:'30px', color:'rgb(128,128,128)'}}>
        사전 체험자 모집을 위한 설문조사에 참여하시고, 정식 런칭 시 우선 이용 기회 및
        특별 혜택을 받아보세요!
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      {
        step==0 &&
        <>
        <div className="form-section">
          <hr/>
          <h2>기본 정보</h2>
          <label htmlFor="id">아이디:</label>
          <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} required />
          <label htmlFor="gender">성별:</label>
          <input type="text" id="gender" name="gender" value={formData.gender} onChange={handleChange} required />

          <label htmlFor="age">연령:</label>
          <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div className="form-section">
          <hr/>
          <h2>생활습관</h2>
          <label>흡연 여부:</label>
          <input type="radio" id="smoking_yes" name="smoking" value="yes" onChange={handleChange} />
          <label htmlFor="smoking_yes" className="d-inline-block">예</label>
          <input type="radio" id="smoking_no" name="smoking" value="no" onChange={handleChange} />
          <label htmlFor="smoking_no" className="d-inline-block">아니오</label>

          <label htmlFor="smoking_avg">현재 담배를 피운다면 하루 평균 (개피):</label>
          <input type="number" id="smoking_avg" name="smoking_avg" value={formData.smoking_avg} onChange={handleChange} />
          
          <label>음주주 여부:</label>
          <input type="radio" id="smoking_yes" name="음주" value="예" onChange={handleChange} />
          <label htmlFor="음주_예" className="d-inline-block">예</label>
          <input type="radio" id="smoking_no" name="음주" value="아니오" onChange={handleChange} />
          <label htmlFor="음주_아니오" className="d-inline-block">아니오</label>

          <label htmlFor="smoking_avg">음주 횟수는 일주일에 평균</label>
          <input type="number" id="smoking_avg" name="음주평균" value={formData.smoking_avg} onChange={handleChange} />
        </div>
        </>
      }
      {
        step==1 && 
        <div className="form-section">
              <h2>신체 기능</h2>
              <label>세부장애유형 (해당사항에 모두 체크)</label>
              {
                세부장애유형.map((a,i)=>{
                  console.log(a)
                  return(
                    <>            
                    {
                      a == "중복장애" ? 
                      <>
                      <label htmlFor={a}>중복 장애명 (있을 경우만 적어주세요):</label>
                      <input type="text" id={a} name="세부장애" onChange={handleChange} />
                      </>: 
                      <>
                      <label className="d-inline-block ms-2">{a}</label>
                      <input type="checkbox" id={a} name="세부장애" value="왼쪽" onChange={handleChange} />
                      <label htmlFor={a} className="d-inline-block ms-2">왼쪽</label>
                      <input type="checkbox" id={a} name="세부장애" value="오른쪽" onChange={handleChange} />
                      <label htmlFor={a} className="d-inline-block ms-2">오른쪽</label>
                      <br></br></>                 
                    }
                    </>
                  )
                })
              }
              <hr></hr>
              <label>전반적인 신체기능</label>
              {
                전반적신체기능.map((a,i)=>{
                  return(
                    <>
                    <input type="radio" id={a} name="전반적인 신체기능" value={a} onChange={handleChange} />
                    <label htmlFor={a} className="d-inline-block">{a}</label>
                    <br></br>
                    </>
                  )
                  
                })
              }
          </div>
      }
      {
        step==2 &&
        <>
        <div className="form-section">
            <hr></hr>
            <h2>장애의 진행 여부</h2>
            <label htmlFor="진행x">진행되지 않음</label>
            <input type="radio" id="진행x" name="장애진행여부" value="no" onChange={handleChange} />
            <label htmlFor="진행o">진행되고 있음</label>
            <input type="radio" id="진행o" name="장애진행여부" value="yes" onChange={handleChange} />

            <hr></hr>
            <h2>중추신경계(감각) 장애 여부</h2>
            <input type="radio" id="비해당" name="중추장애진행여부" value="no" onChange={handleChange} />
            <label htmlFor="비해당">비해당</label>
            <input type="radio" id="해당" name="중추장애진행여부" value="yes" onChange={handleChange} />
            <label htmlFor="진행o">해당</label>
            
        </div>

        <div className="form-section">
            <h2>운동 목적</h2>
            <input type="radio" id="체중감소" name="운동목적" value="체중감소" onChange={handleChange} />
            <label htmlFor="체중감소" className="d-inline-block">체중감소</label>
            <input type="radio" id="체력증진" name="운동목적" value="체력증진" onChange={handleChange} />
            <label htmlFor="체력증진" className="d-inline-block">체력증진(심폐지구력/근력)</label>
            <input type="radio" id="통증완화" name="운동목적" value="통증완화" onChange={handleChange} />
            <label htmlFor="통증완화" className="d-inline-block">통증완화</label>
            <input type="radio" id="여가활동" name="운동목적" value="여가활동" onChange={handleChange} />
            <label htmlFor="여가활동" className="d-inline-block">여가활동(재미)</label>
        </div>
        <div className="form-section">
            <h2>선호하는 운동방법</h2>
            <input type="radio" id="유산소운동" name="선호운동" value="유산소운동" onChange={handleChange} />
            <label htmlFor="유산소운동" className="d-inline-block">유산소운동</label>
            <input type="radio" id="근력운동" name="선호운동" value="근력운동" onChange={handleChange} />
            <label htmlFor="근력운동" className="d-inline-block">근력운동</label>
            <input type="radio" id="복합운동" name="선호운동" value="복합운동" onChange={handleChange} />
            <label htmlFor="복합운동" className="d-inline-block">복합운동</label>
        </div>
        <div className="form-section">
            <h2>관절 통증</h2>
            <input type="radio" id="유산소운동" name="선호운동" value="유산소운동" onChange={handleChange} />
            <label htmlFor="유산소운동" className="d-inline-block">유산소운동</label>
            <input type="radio" id="근력운동" name="선호운동" value="근력운동" onChange={handleChange} />
            <label htmlFor="근력운동" className="d-inline-block">근력운동</label>
            <input type="radio" id="복합운동" name="선호운동" value="복합운동" onChange={handleChange} />
            <label htmlFor="복합운동" className="d-inline-block">복합운동</label>
        </div>

        <div className="form-section">
            <h2>기타</h2>
            <label htmlFor="comments">운동 프로그램에 바라는 점:</label>
            <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange}></textarea>
        </div>
        </>
      }
          
        {
          step > 0 && (
            <button type="button" onClick={()=>{ prevStep()}} className="bg-blue-500 text-black p-2 rounded">
            이전
            </button>
          )
        }
        { step < 5 && (
          <button type="button" onClick={()=>{ nextStep()}} className="bg-blue-500 text-black p-2 rounded">
            다음
          </button>
        )
          }
          { step >= 5 && (
          <button type="submit" className="bg-green-500 text-black p-2 rounded">
            제출하기
          </button>)
          }
          
        </form>
      </div>
    );
  };