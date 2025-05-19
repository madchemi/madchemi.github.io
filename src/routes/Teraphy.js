import { useState } from "react"
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export function Teraphy(){
    let [tera, setTera]= useState({therapist_gender: "",
        therapist_style: "",
        exercise_intensity: "",
        num_of_week: 2});
    let [therapist,setTherapist] = useState(
        {exercise_intensity: " ", num_of_week: 0,therapist_gender:"",
        therapist_name:"",therapist_old: 0,therapist_style: ""});
    const handleChange = (e)=>{
        setTera({...tera, [e.target.name]: e.target.value })
        console.log(tera)
    }
    
    return(
        <>
        <div className="form-section">
            <h2>성별</h2>
            <input type="radio" id="남" name="therapist_gender" value="남" onChange={handleChange} />
            <label htmlFor="남" className="d-inline-block" >남</label>
            <input type="radio" id="여" name="therapist_gender" value="여" onChange={handleChange} />
            <label htmlFor="여" className="d-inline-block">여</label>
        </div>
        <div className="form-section">
            <h2>스타일</h2>
            <input type="radio" id="친절" name="therapist_style" value="친절"onChange={handleChange} />
            <label htmlFor="친절" className="d-inline-block">친절</label>
            <input type="radio" id="스파르타" name="therapist_style" value="스파르타" onChange={handleChange} />
            <label htmlFor="스파르타" className="d-inline-block">스파르타</label>
        </div>
        <div className="form-section">
            <h2>강도</h2>
            <input type="radio" id="강하게" name="exercise_intensity" value="강하게" onChange={handleChange} />
            <label htmlFor="강하게" className="d-inline-block">강하게</label>
            <input type="radio" id="약하게" name="exercise_intensity" value="약하게" onChange={handleChange} />
            <label htmlFor="약하게" className="d-inline-block">약하게</label>
        </div>
        <div className="form-section">
            <h2>주운동 횟수</h2>
            <input type="radio" id="2" name="num_of_week" value="2" onChange={handleChange} />
            <label htmlFor="2" className="d-inline-block">2</label>
            <input type="radio" id="3" name="num_of_week" value="3" onChange={handleChange} />
            <label htmlFor="3" className="d-inline-block">3</label>
        </div>
        {
            therapist["therapist_name"] != "" && (
                <Card style={{ display:'inline',width: '18rem' }}>
                  <Card.Img variant="top" src="holder.js/100px180" />
                  <Card.Body>
                    <Card.Title>{therapist["therapist_name"]}</Card.Title>
                    <Card.Text>
                      나이: {therapist["therapist_age"]}
                      성별: {therapist["therapist_gender"]}
                      코칭 스타일: {therapist["therapist_style"]}
                      운동 강도: {therapist["exercise_intensity"]}
                      주간 운동 횟수: {therapist["num_of_week"]}
                    </Card.Text>
                  </Card.Body>
                </Card>
            )
        }
        <button onClick={()=>{
            axios.post(`${process.env.REACT_APP_RAILWAY_URL}/teraphy`, tera).then((a)=>{
            alert("성공적으로 전송함")
            setTherapist(...a.data)
            console.log(therapist)
        }).catch((e)=>{
            alert("전송 실패")
        })}}>제출</button>
        </>

        
    )
}