package in.raghuenggcollege.events.service;

import in.raghuenggcollege.events.entity.Event;
import in.raghuenggcollege.events.entity.Registration;
import in.raghuenggcollege.events.repository.EventRepository;
import in.raghuenggcollege.events.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    // Run every hour to check for events starting in the next 24-25 hours
    @Scheduled(cron = "0 0 * * * *")
    public void sendEventReminders() {
        LocalDateTime tomorrowStart = LocalDateTime.now().plusDays(1).minusMinutes(30); // simplistic check
        LocalDateTime tomorrowEnd = LocalDateTime.now().plusDays(1).plusMinutes(30);

        // Find events starting around this time tomorrow
        // Note: In a real app, use a custom query for "between" dates.
        // For simplicity, we'll fetch all future events and filter in code (not
        // efficient for huge data, fine for college project)
        List<Event> upcomingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getStartTime().isAfter(tomorrowStart) &&
                        e.getStartTime().isBefore(tomorrowEnd))
                .toList();

        for (Event event : upcomingEvents) {
            List<Registration> registrations = registrationRepository.findByEvent(event);
            for (Registration reg : registrations) {
                if (reg.getUser() != null && reg.getUser().getEmail() != null) {
                    notificationService.sendEmail(
                            reg.getUser().getEmail(),
                            "Reminder: " + event.getTitle() + " is tomorrow!",
                            "Don't forget, " + event.getTitle() + " starts at " + event.getStartTime());
                }
            }
        }
    }
}
