package org.springframework.samples.petclinic.modernization.visit;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateVisitRequest(@NotNull @Future LocalDate date, @NotBlank @Size(max = 255) String description) {
}
