package in.raghuenggcollege.events.config;

import in.raghuenggcollege.events.entity.Event;
import in.raghuenggcollege.events.entity.Role;
import in.raghuenggcollege.events.entity.User;
import in.raghuenggcollege.events.repository.EventRepository;
import in.raghuenggcollege.events.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedEvents();
    }

    private void seedUsers() {
        // SUPER ADMIN
        if (userRepository.findByEmail("admin@raghuenggcollege.in").isEmpty()) {
            User admin = User.builder()
                    .fullName("Super Admin")
                    .email("admin@raghuenggcollege.in")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.SUPER_ADMIN)
                    .isVerified(true)
                    .department("Administration")
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Seeded SUPER_ADMIN");
        }

        // DEPT ADMIN (CSE)
        if (userRepository.findByEmail("cse.admin@raghuenggcollege.in").isEmpty()) {
            User cseAdmin = User.builder()
                    .fullName("CSE HOD")
                    .email("cse.admin@raghuenggcollege.in")
                    .password(passwordEncoder.encode("cse123"))
                    .role(Role.DEPT_ADMIN)
                    .isVerified(true)
                    .department("CSE")
                    .build();
            userRepository.save(cseAdmin);
            System.out.println("✅ Seeded CSE DEPT_ADMIN");
        }

        // STUDENT
        if (userRepository.findByEmail("student@raghuenggcollege.in").isEmpty()) {
            User student = User.builder()
                    .fullName("Student User")
                    .email("student@raghuenggcollege.in")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.STUDENT)
                    .isVerified(true)
                    .department("CSE")
                    .build();
            userRepository.save(student);
            System.out.println("✅ Seeded STUDENT");
        }
    }

    private void seedEvents() {
        if (eventRepository.count() == 0) {
            User cseAdmin = userRepository.findByEmail("cse.admin@raghuenggcollege.in").orElseThrow();
            User superAdmin = userRepository.findByEmail("admin@raghuenggcollege.in").orElseThrow();

            // CSE Event (Created by Dept Admin)
            Event event1 = Event.builder()
                    .title("AI & ML Workshop")
                    .description("Introduction to Machine Learning.")
                    .venue("CSE Seminar Hall")
                    .startTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(2).withHour(13).withMinute(0))
                    .capacity(60)
                    .createdBy(cseAdmin)
                    .department("CSE")
                    .tags("AI, ML, CSE")
                    .build();

            // General Event (Created by Super Admin)
            Event event2 = Event.builder()
                    .title("College Fest 2026")
                    .description("Annual Cultural Fest.")
                    .venue("Main Ground")
                    .startTime(LocalDateTime.now().plusWeeks(1).withHour(18).withMinute(0))
                    .endTime(LocalDateTime.now().plusWeeks(1).withHour(22).withMinute(0))
                    .capacity(500)
                    .createdBy(superAdmin)
                    .department("General")
                    .tags("Cultural, Fun")
                    .build();

            eventRepository.save(event1);
            eventRepository.save(event2);
            System.out.println("✅ Seeded Events: AI Workshop & College Fest");
        }
    }
}
