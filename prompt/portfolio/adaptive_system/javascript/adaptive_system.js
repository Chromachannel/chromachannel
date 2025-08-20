document.addEventListener('DOMContentLoaded', () => {

    // --- STATE (状態管理) ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
        skillLevel: 'intermediate',
        averageTaskTime: 45,
        bestWorkingHours: [9, 10, 14, 15]
    };
    let activeView = 'tasks';
    let currentTime = new Date();

    // --- DOM ELEMENTS (HTML要素の取得) ---
    const tasksView = document.getElementById('tasks-view');
    const analyticsView = document.getElementById('analytics-view');
    const btnViewTasks = document.getElementById('btn-view-tasks');
    const btnViewAnalytics = document.getElementById('btn-view-analytics');
    const optimizationBanner = document.getElementById('optimization-banner');
    const optimizationSuggestion = document.getElementById('optimization-suggestion');
    const addTaskForm = document.getElementById('add-task-form');
    const newTaskTitleInput = document.getElementById('new-task-title');
    const newTaskDescInput = document.getElementById('new-task-desc');
    const pendingTasksList = document.getElementById('pending-tasks-list');
    const inprogressTasksList = document.getElementById('inprogress-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const profileForm = document.getElementById('profile-form');
    const skillLevelSelect = document.getElementById('skill-level-select');
    const avgTimeInput = document.getElementById('avg-time-input');
    const bestHoursInput = document.getElementById('best-hours-input');

    // --- LOGIC (ロジック関数) ---
    const saveState = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    };

    const calculateAdaptiveDifficulty = () => {
        const currentHour = currentTime.getHours();
        const isOptimalTime = userProfile.bestWorkingHours.includes(currentHour);
        if (userProfile.skillLevel === 'beginner') return isOptimalTime ? 'easy' : 'very-easy';
        if (userProfile.skillLevel === 'advanced') return isOptimalTime ? 'hard' : 'medium';
        return isOptimalTime ? 'medium' : 'easy';
    };

    const calculateRecommendedTime = (difficulty) => {
        const baseTime = userProfile.averageTaskTime;
        const multipliers = { 'very-easy': 0.5, 'easy': 0.7, 'medium': 1.0, 'hard': 1.5, 'very-hard': 2.0 };
        return Math.round(baseTime * (multipliers[difficulty] || 1.0));
    };

    const getCurrentOptimization = () => {
        const currentHour = currentTime.getHours();
        const isOptimal = userProfile.bestWorkingHours.includes(currentHour);
        return {
            isOptimal,
            suggestion: isOptimal
                ? '最適な作業時間です！集中してタスクに取り組みましょう'
                : '集中しやすい時間帯ではありません。簡単なタスクから始めることをお勧めします'
        };
    };

    // --- ACTIONS (ユーザー操作に対する処理) ---
    const addTask = (e) => {
        e.preventDefault();
        const title = newTaskTitleInput.value.trim();
        if (!title) return;
        const difficulty = calculateAdaptiveDifficulty();
        const newTask = {
            id: Date.now(),
            title: title,
            description: newTaskDescInput.value.trim(),
            difficulty: difficulty,
            recommendedTime: calculateRecommendedTime(difficulty),
            createdAt: new Date().toISOString(),
            status: 'pending',
            startTime: null,
            actualTime: 0
        };
        tasks.push(newTask);
        newTaskTitleInput.value = '';
        newTaskDescInput.value = '';
        saveState();
        render();
    };

    const startTask = (taskId) => {
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, status: 'in-progress', startTime: new Date().toISOString() } : task
        );
        saveState();
        render();
    };

    const completeTask = (taskId) => {
        let completedTaskInstance = null;
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                const startTime = new Date(task.startTime);
                const actualTime = Math.round((new Date() - startTime) / 60000);
                completedTaskInstance = { ...task, status: 'completed', completedAt: new Date().toISOString(), actualTime: actualTime || task.recommendedTime };
                return completedTaskInstance;
            }
            return task;
        });
        if (completedTaskInstance) updateUserProfile(completedTaskInstance);
        saveState();
        render();
    };

    const updateUserProfile = () => {
        const allCompletedTasks = tasks.filter(t => t.status === 'completed');
        const totalCompleted = allCompletedTasks.length;
        const newCompletionRate = tasks.length > 0 ? totalCompleted / tasks.length : 0;
        const newAverageTime = totalCompleted > 0 ? Math.round(allCompletedTasks.reduce((sum, t) => sum + t.actualTime, 0) / totalCompleted) : userProfile.averageTaskTime;
        userProfile.completionRate = isNaN(newCompletionRate) ? (userProfile.completionRate || 0) : newCompletionRate;
        userProfile.averageTaskTime = isNaN(newAverageTime) ? userProfile.averageTaskTime : newAverageTime;
    };
    
    const openSettingsModal = () => {
        skillLevelSelect.value = userProfile.skillLevel;
        avgTimeInput.value = userProfile.averageTaskTime;
        bestHoursInput.value = userProfile.bestWorkingHours.join(', ');
        settingsModal.classList.remove('hidden');
    };

    const closeSettingsModal = () => settingsModal.classList.add('hidden');

    const saveProfileSettings = (e) => {
        e.preventDefault();
        userProfile.skillLevel = skillLevelSelect.value;
        userProfile.averageTaskTime = Number(avgTimeInput.value);
        userProfile.bestWorkingHours = bestHoursInput.value.trim().split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 23);
        saveState();
        closeSettingsModal();
        render();
    };

    // --- RENDER (描画関数) ---
    const render = () => {
        tasksView.classList.toggle('hidden', activeView !== 'tasks');
        analyticsView.classList.toggle('hidden', activeView !== 'analytics');
        btnViewTasks.classList.toggle('active', activeView === 'tasks');
        btnViewAnalytics.classList.toggle('active', activeView !== 'analytics');

        const optimization = getCurrentOptimization();
        optimizationSuggestion.textContent = optimization.suggestion;
        optimizationBanner.className = 'optimization-banner';
        optimizationBanner.classList.add(optimization.isOptimal ? 'optimal' : 'suboptimal');

        if (activeView === 'tasks') renderTaskLists();
        else renderAnalytics();

        lucide.createIcons();
    };

    const renderTaskLists = () => {
        pendingTasksList.innerHTML = '';
        inprogressTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskCardHTML = createTaskCard(task);
            if (task.status === 'pending') pendingTasksList.innerHTML += taskCardHTML;
            else if (task.status === 'in-progress') inprogressTasksList.innerHTML += taskCardHTML;
            else completedTasksList.innerHTML = taskCardHTML + completedTasksList.innerHTML;
        });
    };
    
    const createTaskCard = (task) => {
        const difficultyClass = `difficulty-${task.difficulty.replace(' ', '-')}`;
        if (task.status === 'pending') return `<div class="task-card ${difficultyClass}" data-task-id="${task.id}"><h4>${task.title}</h4><p>${task.description || ' '}</p><div class="task-meta"><div class="task-meta-left"><i data-lucide="clock"></i><span>推奨: ${task.recommendedTime}分</span><span class="difficulty-badge">${task.difficulty}</span></div><button class="btn btn-secondary start-btn">開始</button></div></div>`;
        if (task.status === 'in-progress') {
            const elapsed = Math.round((currentTime - new Date(task.startTime)) / 60000);
            const progress = Math.min((elapsed / task.recommendedTime) * 100, 100);
            return `<div class="task-card task-inprogress ${difficultyClass}" data-task-id="${task.id}"><h4>${task.title}</h4><p>${task.description || ' '}</p><div class="task-inprogress-meta"><span>経過: ${elapsed}分 / ${task.recommendedTime}分</span><div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progress}%"></div></div></div><button class="btn btn-complete complete-btn">完了</button></div>`;
        }
        if (task.status === 'completed') return `<div class="task-card task-completed" data-task-id="${task.id}"><h4><i data-lucide="check-circle"></i> ${task.title}</h4><p>${task.description || ' '}</p><div class="actual-time">実際の時間: ${task.actualTime}分 (推奨: ${task.recommendedTime}分)</div></div>`;
        return '';
    };

    const renderAnalytics = () => {
        updateUserProfile();
        document.getElementById('profile-skill').textContent = userProfile.skillLevel;
        document.getElementById('profile-completion').textContent = `${Math.round((userProfile.completionRate || 0) * 100)}%`;
        document.getElementById('profile-avg-time').textContent = `${userProfile.averageTaskTime}分`;
        document.getElementById('profile-best-hours').textContent = `${userProfile.bestWorkingHours.join(', ')}時`;
        
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const inprogressCount = tasks.filter(t => t.status === 'in-progress').length;
        const pendingCount = tasks.filter(t => t.status === 'pending').length;
        document.getElementById('stats-total').textContent = tasks.length;
        document.getElementById('stats-completed').textContent = completedCount;
        document.getElementById('stats-inprogress').textContent = inprogressCount;
        document.getElementById('stats-pending').textContent = pendingCount;

        document.getElementById('suggestion-pattern').textContent = `あなたの完了率は${Math.round((userProfile.completionRate || 0) * 100)}%です。平均作業時間は${userProfile.averageTaskTime}分で、${userProfile.bestWorkingHours.join('時、')}時の時間帯で最も効率的に作業されています。`;
        document.getElementById('suggestion-improvement').textContent = '最適な作業時間帯により多くのタスクを配分することで、生産性を約15-20%向上させることができると予測されます。';
    };

    // --- EVENT LISTENERS (イベントリスナーの設定) ---
    addTaskForm.addEventListener('submit', addTask);
    btnViewTasks.addEventListener('click', () => { activeView = 'tasks'; render(); });
    btnViewAnalytics.addEventListener('click', () => { activeView = 'analytics'; render(); });
    tasksView.addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        const taskId = Number(taskCard.dataset.taskId);
        if (e.target.matches('.start-btn')) startTask(taskId);
        else if (e.target.matches('.complete-btn')) completeTask(taskId);
    });
    settingsBtn.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    profileForm.addEventListener('submit', saveProfileSettings);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
    
    setInterval(() => { currentTime = new Date(); if(activeView === 'tasks') render(); }, 60000);

    // --- INITIALIZATION (初期化) ---
    render();
});