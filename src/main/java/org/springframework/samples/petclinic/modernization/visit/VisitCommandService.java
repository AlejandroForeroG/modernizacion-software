package org.springframework.samples.petclinic.modernization.visit;

import org.springframework.samples.petclinic.modernization.ResourceNotFoundException;
import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.OwnerRepository;
import org.springframework.samples.petclinic.owner.Pet;
import org.springframework.samples.petclinic.owner.Visit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VisitCommandService {

	private final OwnerRepository owners;

	public VisitCommandService(OwnerRepository owners) {
		this.owners = owners;
	}

	@Transactional
	public VisitResponse create(int ownerId, int petId, CreateVisitRequest request) {
		Owner owner = this.owners.findById(ownerId)
			.orElseThrow(() -> new ResourceNotFoundException("Owner %d was not found.".formatted(ownerId)));
		Pet pet = owner.getPet(petId);
		if (pet == null) {
			throw new ResourceNotFoundException("Pet %d does not belong to owner %d.".formatted(petId, ownerId));
		}

		Visit visit = new Visit();
		visit.setDate(request.date());
		visit.setDescription(request.description().trim());
		pet.addVisit(visit);
		this.owners.save(owner);
		return VisitResponse.from(ownerId, petId, visit);
	}

}
