document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル変数 ---
    let currentCalendarDate = new Date();
    let selectedDay = null;
    let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let timerInterval;
    let timerRunning = false;
    let timerPaused = false;
    let timerSeconds = 0;
    let timerMode = 'up';
    let timerSound = localStorage.getItem('timerSound') || null;
    let currentAudio = null;

    // --- DOM要素 ---
    const currentTimeEl = document.getElementById('current-time');
    const currentDateEl = document.getElementById('current-date');
    const monthYearEl = document.getElementById('month-year');
    const calendarGridEl = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const modal = document.getElementById('event-modal');
    const modalDateEl = document.getElementById('modal-date');
    const eventTitleInput = document.getElementById('event-title');
    const eventDetailsInput = document.getElementById('event-details');
    const cancelEventBtn = document.getElementById('cancel-event');
    const saveEventBtn = document.getElementById('save-event');
    const timerDisplayEl = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const setTimerBtn = document.getElementById('set-timer');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const timerModeRadios = document.querySelectorAll('input[name="timer-mode"]');
    const soundInput = document.getElementById('timer-sound');
    const testSoundBtn = document.getElementById('test-sound');
    const stopSoundBtn = document.getElementById('stop-sound');
    const removeSoundBtn = document.getElementById('remove-sound');

    // --- 関数 ---
    function updateDateTime() {
        const now = new Date();
        currentTimeEl.textContent = now.toLocaleTimeString('ja-JP');
        currentDateEl.textContent = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }

    function updateCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        monthYearEl.textContent = `${year}年${month + 1}月`;
        calendarGridEl.innerHTML = '';
        
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarGridEl.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDay; i++) {
            calendarGridEl.insertAdjacentHTML('beforeend', '<div class="day empty"></div>');
        }

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        for (let i = 1; i <= lastDate; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            const dayOfWeek = new Date(year, month, i).getDay();
            if (dayOfWeek === 0) dayElement.classList.add('sunday');
            if (dayOfWeek === 6) dayElement.classList.add('saturday');
            if (isCurrentMonth && i === today.getDate()) dayElement.classList.add('today');
            
            dayElement.textContent = i;
            const dateKey = `${year}-${month + 1}-${i}`;
            if (calendarEvents[dateKey]) {
                dayElement.classList.add('has-event');
            }

            dayElement.addEventListener('click', () => {
                selectedDay = new Date(year, month, i);
                openEventModal();
            });
            calendarGridEl.appendChild(dayElement);
        }
    }

    function openEventModal() {
        modal.style.display = 'flex';
        modalDateEl.textContent = `${selectedDay.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 予定追加`;
        const dateKey = `${selectedDay.getFullYear()}-${selectedDay.getMonth() + 1}-${selectedDay.getDate()}`;
        eventTitleInput.value = calendarEvents[dateKey]?.title || '';
        eventDetailsInput.value = calendarEvents[dateKey]?.details || '';
    }

    function closeEventModal() {
        modal.style.display = 'none';
    }

    function saveEvent() {
        const title = eventTitleInput.value.trim();
        const details = eventDetailsInput.value.trim();
        const dateKey = `${selectedDay.getFullYear()}-${selectedDay.getMonth() + 1}-${selectedDay.getDate()}`;
        if (title || details) {
            calendarEvents[dateKey] = { title, details };
        } else {
            delete calendarEvents[dateKey];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
        updateCalendar();
        closeEventModal();
    }

    function updateTimerDisplay() {
        const h = Math.floor(Math.abs(timerSeconds) / 3600);
        const m = Math.floor((Math.abs(timerSeconds) % 3600) / 60);
        const s = Math.abs(timerSeconds) % 60;
        timerDisplayEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function startTimer() {
        if (timerRunning && timerPaused) {
            timerPaused = false;
        } else if (!timerRunning) {
            timerRunning = true;
        }
        startTimerBtn.textContent = '再開';
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        timerInterval = setInterval(() => {
            timerMode === 'up' ? timerSeconds++ : timerSeconds--;
            updateTimerDisplay();
            if (timerMode === 'down' && timerSeconds < 0) {
                playTimerSound();
                resetTimer();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        if (timerRunning && !timerPaused) {
            clearInterval(timerInterval);
            timerPaused = true;
            startTimerBtn.disabled = false;
            pauseTimerBtn.disabled = true;
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = false;
        timerSeconds = 0;
        updateTimerDisplay();
        startTimerBtn.textContent = 'スタート';
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
    }

    function setTimerFromInput() {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;
        const s = parseInt(secondsInput.value) || 0;
        timerSeconds = h * 3600 + m * 60 + s;
        if (timerMode === 'down' && timerSeconds <= 0) {
            alert('カウントダウンには1秒以上の時間を設定してください');
            timerSeconds = 0;
        }
        resetTimer();
        updateTimerDisplay();
    }
    
    function playTimerSound() {
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (timerSound) {
            currentAudio = new Audio(timerSound);
            currentAudio.play().catch(e => console.error("Audio play failed:", e));
            stopSoundBtn.disabled = false;
        } else {
            alert('タイマーが終了しました！');
        }
    }
    
    function stopTimerSound() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        stopSoundBtn.disabled = true;
    }

    // --- イベントリスナー ---
    setInterval(updateDateTime, 1000);
    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        updateCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        updateCalendar();
    });
    saveEventBtn.addEventListener('click', saveEvent);
    cancelEventBtn.addEventListener('click', closeEventModal);
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    setTimerBtn.addEventListener('click', setTimerFromInput);
    timerModeRadios.forEach(r => r.addEventListener('change', e => {
        timerMode = e.target.value;
        resetTimer();
        if (timerMode === 'down') setTimerFromInput();
    }));
    soundInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                timerSound = e.target.result;
                localStorage.setItem('timerSound', timerSound);
                testSoundBtn.disabled = false;
                removeSoundBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });
    testSoundBtn.addEventListener('click', playTimerSound);
    stopSoundBtn.addEventListener('click', stopTimerSound);
    removeSoundBtn.addEventListener('click', () => {
        timerSound = null;
        localStorage.removeItem('timerSound');
        soundInput.value = '';
        testSoundBtn.disabled = true;
        removeSoundBtn.disabled = true;
        stopTimerSound();
    });

    // --- 初期化 ---
    updateDateTime();
    updateCalendar();
    if (timerSound) {
        testSoundBtn.disabled = false;
        removeSoundBtn.disabled = false;
    }
});