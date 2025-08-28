/* src/main/resources/static/js/script.js  */

/**
 * @file 투두리스트 프론트엔드 메인 로직
 * @description 서버 API와 통신하여 투두리스트의 CRUD(생성, 읽기, 수정, 삭제) 및 필터링 기능을 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 상수 및 DOM 요소 선언 ---
    const API_URL = 'http://localhost:8080/api/todos';
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const filterContainer = document.querySelector('.filter-container');
    const showAllBtn = document.getElementById('show-all');

    // --- 2. API 통신 및 핵심 로직 함수 (async/await 스타일로 통일) ---

    /**
     * 서버 API 호출을 위한 범용 헬퍼 함수
     */
    async function fetchHelper(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '서버 응답이 올바르지 않습니다.' }));
            throw new Error(errorData.message || `HTTP 에러! 상태 코드: ${response.status}`);
        }
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null; // 내용(body)이 없는 성공 응답(204 No Content 등) 처리
        }
        return response.json();
    }

    /**
     * 서버에서 투두 목록을 가져와 화면에 렌더링
     */
    async function fetchTodos(filter = 'all') {
        let url = API_URL;
        if (filter === 'incomplete') url = `${API_URL}/incomplete`;
        else if (filter === 'completed') url = `${API_URL}/completed`;

        try {
            const todos = await fetchHelper(url);
            todoList.innerHTML = ''; // 기존 목록 초기화
            todos.forEach(addTodoToList);
        } catch (error) {
            console.error('투두리스트 로딩 오류:', error);
            alert(`목록을 불러오지 못했습니다: ${error.message}`);
        }
    }

    /**
     * '추가' 버튼 클릭 또는 'Enter' 키 입력 시 새로운 투두를 생성
     */
    async function handleAddTodo() {
        const title = todoInput.value.trim();
        if (title === '') {
            alert('할 일을 입력해주세요.');
            return;
        }

        try {
            await fetchHelper(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            todoInput.value = ''; // 입력창 비우기
            updateListBasedOnFilter(); // 현재 필터 기준으로 목록 새로고침
        } catch (error) {
            console.error('투두 추가 오류:', error);
            alert(`투두를 추가하지 못했습니다: ${error.message}`);
        }
    }

    /**
     * 수정된 내용을 서버에 저장
     */
    async function saveTodo(id, newTitle) {
        if (newTitle.trim() === '') {
            alert('할 일 내용은 비워둘 수 없습니다.');
            return;
        }
        try {
            await fetchHelper(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle }),
            });
            updateListBasedOnFilter();
        } catch (error) {
            console.error('투두 업데이트 오류:', error);
            alert(`업데이트에 실패했습니다: ${error.message}`);
            updateListBasedOnFilter(); // 실패 시 목록 원상 복구
        }
    }

    /**
     * 투두 항목의 완료/미완료 상태를 토글
     */
    async function toggleTodo(id) {
        try {
            await fetchHelper(`${API_URL}/${id}/toggle`, { method: 'PATCH' });
            updateListBasedOnFilter();
        } catch (error) {
            console.error('투두 상태 토글 오류:', error);
            alert(`상태 변경에 실패했습니다: ${error.message}`);
        }
    }

    /**
     * 투두 항목을 삭제
     */
    async function deleteTodo(id) {
        // 확인 창은 이벤트 핸들러에서 직접 처리
        try {
            await fetchHelper(`${API_URL}/${id}`, { method: 'DELETE' });
            // 화면 갱신은 updateListBasedOnFilter에 맡기거나 직접 엘리먼트 제거
            // 여기서는 일관성을 위해 전체 목록을 새로고침합니다.
            updateListBasedOnFilter();
        } catch (error) {
            console.error('투두 삭제 오류:', error);
            alert(`삭제에 실패했습니다: ${error.message}`);
        }
    }

    // --- 3. DOM 조작 및 렌더링 함수 ---

    /**
     * 투두 객체 하나를 받아 LI 태그로 만들어 목록에 추가
     */
    function addTodoToList(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id; // 이벤트 위임을 위해 ID를 데이터 속성에 저장
        li.className = todo.completed ? 'completed' : '';

        const todoText = document.createElement('span');
        todoText.className = 'todo-text';
        todoText.textContent = todo.title;
        if (todo.completed) {
            todoText.classList.add('completed-text');
        }

        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '수정';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = todo.completed ? '미완료' : '완료';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';

        // '수정' 기능은 상태(원래 제목)를 알아야 하므로 개별 리스너를 유지하는 것이 간단
        editBtn.addEventListener('click', () => editTodo(todo, li, todoText, actionButtons));

        actionButtons.append(editBtn, toggleBtn, deleteBtn);
        li.append(todoText, actionButtons);
        todoList.appendChild(li);
    }

    /**
     * 특정 투두 항목을 '수정 모드'로 변경 (기존 로직 유지)
     */
    function editTodo(todo, li, todoText, actionButtons) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = todo.title;
        editInput.className = 'edit-input';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = '저장';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = '취소';

        li.replaceChild(editInput, todoText);
        actionButtons.innerHTML = '';
        actionButtons.append(saveBtn, cancelBtn);
        editInput.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveTodo(todo.id, editInput.value);
            } else if (event.key === 'Escape') {
                updateListBasedOnFilter();
            }
        };

        editInput.addEventListener('keydown', handleKeyDown);
        saveBtn.addEventListener('click', () => saveTodo(todo.id, editInput.value));
        cancelBtn.addEventListener('click', () => updateListBasedOnFilter());
    }

    /**
     * 현재 활성화된 필터를 기준으로 목록을 업데이트하는 함수
     */
    function updateListBasedOnFilter() {
        const activeFilterBtn = document.querySelector('.filter-container button.active');
        const filter = activeFilterBtn.id.replace('show-', '');
        fetchTodos(filter);
    }

    /**
     * 필터 버튼의 활성 상태를 시각적으로 변경하는 함수
     */
    function setActiveFilter(activeButton) {
        document.querySelectorAll('.filter-container button').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    // --- 4. 이벤트 리스너 설정 및 초기화 ---

    // 할 일 추가 이벤트
    addButton.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleAddTodo();
    });

    // 필터 버튼 클릭 이벤트 (이벤트 위임)
    filterContainer.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('button');
        if (!clickedButton) return;

        const filter = clickedButton.id.replace('show-', '');
        setActiveFilter(clickedButton);
        fetchTodos(filter);
    });

    // 할 일 목록의 버튼 클릭 이벤트 (이벤트 위임)
    todoList.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (!li) return;

        const id = Number(li.dataset.id);
        const targetClass = event.target.className;

        if (targetClass === 'toggle-btn') {
            toggleTodo(id);
        } else if (targetClass === 'delete-btn') {
            if (confirm("정말로 삭제하시겠습니까?")) {
                deleteTodo(id);
            }
        }
    });

    // --- 5. 페이지 최초 로드 시 실행 ---
    function initialize() {
        setActiveFilter(showAllBtn); // '모두' 버튼을 기본 활성 상태로 설정
        fetchTodos(); // 전체 목록을 불러오며 시작
    }

    initialize();
});