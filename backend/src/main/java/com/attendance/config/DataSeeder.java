package com.attendance.config;

import com.attendance.entity.User;
import com.attendance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@company.com")) {
            User admin = User.builder()
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Admin")
                    .role(User.Role.ADMIN)
                    .department("Management")
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Admin created: admin@company.com / admin123");
        }

        if (!userRepository.existsByEmail("dev1@company.com")) {
            User dev1 = User.builder()
                    .email("dev1@company.com")
                    .password(passwordEncoder.encode("dev123"))
                    .name("Rahul Sharma")
                    .role(User.Role.DEVELOPER)
                    .department("Backend")
                    .active(true)
                    .build();
            userRepository.save(dev1);
            System.out.println("✅ Developer created: dev1@company.com / dev123");
        }

        if (!userRepository.existsByEmail("dev2@company.com")) {
            User dev2 = User.builder()
                    .email("dev2@company.com")
                    .password(passwordEncoder.encode("dev123"))
                    .name("Priya Patel")
                    .role(User.Role.DEVELOPER)
                    .department("Frontend")
                    .active(true)
                    .build();
            userRepository.save(dev2);
            System.out.println("✅ Developer created: dev2@company.com / dev123");
        }
    }
}
