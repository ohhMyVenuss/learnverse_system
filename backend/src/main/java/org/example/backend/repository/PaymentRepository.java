package org.example.backend.repository;

import org.example.backend.entity.Payment;
import org.example.backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);

    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);

    List<Payment> findByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);

    List<Payment> findByCourseId(Long courseId);

    Payment findByOrderCode(Long orderCode);


    //SELECT p FROM Payment p 
    // JOIN FETCH p.course c 
    // JOIN FETCH c.teacher 
    // WHERE p.user.id = :userId 
    // AND p.status IN :statuses 
    // ORDER BY p.createdAt DESC

    @Query("SELECT p FROM Payment p JOIN FETCH p.course c" + 
    " JOIN FETCH c.teacher WHERE p.user.id = :userId AND p.status IN :statuses ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdAndStatusIn(@Param("userId") Long userId,
            @Param("statuses") List<PaymentStatus> statuses);
}
// 3 -> 5