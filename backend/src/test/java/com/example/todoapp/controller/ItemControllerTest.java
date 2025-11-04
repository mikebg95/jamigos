package com.example.todoapp.controller;

import com.example.todoapp.aop.RequireOwnerAspect;
import com.example.todoapp.dto.ItemCreateRequest;
import com.example.todoapp.model.Item;
import com.example.todoapp.repository.ItemRepository;
import com.example.todoapp.security.CurrentUserService;
import com.example.todoapp.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.aop.AopAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ItemController.class)
@Import({RequireOwnerAspect.class, AopAutoConfiguration.class})
@ActiveProfiles("test")
class ItemControllerTest {

    private static final String USER_ID = "user-123";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    UserService userService;

    @MockitoBean
    JwtDecoder jwtDecoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ItemRepository itemRepository;

    @MockitoBean
    private CurrentUserService currentUserService;

    // ---------- GET /items ----------

    @Test
    void getAllItems_returnsAllItemsWhenFiltersDisabled() throws Exception {
        Item i1 = Item.of("Buy milk", USER_ID); i1.setId("1");
        Item i2 = Item.of("Walk dog", USER_ID); i2.setId("2");

        when(itemRepository.findAll()).thenReturn(List.of(i1, i2));

        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].text").value("Buy milk"))
                .andExpect(jsonPath("$[1].id").value("2"))
                .andExpect(jsonPath("$[1].text").value("Walk dog"));

        verify(itemRepository).findAll();
        verifyNoInteractions(currentUserService);
    }

    @Test
    void getAllItems_returnsEmptyArrayWhenNoneExist() throws Exception {
        when(itemRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.length()").value(0));

        verify(itemRepository).findAll();
        verifyNoInteractions(currentUserService);
    }

    @Test
    void getAllItems_returns500WhenRepositoryThrows() throws Exception {
        when(itemRepository.findAll()).thenThrow(new RuntimeException("boom"));

        mockMvc.perform(get("/items"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE));

        verify(itemRepository).findAll();
        verifyNoInteractions(currentUserService);
    }

    // ---------- POST /items ----------

    @Test
    void addItem_setsOwnerIdFromCurrentUser() throws Exception {
        when(currentUserService.getUserId()).thenReturn(USER_ID);
        when(itemRepository.save(any(Item.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemCreateRequest req = new ItemCreateRequest("Read book");

        mockMvc.perform(post("/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        var captor = org.mockito.ArgumentCaptor.forClass(Item.class);
        verify(itemRepository).save(captor.capture());
        Item saved = captor.getValue();
        assertThat(saved.getText()).isEqualTo("Read book");
        assertThat(saved.getOwnerId()).isEqualTo(USER_ID);
    }

    // ---------- DELETE /items/{id} ----------

    @Test
    void deleteItem_allowsOwner() throws Exception {
        when(currentUserService.getUserId()).thenReturn(USER_ID);
        when(itemRepository.existsByIdAndOwnerId("abc", USER_ID)).thenReturn(true);

        mockMvc.perform(delete("/items/abc"))
                .andExpect(status().isOk());

        verify(itemRepository).deleteById("abc");
    }

    @Test
    void deleteItem_forbiddenForNonOwner_returns404FromAspect() throws Exception {
        when(currentUserService.getUserId()).thenReturn(USER_ID);
        when(itemRepository.existsByIdAndOwnerId("abc", USER_ID)).thenReturn(false);

        mockMvc.perform(delete("/items/abc"))
                .andExpect(status().isNotFound());

        verify(itemRepository, never()).deleteById(anyString());
    }

    @Test
    void deleteItem_notFoundWhenMissing_returns404FromAspect() throws Exception {
        when(currentUserService.getUserId()).thenReturn(USER_ID);
        when(itemRepository.existsByIdAndOwnerId("missing", USER_ID)).thenReturn(false);

        mockMvc.perform(delete("/items/missing"))
                .andExpect(status().isNotFound());

        verify(itemRepository, never()).deleteById(anyString());
    }
}