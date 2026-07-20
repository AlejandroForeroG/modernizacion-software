package org.springframework.samples.petclinic.modernization.visit;

import java.time.LocalDate;

import org.springframework.samples.petclinic.owner.Visit;

public record VisitResponse(Integer id, int ownerId, int petId, LocalDate date, String description) {

	static VisitResponse from(int ownerId, int petId, Visit visit) {
		return new VisitResponse(visit.getId(), ownerId, petId, visit.getDate(), visit.getDescription());
	}

}
