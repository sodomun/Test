function loadTodos() {
        const stored = localStorage.getItem('todos'); // ブラウザにあるデータからtodosを取得
        return stored? JSON.parse(stored) : []; // 正常ならJSON文字列変換したものを返す
    }

function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos)) // todos配列/オブジェクトを文字列に変換. ブラウザのlocalStorageにキー名'todos'として保存
}

const inputEl = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoListEl = document.getElementById('todo-list');

addBtn.innerHTML = '<i class="fas fa-plus"></i> 追加'; // +追加ボタンアイコンの表示の修正

let todos = loadTodos();

function renderTodos() {
    todoListEl.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.classList.add('todo-text');  // クラス追加
        span.textContent = todo.text;
        if (todo.done) {
            span.classList.add('done-text');
        }

        const progressCanvas = document.createElement('canvas');
        progressCanvas.width = 70;
        progressCanvas.height = 70;

        setTimeout(() => {
    const progress = todo.progress;
    let color = '#4caf50'; // 緑（デフォルト完了）

    if (progress < 34) {
        color = '#f44336'; // 赤
    } else if (progress < 67) {
        color = '#ff9800'; // オレンジ
    } else if (progress < 100) {
        color = '#2196f3'; // 青
    }

    new Chart(progressCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [progress, 100 - progress],
                backgroundColor: [color, '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                // 中央に % を表示するプラグイン
                title: {
                    display: false,
                    text: `${progress}%`,
                    color: '#333',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    position: 'center'
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw(chart) {
                const { width } = chart;
                const { ctx } = chart;
                const text = `${progress}%`;
                ctx.restore();
                ctx.font = 'bold 14px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#333';
                ctx.fillText(text, width / 2, chart.height / 2);
                ctx.save();
            }
        }]
    });
}, 0);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = todo.progress;
        slider.addEventListener('input', () => {
            todos[index].progress = parseInt(slider.value);
            saveTodos(todos);
            renderTodos(); // 再描画してグラフも更新
        });

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.classList.add('delete-btn');
        delBtn.addEventListener('click', () => {
            todos.splice(index, 1);
            saveTodos(todos);
            renderTodos();
        });

        addBtn.innerHTML = '<i class="fas fa-plus"></i> 追加';  // 追加ボタン

        li.appendChild(span);
        li.appendChild(progressCanvas); // 円グラフ
        li.appendChild(slider);         // 進捗調整用スライダー
        li.appendChild(delBtn);
        todoListEl.appendChild(li);
    });

    updateOverallProgressBar(); // 平均バー
}

function addTodo() {
    const text = inputEl.value.trim(); // 入力欄の文字列を取得し, trim()により, 文字列の前後にあるスペース/改行を取り除く
    if (text) { // textがあれば
        todos.push({ text: text, done: false, progress: 0 }); // 配列に新しいTodoオブジェクトを追加. 初期進行度は0%
        saveTodos(todos);
        renderTodos(); // 画面を表示し直す
        inputEl.value = ''; // 入力欄を空にする
    }
}

addBtn.addEventListener('click', addTodo); // ユーザの操作に反応する処理

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enterで改行
        // PC/スマホでEnter押しても追加されないようにする
        e.preventDefault();
    }
});

// 全体の平均進捗バー
function updateOverallProgressBar() {
    const barFill = document.querySelector('.progress-bar-fill');
    if (!barFill || todos.length === 0) {
        barFill.style.width = '0%';
        return;
    }

    const total = todos.reduce((sum, todo) => sum + todo.progress, 0);
    const average = total / todos.length;
    barFill.style.width = `${average}%`;
}

renderTodos();

const themeToggleBtn = document.getElementById('theme-toggle');

function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    themeToggleBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme();
});

applyTheme(); // 初期読み込み