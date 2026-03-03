package com.autoflex.inventory;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    // --- 1. CRUD BÁSICO DE PRODUTOS ---

    @GET
    public List<Product> listAll() {
        return Product.listAll();
    }

    @POST
    @Transactional
    public Response create(Product product) {
        if (product.id != null) {
            throw new WebApplicationException("Id was invalidly set on request.", 422);
        }
        product.persist();
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

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

    // --- 2. ENDPOINTS: COMPOSIÇÃO DO PRODUTO (RECEITA) ---

    // DTOs de Segurança para evitar problemas de JSON (Loop do Hibernate)
    public record AddRecipePayload(Long rawMaterialId, Integer requiredQuantity) {}
    public record RecipeItemDTO(Long id, String rawMaterialName, String rawMaterialCode, Integer requiredQuantity) {}

    @POST
    @Path("/{id}/raw-materials")
    @Transactional
    public Response addRawMaterialToProduct(@PathParam("id") Long productId, AddRecipePayload payload) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new WebApplicationException("Product not found.", 404);
        }
        
        if (payload.rawMaterialId() == null) {
            throw new WebApplicationException("Raw Material ID is required.", 400);
        }

        RawMaterial rm = RawMaterial.findById(payload.rawMaterialId());
        if (rm == null) {
            throw new WebApplicationException("Raw Material not found.", 404);
        }
        
        if (payload.requiredQuantity() == null || payload.requiredQuantity() <= 0) {
            throw new WebApplicationException("Required quantity must be greater than zero.", 400);
        }

        ProductRawMaterial association = new ProductRawMaterial();
        association.product = product;
        association.rawMaterial = rm;
        association.requiredQuantity = payload.requiredQuantity();
        
        association.persist();

        return Response.status(Response.Status.CREATED).build();
    }

    @GET
    @Path("/{id}/raw-materials")
    public Response getProductRawMaterials(@PathParam("id") Long productId) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new WebApplicationException("Product not found.", 404);
        }
        
        List<ProductRawMaterial> associations = ProductRawMaterial.list("product", product);
        
        // Convertendo para o DTO seguro antes de enviar para o React
        List<RecipeItemDTO> safeRecipeList = new ArrayList<>();
        for (ProductRawMaterial item : associations) {
            safeRecipeList.add(new RecipeItemDTO(
                item.id, 
                item.rawMaterial.name, 
                item.rawMaterial.code, 
                item.requiredQuantity
            ));
        }
        
        return Response.ok(safeRecipeList).build();
    }

    // --- 3. ALGORITMOS DE PRODUÇÃO (CUMPRINDO RF004) ---

    // Consulta geral de produção disponível para todos os produtos (Dashboard)
    @GET
    @Path("/available-production")
    public Response getAvailableProduction() {
        List<Product> products = Product.listAll();
        List<ProductionSuggestion> resultList = new ArrayList<>();

        for (Product p : products) {
            int maxProd = calculateMaxProductionForProduct(p);
            resultList.add(new ProductionSuggestion(p.id, p.name, maxProd));
        }

        return Response.ok(resultList).build();
    }

    // Consulta de gargalo de um produto específico (Tela da Receita)
    @GET
    @Path("/{id}/max-production")
    public Response calculateMaxProduction(@PathParam("id") Long productId) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new WebApplicationException("Product not found.", 404);
        }

        int maxCanProduce = calculateMaxProductionForProduct(product);
        return Response.ok(new ProductionSuggestion(product.id, product.name, maxCanProduce)).build();
    }

    // --- MÉTODO AUXILIAR: O CÉREBRO MATEMÁTICO ---
    
    private int calculateMaxProductionForProduct(Product product) {
        List<ProductRawMaterial> recipe = ProductRawMaterial.list("product", product);
        
        if (recipe.isEmpty()) {
            return 0; // Se não tem receita, não fabrica nada
        }

        int maxCanProduce = Integer.MAX_VALUE;

        for (ProductRawMaterial item : recipe) {
            int availableStock = item.rawMaterial.stockQuantity;
            int required = item.requiredQuantity;
            
            int possibleWithThisMaterial = availableStock / required;
            
            if (possibleWithThisMaterial < maxCanProduce) {
                maxCanProduce = possibleWithThisMaterial;
            }
        }
        
        return maxCanProduce;
    }

    // Estrutura do JSON de resposta
    public record ProductionSuggestion(Long productId, String productName, int maxProduction) {}
}