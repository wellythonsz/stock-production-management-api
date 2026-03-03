package com.autoflex.inventory;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import jakarta.ws.rs.core.MediaType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
public class ProductResourceTest {

    @Test
    public void testListAllProductsEndpoint() {
        // Testa se o endpoint GET /api/products retorna 200 OK e um JSON válido
        given()
          .when().get("/api/products")
          .then()
             .statusCode(200)
             .contentType(MediaType.APPLICATION_JSON)
             .body(is(notNullValue()));
    }

    @Test
    public void testAvailableProductionEndpoint() {
        // Testa se o cérebro do nosso sistema (RF004) está respondendo com 200 OK
        given()
          .when().get("/api/products/available-production")
          .then()
             .statusCode(200)
             .contentType(MediaType.APPLICATION_JSON)
             .body(is(notNullValue()));
    }
    
    // Desafio Sênior: Testar a criação de um Produto isoladamente
    @Test
    public void testCreateProductEndpoint() {
        String newProductJson = """
            {
                "code": "TEST-001",
                "name": "Produto de Teste Automatizado",
                "value": 99.90
            }
            """;

        given()
          .contentType(MediaType.APPLICATION_JSON)
          .body(newProductJson)
          .when().post("/api/products")
          .then()
             .statusCode(201) // 201 Created
             .body("code", is("TEST-001"))
             .body("name", is("Produto de Teste Automatizado"));
    }
}