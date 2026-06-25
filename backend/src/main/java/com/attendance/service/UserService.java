package com.attendance.service;

import com.attendance.dto.Dto;
import com.attendance.entity.User;
import com.attendance.repository.LeaveRequestRepository;
import com.attendance.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, LeaveRequestRepository leaveRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.leaveRepository = leaveRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Dto.UserResponse createUser(Dto.CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(request.getDepartment())
                .role(request.getRole() != null ? User.Role.valueOf(request.getRole()) : User.Role.DEVELOPER)
                .active(true)
                .build();
        return toResponse(userRepository.save(user));
    }

    public List<Dto.UserResponse> getAllDevelopers() {
        return userRepository.findByRole(User.Role.DEVELOPER)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Dto.UserResponse getProfile(String email) {
        return toResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public Dto.UserResponse toResponse(User u) {
        int year = LocalDate.now().getYear();
        Long totalLeaves = leaveRepository.sumApprovedLeavesByYear(u, year);
        return Dto.UserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .role(u.getRole().name()).department(u.getDepartment())
                .active(u.isActive()).createdAt(u.getCreatedAt())
                .totalLeavesThisYear(totalLeaves != null ? totalLeaves.intValue() : 0)
                .build();
    }
}
