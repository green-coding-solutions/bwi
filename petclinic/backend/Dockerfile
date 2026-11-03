# Spring PetClinic REST in the variants for the cluster runs of the workshop.
# GMT builds the target that the usage scenario names on the measurement machine.
#
#   db      Postgres with schema and data of PetClinic
#   native  GraalVM Native Image
#   crac    Zulu with CRaC. The checkpoint is taken while building, restore at start
#   jvm     JVM, JVM_IMAGE picks the JDK and JAVA_OPTS the flags. Default target
#
# All variants come from the same pinned source plus workshop.patch.

ARG PETCLINIC_TAG=v4.0.2
ARG JVM_IMAGE=eclipse-temurin:21.0.13_9-jre-noble
# Every cluster run downloads the dependencies again. A single 502 from Maven Central
# must not cost a whole run, so Maven retries gateway errors as well.
ARG MAVEN_RETRY="-Daether.transport.http.retryHandler.count=6 -Daether.transport.http.retryHandler.serviceUnavailable=429,500,502,503,504"

FROM alpine/git:v2.49.1 AS source
ARG PETCLINIC_TAG
WORKDIR /src
RUN git clone --depth 1 --branch ${PETCLINIC_TAG} https://github.com/spring-petclinic/spring-petclinic-rest.git .
COPY workshop.patch /tmp/workshop.patch
RUN git apply /tmp/workshop.patch

FROM postgres:16.15 AS db
# Spring does not run the SQL scripts in the workshop profile. Postgres loads them once at its first start.
COPY --from=source /src/src/main/resources/db/postgres/schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY --from=source /src/src/main/resources/db/postgres/data.sql /docker-entrypoint-initdb.d/02-data.sql

# One jar for all JVM variants, compiled for Java 17 as upstream does
FROM maven:3.9.16-eclipse-temurin-21-noble AS jar
ARG MAVEN_RETRY
ENV MAVEN_ARGS=${MAVEN_RETRY}
WORKDIR /src
COPY --from=source /src .
RUN mvn -B -q -DskipTests -Dcheckstyle.skip -Djacoco.skip package \
    && cp target/spring-petclinic-rest-*.jar /app.jar

FROM ghcr.io/graalvm/native-image-community:25.0.2-ol9 AS native-build
ARG MAVEN_RETRY
ENV MAVEN_ARGS=${MAVEN_RETRY}
WORKDIR /src
COPY --from=source /src .
# Spring AOT fixes the active profiles at build time and reads them from application.properties.
# Upstream defaults to h2 there, which would pick the H2 driver for the Postgres URL.
# A native image cannot do CRaC. With the CRaC library present, Spring Boot would add a Hikari
# checkpoint bean that needs reflection the image does not have, so the library goes.
RUN sed -i 's/^spring.profiles.active=.*/spring.profiles.active=postgres,spring-data-jpa,workshop/' \
        src/main/resources/application.properties \
    && sed -z -i 's|<dependency>\s*<groupId>org.crac</groupId>\s*<artifactId>crac</artifactId>\s*</dependency>||' pom.xml \
    && ! grep -q org.crac pom.xml \
    && ./mvnw -B -q -Pnative -DskipTests -Dcheckstyle.skip -Djacoco.skip native:compile \
    && cp target/spring-petclinic-rest /petclinic

FROM ubuntu:24.04 AS native
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=native-build /petclinic /app/petclinic
ENV SPRING_PROFILES_ACTIVE=postgres,spring-data-jpa,workshop
EXPOSE 9966
ENTRYPOINT ["/app/petclinic"]

FROM azul/zulu-openjdk:21.0.12.1-21.52-jre-crac AS crac
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=jar /app.jar /app/app.jar
# A restored JVM keeps the environment of the checkpoint, so it is fixed here
ENV SPRING_PROFILES_ACTIVE=postgres,spring-data-jpa,workshop \
    POSTGRES_URL=jdbc:postgresql://db/petclinic
# Warp needs no extra privileges, so the checkpoint works inside the image build.
# Spring takes it after the context refresh and the JVM exits with code 137.
RUN java -XX:CRaCEngine=warp -XX:CRaCCheckpointTo=/app/crac -Dspring.context.checkpoint=onRefresh \
        -jar /app/app.jar; test -d /app/crac
EXPOSE 9966
ENTRYPOINT ["java", "-XX:CRaCEngine=warp", "-XX:CRaCRestoreFrom=/app/crac"]

FROM ${JVM_IMAGE} AS jvm
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=jar /app.jar /app/app.jar
ENV SPRING_PROFILES_ACTIVE=postgres,spring-data-jpa,workshop
EXPOSE 9966
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
