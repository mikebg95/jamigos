package dev.michaelgoldman.jamigos.aop;

import dev.michaelgoldman.jamigos.controller.ItemController;
import dev.michaelgoldman.jamigos.dto.ItemCreateRequest;
import dev.michaelgoldman.jamigos.service.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * Proxies a real controller with the aspect so the pointcut expression itself is
 * exercised: if it stops matching the controller package, these tests fail.
 */
class InputValidationAspectTest {

    private ItemService itemService;
    private ItemController proxiedController;

    @BeforeEach
    void setUp() {
        itemService = mock(ItemService.class);
        AspectJProxyFactory factory = new AspectJProxyFactory(new ItemController(itemService));
        factory.setProxyTargetClass(true);
        factory.addAspect(new InputValidationAspect());
        proxiedController = factory.getProxy();
    }

    @Test
    void rejectsBlankNotBlankFieldOnPostMapping() {
        assertThatThrownBy(() -> proxiedController.addItem(new ItemCreateRequest("   ")))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(itemService, never()).addItem(anyString());
    }

    @Test
    void passesValidInputThrough() {
        proxiedController.addItem(new ItemCreateRequest("Rehearse Friday"));

        verify(itemService).addItem("Rehearse Friday");
    }
}
