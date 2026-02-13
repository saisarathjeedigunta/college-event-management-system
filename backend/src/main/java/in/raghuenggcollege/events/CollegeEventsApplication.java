package in.raghuenggcollege.events;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CollegeEventsApplication {

	public static void main(String[] args) {
		SpringApplication.run(CollegeEventsApplication.class, args);
	}

}
