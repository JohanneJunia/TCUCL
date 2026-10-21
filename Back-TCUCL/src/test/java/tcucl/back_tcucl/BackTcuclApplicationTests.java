package tcucl.back_tcucl;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Vérifie que l'application démarre (beans, configuration, Flyway, Hibernate).
 * Désactivé : nécessite une base PostgreSQL accessible et les variables du .env.
 * À réactiver avec Testcontainers.
 */
@SpringBootTest
@Disabled("Nécessite une base PostgreSQL et les variables du .env (à migrer vers Testcontainers)")
class BackTcuclApplicationTests {

	@Test
	void contextLoads() {
	}
}