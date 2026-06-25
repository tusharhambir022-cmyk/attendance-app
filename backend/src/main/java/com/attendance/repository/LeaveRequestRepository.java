package com.attendance.repository;

import com.attendance.entity.LeaveRequest;
import com.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByUserOrderByAppliedAtDesc(User user);

    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveRequest.LeaveStatus status);

    List<LeaveRequest> findAllByOrderByAppliedAtDesc();

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.user = :user AND l.leaveType = :type AND l.status = 'APPROVED' AND YEAR(l.startDate) = :year")
    long countApprovedLeavesByTypeAndYear(@Param("user") User user, @Param("type") LeaveRequest.LeaveType type, @Param("year") int year);

    @Query("SELECT SUM(l.totalDays) FROM LeaveRequest l WHERE l.user = :user AND l.status = 'APPROVED' AND YEAR(l.startDate) = :year")
    Long sumApprovedLeavesByYear(@Param("user") User user, @Param("year") int year);
}
