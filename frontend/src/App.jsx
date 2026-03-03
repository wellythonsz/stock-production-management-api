import { useEffect, useState } from 'react'

function App() {
  // Estado para controlar qual tela estamos vendo
  const [activeTab, setActiveTab] = useState('products') // pode ser 'products' ou 'rawMaterials'

  // --- ESTADOS: PRODUTOS ---
  const [products, setProducts] = useState([])
  const [prodCode, setProdCode] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodValue, setProdValue] = useState('')

  // --- ESTADOS: MATÉRIAS-PRIMAS ---
  const [rawMaterials, setRawMaterials] = useState([])
  const [rmCode, setRmCode] = useState('')
  const [rmName, setRmName] = useState('')
  const [rmStock, setRmStock] = useState('')

  // --- FUNÇÕES DE BUSCA ---
  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }

  const fetchRawMaterials = () => {
    fetch('/api/raw-materials')
      .then(res => res.json())
      .then(data => setRawMaterials(data))
      .catch(err => console.error(err))
  }

  // Dispara a busca dependendo da aba que o usuário clicou
  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'rawMaterials') fetchRawMaterials()
  }, [activeTab])

  // --- FUNÇÕES DE CADASTRO ---
  const handleProductSubmit = (e) => {
    e.preventDefault()
    const newProduct = { code: prodCode, name: prodName, value: parseFloat(prodValue) }
    
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).then(res => {
      if (res.ok) {
        setProdCode(''); setProdName(''); setProdValue(''); fetchProducts();
      } else {
        alert('Erro ao cadastrar produto!')
      }
    })
  }

  const handleRmSubmit = (e) => {
    e.preventDefault()
    const newRm = { code: rmCode, name: rmName, stockQuantity: parseInt(rmStock) }
    
    fetch('/api/raw-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRm)
    }).then(res => {
      if (res.ok) {
        setRmCode(''); setRmName(''); setRmStock(''); fetchRawMaterials();
      } else {
        alert('Erro ao cadastrar matéria-prima!')
      }
    })
  }

  // --- ESTILOS COMPARTILHADOS ---
  const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }
  const btnStyle = { padding: '9px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }
  const tabBtnStyle = (isActive) => ({
    padding: '10px 20px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '16px',
    backgroundColor: isActive ? '#4CAF50' : '#444', color: 'white', marginRight: '10px', borderRadius: '4px'
  })

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏭 Autoflex - Gestão de Fábrica</h1>
      
      {/* MENU DE NAVEGAÇÃO */}
      <div style={{ marginBottom: '30px' }}>
        <button style={tabBtnStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>
          📦 Produtos
        </button>
        <button style={tabBtnStyle(activeTab === 'rawMaterials')} onClick={() => setActiveTab('rawMaterials')}>
          🛢️ Matérias-Primas
        </button>
      </div>

      {/* TELA DE PRODUTOS */}
      {activeTab === 'products' && (
        <div>
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Cadastrar Novo Produto</h3>
            <form onSubmit={handleProductSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Código:</label><input type="text" value={prodCode} onChange={e => setProdCode(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Nome:</label><input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Valor (R$):</label><input type="number" step="0.01" value={prodValue} onChange={e => setProdValue(e.target.value)} required style={inputStyle} /></div>
              <button type="submit" style={btnStyle}>Salvar Produto</button>
            </form>
          </div>

          <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f4f4f4', color: '#000' }}>
              <tr><th>ID</th><th>Código</th><th>Nome</th><th>Valor (R$)</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td></tr> : 
                products.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td>{p.value.toFixed(2)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {/* TELA DE MATÉRIAS-PRIMAS */}
      {activeTab === 'rawMaterials' && (
        <div>
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Cadastrar Nova Matéria-Prima</h3>
            <form onSubmit={handleRmSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Código:</label><input type="text" value={rmCode} onChange={e => setRmCode(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Nome:</label><input type="text" value={rmName} onChange={e => setRmName(e.target.value)} required style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px' }}>Estoque Atual:</label><input type="number" value={rmStock} onChange={e => setRmStock(e.target.value)} required style={inputStyle} min="0" /></div>
              <button type="submit" style={btnStyle}>Salvar Matéria-Prima</button>
            </form>
          </div>

          <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f4f4f4', color: '#000' }}>
              <tr><th>ID</th><th>Código</th><th>Nome</th><th>Qtd. Estoque</th></tr>
            </thead>
            <tbody>
              {rawMaterials.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>Nenhuma matéria-prima cadastrada.</td></tr> : 
                rawMaterials.map(rm => <tr key={rm.id}><td>{rm.id}</td><td>{rm.code}</td><td>{rm.name}</td><td>{rm.stockQuantity}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default App