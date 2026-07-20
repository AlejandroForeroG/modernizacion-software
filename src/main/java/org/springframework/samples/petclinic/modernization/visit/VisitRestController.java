package org.springframework.samples.petclinic.modernization.visit;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/owners/{ownerId}/pets/{petId}/visits")
public class VisitRestController {

	private final VisitCommandService visits;

	public VisitRestController(VisitCommandService visits) {
		this.visits = visits;
	}

	@PostMapping
	ResponseEntity<VisitResponse> create(@PathVariable int ownerId, @PathVariable int petId,
			@Valid @RequestBody CreateVisitRequest request) {
		VisitResponse created = this.visits.create(ownerId, petId, request);
		URI location = URI.create("/api/owners/%d/pets/%d/visits/%d".formatted(ownerId, petId, created.id()));
		return ResponseEntity.created(location).body(created);
	}

}
