describe('Autoflex E2E Flow - Full Core Journey', () => {
  it('should login, create material, create product, add recipe, analyze and logout', () => {
    
    // Gerador de ID único baseado nos milissegundos atuais (nunca vai repetir!)
    const uid = Date.now()
    const rmCode = `RM-${uid}`
    const rmName = `Fibra-${uid}`
    const prodCode = `PRD-${uid}`

    // 1. LOGIN
    cy.visit('http://localhost:5173')
    cy.get('input[type="text"]').type('admin')
    cy.get('input[type="password"]').type('autoflex')
    cy.contains('button', 'Login').click() 

    cy.contains('Available Production Analysis').should('be.visible')

    // 2. CRIAR MATÉRIA-PRIMA
    cy.contains('Categories (Raw Materials)').click()
    cy.contains('New Raw Material').should('be.visible') 
    
    cy.get('input').eq(0).type(rmCode)
    cy.get('input').eq(1).type(rmName)
    cy.get('input').eq(2).type('500')
    cy.contains('button', 'Save').click() 

    // 3. CRIAR PRODUTO
    cy.contains('Products').click()
    cy.contains('New Product').should('be.visible') 
    
    cy.get('input').eq(0).type(prodCode)
    cy.get('input').eq(1).type('Produto Teste')
    cy.get('input').eq(2).type('1250.00')
    cy.contains('button', 'Save').click()

    // TRAVA DE SEGURANÇA: Espera o código do produto novo aparecer na tabela antes de prosseguir
    cy.contains('td', prodCode).should('be.visible')

    // 4. CRIAR RECEITA E ANALISAR GARGALO
    cy.contains('tr', prodCode).contains('button', 'Recipe').click()
    cy.contains('Add Raw Material to Recipe').should('be.visible')
    
    // Usa o nome dinâmico que acabamos de criar para achar a opção correta no Select
    cy.get('select').select(`${rmName} (Stock: 500)`)
    cy.get('input[type="number"]').type('5')
    cy.contains('button', 'Add').click()
    
    cy.contains('button', 'Analyze Production Bottleneck').click()
    
    cy.contains('Estimated Maximum Production').should('be.visible')
    cy.contains('100').should('be.visible') 

    // 5. SAIR DO SISTEMA (LOGOUT)
    cy.contains('Logout').click()
    cy.contains('button', 'Login').should('be.visible')
  })
})