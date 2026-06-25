package com.attendance.service;

import com.attendance.dto.Dto;
import com.attendance.entity.Attendance;
import com.attendance.entity.User;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Dto.AttendanceResponse checkIn(String email) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, today);
        if (existing.isPresent() && existing.get().getCheckIn() != null) {
            throw new RuntimeException("Already checked in today");
        }

        Attendance attendance = existing.orElseGet(() -> Attendance.builder()
                .user(user).date(today).status(Attendance.Status.PRESENT).build());

        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus(Attendance.Status.PRESENT);
        return toResponse(attendanceRepository.save(attendance));
    }

    @Transactional
    public Dto.AttendanceResponse checkOut(String email) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByUserAndDate(user, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));

        if (attendance.getCheckIn() == null) throw new RuntimeException("Please check in first");
        if (attendance.getCheckOut() != null) throw new RuntimeException("Already checked out today");

        LocalDateTime checkOut = LocalDateTime.now();
        attendance.setCheckOut(checkOut);

        int minutes = (int) Duration.between(attendance.getCheckIn(), checkOut).toMinutes();
        attendance.setWorkingMinutes(minutes);
        if (minutes < 240) attendance.setStatus(Attendance.Status.HALF_DAY);

        return toResponse(attendanceRepository.save(attendance));
    }

    public Dto.AttendanceResponse getTodayAttendance(String email) {
        User user = getUser(email);
        Optional<Attendance> attendance = attendanceRepository.findByUserAndDate(user, LocalDate.now());
        return attendance.map(this::toResponse).orElse(null);
    }

    public List<Dto.AttendanceResponse> getMyAttendance(String email, LocalDate start, LocalDate end) {
        User user = getUser(email);
        return attendanceRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dto.AttendanceResponse> getAllTodayAttendance() {
        return attendanceRepository.findByDate(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Dto.AttendanceResponse> getAllAttendance(LocalDate start, LocalDate end) {
        return attendanceRepository.findByDateBetweenOrderByDateDesc(start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Dto.AttendanceSummary getMonthSummary(String email, int month, int year) {
        User user = getUser(email);
        List<Attendance> records = attendanceRepository.findByUserAndMonthAndYear(user, month, year);

        int present = 0, absent = 0, halfDay = 0, leave = 0, wfh = 0, totalMinutes = 0;
        for (Attendance a : records) {
            switch (a.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case HALF_DAY -> halfDay++;
                case ON_LEAVE -> leave++;
                case WORK_FROM_HOME -> wfh++;
            }
            if (a.getWorkingMinutes() != null) totalMinutes += a.getWorkingMinutes();
        }

        return Dto.AttendanceSummary.builder()
                .userId(user.getId()).userName(user.getName())
                .presentDays(present).absentDays(absent).halfDays(halfDay)
                .leaveDays(leave).wfhDays(wfh).totalWorkingMinutes(totalMinutes)
                .month(month + "/" + year)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Dto.AttendanceResponse toResponse(Attendance a) {
        String workingHours = null;
        if (a.getWorkingMinutes() != null) {
            int h = a.getWorkingMinutes() / 60;
            int m = a.getWorkingMinutes() % 60;
            workingHours = h + "h " + m + "m";
        }
        return Dto.AttendanceResponse.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .userName(a.getUser().getName())
                .date(a.getDate())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .workingMinutes(a.getWorkingMinutes())
                .workingHours(workingHours)
                .notes(a.getNotes())
                .build();
    }
}
