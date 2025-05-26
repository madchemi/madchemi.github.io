import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Survey() {
  let [step, setStep] = useState(0);
  const totalSteps = 6; // 총 단계 수 (0부터 5까지)
  const navigate = useNavigate();

  // 옵션 정의
  const 세부장애유형 = ["상지기능장애", "하지기능장애", "상지관절장애", "하지관절장애", "척추장애", "절단장애", "중복장애"];
  const 전반적신체기능 = ["앉기 불가능", "등받이 대고 혼자 앉기 가능", "등받이 없이 혼자 앉기 가능", "서기 가능", "걷기 가능", "달리기 가능"];
  const painLocationOptions = ["목", "어깨 왼쪽", "어깨 오른쪽", "팔꿈치 왼쪽", "팔꿈치 오른쪽", "손목 왼쪽", "손목 오른쪽", "등 위쪽", "등 아래쪽(허리)", "고관절 왼쪽", "고관절 오른쪽", "무릎 왼쪽", "무릎 오른쪽", "발목 왼쪽", "발목 오른쪽"];
  const equipmentOptions = ["없음", "운동 매트", "의자", "가벼운 아령/덤벨", "탄력밴드(세라밴드 등)"];

  // 입력값 상태 관리
  const [formData, setFormData] = useState({
    id: "",
    gender: "",
    age: "",
    smoking: "", // 필수 선택 가정
    smoking_avg: "",
    drinking: "", // 필수 선택 가정
    drinking_frequency: "",
    current_activity_level: "", // 필수 선택 가정
    current_exercise_description: "",
    detailed_disability_type: {
      "상지기능장애": "", "하지기능장애": "", "상지관절장애": "", "하지관절장애": "",
      "척추장애": "", "절단장애": "", "중복장애": ""
    },
    general_physical_function: "", // 필수 선택 가정
    disability_progression: "", // 초기값 "unknown"이 아닌 사용자의 명시적 선택을 유도한다면 필수
    cns_sensory_disorder: "",   // 초기값 "no"가 아닌 사용자의 명시적 선택을 유도한다면 필수
    pain_exists: "no", // 필수 선택 가정 (초기값 no)
    pain_locations: [],
    pain_location_other: "",
    pain_intensity_rest: 0,
    pain_intensity_movement: 0,
    pain_triggers: "",
    exercise_purpose: "", // 필수 선택 가정
    preferred_exercise_type: "", // 필수 선택 가정
    exercise_location_preference: "", // 필수 선택 가정
    available_equipment: [],
    available_equipment_other: "",
    exercise_days_per_week: "", // 필수 입력 가정
    exercise_time_per_session: "", // 필수 입력 가정
    recent_medical_events: "",
    doctor_recommendations: "",
    comments: "",
  });

  // 필수 항목 시각적 표시 스타일
  const requiredMark = <span className="text-red-500 ml-1">*</span>;

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 0: // 기본 정보
        if (!formData.id.trim() || !formData.gender || !formData.age.trim()) return false;
        break;
      case 1: // 생활 습관 및 현재 활동
        if (!formData.smoking) return false;
        if (formData.smoking === "yes" && !formData.smoking_avg.trim()) return false;
        if (!formData.drinking) return false;
        if (formData.drinking === "yes" && !formData.drinking_frequency.trim()) return false;
        if (!formData.current_activity_level) return false;
        break;
      case 2: // 신체 기능 및 장애 정보
        if (!formData.general_physical_function) return false;
        if (!formData.disability_progression) return false; // 사용자가 명시적으로 선택하도록 유도
        if (!formData.cns_sensory_disorder) return false;   // 사용자가 명시적으로 선택하도록 유도
        break;
      case 3: // 통증 평가
        if (!formData.pain_exists) return false; // '예' 또는 '아니오' 선택 필수
        if (formData.pain_exists === "yes") {
          if (formData.pain_locations.length === 0 && !formData.pain_location_other.trim()) return false;
          // 통증 강도는 기본값이 0이므로 항상 값이 있음. 특정 값 이상을 필수로 하려면 추가 로직 필요
        }
        break;
      case 4: // 운동 목표 및 환경
        if (!formData.exercise_purpose) return false;
        if (!formData.preferred_exercise_type) return false;
        if (!formData.exercise_location_preference) return false;
        if (!formData.exercise_days_per_week.trim()) return false;
        if (!formData.exercise_time_per_session.trim()) return false;
        break;
      case 5: // 주의사항 및 기타 (일반적으로 선택 사항이 많음)
        // 특별히 이 단계에서 필수로 지정할 항목이 없다면 항상 true 반환
        break;
      default:
        return true; // 정의되지 않은 단계는 통과
    }
    return true; // 모든 검사 통과
  };


  function nextStep() {
    if (!validateStep(step)) {
      alert("현재 단계의 모든 필수 항목(*)을 입력하거나 선택해주세요.");
      return;
    }
    setStep(step + 1);
  }

  function prevStep() {
    setStep(step - 1);
  }

  const handleChange = (e) => {
    const { name, value, type, checked, id: targetId } = e.target;

    if (name === "detailed_disability_type") {
      const disabilityKey = targetId;
      const sideClicked = value;
      let currentDisabilityStates = { ...formData.detailed_disability_type };

      if (type === "text" && disabilityKey === "중복장애") {
        currentDisabilityStates[disabilityKey] = value;
      } else if (type === "checkbox") {
        let currentSetting = currentDisabilityStates[disabilityKey];
        if (checked) {
          if (!currentSetting || currentSetting === "") {
            currentDisabilityStates[disabilityKey] = sideClicked;
          } else if (currentSetting === "왼쪽" && sideClicked === "오른쪽") {
            currentDisabilityStates[disabilityKey] = "양쪽";
          } else if (currentSetting === "오른쪽" && sideClicked === "왼쪽") {
            currentDisabilityStates[disabilityKey] = "양쪽";
          } else if (currentSetting !== "양쪽" && currentSetting !== sideClicked) {
            currentDisabilityStates[disabilityKey] = "양쪽";
          } else {
            currentDisabilityStates[disabilityKey] = sideClicked;
          }
        } else {
          if (currentSetting === sideClicked) {
            currentDisabilityStates[disabilityKey] = "";
          } else if (currentSetting === "양쪽") {
            currentDisabilityStates[disabilityKey] = (sideClicked === "왼쪽") ? "오른쪽" : "왼쪽";
          }
        }
      }
      setFormData({ ...formData, detailed_disability_type: currentDisabilityStates });
    } else if (type === "checkbox" && (name === "pain_locations" || name === "available_equipment")) {
      const currentArray = formData[name] ? [...formData[name]] : [];
      if (checked) {
        if (!currentArray.includes(value)) {
          currentArray.push(value);
        }
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) {
          currentArray.splice(index, 1);
        }
      }
      setFormData({ ...formData, [name]: currentArray });
    } else if (type === "radio" && name === "pain_exists") {
      setFormData({
        ...formData,
        [name]: value,
        pain_locations: value === "no" ? [] : formData.pain_locations,
        pain_location_other: value === "no" ? "" : formData.pain_location_other,
        pain_intensity_rest: value === "no" ? 0 : formData.pain_intensity_rest,
        pain_intensity_movement: value === "no" ? 0 : formData.pain_intensity_movement,
        pain_triggers: value === "no" ? "" : formData.pain_triggers,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 마지막 단계 유효성 검사
    if (!validateStep(step)) {
        alert("현재 단계의 모든 필수 항목(*)을 입력하거나 선택해주세요.");
        return;
    }
    // 전체 단계 유효성 검사 (선택 사항: 사용자가 직접 마지막 단계로 건너뛰는 것을 방지)
    // for (let i = 0; i <= step; i++) { // 현재까지 진행된 모든 단계 검사
    //   if (!validateStep(i)) {
    //     alert(`단계 ${i + 1}의 필수 항목을 모두 채워주세요.`);
    //     setStep(i); // 해당 단계로 이동
    //     return;
    //   }
    // }

    console.log("Submitting formData:", formData);

    const API_BASE_URL = "http://localhost:8000";
    const API_VERSION_PREFIX = "/api/v1";
    const SURVEY_ENDPOINT = "/survey"; // 이전 오류 수정을 위해 끝 슬래시 제거

    const apiUrl = `${API_BASE_URL}${API_VERSION_PREFIX}${SURVEY_ENDPOINT}`;
    console.log("Attempting to POST to:", apiUrl);


    try {
      const response = await axios.post(apiUrl, formData);
      console.log("응답 데이터:", response.data);
      alert("설문이 성공적으로 제출되었습니다! 분석 페이지로 이동합니다.");
      
      if (formData.id) {
        navigate(`/analysis/${formData.id}`);
      } else {
        // 이 경우는 validateStep(0)에서 id 부재로 이미 걸러졌어야 합니다.
        alert("사용자 ID가 없어 분석 페이지로 이동할 수 없습니다. (ID를 입력해주세요)");
      }
    } catch (error) {
      console.error("설문 제출 오류:", error);
      if (error.response) {
        console.error("에러 데이터:", error.response.data);
        console.error("에러 상태 코드:", error.response.status);
        let errorMessage = `설문 제출에 실패했습니다. (서버 응답 코드: ${error.response.status})`;
        if (error.response.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = `설문 제출 실패: ${error.response.data.detail}`;
          } else if (Array.isArray(error.response.data.detail) && error.response.data.detail.length > 0) {
            // Pydantic 유효성 검사 오류의 경우 (더 자세한 메시지)
            const pydanticError = error.response.data.detail[0];
            errorMessage = `입력 값 오류 (${pydanticError.loc.join(" -> ")}): ${pydanticError.msg}`;
          } else {
             errorMessage = `설문 제출 실패: ${JSON.stringify(error.response.data.detail)}`;
          }
        } else if (error.response.status === 409) {
          errorMessage = `설문 제출 실패: 해당 아이디(${formData.id})로 이미 설문이 제출되었습니다. 다른 아이디를 사용해주세요.`;
        } else if (error.response.status === 405) {
            errorMessage = `설문 제출 실패: 서버에서 해당 경로(${apiUrl})에 대한 POST 요청을 허용하지 않습니다. (405 Method Not Allowed). 백엔드 API 경로 및 메소드 설정을 확인해주세요.`;
        }
        alert(errorMessage);
      } else if (error.request) {
        console.error("응답 없음:", error.request);
        alert(`설문 제출에 실패했습니다. 서버(${API_BASE_URL})로부터 응답을 받지 못했습니다. 네트워크 연결, 서버 실행 상태 또는 CORS 설정을 확인해주세요.`);
      } else {
        console.error('요청 설정 오류:', error.message);
        alert("설문 제출에 실패했습니다: 요청을 보내는 중 오류가 발생했습니다.");
      }
    }
  };

  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const radioLabelStyle = "ml-2 text-sm text-gray-700";
  const checkboxLabelStyle = "ml-2 text-sm text-gray-700";
  const sectionTitleStyle = "text-lg font-semibold text-gray-800 mb-4 border-b pb-2";
  const hrStyle = "my-6 border-t border-gray-200";

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto bg-gray-50 rounded-xl shadow-xl my-10">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-700">
        <span style={{ color: 'rgb(53,208,186)' }}>AiBLE</span> 맞춤 운동 추천 설문
      </h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        더 정확하고 안전한 운동 추천을 위해 아래 설문에 답변해주시면 감사하겠습니다.
      </p>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}>
          </div>
        </div>
        <p className="text-xs text-center mt-1 text-gray-500">진행률: {step + 1} / {totalSteps}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>1. 기본 정보</h3>
            <div>
              <label htmlFor="id" className={labelStyle}>아이디:{requiredMark}</label>
              <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} required className={inputStyle} placeholder="사용하실 아이디를 입력하세요"/>
            </div>
            <div>
              <label htmlFor="gender" className={labelStyle}>성별:{requiredMark}</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className={inputStyle}>
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className={labelStyle}>연령 (만 나이):{requiredMark}</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required className={inputStyle} placeholder="예: 35"/>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>2. 생활 습관 및 현재 활동</h3>
            <div>
              <label className={labelStyle}>흡연 여부:{requiredMark}</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center"><input type="radio" name="smoking" value="yes" checked={formData.smoking === "yes"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>예</span></label>
                <label className="flex items-center"><input type="radio" name="smoking" value="no" checked={formData.smoking === "no"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>아니오</span></label>
              </div>
              {formData.smoking === "yes" && (
                <div className="mt-3">
                  <label htmlFor="smoking_avg" className={labelStyle}>하루 평균 흡연량 (개피):{requiredMark}</label>
                  <input type="number" id="smoking_avg" name="smoking_avg" value={formData.smoking_avg} onChange={handleChange} className={inputStyle} placeholder="예: 10"/>
                </div>
              )}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label className={labelStyle}>음주 여부:{requiredMark}</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center"><input type="radio" name="drinking" value="yes" checked={formData.drinking === "yes"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>예</span></label>
                <label className="flex items-center"><input type="radio" name="drinking" value="no" checked={formData.drinking === "no"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>아니오</span></label>
              </div>
              {formData.drinking === "yes" && (
                <div className="mt-3">
                  <label htmlFor="drinking_frequency" className={labelStyle}>주 평균 음주 횟수:{requiredMark}</label>
                  <input type="number" id="drinking_frequency" name="drinking_frequency" value={formData.drinking_frequency} onChange={handleChange} className={inputStyle} placeholder="예: 2"/>
                </div>
              )}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label htmlFor="current_activity_level" className={labelStyle}>평소 활동량:{requiredMark}</label>
              <select id="current_activity_level" name="current_activity_level" value={formData.current_activity_level} onChange={handleChange} className={inputStyle}>
                <option value="">선택하세요</option>
                <option value="sedentary">거의 앉아서 생활 (별도의 운동 거의 안 함)</option>
                <option value="light">가벼운 활동 위주 (주 1-2회 가벼운 산책 또는 스트레칭)</option>
                <option value="moderate">중간 정도 활동 (주 3-4회 규칙적인 운동)</option>
                <option value="active">매우 활동적 (주 5회 이상 고강도 운동 또는 육체 노동)</option>
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="current_exercise_description" className={labelStyle}>현재 하고 있는 운동이 있다면 자세히 알려주세요 (종류, 시간, 빈도 등):</label>
              <textarea id="current_exercise_description" name="current_exercise_description" value={formData.current_exercise_description} onChange={handleChange} rows="3" className={inputStyle} placeholder="예: 매일 저녁 30분 걷기, 주 2회 수영 1시간"></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>3. 신체 기능 및 장애 정보</h3>
            <div>
              <label className={labelStyle}>세부장애유형 (해당사항에 모두 체크, 해당 시 좌/우 선택):</label>
              {세부장애유형.map((disabilityType) => (
                <div key={disabilityType} className="mb-3 p-3 border border-gray-200 rounded-md bg-white">
                  <p className="font-medium text-gray-700">{disabilityType}</p>
                  {disabilityType === "중복장애" ? (
                    <input type="text" id={disabilityType} name="detailed_disability_type" value={formData.detailed_disability_type[disabilityType] || ""} onChange={handleChange} placeholder="중복 장애명 상세 기술" className={`${inputStyle} mt-1`} />
                  ) : (
                    <div className="flex items-center space-x-6 mt-2">
                      <label className="flex items-center">
                        <input type="checkbox" id={disabilityType} name="detailed_disability_type" value="왼쪽"
                               checked={formData.detailed_disability_type[disabilityType]?.includes("왼쪽") || formData.detailed_disability_type[disabilityType] === "양쪽"}
                               onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <span className={checkboxLabelStyle}>왼쪽</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" id={disabilityType} name="detailed_disability_type" value="오른쪽"
                               checked={formData.detailed_disability_type[disabilityType]?.includes("오른쪽") || formData.detailed_disability_type[disabilityType] === "양쪽"}
                               onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <span className={checkboxLabelStyle}>오른쪽</span>
                      </label>
                      {formData.detailed_disability_type[disabilityType] && <span className="text-xs text-blue-600">({formData.detailed_disability_type[disabilityType]})</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label className={labelStyle}>전반적인 신체 기능:{requiredMark}</label>
              {전반적신체기능.map((func) => (
                <label key={func} className="block my-1 p-2 rounded hover:bg-gray-100 cursor-pointer">
                  <input type="radio" name="general_physical_function" value={func} checked={formData.general_physical_function === func} onChange={handleChange} className="form-radio mr-2"/>{func}
                </label>
              ))}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label className={labelStyle}>장애의 진행 여부:{requiredMark}</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center"><input type="radio" name="disability_progression" value="yes" checked={formData.disability_progression === "yes"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>진행되고 있음</span></label>
                <label className="flex items-center"><input type="radio" name="disability_progression" value="no" checked={formData.disability_progression === "no"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>진행되지 않음</span></label>
                <label className="flex items-center"><input type="radio" name="disability_progression" value="unknown" checked={formData.disability_progression === "unknown"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>모름</span></label>
              </div>
            </div>
            <hr className={hrStyle}/>
            <div>
              <label className={labelStyle}>중추신경계(감각) 장애 여부:{requiredMark}</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center"><input type="radio" name="cns_sensory_disorder" value="yes" checked={formData.cns_sensory_disorder === "yes"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>해당</span></label>
                <label className="flex items-center"><input type="radio" name="cns_sensory_disorder" value="no" checked={formData.cns_sensory_disorder === "no"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>비해당</span></label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>4. 통증 평가</h3>
            <div>
              <label className={labelStyle}>현재 불편하거나 통증이 있는 부위가 있나요?{requiredMark}</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center"><input type="radio" name="pain_exists" value="yes" checked={formData.pain_exists === "yes"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>예</span></label>
                <label className="flex items-center"><input type="radio" name="pain_exists" value="no" checked={formData.pain_exists === "no"} onChange={handleChange} className="form-radio"/> <span className={radioLabelStyle}>아니오</span></label>
              </div>
            </div>

            {formData.pain_exists === "yes" && (
              <>
                <div className="mt-4">
                  <label className={labelStyle}>통증 부위 (해당하는 곳 모두 선택):{requiredMark}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {painLocationOptions.map(loc => (
                      <label key={loc} className="flex items-center p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                        <input type="checkbox" name="pain_locations" value={loc} checked={formData.pain_locations.includes(loc)} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <span className={checkboxLabelStyle}>{loc}</span>
                      </label>
                    ))}
                  </div>
                  <input type="text" name="pain_location_other" value={formData.pain_location_other} onChange={handleChange} placeholder="기타 통증 부위 직접 입력" className={`${inputStyle} mt-3`} />
                </div>
                <div className="mt-4">
                  <label htmlFor="pain_intensity_rest" className={labelStyle}>가만히 있을 때 통증 강도 (0: 통증 없음, 10: 참을 수 없는 통증): <span className="font-bold text-blue-600">{formData.pain_intensity_rest}</span></label>
                  <input type="range" id="pain_intensity_rest" name="pain_intensity_rest" min="0" max="10" value={formData.pain_intensity_rest} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div className="mt-4">
                  <label htmlFor="pain_intensity_movement" className={labelStyle}>움직일 때 통증 강도 (0: 통증 없음, 10: 참을 수 없는 통증): <span className="font-bold text-blue-600">{formData.pain_intensity_movement}</span></label>
                  <input type="range" id="pain_intensity_movement" name="pain_intensity_movement" min="0" max="10" value={formData.pain_intensity_movement} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                </div>
                <div className="mt-4">
                  <label htmlFor="pain_triggers" className={labelStyle}>어떤 활동/동작 시 통증이 주로 발생하거나 심해지나요?</label>
                  <textarea id="pain_triggers" name="pain_triggers" value={formData.pain_triggers} onChange={handleChange} rows="3" className={inputStyle} placeholder="예: 계단을 오를 때 무릎 안쪽 통증, 팔을 위로 들 때 어깨 앞쪽 통증"></textarea>
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>5. 운동 목표 및 환경</h3>
            <div>
              <label className={labelStyle}>운동 목적 (가장 중요한 것 하나 선택):{requiredMark}</label>
              {["ROM(관절가동범위) 개선", "통증 완화 및 관리", "근력 강화", "지구력 향상 (심폐지구력)", "유연성 증진", "체중 관리", "일상생활 기능 향상", "스트레스 해소 및 기분 전환", "여가 활동 (재미)"].map(purpose => (
                <label key={purpose} className="block my-1 p-2 rounded hover:bg-gray-100 cursor-pointer">
                  <input type="radio" name="exercise_purpose" value={purpose} checked={formData.exercise_purpose === purpose} onChange={handleChange} className="form-radio mr-2"/>{purpose}
                </label>
              ))}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label className={labelStyle}>선호하는 운동 방법:{requiredMark}</label>
              {["유산소 운동 (걷기, 자전거 등)", "근력 운동 (기구, 맨몸 등)", "유연성 운동 (스트레칭, 요가 등)", "복합 운동 (여러 요소 결합)"].map(type => (
                <label key={type} className="block my-1 p-2 rounded hover:bg-gray-100 cursor-pointer">
                  <input type="radio" name="preferred_exercise_type" value={type} checked={formData.preferred_exercise_type === type} onChange={handleChange} className="form-radio mr-2"/>{type}
                </label>
              ))}
            </div>
            <hr className={hrStyle}/>
            <div>
              <label htmlFor="exercise_location_preference" className={labelStyle}>주로 운동할 장소:{requiredMark}</label>
              <select id="exercise_location_preference" name="exercise_location_preference" value={formData.exercise_location_preference} onChange={handleChange} className={inputStyle}>
                <option value="">선택하세요</option>
                <option value="home">집</option>
                <option value="gym">헬스장 / 운동 시설</option>
                <option value="outdoor">야외 (공원 등)</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div className="mt-4">
              <label className={labelStyle}>사용 가능한 운동 기구 (해당하는 것 모두 선택):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {equipmentOptions.map(eq => (
                  <label key={eq} className="flex items-center p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" name="available_equipment" value={eq} checked={formData.available_equipment.includes(eq)} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <span className={checkboxLabelStyle}>{eq}</span>
                  </label>
                ))}
              </div>
              <input type="text" name="available_equipment_other" value={formData.available_equipment_other} onChange={handleChange} placeholder="기타 사용 가능 장비 직접 입력" className={`${inputStyle} mt-3`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
              <div>
                <label htmlFor="exercise_days_per_week" className={labelStyle}>일주일에 운동 가능한 횟수:{requiredMark}</label>
                <input type="number" id="exercise_days_per_week" name="exercise_days_per_week" value={formData.exercise_days_per_week} onChange={handleChange} className={inputStyle} placeholder="예: 3 (회)"/>
              </div>
              <div>
                <label htmlFor="exercise_time_per_session" className={labelStyle}>한 번 운동 시 가능한 시간 (분):{requiredMark}</label>
                <input type="number" id="exercise_time_per_session" name="exercise_time_per_session" value={formData.exercise_time_per_session} onChange={handleChange} className={inputStyle} placeholder="예: 30 (분)"/>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="form-section">
            <h3 className={sectionTitleStyle}>6. 주의사항 및 기타</h3>
            <div>
              <label htmlFor="recent_medical_events" className={labelStyle}>최근 1년 이내 수술, 입원, 심각한 부상 경험 또는 진단받은 주요 질환이 있다면 알려주세요:</label>
              <textarea id="recent_medical_events" name="recent_medical_events" value={formData.recent_medical_events} onChange={handleChange} rows="3" className={inputStyle} placeholder="예: 3개월 전 무릎 연골 수술, 고혈압 진단 받음"></textarea>
            </div>
            <hr className={hrStyle}/>
            <div>
              <label htmlFor="doctor_recommendations" className={labelStyle}>운동과 관련하여 의사 또는 물리치료사로부터 특별한 권고 또는 제한 사항을 들은 적이 있나요?</label>
              <textarea id="doctor_recommendations" name="doctor_recommendations" value={formData.doctor_recommendations} onChange={handleChange} rows="3" className={inputStyle} placeholder="예: 어깨에 무리 가는 동작 피하기, 유산소 운동 위주로 권장"></textarea>
            </div>
            <hr className={hrStyle}/>
            <div>
              <label htmlFor="comments" className={labelStyle}>운동 프로그램에 특별히 바라는 점이나 기타 의견이 있다면 자유롭게 작성해주세요:</label>
              <textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} rows="4" className={inputStyle}></textarea>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-10">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 font-semibold">
              이전
            </button>
          ) : (
            <div></div>
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-500 text-black rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold">
              다음
            </button>
          ) : (
             // step === totalSteps - 1 (마지막 단계)
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-black rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-semibold">
              설문 완료 및 제출
            </button>
          )}
        </div>
      </form>
    </div>
  );
}