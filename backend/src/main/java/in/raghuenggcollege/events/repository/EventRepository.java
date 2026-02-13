package in.raghuenggcollege.events.repository;

import in.raghuenggcollege.events.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);
}
