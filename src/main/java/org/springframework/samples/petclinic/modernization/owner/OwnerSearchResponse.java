package org.springframework.samples.petclinic.modernization.owner;

import java.util.List;

public record OwnerSearchResponse(List<OwnerSummary> owners, int page, int size, long totalElements, int totalPages) {
}
