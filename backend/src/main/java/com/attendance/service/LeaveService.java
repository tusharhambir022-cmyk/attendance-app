package com.attendance.service;

import com.attendance.dto.Dto;
import com.attendance.entity.LeaveRequest;
import com.attendance.entity.User;
import com.attendance.repository.LeaveRequestRepository;
import com.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;

    private static final int SICK_LEAVE_QUOTA = 12;
    private static final int CASUAL_LEAVE_QUOTA = 12;
    private static final int PAID_LEAVE_QUOTA = 18;

    public LeaveService(LeaveRequestRepository leaveRepository, UserRepository userRepository) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Dto.LeaveResponse applyLeave(String email, Dto.LeaveRequestDto request) {
        User user = getUser(email);
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        LeaveRequest leave = LeaveRequest.builder()
                .user(user)
                .leaveType(LeaveRequest.LeaveType.valueOf(request.getLeaveType()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING)
                .build();
        return toResponse(leaveRepository.save(leave));
    }

    public List<Dto.LeaveResponse> getMyLeaves(String email) {
        return leaveRepository.findByUserOrderByAppliedAtDesc(getUser(email))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dto.LeaveResponse> getAllLeaves() {
        return leaveRepository.findAllByOrderByAppliedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dto.LeaveResponse> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByAppliedAtDesc(LeaveRequest.LeaveStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public Dto.LeaveResponse reviewLeave(Long leaveId, Dto.LeaveReviewRequest request, String adminEmail) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        User admin = getUser(adminEmail);
        leave.setStatus(LeaveRequest.LeaveStatus.valueOf(request.getStatus()));
        leave.setAdminComment(request.getComment());
        leave.setReviewedAt(LocalDateTime.now());
        leave.setReviewedBy(admin);
        return toResponse(leaveRepository.save(leave));
    }

    public Dto.LeaveBalance getLeaveBalance(String email) {
        User user = getUser(email);
        int year = LocalDate.now().getYear();
        int sickUsed = (int) leaveRepository.countApprovedLeavesByTypeAndYear(user, LeaveRequest.LeaveType.SICK_LEAVE, year);
        int casualUsed = (int) leaveRepository.countApprovedLeavesByTypeAndYear(user, LeaveRequest.LeaveType.CASUAL_LEAVE, year);
        int paidUsed = (int) leaveRepository.countApprovedLeavesByTypeAndYear(user, LeaveRequest.LeaveType.PAID_LEAVE, year);
        return Dto.LeaveBalance.builder()
                .sickLeaveUsed(sickUsed).casualLeaveUsed(casualUsed).paidLeaveUsed(paidUsed)
                .sickLeaveTotal(SICK_LEAVE_QUOTA).casualLeaveTotal(CASUAL_LEAVE_QUOTA).paidLeaveTotal(PAID_LEAVE_QUOTA)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Dto.LeaveResponse toResponse(LeaveRequest l) {
        return Dto.LeaveResponse.builder()
                .id(l.getId()).userId(l.getUser().getId()).userName(l.getUser().getName())
                .leaveType(l.getLeaveType().name()).startDate(l.getStartDate()).endDate(l.getEndDate())
                .totalDays(l.getTotalDays()).reason(l.getReason()).status(l.getStatus().name())
                .adminComment(l.getAdminComment()).appliedAt(l.getAppliedAt())
                .build();
    }
}
