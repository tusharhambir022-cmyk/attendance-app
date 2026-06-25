package com.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private int totalDays;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    private String adminComment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @PrePersist
    public void prePersist() {
        this.appliedAt = LocalDateTime.now();
        if (this.status == null) this.status = LeaveStatus.PENDING;
    }

    public enum LeaveType { SICK_LEAVE, CASUAL_LEAVE, PAID_LEAVE }
    public enum LeaveStatus { PENDING, APPROVED, REJECTED }

    public LeaveRequest() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public LeaveType getLeaveType() { return leaveType; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public int getTotalDays() { return totalDays; }
    public String getReason() { return reason; }
    public LeaveStatus getStatus() { return status; }
    public String getAdminComment() { return adminComment; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public User getReviewedBy() { return reviewedBy; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }
    public void setReason(String reason) { this.reason = reason; }
    public void setStatus(LeaveStatus status) { this.status = status; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final LeaveRequest l = new LeaveRequest();
        public Builder user(User user) { l.user = user; return this; }
        public Builder leaveType(LeaveType leaveType) { l.leaveType = leaveType; return this; }
        public Builder startDate(LocalDate startDate) { l.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { l.endDate = endDate; return this; }
        public Builder totalDays(int totalDays) { l.totalDays = totalDays; return this; }
        public Builder reason(String reason) { l.reason = reason; return this; }
        public Builder status(LeaveStatus status) { l.status = status; return this; }
        public LeaveRequest build() { return l; }
    }
}
