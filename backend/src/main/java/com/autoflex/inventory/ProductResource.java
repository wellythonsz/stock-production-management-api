package com.autoflex.inventory;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    // 1. READ: Lista todos os produtos
    @GET
    public List<Product> listAll() {
        return Product.listAll();
    }

    // 2. CREATE: Adiciona um novo produto
    @POST
    @Transactional
    public Response create(Product product) {
        if (product.id != null) {
            throw new WebApplicationException("Id was invalidly set on request.", 422);
        }
        product.persist();
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    // 3. UPDATE: Atualiza um produto existente
    @PUT
    @Path("/{id}")
    @Transactional
    public Product update(@PathParam("id") Long id, Product updatedProduct) {
        Product entity = Product.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Product with id of " + id + " does not exist.", 404);
        }
        entity.code = updatedProduct.code;
        entity.name = updatedProduct.name;
        entity.value = updatedProduct.value;
        return entity;
    }

    // 4. DELETE: Remove um produto
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Product entity = Product.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Product with id of " + id + " does not exist.", 404);
        }
        entity.delete();
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    // --- NOVOS ENDPOINTS: COMPOSIÇÃO DO PRODUTO (RECEITA) ---

    // 5. Adicionar uma matéria-prima a um produto
    @POST
    @Path("/{id}/raw-materials")
    @Transactional
    public Response addRawMaterialToProduct(@PathParam("id") Long productId, ProductRawMaterial payload) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new WebApplicationException("Product not found.", 404);
        }
        
        // Verifica se a matéria prima existe
        RawMaterial rm = RawMaterial.findById(payload.rawMaterial.id);
        if (rm == null) {
            throw new WebApplicationException("Raw Material not found.", 404);
        }
        
        if (payload.requiredQuantity == null || payload.requiredQuantity <= 0) {
            throw new WebApplicationException("Required quantity must be greater than zero.", 400);
        }

        ProductRawMaterial association = new ProductRawMaterial();
        association.product = product;
        association.rawMaterial = rm;
        association.requiredQuantity = payload.requiredQuantity;
        
        association.persist();

        return Response.status(Response.Status.CREATED).entity(association).build();
    }

    // 6. Listar todas as matérias-primas de um produto
    @GET
    @Path("/{id}/raw-materials")
    public List<ProductRawMaterial> getProductRawMaterials(@PathParam("id") Long productId) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new WebApplicationException("Product not found.", 404);
        }
        // O Panache facilita a busca por um campo específico
        return ProductRawMaterial.list("product", product);
    }
}