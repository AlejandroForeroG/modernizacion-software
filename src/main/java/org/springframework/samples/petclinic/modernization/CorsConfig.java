package org.springframework.samples.petclinic.modernization;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the React client to call the {@code /api/**} boundary from a different origin
 * (e.g. a static frontend hosted separately from this backend). Only the REST API is
 * opened up; server-rendered Thymeleaf routes are plain page navigations and do not need
 * CORS.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final String allowedOrigin;

	public CorsConfig(@Value("${app.cors.allowed-origin}") String allowedOrigin) {
		this.allowedOrigin = allowedOrigin;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
			.allowedOrigins(allowedOrigin)
			.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
	}

}
