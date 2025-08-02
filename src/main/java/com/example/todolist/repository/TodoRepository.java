package com.example.todolist.repository;

import com.example.todolist.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 완료 상태별로 조회
    List<Todo> findByCompleted(Boolean completed);

    // 제목으로 검색 (대소문자 구분 없음)  (여기서는 사실상 내용 으로 검색)
    List<Todo> findByTitleContainingIgnoreCase(String title);

    // 완료되지 않은 항목을 생성일 순으로 정렬
    @Query("SELECT t FROM Todo t WHERE t.completed = false ORDER BY t.createdAt DESC")
    List<Todo> findIncompleteOrderByCreatedAtDesc();

    // 완료된 항목을 업데이트일 순으로 정렬
    @Query("SELECT t FROM Todo t WHERE t.completed = true ORDER BY t.updatedAt DESC")
    List<Todo> findCompletedOrderByUpdatedAtDesc();
}