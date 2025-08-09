/**
 * @file 투두리스트 프론트엔드 메인 로직
 * @description 서버 API와 통신하여 투두리스트의 CRUD(생성, 읽기, 수정, 삭제) 및 필터링 기능을 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 변수 선언 ---
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const showAllBtn = document.getElementById('show-all');
    const showIncompleteBtn = document.getElementById('show-incomplete');
    const showCompletedBtn = document.getElementById('show-completed');

    // 백엔드 API 서버의 기본 주소
    const API_URL = 'http://localhost:8080/api/todos';

    /**
     * 서버 API 호출을 위한 헬퍼 함수
     * @param {string} url - 요청을 보낼 URL
     * @param {object} [options] - fetch 함수에 전달할 옵션 (method, headers, body 등)
     * @returns {Promise<any>} 성공 시 JSON 응답 객체, 실패 시 에러 발생
     */
    async function fetchHelper(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '서버와 통신에 실패했습니다.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // 내용(body)이 없는 성공 응답(204 No Content 등)을 처리
        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return null;
        }
        return response.json();
    }

    /**
     * 서버에서 투두 목록을 가져와 화면에 렌더링
     * @param {string} [filter='all'] - 필터 종류 ('all', 'incomplete', 'completed')
     */
    function fetchTodos(filter = 'all') {
        let url = API_URL;
        if (filter === 'incomplete') url = `${API_URL}/incomplete`;
        else if (filter === 'completed') url = `${API_URL}/completed`;

        fetchHelper(url)
            .then(todos => {
                todoList.innerHTML = ''; // 기존 목록 초기화
                todos.forEach(todo => addTodoToList(todo));
            })
            .catch(error => {
                console.error('투두리스트 로딩 오류:', error);
                alert(`목록을 불러오지 못했습니다: ${error.message}`);
            });
    }

    /**
     * 투두 객체 하나를 받아 LI 태그로 만들어 목록에 추가
     * @param {object} todo - 투두 데이터 객체 {id, title, completed}
     */
    function addTodoToList(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.className = todo.completed ? 'completed' : '';

        const todoText = document.createElement('span');
        todoText.className = 'todo-text';
        todoText.textContent = todo.title;
        if (todo.completed) {
            todoText.classList.add('completed-text');
        }

        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';

        // 버튼 생성
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '수정';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = todo.completed ? '미완료' : '완료';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';

        actionButtons.append(editBtn, toggleBtn, deleteBtn);
        li.append(todoText, actionButtons);
        todoList.appendChild(li);

        // 각 버튼에 이벤트 리스너 할당
        editBtn.addEventListener('click', () => editTodo(todo, li, todoText, actionButtons));
        toggleBtn.addEventListener('click', () => toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));
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
     * 특정 투두 항목을 '수정 모드'로 변경
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

        // 수정 입력창에서 Enter(저장) 또는 Escape(취소) 키 입력 처리
        editInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveTodo(todo.id, editInput.value);
            } else if (event.key === 'Escape') {
                updateListBasedOnFilter();
            }
        });

        saveBtn.addEventListener('click', () => saveTodo(todo.id, editInput.value));
        cancelBtn.addEventListener('click', () => updateListBasedOnFilter());
    }

    /**
     * 수정된 내용을 서버에 저장
     * @param {number} id - 수정할 투두의 ID
     * @param {string} newTitle - 새로운 할 일 내용
     */
    function saveTodo(id, newTitle) {
        if (newTitle.trim() === '') {
            alert('할 일 내용은 비워둘 수 없습니다.');
            return;
        }
        fetchHelper(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle }),
        })
            .then(() => updateListBasedOnFilter())
            .catch(error => {
                console.error('투두 업데이트 오류:', error);
                alert(`업데이트에 실패했습니다: ${error.message}`);
                updateListBasedOnFilter(); // 실패 시 목록 원상 복구
            });
    }

    /**
     * 투두 항목의 완료/미완료 상태를 토글
     * @param {number} id - 상태를 변경할 투두의 ID
     */
    function toggleTodo(id) {
        fetchHelper(`${API_URL}/${id}/toggle`, { method: 'PATCH' })
            .then(() => updateListBasedOnFilter())
            .catch(error => {
                console.error('투두 상태 토글 오류:', error);
                alert(`상태 변경에 실패했습니다: ${error.message}`);
            });
    }

    /**
     * 투두 항목을 삭제
     * @param {number} id - 삭제할 투두의 ID
     * @param {HTMLElement} li - 삭제할 LI 엘리먼트
     */
    function deleteTodo(id, li) {
        if (!confirm("정말로 삭제하시겠습니까?")) return;

        fetchHelper(`${API_URL}/${id}`, { method: 'DELETE' })
            .then(() => {
                li.remove(); // 서버에서 성공적으로 삭제되면 화면에서도 제거
            })
            .catch(error => {
                console.error('투두 삭제 오류:', error);
                alert(`삭제에 실패했습니다: ${error.message}`);
            });
    }

    // --- 이벤트 리스너 초기 설정 ---

    // 할 일 추가 이벤트
    addButton.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleAddTodo();
    });

    // 필터 버튼 클릭 이벤트
    function setActiveFilter(activeButton) {
        document.querySelectorAll('.filter-container button').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    function updateListBasedOnFilter() {
        const activeFilterBtn = document.querySelector('.filter-container button.active');
        const filter = activeFilterBtn.id.replace('show-', ''); // 'show-all' -> 'all'
        fetchTodos(filter);
    }

    showAllBtn.addEventListener('click', () => {
        setActiveFilter(showAllBtn);
        fetchTodos('all');
    });

    showIncompleteBtn.addEventListener('click', () => {
        setActiveFilter(showIncompleteBtn);
        fetchTodos('incomplete');
    });

    showCompletedBtn.addEventListener('click', () => {
        setActiveFilter(showCompletedBtn);
        fetchTodos('completed');
    });

    // --- 페이지 최초 로드 시 실행 ---
    setActiveFilter(showAllBtn); // '모두' 버튼을 기본 활성 상태로 설정
    fetchTodos(); // 전체 목록을 불러오며 시작
});