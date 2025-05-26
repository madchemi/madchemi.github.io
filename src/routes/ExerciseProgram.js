// ExerciseProgram.js
class ExerciseProgram {
    constructor(parentElement, exerciseData) {
        if (!parentElement || !exerciseData) {
            console.error("ExerciseProgram: 부모 요소와 운동 데이터는 필수입니다.");
            return;
        }
        this.parentElement = parentElement;
        this.exerciseData = exerciseData;

        // 상태 정의
        this.STATE_IDLE = 'idle';
        this.STATE_EXERCISING = 'exercising';
        this.STATE_PAUSED = 'paused';
        this.STATE_RESTING = 'resting';
        this.STATE_COMPLETED = 'completed';

        this.currentState = this.STATE_IDLE;
        this.currentSet = 1;
        this.timerInterval = null;
        this.currentTime = 0; // 초 단위

        this.ui = {}; // UI 요소들을 여기에 저장

        this._createDOM(); // DOM 구조 생성 및 부모에 추가
        this._initInternalUIReferences(); // 생성된 DOM 내부 요소 참조 설정
        this.init(); // 데이터 바인딩 및 이벤트 리스너 설정
    }

    _createDOM() {
        // 주 컨테이너 생성
        this.container = document.createElement('div');
        // 여러 인스턴스가 있을 경우를 대비해 유니크 ID 부여 가능 (선택 사항)
        // this.container.id = 'exerciseProgramContainer-' + Date.now(); 
        this.container.className = 'exercise-program-container';

        // 헤더 생성
        const header = document.createElement('header');
        header.className = 'ep-header';
        this.ui.exerciseNameElement = document.createElement('h1');
        this.ui.setIndicatorElement = document.createElement('span');
        header.appendChild(this.ui.exerciseNameElement);
        header.appendChild(this.ui.setIndicatorElement);
        this.container.appendChild(header);

        // 메인 콘텐츠 영역 생성
        const mainContent = document.createElement('main');
        mainContent.className = 'ep-main-content';

        const mediaArea = document.createElement('div');
        mediaArea.className = 'ep-media-area';
        this.ui.exerciseMediaElement = document.createElement('img');
        this.ui.exerciseMediaElement.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Placeholder
        this.ui.exerciseMediaElement.alt = "운동 동작";
        mediaArea.appendChild(this.ui.exerciseMediaElement);
        mainContent.appendChild(mediaArea);

        const infoArea = document.createElement('div');
        infoArea.className = 'ep-info-area';
        this.ui.timerDisplayElement = document.createElement('p');
        this.ui.timerDisplayElement.className = 'ep-timer';
        this.ui.instructionsElement = document.createElement('p');
        this.ui.instructionsElement.className = 'ep-instructions';
        infoArea.appendChild(this.ui.timerDisplayElement);
        infoArea.appendChild(this.ui.instructionsElement);
        mainContent.appendChild(infoArea);
        this.container.appendChild(mainContent);

        // 컨트롤 영역 생성
        const controls = document.createElement('footer');
        controls.className = 'ep-controls';
        this.ui.mainActionButton = document.createElement('button');
        this.ui.mainActionButton.className = 'ep-button ep-button-primary';
        this.ui.skipButton = document.createElement('button');
        this.ui.skipButton.className = 'ep-button ep-button-secondary';
        this.ui.endWorkoutButton = document.createElement('button');
        this.ui.endWorkoutButton.className = 'ep-button ep-button-danger';
        controls.appendChild(this.ui.mainActionButton);
        controls.appendChild(this.ui.skipButton);
        controls.appendChild(this.ui.endWorkoutButton);
        this.container.appendChild(controls);

        // 생성된 DOM을 부모 요소에 추가
        this.parentElement.appendChild(this.container);
    }
    
    _initInternalUIReferences() {
        // _createDOM에서 this.ui.elementName = ... 형태로 이미 참조를 할당했으므로,
        // querySelector를 다시 사용할 필요는 없습니다. 만약 _createDOM에서 할당하지 않았다면 여기서 설정합니다.
        // 예: this.ui.exerciseNameElement = this.container.querySelector('.ep-header h1'); (만약 클래스 기반으로 찾는다면)
        // 현재는 _createDOM에서 직접 할당하는 방식을 사용했습니다.
    }


