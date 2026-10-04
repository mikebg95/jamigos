package dev.michaelgoldman.jamigos.aop;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireOwner {
    String idParam() default "id";
    boolean allowAdmin() default true;
}