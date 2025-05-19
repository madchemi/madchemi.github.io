import React, { useState, useEffect, act } from "react";
import styles from "./Login.module.css";

const Login = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  let [animation, setAnimation] = useState('');
  useEffect(()=>{
    let a = setTimeout(()=>{setAnimation('animation')},100);
    return() => {
      clearTimeout(a);
      setAnimation('');
    }
  },[])
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
   
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      
    };
  }, [isOpen, onClose]);

  return (
    <div className="loginContainer">
      <div className={`${styles.cdUserModal} ${isOpen ? styles.isVisible : ""}`} onClick={onClose}>
        <div className={styles.cdUserModalContainer +' '+ styles.animation} onClick={(e) => e.stopPropagation()}>
          <a className={styles.cdCloseForm} onClick={onClose}>×</a>

          <ul className={styles.cdSwitcher}>
            <li>
              <a className={activeTab === "login" ? styles.selected : ""} onClick={() => setActiveTab("login")}>
                로그인
              </a>
            </li>
            <li>
              <a className={activeTab === "signup" ? styles.selected : ""} onClick={() => setActiveTab("signup")}>
                회원가입
              </a>
            </li>
          </ul>

          {activeTab === "login" && (
            <div>
              <form className={styles.cdForm}>
                <p>
                  <input type="email" placeholder="이메일" required />
                </p>

                <p>
                  <input type={passwordVisible ? "text" : "password"} placeholder="비밀번호" required />
                  <button className={styles.hidePassword} type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? "숨기기" : "보기"}
                  </button>
                </p>

                <p>
                  <input type="checkbox" id="remember-me" />
                  <label htmlFor="remember-me">아이디 저장</label>
                </p>

                <p>
                  <input type="submit" value="로그인" />
                </p>
              </form>
              
            </div>
            
            
          )}

          {activeTab === "signup" && (
            <div>
              <form className={styles.cdForm}>
                <p>
                  <input type="text" placeholder="아이디" required />
                </p>
                <p>
                  <input type="email" placeholder="이메일" required />
                </p>
                <p>
                  <input type={passwordVisible ? "text" : "password"} placeholder="비밀번호" required />
                  <button className={styles.hidePassword} type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? "숨기기" : "보기"}
                  </button>
                </p>
                <p>
                  <input type="checkbox" id="accept-terms" />
                  <label htmlFor="accept-terms">I agree to the <a href="#0">Terms</a></label>
                </p>
                <p>
                  <input type="submit" value="회원가입" />
                </p>
              </form>
            </div>
          )}

          {activeTab === "forgot" && (
            <div>
              <p>Lost your password? Please enter your email address.</p>
              <form className={styles.cdForm}>
                <p>
                  <input type="email" placeholder="E-mail" required />
                </p>
                <p>
                  <input type="submit" value="Reset password" />
                </p>
              </form>
              <p className={styles.cdFormBottomMessage}>
                <a onClick={() => setActiveTab("login")}>Back to log-in</a>
              </p>
            </div>
          )}
        </div>
        { activeTab == "login" && <p className={styles.cdFormBottomMessage}>
                <a onClick={() => setActiveTab("forgot")}>비밀번호를 잊으셨나요?</a>
              </p>}
      </div>
    </div>
    
  );
};

export default Login;
