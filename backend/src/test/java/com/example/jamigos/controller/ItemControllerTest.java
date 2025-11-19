package com.example.jamigos.controller;

import com.example.jamigos.dto.ItemCreateRequest;
import com.example.jamigos.model.Item;
import com.example.jamigos.service.ItemService;
import com.example.jamigos.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ItemController.class)
@ActiveProfiles("test")
@Import(GlobalExceptionHandler.class)
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
    private ItemService itemService;

    // ---------- GET /items ----------

    @Test
    void getAllItemsForUser_returnsAllItemsWhenFiltersDisabled() throws Exception {
        Item i1 = Item.of("Buy milk", USER_ID); i1.setId("1");
        Item i2 = Item.of("Walk dog", USER_ID); i2.setId("2");

        when(itemService.getAllItemsForUser()).thenReturn(List.of(i1, i2));

        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].text").value("Buy milk"))
                .andExpect(jsonPath("$[1].id").value("2"))
                .andExpect(jsonPath("$[1].text").value("Walk dog"));

        verify(itemService).getAllItemsForUser();
    }

    @Test
    void getAllItemsForUser_returnsEmptyArrayWhenNoneExist() throws Exception {
        when(itemService.getAllItemsForUser()).thenReturn(List.of());

        mockMvc.perform(get("/items"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.length()").value(0));

        verify(itemService).getAllItemsForUser();
    }

    @Test
    void getAllItemsForUser_returns500WhenRepositoryThrows() throws Exception {
        when(itemService.getAllItemsForUser()).thenThrow(new RuntimeException("boom"));

        mockMvc.perform(get("/items"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE));

        verify(itemService).getAllItemsForUser();
    }

    // ---------- POST /items ----------

    @Test
    void addItem_returns201WhenItemAdded() throws Exception {
        doNothing().when(itemService).addItem(anyString());

        ItemCreateRequest request = new ItemCreateRequest("Do whatever");
        mockMvc.perform(post("/items")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());
    }

    @Test
    void addItem_returns400WhenAddingEmptyString() throws Exception {
        ItemCreateRequest request = new ItemCreateRequest("");

        mockMvc.perform(post("/items")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    // ---------- DELETE /items/{id} ----------

    @Test
    void deleteItem_returns204WhenItemDeleted() throws Exception {
        doNothing().when(itemService).deleteItem(anyString());

        mockMvc.perform(delete("/items/item-123"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteItem_returns404WhenItemDoesNotExist() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"))
                .when(itemService).deleteItem("bad-id");

        mockMvc.perform(delete("/items/bad-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteItem_returns405WhenIdIsMissing() throws Exception {
        mockMvc.perform(delete("/items"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void getAllItemsForAdmin_returns200() throws Exception {
        when(itemService.getAllItemsForAdmin()).thenReturn(List.of());
        mockMvc.perform(get("/items/all"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllItemsForAdmin_returns200WithItems() throws Exception {
        Item a = Item.of("A", USER_ID); a.setId("1");
        Item b = Item.of("B", USER_ID); b.setId("2");
        when(itemService.getAllItemsForAdmin()).thenReturn(List.of(a, b));

        mockMvc.perform(get("/items/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].text").value("A"))
                .andExpect(jsonPath("$[1].id").value("2"))
                .andExpect(jsonPath("$[1].text").value("B"));

        verify(itemService).getAllItemsForAdmin();
    }

    @Test
    void getAllItemsForAdmin_returns403WhenAccessDenied() throws Exception {
        doThrow(new AccessDeniedException("denied"))
                .when(itemService).getAllItemsForAdmin();

        mockMvc.perform(get("/items/all"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllItemsForAdmin_returns500OnUnexpectedError() throws Exception {
        when(itemService.getAllItemsForAdmin()).thenThrow(new RuntimeException("boom"));

        mockMvc.perform(get("/items/all"))
                .andExpect(status().isInternalServerError());
    }
}