package in.raghuenggcollege.events.repository;

import in.raghuenggcollege.events.entity.Event;
import in.raghuenggcollege.events.entity.Registration;
import in.raghuenggcollege.events.entity.RegistrationStatus;
import in.raghuenggcollege.events.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByUserAndEvent(User user, Event event);

    long countByEventAndStatus(Event event, RegistrationStatus status);

    // Find the oldest waitlisted registration for a specific event
    Optional<Registration> findTopByEventAndStatusOrderByRegisteredAtAsc(Event event, RegistrationStatus status);

    List<Registration> findByUser(User user);

    List<Registration> findByEvent(Event event);

    void deleteByEvent(Event event);
}
