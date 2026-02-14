package in.raghuenggcollege.events.service;

import in.raghuenggcollege.events.entity.Event;
import in.raghuenggcollege.events.entity.Registration;
import in.raghuenggcollege.events.entity.RegistrationStatus;
import in.raghuenggcollege.events.entity.User;
import in.raghuenggcollege.events.repository.EventRepository;
import in.raghuenggcollege.events.repository.RegistrationRepository;
import in.raghuenggcollege.events.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Registration registerUser(Long eventId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Optional<Registration> existingOpt = registrationRepository.findByUserAndEvent(user, event);
        if (existingOpt.isPresent()) {
            Registration existing = existingOpt.get();
            if (existing.getStatus() != RegistrationStatus.CANCELLED) {
                throw new RuntimeException("You are already registered for this event");
            }
            // Re-activate cancelled registration
            long confirmedCount = registrationRepository.countByEventAndStatus(event, RegistrationStatus.CONFIRMED);
            RegistrationStatus newStatus = (confirmedCount < event.getCapacity()) ? RegistrationStatus.CONFIRMED
                    : RegistrationStatus.WAITLIST;
            existing.setStatus(newStatus);

            Registration saved = registrationRepository.save(existing);
            if (newStatus == RegistrationStatus.CONFIRMED) {
                sendConfirmationEmail(user, event);
            }
            return saved;
        }

        long confirmedCount = registrationRepository.countByEventAndStatus(event, RegistrationStatus.CONFIRMED);

        RegistrationStatus status = (confirmedCount < event.getCapacity())
                ? RegistrationStatus.CONFIRMED
                : RegistrationStatus.WAITLIST;

        Registration registration = Registration.builder()
                .user(user)
                .event(event)
                .status(status)
                .build();

        Registration saved = registrationRepository.save(registration);
        if (status == RegistrationStatus.CONFIRMED) {
            sendConfirmationEmail(user, event);
        }
        return saved;
    }

    private void sendConfirmationEmail(User user, Event event) {
        notificationService.sendEmail(
                user.getEmail(),
                "Registration Confirmed: " + event.getTitle(),
                "Hello " + user.getFullName() + ",\n\n" +
                        "You have successfully registered for " + event.getTitle() + ".\n" +
                        "Venue: " + event.getVenue() + "\n" +
                        "Time: " + event.getStartTime() + "\n\n" +
                        "See you there!");
    }

    @Transactional
    public void cancelRegistration(Long registrationId, String userEmail) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        if (!registration.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized cancellation");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);

        promoteNextUser(registration.getEvent());
    }

    private void promoteNextUser(Event event) {
        long confirmedCount = registrationRepository.countByEventAndStatus(event, RegistrationStatus.CONFIRMED);

        if (confirmedCount < event.getCapacity()) {
            registrationRepository.findTopByEventAndStatusOrderByRegisteredAtAsc(event, RegistrationStatus.WAITLIST)
                    .ifPresent(nextUser -> {
                        nextUser.setStatus(RegistrationStatus.CONFIRMED);
                        registrationRepository.save(nextUser);
                    });
        }
    }

    @Transactional(readOnly = true)
    public List<Registration> getUserRegistrations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<Registration> regs = registrationRepository.findByUser(user);
        System.out.println("📦 Found " + regs.size() + " registrations for user: " + userEmail);
        return regs;
    }
}
