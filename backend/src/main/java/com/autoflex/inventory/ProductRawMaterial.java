package com.autoflex.inventory;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class ProductRawMaterial extends PanacheEntity {

    // A ligação ao Produto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore // Muito importante: impede um loop infinito ao gerar o JSON
    public Product product;

    // A ligação à Matéria-prima
    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    public RawMaterial rawMaterial;

    // A quantidade necessária desta matéria-prima para fabricar o produto
    public Integer requiredQuantity;
}