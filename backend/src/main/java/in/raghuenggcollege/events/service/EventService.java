package in.raghuenggcollege.events.service;

import in.raghuenggcollege.events.entity.Event;
import in.raghuenggcollege.events.entity.Role;
import in.raghuenggcollege.events.entity.User;
import in.raghuenggcollege.events.repository.EventRepository;
import in.raghuenggcollege.events.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final in.raghuenggcollege.events.repository.RegistrationRepository registrationRepository;

    public List<Event> getAllUpcomingEvents() {
        return eventRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now());
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Transactional
    public Event createEvent(Event event, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Students cannot create events");
        }

        // Department Logic
        if (user.getRole() == Role.DEPT_ADMIN) {
            // Force event to be in Admin's department
            event.setDepartment(user.getDepartment());
        }
        // SUPER_ADMIN can set any department (or it defaults to null/provided value)
        if (event.getDepartment() == null && user.getRole() == Role.SUPER_ADMIN) {
            event.setDepartment("General"); // Default for Super Admin if not specified
        }

        event.setCreatedBy(user);
        Event saved = eventRepository.save(event);
        log.info("Created Event: {}, StartTime: {}", saved.getTitle(), saved.getStartTime());
        return saved;
    }

    @Transactional
    public Event updateEvent(Long id, Event eventDetails, String userEmail) {
        Event event = getEventById(id);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Permission Check
        if (user.getRole() == Role.DEPT_ADMIN && !event.getDepartment().equalsIgnoreCase(user.getDepartment())) {
            throw new AccessDeniedException("Unauthorized to edit this event");
        }

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setStartTime(eventDetails.getStartTime());
        event.setEndTime(eventDetails.getEndTime());
        event.setVenue(eventDetails.getVenue());
        event.setCapacity(eventDetails.getCapacity());
        event.setTags(eventDetails.getTags());
        event.setBannerUrl(eventDetails.getBannerUrl());

        if (user.getRole() == Role.SUPER_ADMIN) {
            event.setDepartment(eventDetails.getDepartment());
        }

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id, String userEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.SUPER_ADMIN) {
            registrationRepository.deleteByEvent(event);
            eventRepository.delete(event);
            return;
        }

        if (user.getRole() == Role.DEPT_ADMIN) {
            if (event.getDepartment().equalsIgnoreCase(user.getDepartment())) {
                registrationRepository.deleteByEvent(event);
                eventRepository.delete(event);
                return;
            }
        }

        throw new AccessDeniedException("You do not have permission to delete this event");
    }

    // Helper for Controller to call without email if needed, but safer to pass
    // email
    public void deleteEvent(Long id) {
        // This method is now unsafe without user context, so we should deprecate or
        // remove it
        // For now, let's just delegate or fail?
        // Better to update Controller to pass principal.
        throw new UnsupportedOperationException("UserId required for delete");
    }
}
