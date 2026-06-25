package com.attendance.repository;

import com.attendance.entity.Attendance;
import com.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    List<Attendance> findByUserOrderByDateDesc(User user);

    List<Attendance> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate start, LocalDate end);

    List<Attendance> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);

    @Query("SELECT a FROM Attendance a WHERE a.user = :user AND MONTH(a.date) = :month AND YEAR(a.date) = :year ORDER BY a.date")
    List<Attendance> findByUserAndMonthAndYear(@Param("user") User user, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.user = :user AND a.status = :status AND MONTH(a.date) = :month AND YEAR(a.date) = :year")
    long countByUserAndStatusAndMonthAndYear(@Param("user") User user, @Param("status") Attendance.Status status, @Param("month") int month, @Param("year") int year);

    List<Attendance> findByDate(LocalDate date);
}
