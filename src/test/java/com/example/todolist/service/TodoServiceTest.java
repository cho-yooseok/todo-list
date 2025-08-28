package com.example.todolist.service;

import com.example.todolist.dto.TodoRequestDto;
import com.example.todolist.dto.TodoResponseDto;
import com.example.todolist.model.Todo;
import com.example.todolist.repository.TodoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoService todoService;

    @Test
    @DisplayName("새로운 Todo를 생성하면 저장된 Todo 정보를 반환한다.")
    void createTodo() {
        // given
        TodoRequestDto requestDto = new TodoRequestDto();
        requestDto.setTitle("새로운 할 일");

        Todo todo = new Todo("새로운 할 일");
        given(todoRepository.save(any(Todo.class))).willReturn(todo);

        // when
        TodoResponseDto responseDto = todoService.createTodo(requestDto);

        // then
        assertThat(responseDto.getTitle()).isEqualTo("새로운 할 일");
    }

    @Test
    @DisplayName("존재하는 ID로 Todo를 업데이트하면 수정된 내용이 반영된다.")
    void updateTodo() {
        // given
        Long id = 1L;
        TodoRequestDto requestDto = new TodoRequestDto();
        requestDto.setTitle("수정된 할 일");

        Todo existingTodo = new Todo("원래 할 일");
        given(todoRepository.findById(id)).willReturn(Optional.of(existingTodo));

        // when
        TodoResponseDto responseDto = todoService.updateTodo(id, requestDto);

        // then
        assertThat(responseDto.getTitle()).isEqualTo("수정된 할 일");
    }

    @Test
    @DisplayName("존재하지 않는 ID로 Todo를 업데이트하면 예외가 발생한다.")
    void updateTodo_throwsException() {
        // given
        Long id = 99L;
        TodoRequestDto requestDto = new TodoRequestDto();
        requestDto.setTitle("수정된 할 일");
        given(todoRepository.findById(id)).willReturn(Optional.empty());

        // when & then
        assertThrows(EntityNotFoundException.class, () -> {
            todoService.updateTodo(id, requestDto);
        });
    }

    @Test
    @DisplayName("Todo의 완료 상태를 토글할 수 있다.")
    void toggleTodo() {
        // given
        Long id = 1L;
        Todo todo = new Todo("할 일");
        assertThat(todo.getCompleted()).isFalse(); // 초기 상태: false
        given(todoRepository.findById(id)).willReturn(Optional.of(todo));

        // when
        TodoResponseDto responseDto = todoService.toggleTodo(id);

        // then
        assertThat(responseDto.getCompleted()).isTrue();
    }

    @Test
    @DisplayName("존재하는 ID의 Todo를 삭제할 수 있다.")
    void deleteTodo() {
        // given
        Long id = 1L;
        given(todoRepository.existsById(id)).willReturn(true);

        // when
        todoService.deleteTodo(id);

        // then
        verify(todoRepository).deleteById(id);
    }
}