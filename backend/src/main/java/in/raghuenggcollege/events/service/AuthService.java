package in.raghuenggcollege.events.service;

import in.raghuenggcollege.events.config.JwtAuthenticationFilter;
import in.raghuenggcollege.events.dto.AuthenticationRequest;
import in.raghuenggcollege.events.dto.AuthenticationResponse;
import in.raghuenggcollege.events.dto.RegisterRequest;
import in.raghuenggcollege.events.dto.VerifyRequest;
import in.raghuenggcollege.events.entity.Role;
import in.raghuenggcollege.events.entity.User;
import in.raghuenggcollege.events.entity.VerificationToken;
import in.raghuenggcollege.events.repository.UserRepository;
import in.raghuenggcollege.events.repository.VerificationTokenRepository;
import in.raghuenggcollege.events.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT) // Default role
                .isVerified(false)
                .build();

        userRepository.save(user);

        // Generate and Send OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        var token = VerificationToken.builder()
                .email(request.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        tokenRepository.save(token);
        sendOtpEmail(request.getEmail(), otp);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            System.out.println("🔐 Attempting login for: " + request.getEmail());
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
            System.out.println("✅ Login successful for: " + request.getEmail());
        } catch (Exception e) {
            System.out.println("❌ Login FAILED for: " + request.getEmail() + " Error: " + e.getMessage());
            throw e;
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Account not verified. Please verify your email.");
        }

        var jwtToken = jwtUtil.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .department(user.getDepartment())
                .build();
    }

    public void verify(VerifyRequest request) {
        var token = tokenRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token); // Cleanup
            throw new RuntimeException("OTP expired");
        }

        if (!token.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setVerified(true);
        userRepository.save(user);

        tokenRepository.delete(token);
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Raghu Engineering College - Email Verification");
        message.setText("Your verification code is: " + otp + "\n\nThis code expires in 10 minutes.");
        mailSender.send(message);
    }
}
