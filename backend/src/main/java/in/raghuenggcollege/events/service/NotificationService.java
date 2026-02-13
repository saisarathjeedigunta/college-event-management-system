package in.raghuenggcollege.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;

    public void sendGlobalNotification(String message) {
        messagingTemplate.convertAndSend("/topic/events", message);
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("📧 Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to + " Error: " + e.getMessage());
        }
    }
}
