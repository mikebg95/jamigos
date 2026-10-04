package dev.michaelgoldman.jamigos.aop;

import dev.michaelgoldman.jamigos.repository.ItemRepository;
import dev.michaelgoldman.jamigos.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.CodeSignature;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Aspect
@Component
@RequiredArgsConstructor
public class RequireOwnerAspect {
    private final ItemRepository itemRepository;
    private final CurrentUserService currentUserService;

    @Before("@annotation(requireOwner)")
    public void verifyOwnership(JoinPoint jp, RequireOwner requireOwner) {
        String idParamName = requireOwner.idParam();
        boolean allowAdmin = requireOwner.allowAdmin();
        String itemId = resolveItemId(jp, idParamName);

        // get roles for current user
        List<String> roles = new ArrayList<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            roles = auth.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
        }

        // if user is admin and admin is allowed, break out of this aspect
        if (roles.contains("ROLE_ADMIN") && allowAdmin) {
            return;
        }

        // check if item exists in database for this owner
        String currentUserId = currentUserService.getUserId();
        boolean itemExistsByThisOwner = itemRepository.existsByIdAndOwnerId(itemId, currentUserId);

        // item doesn't exist or belongs to someone else
        if (!itemExistsByThisOwner) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
    }

    private static String resolveItemId(JoinPoint jp, String idParamName) {
        String itemId = null;

        CodeSignature signature =  (CodeSignature) jp.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = jp.getArgs();

        // get value of method parameters id param
        for (int i = 0; i < parameterNames.length; i++) {
            String param = parameterNames[i];
            if (param.equals(idParamName)) {
                itemId = String.valueOf(args[i]);
                break;
            }
        }

        // make sure idParam is not null or blank
        if (itemId == null || itemId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing parameter: " + idParamName);
        }
        return itemId;
    }
}
