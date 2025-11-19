package com.example.jamigos.aop;

import jakarta.validation.constraints.NotBlank;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.lang.reflect.Field;

@Aspect
@Component
public class InputValidationAspect {
    @Before("@annotation(org.springframework.web.bind.annotation.PostMapping) && within(com.example.todoapp.controller..*)")
    public void validateInput(JoinPoint joinPoint) {
        for (Object arg : joinPoint.getArgs()) {
            if (arg == null) continue;

            // simple string param
            if (arg instanceof String s) {
                if (isBlank(s)) throw badRequest("string parameter can not be blank");
                continue;
            }

            // item DTO: only check item title
            Class<?> clazz = arg.getClass();
            for (Field field : clazz.getDeclaredFields()) {
                if (!field.isAnnotationPresent(NotBlank.class)) continue;
                field.setAccessible(true);
                try {
                    Object value = field.get(arg);
                    if (value == null || (value instanceof String str && isBlank(str))) {
                        throw badRequest("field '" + field.getName() + "' must not be blank");
                    }
                } catch (IllegalAccessException e) {
                    throw badRequest("invalid value for field '" + field.getName() + "'");
                }
            }
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static ResponseStatusException badRequest(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
