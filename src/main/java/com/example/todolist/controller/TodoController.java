package com.example.todolist.controller;

import com.example.todolist.dto.TodoRequestDto;
import com.example.todolist.dto.TodoResponseDto;
import com.example.todolist.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoService todoService;

    // 모든 Todo 조회
    @GetMapping
    public ResponseEntity<List<TodoResponseDto>> getAllTodos() {
        return ResponseEntity.ok(todoService.getAllTodos());
    }

    // 새 Todo 생성
    @PostMapping
    public ResponseEntity<TodoResponseDto> createTodo(@Valid @RequestBody TodoRequestDto requestDto) {
        return ResponseEntity.ok(todoService.createTodo(requestDto));
    }

    // Todo 업데이트 (내용만 수정)
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponseDto> updateTodo(@PathVariable Long id, @Valid @RequestBody TodoRequestDto requestDto) {
        try {
            return ResponseEntity.ok(todoService.updateTodo(id, requestDto));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Todo 완료 상태 토글
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoResponseDto> toggleTodo(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(todoService.toggleTodo(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Todo 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        try {
            todoService.deleteTodo(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 미완료 항목 (최신순)
    @GetMapping("/incomplete")
    public ResponseEntity<List<TodoResponseDto>> getIncompleteTodos() {
        return ResponseEntity.ok(todoService.getIncompleteTodos());
    }

    // 완료 항목 (최신순)
    @GetMapping("/completed")
    public ResponseEntity<List<TodoResponseDto>> getCompletedTodos() {
        return ResponseEntity.ok(todoService.getCompletedTodos());
    }

}