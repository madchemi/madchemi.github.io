// 캔버스에 작성된 코드입니다. 복사하여 사용하세요.
// src/routes/Login.js

import React, { useState, useEffect } from "react";
import styles from "./Login.module.css"; // Login.module.css import
import { useAuth } from "../AuthContext"; // useAuth 훅 가져오기

const Login = ({ isOpen, onClose }) => {
  const { login } = useAuth(); // AuthContext에서 login 함수 가져오기
  const [activeTab, setActiveTab] = useState("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Error/Success messages
  const [loginError, setLoginError] = useState("");
  const [signupMessage, setSignupMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'hidden'; // 모달이 열리면 배경 스크롤 방지
    } else {
      // 모달이 닫힐 때 메시지 초기화 및 스크롤 복원
      setLoginError("");
      setSignupMessage("");
      document.body.style.overflow = 'auto';
    }

    // 컴포넌트 언마운트 시 또는 isOpen 변경 시 실행될 클린업 함수
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'auto'; // 항상 스크롤 복원
    };
  }, [isOpen, onClose]); // isOpen 또는 onClose가 변경될 때마다 이 효과를 다시 실행

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError(""); // 이전 에러 메시지 초기화
    
    if (!loginUsername || !loginPassword) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    
    try {
      // 실제 API 주소로 변경해야 합니다.
      const response = await fetch("http://localhost:8000/api/v1/auth/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // ▼▼▼ 핵심 수정 부분 ▼▼▼
        // 서버에서 받은 access_token을 'authToken'이라는 이름으로 브라우저 저장소에 저장합니다.
        localStorage.setItem('authToken', data.access_token); 
        // ▲▲▲ 핵심 수정 부분 ▲▲▲
        
        login(data.user, data.access_token); // AuthContext의 login 함수 호출
        alert("로그인 성공!"); // 사용자에게 성공 알림
        onClose(); // 모달 닫기
      } else {
        setLoginError(data.detail || "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("Login API error:", error);
      setLoginError("로그인 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.");
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupMessage(""); // 이전 메시지 초기화

    if (!signupUsername || !signupEmail || !signupPassword || !agreeTerms) {
        setSignupMessage({type: 'error', text: "모든 필수 항목을 입력하고 약관에 동의해주세요."});
        return;
    }
    if (signupPassword.length < 6) {
        setSignupMessage({type: 'error', text: "비밀번호는 6자 이상이어야 합니다."});
        return;
    }

    try {
      // 실제 API 주소로 변경해야 합니다.
      const response = await fetch("http://localhost:8000/api/v1/auth/signup", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setSignupMessage({type: 'success', text: "회원가입이 완료되었습니다! 로그인 탭에서 로그인 해주세요."});
        // 성공 시 폼 초기화 (선택 사항)
        setSignupUsername("");
        setSignupEmail("");
        setSignupPassword("");
        setAgreeTerms(false);
        setActiveTab("login"); // 로그인 탭으로 자동 전환
      } else {
        setSignupMessage({type: 'error', text: data.detail || "회원가입에 실패했습니다. 다른 아이디/이메일을 사용해보세요."});
      }
    } catch (error) {
      console.error("Signup API error:", error);
      setSignupMessage({type: 'error', text: "회원가입 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요."});
    }
  };

  // isOpen이 false이면 CSS 트랜지션을 위해 컴포넌트는 렌더링하되 보이지 않도록 처리합니다.
  // styles.cdUserModal 과 styles.isVisible 클래스로 제어합니다.
  return (
    <div 
      className={`${styles.cdUserModal} ${isOpen ? styles.isVisible : ''}`} 
      onClick={onClose} // 배경 클릭 시 모달 닫기
    >
        {/* 모달 컨텐츠 클릭 시 이벤트 버블링 방지 */}
        <div className={styles.cdUserModalContainer} onClick={(e) => e.stopPropagation()}> 
            <a className={styles.cdCloseForm} onClick={onClose}></a> {/* 닫기 버튼 */}

            {/* 탭 전환 UI */}
            <ul className={styles.cdSwitcher}>
                <li><a className={activeTab === "login" ? styles.selected : ""} onClick={() => setActiveTab("login")}>로그인</a></li>
                <li><a className={activeTab === "signup" ? styles.selected : ""} onClick={() => setActiveTab("signup")}>회원가입</a></li>
            </ul>

            {/* 로그인 폼 */}
            {activeTab === 'login' && (
                <div id="cd-login" className={styles.cdForm}>
                    <form onSubmit={handleLoginSubmit}>
                       <div className={styles.formGroup}>
                         <label htmlFor="login-username">아이디</label>
                         <input id="login-username" type="text" placeholder="아이디를 입력하세요" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                       </div>
                       <div className={styles.formGroup}>
                         <label htmlFor="login-password">비밀번호</label>
                         <input id="login-password" type={passwordVisible ? "text" : "password"} placeholder="비밀번호를 입력하세요" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                         {/* 비밀번호 보기/숨기기 기능은 필요시 추가 */}
                       </div>
                       {loginError && <p className={styles.errorMessage}>{loginError}</p>}
                       <div className={styles.formGroup}>
                        <button type="submit" className={styles.fullWidthButton}>로그인</button>
                       </div>
                    </form>
                    {/* <p className={styles.cdFormBottomMessage}><a href="#0">비밀번호를 잊으셨나요?</a></p> */}
                </div>
            )}
            
            {/* 회원가입 폼 */}
            {activeTab === 'signup' && (
                <div id="cd-signup" className={styles.cdForm}>
                    <form onSubmit={handleSignupSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="signup-username">사용자 아이디</label>
                            <input id="signup-username" type="text" placeholder="사용할 아이디를 입력하세요" required value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="signup-email">이메일</label>
                            <input id="signup-email" type="email" placeholder="이메일 주소를 입력하세요" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="signup-password">비밀번호</label>
                            <input id="signup-password" type={passwordVisible ? "text" : "password"} placeholder="비밀번호 (6자 이상)" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                        </div>
                        {signupMessage && <p className={signupMessage.type === 'success' ? styles.successMessage : styles.errorMessage}>{signupMessage.text}</p>}
                        <div className={`${styles.formGroup} ${styles.termsCheckbox}`}>
                            <input type="checkbox" id="accept-terms" required checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                            <label htmlFor="accept-terms">이용약관 및 개인정보처리방침에 동의합니다.</label>
                        </div>
                       <div className={styles.formGroup}>
                        <button type="submit" className={styles.fullWidthButton}>회원가입</button>
                       </div>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};

export default Login;