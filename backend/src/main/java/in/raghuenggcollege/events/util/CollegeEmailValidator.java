package in.raghuenggcollege.events.util;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CollegeEmailValidator implements ConstraintValidator<ValidCollegeEmail, String> {

    private static final String COLLEGE_DOMAIN = "@raghuenggcollege.in";

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isBlank()) {
            return false; // Let @NotNull handle nulls if needed, or return true if optional
        }
        return email.endsWith(COLLEGE_DOMAIN);
    }
}
