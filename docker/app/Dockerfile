# Etapa 1: build del jar con Maven (no requiere mvn instalado en el host)
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B package -DskipTests

# Etapa 2: imagen de ejecución, solo con el JRE y el jar generado
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN useradd -r -u 1001 spring
COPY --from=build /app/target/*.jar app.jar
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
