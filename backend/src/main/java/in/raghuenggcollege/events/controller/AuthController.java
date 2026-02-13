package in.raghuenggcollege.events.controller;

import in.raghuenggcollege.events.dto.AuthenticationRequest;
import in.raghuenggcollege.events.dto.AuthenticationResponse;
import in.raghuenggcollege.events.dto.RegisterRequest;
import in.raghuenggcollege.events.dto.VerifyRequest;
import in.raghuenggcollege.events.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Allow React App
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequest request) {
        service.register(request);
        return ResponseEntity.ok("User registered successfully. details sent to email.");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verify(@RequestBody @Valid VerifyRequest request) {
        service.verify(request);
        return ResponseEntity.ok("Account verified successfully.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
