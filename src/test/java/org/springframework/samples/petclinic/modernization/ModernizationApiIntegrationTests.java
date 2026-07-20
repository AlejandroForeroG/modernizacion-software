package org.springframework.samples.petclinic.modernization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.modernization.owner.OwnerDetails;
import org.springframework.samples.petclinic.modernization.owner.OwnerSearchResponse;
import org.springframework.samples.petclinic.modernization.visit.CreateVisitRequest;
import org.springframework.samples.petclinic.modernization.visit.VisitResponse;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ModernizationApiIntegrationTests {

	@LocalServerPort
	private int port;

	@Autowired
	private RestTemplateBuilder builder;

	@Test
	void searchOwnersReturnsPrefixMatchesAndPaginationMetadata() {
		ResponseEntity<OwnerSearchResponse> response = restTemplate()
			.exchange(RequestEntity.get("/api/owners?lastName=Davis&page=0&size=5").build(), OwnerSearchResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().totalElements()).isEqualTo(2);
		assertThat(response.getBody().owners()).extracting("firstName").containsExactly("Betty", "Harold");
	}

	@Test
	void findOwnerReturnsPetsAndExistingVisits() {
		ResponseEntity<OwnerDetails> response = restTemplate().exchange(RequestEntity.get("/api/owners/6").build(),
				OwnerDetails.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().firstName()).isEqualTo("Jean");
		assertThat(response.getBody().pets()).extracting("name").containsExactly("Max", "Samantha");
		assertThat(response.getBody().pets()).flatExtracting("visits").isNotEmpty();
	}

	@Test
	void createVisitPersistsItInTheOwnerAggregate() {
		CreateVisitRequest request = new CreateVisitRequest(LocalDate.now().plusDays(3), "API pre-experiment visit");
		ResponseEntity<VisitResponse> response = restTemplate()
			.exchange(RequestEntity.post("/api/owners/1/pets/1/visits").body(request), VisitResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getHeaders().getLocation()).isNotNull();
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().description()).isEqualTo("API pre-experiment visit");

		OwnerDetails owner = restTemplate().exchange(RequestEntity.get("/api/owners/1").build(), OwnerDetails.class)
			.getBody();
		assertThat(owner).isNotNull();
		assertThat(owner.pets()).flatExtracting("visits")
			.extracting("description")
			.contains("API pre-experiment visit");
	}

	@Test
	void createVisitRejectsDatesThatAreNotInTheFuture() {
		CreateVisitRequest request = new CreateVisitRequest(LocalDate.now(), "Invalid visit");

		assertThatThrownBy(() -> restTemplate()
			.exchange(RequestEntity.post("/api/owners/1/pets/1/visits").body(request), VisitResponse.class))
			.isInstanceOfSatisfying(HttpClientErrorException.BadRequest.class,
					exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
	}

	private RestTemplate restTemplate() {
		return this.builder.rootUri("http://localhost:" + this.port).build();
	}

}
