package org.springframework.samples.petclinic.modernization.owner;

import org.springframework.samples.petclinic.owner.Owner;

public record OwnerSummary(Integer id, String firstName, String lastName, String address, String city,
		String telephone) {

	static OwnerSummary from(Owner owner) {
		return new OwnerSummary(owner.getId(), owner.getFirstName(), owner.getLastName(), owner.getAddress(),
				owner.getCity(), owner.getTelephone());
	}

}
