package in.raghuenggcollege.events.util;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Constraint(validatedBy = CollegeEmailValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCollegeEmail {
    String message() default "Email must belong to @raghuenggcollege.in domain";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
