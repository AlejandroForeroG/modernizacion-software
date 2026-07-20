package org.springframework.samples.petclinic.modernization.owner;

import java.time.LocalDate;
import java.util.List;

import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.Pet;
import org.springframework.samples.petclinic.owner.Visit;

public record OwnerDetails(Integer id, String firstName, String lastName, String address, String city, String telephone,
		List<PetDetails> pets) {

	static OwnerDetails from(Owner owner) {
		return new OwnerDetails(owner.getId(), owner.getFirstName(), owner.getLastName(), owner.getAddress(),
				owner.getCity(), owner.getTelephone(), owner.getPets().stream().map(PetDetails::from).toList());
	}

	public record PetDetails(Integer id, String name, LocalDate birthDate, String type, List<VisitDetails> visits) {

		static PetDetails from(Pet pet) {
			String typeName = pet.getType() == null ? null : pet.getType().getName();
			return new PetDetails(pet.getId(), pet.getName(), pet.getBirthDate(), typeName,
					pet.getVisits().stream().map(VisitDetails::from).toList());
		}
	}

	public record VisitDetails(Integer id, LocalDate date, String description) {

		static VisitDetails from(Visit visit) {
			return new VisitDetails(visit.getId(), visit.getDate(), visit.getDescription());
		}
	}

}
