package com.attendance.controller;

import com.attendance.dto.Dto;
import com.attendance.entity.User;
import com.attendance.repository.UserRepository;
import com.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    @PostMapping("/check-in")
    public ResponseEntity<Dto.AttendanceResponse> checkIn(Authentication auth) {
        return ResponseEntity.ok(attendanceService.checkIn(auth.getName()));
    }

    @PostMapping("/check-out")
    public ResponseEntity<Dto.AttendanceResponse> checkOut(Authentication auth) {
        return ResponseEntity.ok(attendanceService.checkOut(auth.getName()));
    }

    @GetMapping("/today")
    public ResponseEntity<Dto.AttendanceResponse> getTodayAttendance(Authentication auth) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(auth.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Dto.AttendanceResponse>> getMyAttendance(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().withDayOfMonth(1);
        if (end == null) end = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getMyAttendance(auth.getName(), start, end));
    }

    @GetMapping("/my/summary")
    public ResponseEntity<Dto.AttendanceSummary> getMySummary(
            Authentication auth,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();
        return ResponseEntity.ok(attendanceService.getMonthSummary(auth.getName(), month, year));
    }

    @GetMapping("/admin/today")
    public ResponseEntity<List<Dto.AttendanceResponse>> getAllTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getAllTodayAttendance());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Dto.AttendanceResponse>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now().minusDays(30);
        if (end == null) end = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAllAttendance(start, end));
    }

    @GetMapping("/admin/summary/{userId}")
    public ResponseEntity<Dto.AttendanceSummary> getUserSummary(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(attendanceService.getMonthSummary(user.getEmail(), month, year));
    }
}
