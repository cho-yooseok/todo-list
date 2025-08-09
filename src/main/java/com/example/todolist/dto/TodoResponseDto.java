package com.example.todolist.dto;

import com.example.todolist.model.Todo;
import lombok.Getter;
import java.time.LocalDateTime;

// 클라이언트에게 보내는 데이터를 담는 객체
@Getter
public class TodoResponseDto {

    private final Long id;
    private final String title;
    private final Boolean completed;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public TodoResponseDto(Todo todo) {
        this.id = todo.getId();
        this.title = todo.getTitle();
        this.completed = todo.getCompleted();
        this.createdAt = todo.getCreatedAt();
        this.updatedAt = todo.getUpdatedAt();
    }
}