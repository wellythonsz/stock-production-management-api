import { useEffect, useState } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('products')

  // --- ESTADOS: GERAIS ---
  const [products, setProducts] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])

  // --- ESTADOS: CADASTRO ---
  const [prodCode, setProdCode] = useState(''); const [prodName, setProdName] = useState(''); const [prodValue, setProdValue] = useState('')
  const [rmCode, setRmCode] = useState(''); const [rmName, setRmName] = useState(''); const [rmStock, setRmStock] = useState('')

  // --- ESTADOS: RECEITA DO PRODUTO ---
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [recipe, setRecipe] = useState([])
  const [selectedRmId, setSelectedRmId] = useState('')
  const [requiredQuantity, setRequiredQuantity] = useState('')

  // --- FUNÇÕES DE BUSCA ---
  const fetchProducts = () => fetch('/api/products').then(res => res.json()).then(data => setProducts(data)).catch(err => console.error(err))
  const fetchRawMaterials = () => fetch('/api/raw-materials').then(res => res.json()).then(data => setRawMaterials(data)).catch(err => console.error(err))

  // Busca tudo logo que a tela carrega
  useEffect(() => {
    fetchProducts()
    fetchRawMaterials()
  }, [])

  // --- FUNÇÕES DE CADASTRO GERAL ---
  const handleProductSubmit = (e) => {
    e.preventDefault()
    fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: prodCode, name: prodName, value: parseFloat(prodValue) }) })
      .then(res => { if (res.ok) { setProdCode(''); setProdName(''); setProdValue(''); fetchProducts(); } else alert('Erro!') })
  }

  const handleRmSubmit = (e) => {
    e.preventDefault()
    fetch('/api/raw-materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: rmCode, name: rmName, stockQuantity: parseInt(rmStock) }) })
      .then(res => { if (res.ok) { setRmCode(''); setRmName(''); setRmStock(''); fetchRawMaterials(); } else alert('Erro!') })
  }

  // --- FUNÇÕES DA RECEITA ---
  const openRecipe = (product) => {
    setSelectedProduct(product)
    fetchRecipe(product.id)
  }

  const fetchRecipe = (productId) => {
    fetch(`/api/products/${productId}/raw-materials`)
      .then(res => res.json())
      .then(data => setRecipe(data))
      .catch(err => console.error(err))
  }

  const handleAddMaterialToRecipe = (e) => {
    e.preventDefault()
    if (!selectedRmId) return alert('Selecione uma matéria-prima!')

    const payload = {
      rawMaterial: { id: parseInt(selectedRmId) },
      requiredQuantity: parseInt(requiredQuantity)
    }

    fetch(`/api/products/${selectedProduct.id}/raw-materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.ok) {
        setSelectedRmId(''); setRequiredQuantity(''); fetchRecipe(selectedProduct.id);
      } else {
        alert('Erro ao adicionar à receita.')
      }
    })
  }

  // --- ESTILOS COMPARTILHADOS ---
  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }
  const btnStyle = { padding: '9px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }
  const actionBtnStyle = { padding: '6px 12px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }
  const tabBtnStyle = (isActive) => ({ padding: '10px 20px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px', backgroundColor: isActive ? '#4CAF50' : '#444', color: 'white', marginRight: '10px', borderRadius: '4px' })

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏭 Autoflex - Gestão de Fábrica</h1>
      
      {/* MENU SÓ APARECE SE NÃO ESTIVERMOS VENDO UMA RECEITA */}
      {!selectedProduct && (
        <div style={{ marginBottom: '30px' }}>
          <button style={tabBtnStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>📦 Produtos</button>
          <button style={tabBtnStyle(activeTab === 'rawMaterials')} onClick={() => setActiveTab('rawMaterials')}>🛢️ Matérias-Primas</button>
        </div>
      )}

      {/* TELA DE PRODUTOS PRINCIPAL */}
      {activeTab === 'products' && !selectedProduct && (
        <div>
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Cadastrar Novo Produto</h3>
            <form onSubmit={handleProductSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Código:</label><input type="text" value={prodCode} onChange={e => setProdCode(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Nome:</label><input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Valor (R$):</label><input type="number" step="0.01" value={prodValue} onChange={e => setProdValue(e.target.value)} required style={inputStyle} /></div>
              <button type="submit" style={btnStyle}>Salvar</button>
            </form>
          </div>

          <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f4f4f4', color: '#000' }}>
              <tr><th>ID</th><th>Código</th><th>Nome</th><th>Valor (R$)</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td>{p.value.toFixed(2)}</td>
                  <td><button onClick={() => openRecipe(p)} style={actionBtnStyle}>Ver Receita</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TELA DA RECEITA (COMPOSIÇÃO DO PRODUTO) */}
      {activeTab === 'products' && selectedProduct && (
        <div>
          <button onClick={() => setSelectedProduct(null)} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '4px' }}>
            ⬅ Voltar para Lista
          </button>
          
          <h2 style={{ color: '#4CAF50' }}>Receita do Produto: {selectedProduct.name}</h2>
          
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Adicionar Ingrediente</h3>
            <form onSubmit={handleAddMaterialToRecipe} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px' }}>Matéria-Prima:</label>
                <select value={selectedRmId} onChange={e => setSelectedRmId(e.target.value)} required style={{ ...inputStyle, width: '250px' }}>
                  <option value="">Selecione...</option>
                  {rawMaterials.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name} (Estoque: {rm.stockQuantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px' }}>Qtd. Necessária:</label>
                <input type="number" value={requiredQuantity} onChange={e => setRequiredQuantity(e.target.value)} required min="1" style={inputStyle} />
              </div>
              <button type="submit" style={actionBtnStyle}>+ Adicionar à Receita</button>
            </form>
          </div>

          <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f4f4f4', color: '#000' }}>
              <tr><th>Matéria-Prima</th><th>Qtd. Necessária p/ Fabricar 1</th></tr>
            </thead>
            <tbody>
              {recipe.length === 0 ? <tr><td colSpan="2" style={{ textAlign: 'center' }}>Receita vazia. Adicione ingredientes acima.</td></tr> :
                recipe.map(item => (
                  <tr key={item.id}>
                    <td>{item.rawMaterial.name} ({item.rawMaterial.code})</td>
                    <td>{item.requiredQuantity} un</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TELA DE MATÉRIAS-PRIMAS */}
      {activeTab === 'rawMaterials' && !selectedProduct && (
        <div>
          {/* O formulário e a tabela de matérias-primas que já fizemos na etapa anterior (mantido igual) */}
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Cadastrar Nova Matéria-Prima</h3>
            <form onSubmit={handleRmSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Código:</label><input type="text" value={rmCode} onChange={e => setRmCode(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Nome:</label><input type="text" value={rmName} onChange={e => setRmName(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Estoque Atual:</label><input type="number" value={rmStock} onChange={e => setRmStock(e.target.value)} required style={inputStyle} min="0" /></div>
              <button type="submit" style={btnStyle}>Salvar</button>
            </form>
          </div>
          <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f4f4f4', color: '#000' }}><tr><th>ID</th><th>Código</th><th>Nome</th><th>Qtd. Estoque</th></tr></thead>
            <tbody>
              {rawMaterials.map(rm => <tr key={rm.id}><td>{rm.id}</td><td>{rm.code}</td><td>{rm.name}</td><td>{rm.stockQuantity}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App