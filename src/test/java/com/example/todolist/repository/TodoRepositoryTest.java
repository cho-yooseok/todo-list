package com.example.todolist.repository;

import com.example.todolist.model.Todo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TodoRepositoryTest {

    @Autowired
    private TodoRepository todoRepository;

    @Test
    @DisplayName("미완료 Todo 항목들을 생성 시간 역순으로 조회한다.")
    void findIncompleteOrderByCreatedAtDesc() throws InterruptedException {
        // given: 명확한 시간 차이를 두고 순차적으로 데이터를 저장
        Todo todo1 = new Todo("빨래하기");
        todoRepository.save(todo1);

        Thread.sleep(10); // createdAt 시간 차이를 두기 위함

        Todo todo2 = new Todo("청소하기");
        todo2.setCompleted(true);
        todoRepository.save(todo2);

        Thread.sleep(10); // createdAt 시간 차이를 두기 위함

        Todo todo3 = new Todo("공부하기");
        todoRepository.save(todo3);

        // when
        List<Todo> incompleteTodos = todoRepository.findIncompleteOrderByCreatedAtDesc();

        // then: 미완료 항목은 2개이며, 가장 나중에 생성된 "공부하기"가 첫 번째로 와야 한다.
        assertThat(incompleteTodos).hasSize(2);
        assertThat(incompleteTodos.get(0).getTitle()).isEqualTo("공부하기");
        assertThat(incompleteTodos.get(1).getTitle()).isEqualTo("빨래하기");
    }

    @Test
    @DisplayName("완료된 Todo 항목들을 수정 시간 역순으로 조회한다.")
    void findCompletedOrderByUpdatedAtDesc() throws InterruptedException {
        // given
        Todo todo1 = new Todo("책 읽기");
        todo1.setCompleted(true);
        todoRepository.save(todo1);

        Thread.sleep(10); // updatedAt 시간 차이를 두기 위함

        Todo todo2 = new Todo("영화 보기");
        todo2.setCompleted(true);
        todoRepository.save(todo2);

        // when
        List<Todo> completedTodos = todoRepository.findCompletedOrderByUpdatedAtDesc();

        // then
        assertThat(completedTodos).hasSize(2);
        assertThat(completedTodos.get(0).getTitle()).isEqualTo("영화 보기");
        assertThat(completedTodos.get(1).getTitle()).isEqualTo("책 읽기");
    }
}