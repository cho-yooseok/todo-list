package com.example.todolist.controller;

import com.example.todolist.model.Todo;
import com.example.todolist.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*") // CORS 허용
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    // 모든 Todo 조회
    @GetMapping
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    // 새 Todo 생성
    @PostMapping
    public Todo createTodo(@RequestBody Todo todo) {
        return todoRepository.save(todo);
    }

    // Todo 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        Optional<Todo> optionalTodo = todoRepository.findById(id);

        if (optionalTodo.isPresent()) {
            Todo todo = optionalTodo.get();
            todo.setTitle(todoDetails.getTitle());
            todo.setDescription(todoDetails.getDescription());
            todo.setCompleted(todoDetails.getCompleted());
            return ResponseEntity.ok(todoRepository.save(todo));
        }

        return ResponseEntity.notFound().build();
    }

    // Todo 완료 상태 토글
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleTodo(@PathVariable Long id) {
        Optional<Todo> optionalTodo = todoRepository.findById(id);

        if (optionalTodo.isPresent()) {
            Todo todo = optionalTodo.get();
            todo.setCompleted(!todo.getCompleted());
            return ResponseEntity.ok(todoRepository.save(todo));
        }

        return ResponseEntity.notFound().build();
    }

    // Todo 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        if (todoRepository.existsById(id)) {
            todoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 완료 상태별 조회
    @GetMapping("/status/{completed}")
    public List<Todo> getTodosByStatus(@PathVariable Boolean completed) {
        return todoRepository.findByCompleted(completed);
    }

    // 제목으로 검색
    @GetMapping("/search")
    public List<Todo> searchTodos(@RequestParam String title) {
        return todoRepository.findByTitleContainingIgnoreCase(title);
    }

    // 미완료 항목 (최신순)
    @GetMapping("/incomplete")
    public List<Todo> getIncompleteTodos() {
        return todoRepository.findIncompleteOrderByCreatedAtDesc();
    }

    // 완료 항목 (최신순)
    @GetMapping("/completed")
    public List<Todo> getCompletedTodos() {
        return todoRepository.findCompletedOrderByUpdatedAtDesc();
    }
}