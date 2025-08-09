package com.example.todolist.service;

import com.example.todolist.dto.TodoRequestDto;
import com.example.todolist.dto.TodoResponseDto;
import com.example.todolist.model.Todo;
import com.example.todolist.repository.TodoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    // 모든 Todo 조회
    @Transactional(readOnly = true)
    public List<TodoResponseDto> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(TodoResponseDto::new)
                .collect(Collectors.toList());
    }

    // 새 Todo 생성
    @Transactional
    public TodoResponseDto createTodo(TodoRequestDto requestDto) {
        Todo newTodo = new Todo(requestDto.getTitle());
        Todo savedTodo = todoRepository.save(newTodo);
        return new TodoResponseDto(savedTodo);
    }

    // Todo 업데이트
    @Transactional
    public TodoResponseDto updateTodo(Long id, TodoRequestDto requestDto) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 할 일을 찾을 수 없습니다: " + id));

        todo.setTitle(requestDto.getTitle());
        // save를 호출하지 않아도 @Transactional에 의해 변경 감지(Dirty Checking)되어 DB에 반영됩니다.
        return new TodoResponseDto(todo);
    }

    // Todo 완료 상태 토글
    @Transactional
    public TodoResponseDto toggleTodo(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 ID의 할 일을 찾을 수 없습니다: " + id));

        todo.setCompleted(!todo.getCompleted());
        return new TodoResponseDto(todo);
    }

    // Todo 삭제
    @Transactional
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new EntityNotFoundException("해당 ID의 할 일을 찾을 수 없습니다: " + id);
        }
        todoRepository.deleteById(id);
    }

    // 미완료 항목 조회 (최신순)
    @Transactional(readOnly = true)
    public List<TodoResponseDto> getIncompleteTodos() {
        return todoRepository.findIncompleteOrderByCreatedAtDesc().stream()
                .map(TodoResponseDto::new)
                .collect(Collectors.toList());
    }

    // 완료 항목 조회 (최신순)
    @Transactional(readOnly = true)
    public List<TodoResponseDto> getCompletedTodos() {
        return todoRepository.findCompletedOrderByUpdatedAtDesc().stream()
                .map(TodoResponseDto::new)
                .collect(Collectors.toList());
    }
}