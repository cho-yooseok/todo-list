package com.example.todolist.repository;

import com.example.todolist.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 완료되지 않은 항목을 생성일 순으로 정렬
    @Query("SELECT t FROM Todo t WHERE t.completed = false ORDER BY t.createdAt DESC")
    List<Todo> findIncompleteOrderByCreatedAtDesc();

    // 완료된 항목을 업데이트일 순으로 정렬
    @Query("SELECT t FROM Todo t WHERE t.completed = true ORDER BY t.updatedAt DESC")
    List<Todo> findCompletedOrderByUpdatedAtDesc();
}