package dev.michaelgoldman.jamigos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ItemCreateRequest {
    @NotBlank
    private String text;
}
