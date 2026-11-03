package io.greencoding.workshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    // Start page for the forwarded port, so the browser does not land on a 404.
    // The links are relative because Codespaces serves the app under its own host.
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        return """
            <h1>Demo-App</h1>
            <p><a href="api/primes">/api/primes</a> zählt die Primzahlen bis 20000. Darauf geht die Last von k6.</p>
            <p><a href="actuator/prometheus">/actuator/prometheus</a> liefert die Metriken für Prometheus.</p>
            """;
    }

    // Some real CPU work per request so that CPU seconds per request is not just framework overhead
    @GetMapping("/api/primes")
    public long primes(@RequestParam(defaultValue = "20000") int limit) {
        long count = 0;
        for (int n = 2; n <= limit; n++) {
            boolean prime = true;
            for (int d = 2; (long) d * d <= n; d++) {
                if (n % d == 0) {
                    prime = false;
                    break;
                }
            }
            if (prime) {
                count++;
            }
        }
        return count;
    }
}
