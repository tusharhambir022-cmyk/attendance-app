package com.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private boolean active = true;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LeaveRequest> leaveRequests;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum Role { ADMIN, DEVELOPER }

    // Constructors
    public User() {}

    // Getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getName() { return name; }
    public Role getRole() { return role; }
    public String getDepartment() { return department; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isActive() { return active; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setName(String name) { this.name = name; }
    public void setRole(Role role) { this.role = role; }
    public void setDepartment(String department) { this.department = department; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setActive(boolean active) { this.active = active; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User user = new User();
        public Builder id(Long id) { user.id = id; return this; }
        public Builder email(String email) { user.email = email; return this; }
        public Builder password(String password) { user.password = password; return this; }
        public Builder name(String name) { user.name = name; return this; }
        public Builder role(Role role) { user.role = role; return this; }
        public Builder department(String department) { user.department = department; return this; }
        public Builder active(boolean active) { user.active = active; return this; }
        public User build() { return user; }
    }
}
