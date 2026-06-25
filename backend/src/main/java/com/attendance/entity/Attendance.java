package com.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Integer workingMinutes;
    private String notes;

    @PrePersist
    public void prePersist() {
        if (this.date == null) this.date = LocalDate.now();
        if (this.status == null) this.status = Status.PRESENT;
    }

    public enum Status { PRESENT, ABSENT, HALF_DAY, ON_LEAVE, WORK_FROM_HOME }

    public Attendance() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDate getDate() { return date; }
    public LocalDateTime getCheckIn() { return checkIn; }
    public LocalDateTime getCheckOut() { return checkOut; }
    public Status getStatus() { return status; }
    public Integer getWorkingMinutes() { return workingMinutes; }
    public String getNotes() { return notes; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }
    public void setStatus(Status status) { this.status = status; }
    public void setWorkingMinutes(Integer workingMinutes) { this.workingMinutes = workingMinutes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Attendance a = new Attendance();
        public Builder user(User user) { a.user = user; return this; }
        public Builder date(LocalDate date) { a.date = date; return this; }
        public Builder checkIn(LocalDateTime checkIn) { a.checkIn = checkIn; return this; }
        public Builder checkOut(LocalDateTime checkOut) { a.checkOut = checkOut; return this; }
        public Builder status(Status status) { a.status = status; return this; }
        public Builder workingMinutes(Integer workingMinutes) { a.workingMinutes = workingMinutes; return this; }
        public Builder notes(String notes) { a.notes = notes; return this; }
        public Attendance build() { return a; }
    }
}