    init() {
        this.ui.exerciseNameElement.textContent = this.exerciseData.name;
        this.ui.exerciseMediaElement.src = this.exerciseData.mediaUrl;
        this.ui.exerciseMediaElement.alt = `${this.exerciseData.name} 동작`;
        this.ui.instructionsElement.textContent = this.exerciseData.instructions;

        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        this.ui.mainActionButton.addEventListener('click', () => this.handleMainAction());
        this.ui.skipButton.addEventListener('click', () => this.handleSkipAction());
        this.ui.endWorkoutButton.addEventListener('click', () => this.endWorkout());
    }

    handleMainAction() {
        switch (this.currentState) {
            case this.STATE_IDLE:
                if (this.currentSet <= this.exerciseData.sets) {
                    this.startExercise();
                } else {
                    this.completeWorkout();
                }
                break;
            case this.STATE_EXERCISING:
                this.pauseExercise();
                break;
            case this.STATE_PAUSED:
                this.resumeExercise();
                break;
            case this.STATE_RESTING:
                this.startExercise();
                break;
        }
    }

    handleSkipAction() {
        switch (this.currentState) {
            case this.STATE_EXERCISING:
            case this.STATE_PAUSED:
                this.clearTimer();
                if (this.currentSet < this.exerciseData.sets) {
                    this.startRest();
                } else {
                    this.completeWorkout();
                }
                break;
            case this.STATE_RESTING:
                this.clearTimer();
                this.startExercise(); // 다음 세트 바로 시작
                break;
            case this.STATE_IDLE:
                 console.log("운동 시작 전 건너뛰기 (다음 운동으로 - 외부 연동 필요)");
                 alert("현재 운동을 건너뜁니다. (다음 운동 연동은 외부에서 처리해야 합니다)");
                 // 이 컴포넌트는 자체적으로 '다음 운동'의 개념을 알 수 없으므로,
                 // 콜백이나 이벤트를 통해 부모 환경에 알려야 합니다.
                 // 예: this.container.dispatchEvent(new CustomEvent('exerciseSkipped', { detail: this.exerciseData }));
                 // 그리고 이 컴포넌트 자체는 종료 또는 비활성화합니다.
                 this.endWorkout(true); // 건너뛰기도 일종의 종료로 처리
                 break;
        }
    }

    startExercise() {
        if (this.currentSet > this.exerciseData.sets) {
            this.completeWorkout();
            return;
        }
        this.currentState = this.STATE_EXERCISING;
        if (this.exerciseData.type === 'hold') {
            this.currentTime = this.exerciseData.duration;
            this.startTimer(() => {
                if (this.currentSet < this.exerciseData.sets) {
                    this.startRest();
                } else {
                    this.completeWorkout();
                }
            });
        } else if (this.exerciseData.type === 'reps') {
            this.currentTime = 0;
        }
        this.updateUI();
    }

    pauseExercise() {
        if (this.currentState !== this.STATE_EXERCISING) return;
        this.currentState = this.STATE_PAUSED;
        this.clearTimer();
        this.updateUI();
    }

    resumeExercise() {
        if (this.currentState !== this.STATE_PAUSED) return;
        this.currentState = this.STATE_EXERCISING;
        if (this.exerciseData.type === 'hold' && this.currentTime > 0) {
            this.startTimer(() => {
                if (this.currentSet < this.exerciseData.sets) {
                    this.startRest();
                } else {
                    this.completeWorkout();
                }
            });
        }
        this.updateUI();
    }

    startRest() {
        this.currentState = this.STATE_RESTING;
        this.currentTime = this.exerciseData.restTime;
        this.startTimer(() => {
            this.currentSet++;
            if (this.currentSet <= this.exerciseData.sets) {
                this.currentState = this.STATE_IDLE;
                 this.startExercise(); // 휴식 후 자동 시작 또는 IDLE 상태에서 버튼 클릭 대기
            } else {
                this.completeWorkout();
            }
        });
        this.updateUI();
    }

