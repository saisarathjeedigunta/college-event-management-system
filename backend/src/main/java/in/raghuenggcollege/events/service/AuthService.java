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
import org.springframework.transaction.annotation.Transactional;

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

    // Public method - handles registration flow
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail()).get();
            if (existingUser.isVerified()) {
                throw new RuntimeException("Email already registered");
            }
            // User exists but NOT verified -> Update details & Resend OTP
            updateExistingUser(existingUser, request);
            String otp = generateAndSaveOtp(existingUser.getEmail());
            sendOtpEmailSafely(existingUser.getEmail(), otp);
            return;
        }

        // Create new user and token (transactional)
        User user = createUserAndToken(request);

        // Send email (non-transactional, with error handling)
        String otp = tokenRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("Token not found"))
                .getOtpCode();
        sendOtpEmailSafely(user.getEmail(), otp);
    }

    // Transactional: Create user and token atomically
    @Transactional
    private User createUserAndToken(RegisterRequest request) {
        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .isVerified(false)
                .build();

        userRepository.save(user);

        // Generate and save OTP token
        String otp = String.format("%06d", new Random().nextInt(999999));
        var token = VerificationToken.builder()
                .email(request.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        tokenRepository.save(token);
        return user;
    }

    // Transactional: Update existing unverified user
    @Transactional
    private void updateExistingUser(User user, RegisterRequest request) {
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    // Transactional: Generate and save new OTP
    @Transactional
    private String generateAndSaveOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        VerificationToken token = tokenRepository.findByEmail(email)
                .orElse(VerificationToken.builder().email(email).build());

        token.setOtpCode(otp);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(token);
        return otp;
    }

    // Non-transactional: Send email with error handling
    private void sendOtpEmailSafely(String email, String otp) {
        try {
            sendOtpEmail(email, otp);
            System.out.println("✅ OTP email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send OTP email to: " + email);
            System.err.println("   Error: " + e.getMessage());
            // User is still created - they can request resend later
            // Don't throw exception - registration should succeed
        }
    }

    // Public method: Resend OTP to user
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User already verified");
        }

        // Generate and save new OTP
        String otp = generateAndSaveOtp(email);

        // Send email (gracefully handles failures)
        sendOtpEmailSafely(email, otp);
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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Raghu Engineering College - Email Verification");
            message.setText("Your verification code is: " + otp + "\n\nThis code expires in 10 minutes.");
            mailSender.send(message);
            System.out.println("✅ OTP Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("❌ FAILED to send OTP email to: " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
}
