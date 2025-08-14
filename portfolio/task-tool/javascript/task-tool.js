document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const difficultySelect = document.getElementById('difficulty-select');
    const taskList = document.getElementById('task-list');
    const filterControls = document.querySelector('.filter-controls');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const feedbackMessage = document.getElementById('feedback-message');

    // タスクを管理する配列（ローカルストレージから読み込む）
    let tasks = JSON.parse(localStorage.getItem('userTasks')) || [];
    let currentFilter = 'all';

    // イベントリスナー
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            difficulty: difficultySelect.value,
            completed: false,
        };

        tasks.push(newTask);
        taskInput.value = '';
        saveAndRender();
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.matches('.complete-btn, .complete-btn *')) {
            const id = Number(e.target.closest('.task-item').dataset.id);
            toggleComplete(id);
        }
        if (e.target.matches('.delete-btn, .delete-btn *')) {
            const id = Number(e.target.closest('.task-item').dataset.id);
            deleteTask(id);
        }
    });

    filterControls.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });

    // 関数
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                showFeedback(task.difficulty);
            }
            saveAndRender();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('userTasks', JSON.stringify(tasks));
        renderTasks();
        updateProgress();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="no-tasks">タスクはありません。</li>';
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.difficulty} ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.id = task.id;

                taskItem.innerHTML = `
                    <div class="task-content">
                        <button class="complete-btn">${task.completed ? '✅' : '⬜️'}</button>
                        <span class="task-text">${task.text}</span>
                    </div>
                    <div class="task-buttons">
                        <button class="delete-btn">🗑️</button>
                    </div>
                `;
                taskList.appendChild(taskItem);
            });
        }
    }
    
    function updateProgress() {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        progressBar.value = progress;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    function showFeedback(difficulty) {
        let message = '';
        switch(difficulty) {
            case 'easy': message = 'よくできました！簡単なタスクも大事な一歩です！'; break;
            case 'normal': message = '素晴らしい！順調に進んでいますね！'; break;
            case 'hard': message = 'すごい！難しいタスクをやり遂げましたね！'; break;
        }
        
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message show ${difficulty}`;
        setTimeout(() => {
            feedbackMessage.classList.remove('show');
        }, 3000);
    }

    // 初期描画
    saveAndRender();
});