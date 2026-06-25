package com.attendance.controller;

import com.attendance.dto.Dto;
import com.attendance.service.LeaveService;
import com.attendance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MainController {

    private final UserService userService;
    private final LeaveService leaveService;

    public MainController(UserService userService, LeaveService leaveService) {
        this.userService = userService;
        this.leaveService = leaveService;
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dto.UserResponse> createUser(@Valid @RequestBody Dto.CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/admin/developers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Dto.UserResponse>> getAllDevelopers() {
        return ResponseEntity.ok(userService.getAllDevelopers());
    }

    @PatchMapping("/admin/users/{userId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleUser(@PathVariable Long userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/profile")
    public ResponseEntity<Dto.UserResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PostMapping("/leaves/apply")
    public ResponseEntity<Dto.LeaveResponse> applyLeave(Authentication auth, @Valid @RequestBody Dto.LeaveRequestDto request) {
        return ResponseEntity.ok(leaveService.applyLeave(auth.getName(), request));
    }

    @GetMapping("/leaves/my")
    public ResponseEntity<List<Dto.LeaveResponse>> getMyLeaves(Authentication auth) {
        return ResponseEntity.ok(leaveService.getMyLeaves(auth.getName()));
    }

    @GetMapping("/leaves/balance")
    public ResponseEntity<Dto.LeaveBalance> getLeaveBalance(Authentication auth) {
        return ResponseEntity.ok(leaveService.getLeaveBalance(auth.getName()));
    }

    @GetMapping("/admin/leaves")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Dto.LeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/admin/leaves/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Dto.LeaveResponse>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PatchMapping("/admin/leaves/{leaveId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dto.LeaveResponse> reviewLeave(@PathVariable Long leaveId,
            @RequestBody Dto.LeaveReviewRequest request, Authentication auth) {
        return ResponseEntity.ok(leaveService.reviewLeave(leaveId, request, auth.getName()));
    }
}
