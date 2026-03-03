package com.autoflex.inventory;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
public class Product extends PanacheEntity {
    
    // O PanacheEntity já cria o "public Long id" automaticamente para nós!

    @Column(nullable = false, unique = true)
    public String code;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public BigDecimal value;

}