    completeWorkout() {
        this.currentState = this.STATE_COMPLETED;
        this.clearTimer();
        this.updateUI();
        // alert(`${this.exerciseData.name} 운동 완료! 수고하셨습니다.`);
        // 완료 이벤트를 발생시켜 부모 환경에서 다음 동작을 결정하도록 할 수 있음
        this.container.dispatchEvent(new CustomEvent('workoutCompleted', { detail: { exercise: this.exerciseData.name, status: 'completed' } }));
    }
    
    endWorkout(isSkipped = false) {
        this.clearTimer();
        const finalState = isSkipped ? 'skipped' : 'ended';
        this.currentState = this.STATE_COMPLETED; // 내부 상태는 완료로 통일
        this.ui.mainActionButton.disabled = true;
        this.ui.skipButton.disabled = true;
        // alert(isSkipped ? "운동을 건너뛰었습니다." : "운동을 종료합니다.");
        this.updateUI(); // 버튼 비활성화 등 반영
        this.container.dispatchEvent(new CustomEvent('workoutEnded', { detail: { exercise: this.exerciseData.name, status: finalState } }));
        // 원한다면 여기서 this.container.remove()를 호출하여 DOM에서 컴포넌트 자체를 제거할 수도 있습니다.
    }

    startTimer(onComplete) {
        this.clearTimer();
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            if (this.currentTime <= 0) {
                this.clearTimer();
                if (onComplete) onComplete();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateTimerDisplay() {
        if (this.exerciseData.type === 'hold' || this.currentState === this.STATE_RESTING) {
            this.ui.timerDisplayElement.textContent = this.formatTime(this.currentTime);
        } else if (this.exerciseData.type === 'reps' && this.currentState === this.STATE_EXERCISING) {
            this.ui.timerDisplayElement.textContent = `${this.exerciseData.reps}회 목표`;
        } else {
            this.ui.timerDisplayElement.textContent = this.formatTime(0);
        }
    }

    updateUI() {
        this.updateTimerDisplay();
        this.ui.setIndicatorElement.textContent = `${this.currentSet} / ${this.exerciseData.sets} 세트`;

        switch (this.currentState) {
            case this.STATE_IDLE:
                this.ui.mainActionButton.textContent = (this.currentSet <= this.exerciseData.sets) ? `세트 시작 (${this.currentSet}/${this.exerciseData.sets})` : '운동 완료';
                this.ui.mainActionButton.disabled = false;
                this.ui.skipButton.textContent = '운동 건너뛰기';
                this.ui.skipButton.disabled = false;
                if (this.exerciseData.type === 'hold') {
                    this.ui.timerDisplayElement.textContent = this.formatTime(this.exerciseData.duration);
                } else {
                     this.ui.timerDisplayElement.textContent = `${this.exerciseData.reps}회 목표`;
                }
                break;
            case this.STATE_EXERCISING:
                this.ui.mainActionButton.textContent = (this.exerciseData.type === 'hold') ? '일시정지' : '세트 완료';
                this.ui.mainActionButton.disabled = false;
                this.ui.skipButton.textContent = '세트 건너뛰기';
                this.ui.skipButton.disabled = false;
                break;
            case this.STATE_PAUSED:
                this.ui.mainActionButton.textContent = '계속하기';
                this.ui.mainActionButton.disabled = false;
                this.ui.skipButton.textContent = '세트 건너뛰기';
                this.ui.skipButton.disabled = false;
                break;
            case this.STATE_RESTING:
                const nextSetLabel = this.currentSet + 1 > this.exerciseData.sets ? '마지막' : this.currentSet + 1;
                this.ui.mainActionButton.textContent = `다음 세트 (${nextSetLabel}/${this.exerciseData.sets})`;
                this.ui.mainActionButton.disabled = false;
                this.ui.skipButton.textContent = '휴식 건너뛰기';
                this.ui.skipButton.disabled = false;
                break;
            case this.STATE_COMPLETED:
                this.ui.mainActionButton.textContent = '운동 완료됨';
                this.ui.mainActionButton.disabled = true;
                this.ui.skipButton.textContent = '건너뛰기';
                this.ui.skipButton.disabled = true;
                this.ui.timerDisplayElement.textContent = "수고하셨습니다!";
                this.ui.setIndicatorElement.textContent = `총 ${this.exerciseData.sets}세트 완료`;
                break;
        }
         this.ui.endWorkoutButton.disabled = (this.currentState === this.STATE_COMPLETED);
         this.ui.endWorkoutButton.textContent = "운동 종료";
    }
}

/*
// ExerciseProgram.js 사용 예시:
// 이 코드는 ExerciseProgram.js 파일 자체에 포함되는 것이 아니라,
// 이 컴포넌트를 사용하는 다른 HTML 파일이나 JavaScript 파일에서 실행됩니다.

// 1. ExerciseProgram.css 와 ExerciseProgram.js 를 HTML에 포함시킵니다.
// <link rel="stylesheet" href="ExerciseProgram.css">
// <script src="ExerciseProgram.js"></script>

// 2. 컴포넌트를 추가할 부모 요소를 HTML에 만듭니다.
// <div id="my-exercise-container"></div>

// 3. JavaScript에서 ExerciseProgram 인스턴스를 생성합니다.
document.addEventListener('DOMContentLoaded', () => {
    const exerciseContainer = document.getElementById('my-exercise-container'); // 예시 부모 요소 ID
    
    if (exerciseContainer) {
        const sampleExerciseData = {
            name: "벽 밀기 (Wall Push-up)",
            mediaUrl: "https://media.istockphoto.com/id/1165802093/ko/%EB%B2%A1%ED%84%B0/%EC%97%AC%EC%9E%90%EB%8A%94-%ED%91%B8%EC%8B%9C-%EC%97%85-%EC%9A%B4%EB%8F%99%EC%9D%84-%ED%95%9C%EB%8B%A4-%ED%94%BC%ED%8A%B8%EB%8B%88%EC%8A%A4-%EC%9A%B4%EB%8F%99-%EC%97%AC%EC%9E%90-%EC%BA%90%EB%A6%AD%ED%84%B0%EC%9E%85%EB%8B%88%EB%8B%A4-%ED%9D%B0%EC%83%89-%EB%B0%B0%EA%B2%BD%EC%97%90-%EA%B3%A0%EB%A6%BD%EB%90%9C-%EB%B2%A1%ED%84%B0-%EC%9D%BC%EB%9F%AC%EC%8A%A4%ED%8A%B8-%EB%A0%88%EC%9D%B4%EC%85%98.jpg?s=612x612&w=0&k=20&c=_g1gVjS3sYfK8Xg8d_9m3b3jHjQ_xKl7n8zT2o9W4P0=", // 실제 GIF/Video URL
            type: "reps", // 'hold' (유지), 'reps' (반복)
            reps: 10,     // 'reps' 타입일 경우 반복 횟수
            duration: 0,  // 'hold' 타입일 경우 유지 시간 (초)
            sets: 3,
            restTime: 20, // 세트 간 휴식 시간 (초)
            instructions: "어깨너비로 팔을 벌리고 벽을 밀어내세요. 팔꿈치가 완전히 펴지지 않도록 주의합니다."
        };

        const program = new ExerciseProgram(exerciseContainer, sampleExerciseData);

        // 컴포넌트에서 발생하는 이벤트 리스닝 예시
        program.container.addEventListener('workoutCompleted', (event) => {
            console.log('운동 완료 이벤트:', event.detail);
            // 여기서 다음 운동을 로드하거나, 사용자에게 완료 메시지를 표시할 수 있습니다.
            // 예: exerciseContainer.innerHTML = `<h2>${event.detail.exercise} 완료! 다음 운동 준비 중...</h2>`;
        });
        program.container.addEventListener('workoutEnded', (event) => {
            console.log('운동 종료/건너뛰기 이벤트:', event.detail);
             if (event.detail.status === 'skipped') {
                alert(`${event.detail.exercise} 운동을 건너뛰었습니다.`);
             } else {
                alert(`${event.detail.exercise} 운동이 종료되었습니다.`);
             }
            // 필요시 컴포넌트 DOM 제거: program.container.remove();
        });

    } else {
        console.error("운동 프로그램을 추가할 부모 요소를 찾을 수 없습니다.");
    }
});
*/