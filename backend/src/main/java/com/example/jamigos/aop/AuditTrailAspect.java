package com.example.jamigos.aop;

import com.example.jamigos.model.AuditLog;
import com.example.jamigos.repository.AuditLogRepository;
import com.example.jamigos.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.CodeSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.Instant;
import java.util.Arrays;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditTrailAspect {
    private final CurrentUserService currentUserService;
    private final AuditLogRepository auditLogRepository;

    @AfterReturning("@annotation(postMapping)")
    public void afterPost(JoinPoint jp, PostMapping postMapping) {
        audit(jp, "CREATE");
    }

    @AfterReturning("@annotation(deleteMapping)")
    public void afterReturning(JoinPoint jp, DeleteMapping deleteMapping) {
        audit(jp, "DELETE");
    }

    private void audit(JoinPoint jp, String action) {
        String userId = safe(currentUserService::getUserId, "anonymous");
        String itemId = resolveIdArg(jp, "id"); // works for DELETE /items/{id}; may be "unknown" for POST
        String method = jp.getSignature().toShortString();
        Instant ts = Instant.now();

        // log to console
        log.info("[AUDIT] ts={} userId={} action={} itemId={} method={} args={}",
                ts, userId, action, itemId, method, Arrays.toString(jp.getArgs()));

        // create database entry
        AuditLog auditLog = new AuditLog(ts, userId, action, itemId);
        auditLogRepository.save(auditLog);
    }

    private static String resolveIdArg(JoinPoint jp, String idParamName) {
        if (!(jp.getSignature() instanceof CodeSignature sig)) return "unknown";
        String[] names = sig.getParameterNames();
        Object[] args = jp.getArgs();
        for (int i = 0; i < names.length; i++) {
            if (idParamName.equals(names[i]) && args[i] != null) {
                return String.valueOf(args[i]);
            }
        }
        return "unknown";
    }

    private static <T> T safe(SupplierEx<T> s, T fallback) {
        try { return s.get(); } catch (Exception ignored) { return fallback; }
    }

    @FunctionalInterface
    private interface SupplierEx<T> { T get() throws Exception; }
}

