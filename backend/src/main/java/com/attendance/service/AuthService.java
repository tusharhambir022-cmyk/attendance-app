package com.attendance.service;

import com.attendance.dto.Dto;
import com.attendance.entity.User;
import com.attendance.repository.UserRepository;
import com.attendance.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    public Dto.LoginResponse login(Dto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return Dto.LoginResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }
}
