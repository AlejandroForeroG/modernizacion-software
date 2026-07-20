package org.springframework.samples.petclinic.modernization.owner;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.samples.petclinic.modernization.ResourceNotFoundException;
import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.OwnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OwnerQueryService {

	private final OwnerRepository owners;

	public OwnerQueryService(OwnerRepository owners) {
		this.owners = owners;
	}

	public OwnerSearchResponse search(String lastName, int page, int size) {
		String prefix = lastName == null ? "" : lastName.trim();
		Page<Owner> result = this.owners.findByLastNameStartingWith(prefix, PageRequest.of(page, size));
		return new OwnerSearchResponse(result.getContent().stream().map(OwnerSummary::from).toList(), page, size,
				result.getTotalElements(), result.getTotalPages());
	}

	public OwnerDetails findById(int ownerId) {
		Owner owner = this.owners.findById(ownerId)
			.orElseThrow(() -> new ResourceNotFoundException("Owner %d was not found.".formatted(ownerId)));
		return OwnerDetails.from(owner);
	}

}
