package com.example.todolist.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// 클라이언트로부터 받는 데이터를 담는 객체
@Getter
@Setter
public class TodoRequestDto {

    @NotBlank(message = "할 일 내용은 비워둘 수 없습니다.")
    private String title;
}