package com.attendance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Dto {

    // ---- AUTH ----
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String token;
        private String name;
        private String email;
        private String role;
        private Long userId;
        public LoginResponse() {}
        public LoginResponse(String token, String name, String email, String role, Long userId) {
            this.token = token; this.name = name; this.email = email; this.role = role; this.userId = userId;
        }
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final LoginResponse r = new LoginResponse();
            public Builder token(String t) { r.token = t; return this; }
            public Builder name(String n) { r.name = n; return this; }
            public Builder email(String e) { r.email = e; return this; }
            public Builder role(String ro) { r.role = ro; return this; }
            public Builder userId(Long id) { r.userId = id; return this; }
            public LoginResponse build() { return r; }
        }
        public String getToken() { return token; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public Long getUserId() { return userId; }
    }

    // ---- USER ----
    public static class CreateUserRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank private String password;
        private String department;
        private String role;
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public String getDepartment() { return department; }
        public String getRole() { return role; }
        public void setName(String name) { this.name = name; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
        public void setDepartment(String department) { this.department = department; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UserResponse {
        private Long id; private String name; private String email; private String role;
        private String department; private boolean active; private LocalDateTime createdAt;
        private Integer totalLeavesThisYear; private Integer pendingLeaves;
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final UserResponse r = new UserResponse();
            public Builder id(Long id) { r.id = id; return this; }
            public Builder name(String n) { r.name = n; return this; }
            public Builder email(String e) { r.email = e; return this; }
            public Builder role(String ro) { r.role = ro; return this; }
            public Builder department(String d) { r.department = d; return this; }
            public Builder active(boolean a) { r.active = a; return this; }
            public Builder createdAt(LocalDateTime c) { r.createdAt = c; return this; }
            public Builder totalLeavesThisYear(Integer t) { r.totalLeavesThisYear = t; return this; }
            public Builder pendingLeaves(Integer p) { r.pendingLeaves = p; return this; }
            public UserResponse build() { return r; }
        }
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public String getDepartment() { return department; }
        public boolean isActive() { return active; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public Integer getTotalLeavesThisYear() { return totalLeavesThisYear; }
        public Integer getPendingLeaves() { return pendingLeaves; }
    }

    // ---- ATTENDANCE ----
    public static class AttendanceResponse {
        private Long id; private Long userId; private String userName; private LocalDate date;
        private LocalDateTime checkIn; private LocalDateTime checkOut; private String status;
        private Integer workingMinutes; private String workingHours; private String notes;
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final AttendanceResponse r = new AttendanceResponse();
            public Builder id(Long id) { r.id = id; return this; }
            public Builder userId(Long uid) { r.userId = uid; return this; }
            public Builder userName(String n) { r.userName = n; return this; }
            public Builder date(LocalDate d) { r.date = d; return this; }
            public Builder checkIn(LocalDateTime c) { r.checkIn = c; return this; }
            public Builder checkOut(LocalDateTime c) { r.checkOut = c; return this; }
            public Builder status(String s) { r.status = s; return this; }
            public Builder workingMinutes(Integer m) { r.workingMinutes = m; return this; }
            public Builder workingHours(String h) { r.workingHours = h; return this; }
            public Builder notes(String n) { r.notes = n; return this; }
            public AttendanceResponse build() { return r; }
        }
        public Long getId() { return id; }
        public Long getUserId() { return userId; }
        public String getUserName() { return userName; }
        public LocalDate getDate() { return date; }
        public LocalDateTime getCheckIn() { return checkIn; }
        public LocalDateTime getCheckOut() { return checkOut; }
        public String getStatus() { return status; }
        public Integer getWorkingMinutes() { return workingMinutes; }
        public String getWorkingHours() { return workingHours; }
        public String getNotes() { return notes; }
    }

    public static class AttendanceSummary {
        private Long userId; private String userName; private int presentDays; private int absentDays;
        private int halfDays; private int leaveDays; private int wfhDays; private int totalWorkingMinutes; private String month;
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final AttendanceSummary s = new AttendanceSummary();
            public Builder userId(Long id) { s.userId = id; return this; }
            public Builder userName(String n) { s.userName = n; return this; }
            public Builder presentDays(int p) { s.presentDays = p; return this; }
            public Builder absentDays(int a) { s.absentDays = a; return this; }
            public Builder halfDays(int h) { s.halfDays = h; return this; }
            public Builder leaveDays(int l) { s.leaveDays = l; return this; }
            public Builder wfhDays(int w) { s.wfhDays = w; return this; }
            public Builder totalWorkingMinutes(int t) { s.totalWorkingMinutes = t; return this; }
            public Builder month(String m) { s.month = m; return this; }
            public AttendanceSummary build() { return s; }
        }
        public Long getUserId() { return userId; }
        public String getUserName() { return userName; }
        public int getPresentDays() { return presentDays; }
        public int getAbsentDays() { return absentDays; }
        public int getHalfDays() { return halfDays; }
        public int getLeaveDays() { return leaveDays; }
        public int getWfhDays() { return wfhDays; }
        public int getTotalWorkingMinutes() { return totalWorkingMinutes; }
        public String getMonth() { return month; }
    }

    // ---- LEAVE ----
    public static class LeaveRequestDto {
        @NotBlank private String leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        @NotBlank private String reason;
        public String getLeaveType() { return leaveType; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public String getReason() { return reason; }
        public void setLeaveType(String leaveType) { this.leaveType = leaveType; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class LeaveResponse {
        private Long id; private Long userId; private String userName; private String leaveType;
        private LocalDate startDate; private LocalDate endDate; private int totalDays;
        private String reason; private String status; private String adminComment; private LocalDateTime appliedAt;
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final LeaveResponse r = new LeaveResponse();
            public Builder id(Long id) { r.id = id; return this; }
            public Builder userId(Long uid) { r.userId = uid; return this; }
            public Builder userName(String n) { r.userName = n; return this; }
            public Builder leaveType(String t) { r.leaveType = t; return this; }
            public Builder startDate(LocalDate d) { r.startDate = d; return this; }
            public Builder endDate(LocalDate d) { r.endDate = d; return this; }
            public Builder totalDays(int d) { r.totalDays = d; return this; }
            public Builder reason(String re) { r.reason = re; return this; }
            public Builder status(String s) { r.status = s; return this; }
            public Builder adminComment(String c) { r.adminComment = c; return this; }
            public Builder appliedAt(LocalDateTime a) { r.appliedAt = a; return this; }
            public LeaveResponse build() { return r; }
        }
        public Long getId() { return id; }
        public Long getUserId() { return userId; }
        public String getUserName() { return userName; }
        public String getLeaveType() { return leaveType; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public int getTotalDays() { return totalDays; }
        public String getReason() { return reason; }
        public String getStatus() { return status; }
        public String getAdminComment() { return adminComment; }
        public LocalDateTime getAppliedAt() { return appliedAt; }
    }

    public static class LeaveReviewRequest {
        @NotBlank private String status;
        private String comment;
        public String getStatus() { return status; }
        public String getComment() { return comment; }
        public void setStatus(String status) { this.status = status; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class LeaveBalance {
        private int sickLeaveUsed; private int casualLeaveUsed; private int paidLeaveUsed;
        private int sickLeaveTotal; private int casualLeaveTotal; private int paidLeaveTotal;
        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final LeaveBalance b = new LeaveBalance();
            public Builder sickLeaveUsed(int v) { b.sickLeaveUsed = v; return this; }
            public Builder casualLeaveUsed(int v) { b.casualLeaveUsed = v; return this; }
            public Builder paidLeaveUsed(int v) { b.paidLeaveUsed = v; return this; }
            public Builder sickLeaveTotal(int v) { b.sickLeaveTotal = v; return this; }
            public Builder casualLeaveTotal(int v) { b.casualLeaveTotal = v; return this; }
            public Builder paidLeaveTotal(int v) { b.paidLeaveTotal = v; return this; }
            public LeaveBalance build() { return b; }
        }
        public int getSickLeaveUsed() { return sickLeaveUsed; }
        public int getCasualLeaveUsed() { return casualLeaveUsed; }
        public int getPaidLeaveUsed() { return paidLeaveUsed; }
        public int getSickLeaveTotal() { return sickLeaveTotal; }
        public int getCasualLeaveTotal() { return casualLeaveTotal; }
        public int getPaidLeaveTotal() { return paidLeaveTotal; }
    }

    public static class AdminDashboard {
        private long totalDevelopers; private long presentToday; private long absentToday; private long pendingLeaveRequests;
        private List<UserResponse> recentlyJoined; private List<LeaveResponse> pendingLeaves;
        public long getTotalDevelopers() { return totalDevelopers; }
        public long getPresentToday() { return presentToday; }
        public long getAbsentToday() { return absentToday; }
        public long getPendingLeaveRequests() { return pendingLeaveRequests; }
    }
}
