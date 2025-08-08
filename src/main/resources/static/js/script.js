document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const showAllBtn = document.getElementById('show-all');
    const showIncompleteBtn = document.getElementById('show-incomplete');
    const showCompletedBtn = document.getElementById('show-completed');

    const API_URL = 'http://localhost:8080/api/todos';

    // 초기 투두리스트 불러오기
    function fetchTodos(filter = 'all') {
        let url = API_URL;
        if (filter === 'incomplete') {
            url = `${API_URL}/incomplete`;
        } else if (filter === 'completed') {
            url = `${API_URL}/completed`;
        }

        fetch(url)
            .then(response => response.json())
            .then(todos => {
                todoList.innerHTML = ''; // 기존 목록 비우기
                todos.forEach(todo => {
                    addTodoToList(todo);
                });
            })
            .catch(error => console.error('투두리스트를 불러오는 중 오류 발생:', error));
    }

    // 투두 아이템을 DOM에 추가하는 함수
    function addTodoToList(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.className = todo.completed ? 'completed' : '';

        const todoText = document.createElement('span');
        todoText.className = 'todo-text';
        if (todo.completed) {
            todoText.classList.add('completed-text');
        }
        todoText.textContent = todo.title;

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

        actionButtons.appendChild(editBtn);
        actionButtons.appendChild(toggleBtn);
        actionButtons.appendChild(deleteBtn);

        li.appendChild(todoText);
        li.appendChild(actionButtons);
        todoList.appendChild(li);

        // 이벤트 리스너 추가
        editBtn.addEventListener('click', () => editTodo(todo, li, todoText, actionButtons));
        toggleBtn.addEventListener('click', () => toggleTodo(todo.id, li, todoText, toggleBtn));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));
    }

    // 새 투두 추가 함수
    addButton.addEventListener('click', () => {
        const title = todoInput.value.trim();
        if (title === '') return;

        const newTodo = {
            title: title,
            completed: false
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo),
        })
            .then(response => response.json())
            .then(addedTodo => {
                addTodoToList(addedTodo);
                todoInput.value = ''; // 입력창 비우기
                updateListBasedOnFilter();
            })
            .catch(error => console.error('투두를 추가하는 중 오류 발생:', error));
    });

    // 할 일 수정 함수
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
        actionButtons.appendChild(saveBtn);
        actionButtons.appendChild(cancelBtn);

        saveBtn.addEventListener('click', () => saveTodo(todo, editInput.value, li));
        cancelBtn.addEventListener('click', () => {
            li.replaceChild(todoText, editInput);
            actionButtons.innerHTML = '';
            addTodoToList(todo); // 기존 항목으로 복원
            updateListBasedOnFilter();
        });
    }

    // 수정 내용 저장 함수
    function saveTodo(todo, newTitle, li) {
        const updatedTodo = {
            ...todo,
            title: newTitle
        };

        fetch(`${API_URL}/${todo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTodo),
        })
            .then(response => response.json())
            .then(updatedItem => {
                li.remove();
                addTodoToList(updatedItem);
                updateListBasedOnFilter();
            })
            .catch(error => console.error('투두를 업데이트하는 중 오류 발생:', error));
    }

    // 완료 상태 토글 함수
    function toggleTodo(id, li, todoText, toggleBtn) {
        fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH',
        })
            .then(response => response.json())
            .then(updatedTodo => {
                li.classList.toggle('completed');
                todoText.classList.toggle('completed-text');
                toggleBtn.textContent = updatedTodo.completed ? '미완료' : '완료';
                updateListBasedOnFilter();
            })
            .catch(error => console.error('투두 상태를 토글하는 중 오류 발생:', error));
    }

    // 투두 삭제 함수
    function deleteTodo(id, li) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    li.remove();
                } else {
                    console.error('투두를 삭제하는 중 오류 발생:', response.statusText);
                }
            })
            .catch(error => console.error('투두를 삭제하는 중 오류 발생:', error));
    }

    // 필터링 버튼 이벤트 리스너
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

    // 필터 버튼 활성화 상태 변경 함수
    function setActiveFilter(activeButton) {
        document.querySelectorAll('.filter-container button').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // 현재 활성화된 필터에 따라 목록을 업데이트하는 함수
    function updateListBasedOnFilter() {
        const activeFilterBtn = document.querySelector('.filter-container button.active');
        let filter = 'all';
        if (activeFilterBtn === showIncompleteBtn) {
            filter = 'incomplete';
        } else if (activeFilterBtn === showCompletedBtn) {
            filter = 'completed';
        }
        fetchTodos(filter);
    }

    // 페이지 로드 시 전체 목록 불러오기
    fetchTodos();
});