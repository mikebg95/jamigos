package com.example.jamigos.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ExecutionTimeAspect {

    private static final Logger log = LoggerFactory.getLogger(ExecutionTimeAspect.class);

    @Around("@within(com.example.jamigos.aop.LogExecutionTime) || @annotation(com.example.jamigos.aop.LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.nanoTime();
        Object result = joinPoint.proceed(); // run the method
        long durationMs = (System.nanoTime() - start) / 1_000_000;

        log.info("{} took {} ms", joinPoint.getSignature(), durationMs);

        return result;
    }
}
