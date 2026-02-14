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

    // PRODUCTION MODE: Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void sendEventReminders() {
        System.out.println("⏰ Reminder Service: Checking for upcoming events...");

        LocalDateTime now = LocalDateTime.now();

        // Find all upcoming events (next 7 days)
        List<Event> upcomingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getStartTime().isAfter(now))
                .toList();

        System.out.println("📋 Found " + upcomingEvents.size() + " upcoming events.");

        for (Event event : upcomingEvents) {
            System.out.println("🔍 Processing event ID: " + event.getId() + ", Title: " + event.getTitle() + " at "
                    + event.getStartTime());

            // Calculate time until event
            long hoursUntilEvent = java.time.Duration.between(now, event.getStartTime()).toHours();
            long minutesUntilEvent = java.time.Duration.between(now, event.getStartTime()).toMinutes();

            System.out
                    .println("   Time until event: " + hoursUntilEvent + " hours (" + minutesUntilEvent + " minutes)");

            // Send reminders at specific intervals: 24h, 1h, 15min
            boolean shouldSendReminder = false;
            String reminderType = "";

            if (hoursUntilEvent >= 23 && hoursUntilEvent <= 25) {
                shouldSendReminder = true;
                reminderType = "24 hours";
            } else if (hoursUntilEvent >= 0 && hoursUntilEvent <= 1 && minutesUntilEvent > 15) {
                shouldSendReminder = true;
                reminderType = "1 hour";
            } else if (minutesUntilEvent >= 10 && minutesUntilEvent <= 20) {
                shouldSendReminder = true;
                reminderType = "15 minutes";
            }

            if (!shouldSendReminder) {
                System.out.println("   ⏭️ Skipping - Not in reminder window (24h, 1h, or 15min before)");
                continue;
            }

            System.out.println("   ✅ Sending " + reminderType + " reminder");

            List<Registration> registrations = registrationRepository.findByEventIdWithUser(event.getId());
            System.out.println("   Found " + registrations.size() + " registrations for event ID: " + event.getId());

            for (Registration reg : registrations) {
                System.out.println("   - Registration ID: " + reg.getId() + ", Status: " + reg.getStatus());

                if (reg.getUser() != null && reg.getUser().getEmail() != null) {
                    System.out.println("📨 Sending reminder to: " + reg.getUser().getEmail());
                    notificationService.sendEmail(
                            reg.getUser().getEmail(),
                            "Reminder: " + event.getTitle() + " is coming up!",
                            "Don't forget! " + event.getTitle() + " starts at " + event.getStartTime() +
                                    " (in approximately " + reminderType + ").\n\nVenue: " + event.getVenue() +
                                    "\n\nSee you there!");
                } else {
                    System.out.println("   ⚠️ Skipping - User or email is null");
                }
            }
        }
    }
}
