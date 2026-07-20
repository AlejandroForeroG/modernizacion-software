package org.springframework.samples.petclinic.modernization.owner;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/owners")
@Validated
public class OwnerRestController {

	private final OwnerQueryService owners;

	public OwnerRestController(OwnerQueryService owners) {
		this.owners = owners;
	}

	@GetMapping
	OwnerSearchResponse search(@RequestParam(defaultValue = "") String lastName,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "5") @Min(1) @Max(20) int size) {
		return this.owners.search(lastName, page, size);
	}

	@GetMapping("/{ownerId}")
	OwnerDetails findById(@PathVariable int ownerId) {
		return this.owners.findById(ownerId);
	}

}
