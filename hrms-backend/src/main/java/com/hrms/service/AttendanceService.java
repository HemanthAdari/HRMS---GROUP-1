package com.hrms.service;

import com.hrms.dao.AttendanceRepository;
import com.hrms.dao.UserRepository;
import com.hrms.entity.Attendance;
import com.hrms.entity.User;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
@Transactional
public class AttendanceService {

    private static final Logger LOG = Logger.getLogger(AttendanceService.class.getName());

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = Objects.requireNonNull(attendanceRepository, "attendanceRepository");
        this.userRepository = Objects.requireNonNull(userRepository, "userRepository");
    }

    /**
     * Mark attendance for a user on a date.
     * Throws IllegalArgumentException if user not found or already marked for the date.
     * Also validates past/future/weekend to keep backend safe.
     */
    public Attendance markAttendance(Integer userId, LocalDate date, Attendance.Status status) {
        if (userId == null) throw new IllegalArgumentException("userId is required");
        if (date == null) throw new IllegalArgumentException("date is required");
        if (status == null) throw new IllegalArgumentException("status is required");

        // backend safety: do not allow past/future/weekend
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            throw new IllegalArgumentException("You cannot mark past days' attendance");
        }
        if (date.isAfter(today)) {
            throw new IllegalArgumentException("You cannot mark future days' attendance");
        }
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("This is a holiday. You cannot mark attendance on weekends");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOpt.get();

        // Check if record already exists for that day
        boolean alreadyMarked = attendanceRepository.findByUser(user)
                .stream()
                .anyMatch(a -> date.equals(a.getDate()));

        if (alreadyMarked) {
            throw new IllegalArgumentException("Attendance already marked for this date");
        }

        Attendance attendance = Attendance.builder()
                .user(user)
                .date(date)
                .status(status)
                .checkIn(status == Attendance.Status.FULL_DAY ? LocalTime.now() : null)
                .checkOut(null)
                .remarks(null)
                .build();

        try {
            Attendance saved = attendanceRepository.save(attendance);
            LOG.info("Saved attendance for user " + user.getEmail() + " date=" + date + " status=" + status);
            return saved;
        } catch (DataIntegrityViolationException dive) {
            LOG.log(Level.WARNING, "Data integrity error saving attendance for userId=" + userId + " date=" + date, dive);
            throw new IllegalArgumentException("Unable to save attendance (data integrity).");
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Unexpected error saving attendance for userId=" + userId + " date=" + date, ex);
            throw ex;
        }
    }

    public List<Attendance> getAttendanceForUser(Integer userId) {
        if (userId == null) throw new IllegalArgumentException("userId is required");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return attendanceRepository.findByUser(user);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
