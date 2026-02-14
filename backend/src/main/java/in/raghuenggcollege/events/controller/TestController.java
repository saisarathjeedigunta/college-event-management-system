package in.raghuenggcollege.events.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final JavaMailSender mailSender;

    @GetMapping("/email")
    public String testEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("collegeeventmanagementapplication@gmail.com"); // Self-test
            message.setSubject("Test Email");
            message.setText("This is a test email.");
            mailSender.send(message);
            return "✅ Email sent successfully!";
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Error: " + e.getMessage() + " || Type: " + e.getClass().getName();
        }
    }
}
