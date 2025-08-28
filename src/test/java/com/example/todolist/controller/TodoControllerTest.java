package com.example.todolist.controller;

import com.example.todolist.dto.TodoRequestDto;
import com.example.todolist.dto.TodoResponseDto;
import com.example.todolist.model.Todo;
import com.example.todolist.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodoService todoService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("새로운 Todo를 생성하는 API 호출이 성공한다.")
    void createTodo() throws Exception {
        // given
        TodoRequestDto requestDto = new TodoRequestDto();
        requestDto.setTitle("API 테스트");

        Todo savedTodo = new Todo("API 테스트");
        given(todoService.createTodo(any(TodoRequestDto.class))).willReturn(new TodoResponseDto(savedTodo));

        // when
        ResultActions resultActions = mockMvc.perform(post("/api/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)));

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("API 테스트"))
                .andDo(print());
    }

    @Test
    @DisplayName("Todo 내용을 수정하는 API 호출이 성공한다.")
    void updateTodo() throws Exception {
        // given
        Long id = 1L;
        TodoRequestDto requestDto = new TodoRequestDto();
        requestDto.setTitle("수정된 API 테스트");

        Todo updatedTodo = new Todo("수정된 API 테스트");
        given(todoService.updateTodo(eq(id), any(TodoRequestDto.class))).willReturn(new TodoResponseDto(updatedTodo));

        // when
        ResultActions resultActions = mockMvc.perform(put("/api/todos/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDto)));

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("수정된 API 테스트"))
                .andDo(print());
    }
}