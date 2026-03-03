import React, { useEffect, useState } from 'react'
import './App.css'
import LoginScreen from './LoginScreen'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const [activeTab, setActiveTab] = useState('dashboard') 
  const [products, setProducts] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [availableProduction, setAvailableProduction] = useState([])

  const [prodCode, setProdCode] = useState(''); const [prodName, setProdName] = useState(''); const [prodValue, setProdValue] = useState('')
  const [rmCode, setRmCode] = useState(''); const [rmName, setRmName] = useState(''); const [rmStock, setRmStock] = useState('')

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [recipe, setRecipe] = useState([])
  const [selectedRmId, setSelectedRmId] = useState('')
  const [requiredQuantity, setRequiredQuantity] = useState('')
  const [maxProduction, setMaxProduction] = useState(null)

  const handleLogin = (user, pass) => {
    if (user === 'admin' && pass === 'autoflex') {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect username or password! (Hint: admin / autoflex)')
    }
  }

  const fetchProducts = () => fetch('/api/products').then(res => res.json()).then(data => setProducts(data)).catch(err => console.error(err))
  const fetchRawMaterials = () => fetch('/api/raw-materials').then(res => res.json()).then(data => setRawMaterials(data)).catch(err => console.error(err))
  
  const fetchAvailableProduction = () => {
    fetch('/api/products/available-production')
      .then(res => res.ok ? res.json() : []) // <-- A mágica da proteção está nesta linha!
      .then(data => setAvailableProduction(data))
      .catch(err => console.error("Erro na produção disponível:", err))
  }
  useEffect(() => {
    if (isAuthenticated) { 
      fetchProducts(); 
      fetchRawMaterials(); 
      fetchAvailableProduction(); 
    }
  }, [isAuthenticated])

  const handleProductSubmit = (e) => { 
    e.preventDefault(); 
    fetch('/api/products', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ code: prodCode, name: prodName, value: parseFloat(prodValue) }) 
    }).then(res => { 
      if (res.ok) { 
        setProdCode(''); setProdName(''); setProdValue(''); 
        fetchProducts(); fetchAvailableProduction(); 
      } 
    }) 
  }

  const handleRmSubmit = (e) => { 
    e.preventDefault(); 
    fetch('/api/raw-materials', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ code: rmCode, name: rmName, stockQuantity: parseInt(rmStock) }) 
    }).then(res => { 
      if (res.ok) { 
        setRmCode(''); setRmName(''); setRmStock(''); 
        fetchRawMaterials(); fetchAvailableProduction(); 
      } 
    }) 
  }

  const openRecipe = (product) => { 
    setSelectedProduct(product); 
    setMaxProduction(null); 
    fetchRecipe(product.id);
  }

  const fetchRecipe = (productId) => {
    fetch(`/api/products/${productId}/raw-materials`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setRecipe(data)
        else setRecipe([])
      })
      .catch(err => console.error("Error fetching recipe:", err))
  }

  const handleAddMaterialToRecipe = (e) => {
    e.preventDefault()
    
    const payload = {
      rawMaterialId: parseInt(selectedRmId),
      requiredQuantity: parseInt(requiredQuantity)
    };

    fetch(`/api/products/${selectedProduct.id}/raw-materials`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    })
    .then(res => { 
      if (res.ok) { 
        setSelectedRmId(''); 
        setRequiredQuantity(''); 
        fetchRecipe(selectedProduct.id); 
        setMaxProduction(null); 
        fetchAvailableProduction(); 
      } else {
        res.text().then(text => alert("Error adding material: " + text))
      } 
    })
    .catch(err => alert("Connection error: " + err))
  }

  const calculateMaxProduction = () => {
    fetch(`/api/products/${selectedProduct.id}/max-production`)
      .then(res => res.json())
      .then(data => setMaxProduction(data.maxProduction))
      .catch(err => console.error(err))
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const getPageTitle = () => {
    if (selectedProduct) return `Recipe: ${selectedProduct.name}`
    if (activeTab === 'dashboard') return 'Dashboard'
    if (activeTab === 'products') return 'Manage Products'
    if (activeTab === 'rawMaterials') return 'Manage Raw Materials'
  }

  return (
    <div className="admin-layout">
      
      <aside className="sidebar">
        <div className="sidebar-header">
          Inventory MS
        </div>
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' && !selectedProduct ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setSelectedProduct(null); }}>
            <i className="fas fa-home"></i> Dashboard
          </li>
          <li className={activeTab === 'products' ? 'active' : ''} onClick={() => { setActiveTab('products'); setSelectedProduct(null); }}>
            <i className="fas fa-box"></i> Products
          </li>
          <li className={activeTab === 'rawMaterials' && !selectedProduct ? 'active' : ''} onClick={() => { setActiveTab('rawMaterials'); setSelectedProduct(null); }}>
            <i className="fas fa-boxes"></i> Categories (Raw Materials)
          </li>
          
          <li style={{ marginTop: 'auto', borderTop: '1px solid #2c3b41' }} onClick={() => setIsAuthenticated(false)}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </li>
        </ul>
      </aside>

      <main className="main-wrapper">
        <header className="top-header">
          {getPageTitle()}
        </header>

        <div className="content-area">
          
          {/* SCREEN: DASHBOARD */}
          {activeTab === 'dashboard' && !selectedProduct && (
            <div>
              <div className="dashboard-cards">
                <div className="stat-card bg-blue">
                  <h4>Total Products</h4>
                  <p>{products.length}</p>
                </div>
                <div className="stat-card bg-green">
                  <h4>Total Stock</h4>
                  <p>{rawMaterials.reduce((acc, rm) => acc + rm.stockQuantity, 0)}</p>
                </div>
                <div className="stat-card bg-yellow">
                  <h4>Orders Today</h4>
                  <p>12</p> 
                </div>
                <div className="stat-card bg-purple">
                  <h4>Revenue (Estimated)</h4>
                  <p>${products.reduce((acc, p) => acc + p.value, 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="card">
                <h3><i className="fas fa-industry" style={{color: 'var(--cobre)', marginRight: '10px'}}></i> Available Production Analysis</h3>
                <p style={{color: 'var(--cinza-aco)', marginBottom: '20px'}}>
                  Consult the maximum quantity of each product that can be manufactured based on the current raw material stock.
                </p>
                
                {availableProduction.length === 0 ? (
                  <p style={{textAlign: 'center', padding: '20px', color: 'var(--cinza-aco)'}}>
                    <em>No product recipes found. Add raw materials to a product recipe to see the analysis.</em>
                  </p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Production Capacity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableProduction.map(item => (
                        <tr key={item.productId}>
                          <td><strong>{item.productName}</strong></td>
                          <td style={{fontSize: '1.2rem', color: 'var(--azul-petroleo)', fontWeight: 'bold'}}>{item.maxProduction} units</td>
                          <td>
                            {item.maxProduction > 0 
                              ? <span style={{color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>🟢 Ready to Manufacture</span>
                              : <span style={{color: '#c62828', backgroundColor: '#ffebee', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>🔴 Missing Materials</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SCREEN: PRODUCTS */}
          {activeTab === 'products' && !selectedProduct && (
              <div className="centered-content"> 
              <div className="card">
                <h3>New Product</h3>
                <form onSubmit={handleProductSubmit} className="form-group">
                  <div className="input-wrapper"><label>Code</label><input type="text" className="input-field" value={prodCode} onChange={e => setProdCode(e.target.value)} required /></div>
                  <div className="input-wrapper"><label>Name</label><input type="text" className="input-field" value={prodName} onChange={e => setProdName(e.target.value)} required /></div>
                  <div className="input-wrapper"><label>Value ($)</label><input type="number" step="0.01" className="input-field" value={prodValue} onChange={e => setProdValue(e.target.value)} required /></div>
                  <div className="form-actions">
                  <button type="submit" className="btn-primary">Save</button>
                  </div>
                </form>
              </div>

              <table className="data-table">
                <thead><tr><th>ID</th><th>Code</th><th>Name</th><th>Value</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td>$ {p.value.toFixed(2)}</td>
                      <td><button onClick={() => openRecipe(p)} className="btn-secondary"><i className="fas fa-cog"></i> Recipe</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SCREEN: PRODUCT RECIPE (ALGORITHM) */}
          {selectedProduct && (
            <div className="centered-content">
              <button onClick={() => setSelectedProduct(null)} className="btn-back">
                <i className="fas fa-arrow-left"></i> Back to Products
              </button>
              
              <div className="card">
                <h3>Add Raw Material to Recipe</h3>
                <form onSubmit={handleAddMaterialToRecipe} className="form-group">
                  <div className="input-wrapper">
                    <label>Raw Material</label>
                    <select className="input-field" value={selectedRmId} onChange={e => setSelectedRmId(e.target.value)} required>
                      <option value="">Select...</option>
                      {rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.name} (Stock: {rm.stockQuantity})</option>)}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label>Required Quantity</label>
                    <input type="number" className="input-field" value={requiredQuantity} onChange={e => setRequiredQuantity(e.target.value)} required min="1" />
                  </div>
                  <button type="submit" className="btn-primary">Add</button>
                </form>
              </div>

              <table className="data-table">
                <thead><tr><th>Raw Material</th><th>Required Qty</th></tr></thead>
                <tbody>
                  {recipe.map(item => (
                    <tr key={item.id}>
                      <td>{item.rawMaterialName} ({item.rawMaterialCode})</td>
                      <td>{item.requiredQuantity} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recipe.length > 0 && (
                <div className="result-panel">
                  <button onClick={calculateMaxProduction} className="btn-calculate">
                    <i className="fas fa-bolt" style={{marginRight: '8px'}}></i> Analyze Production Bottleneck
                  </button>
                  
                  {maxProduction !== null && (
                    <div className="result-content">
                      <span className="result-label">Estimated Maximum Production</span>
                      <div className="result-number">
                        {maxProduction} <span className="result-unit">units</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SCREEN: RAW MATERIALS */}
          {activeTab === 'rawMaterials' && !selectedProduct && (
            <div className="centered-content">
              <div className="card">
                <h3>New Raw Material</h3>
                <form onSubmit={handleRmSubmit} className="form-group">
                  <div className="input-wrapper"><label>Code</label><input type="text" className="input-field" value={rmCode} onChange={e => setRmCode(e.target.value)} required /></div>
                  <div className="input-wrapper"><label>Name</label><input type="text" className="input-field" value={rmName} onChange={e => setRmName(e.target.value)} required /></div>
                  <div className="input-wrapper"><label>Stock</label><input type="number" className="input-field" value={rmStock} onChange={e => setRmStock(e.target.value)} required min="0" /></div>
                  <div className="form-actions">
                  <button type="submit" className="btn-primary">Save</button>
                  </div>
                </form>
              </div>
              <table className="data-table">
                <thead><tr><th>ID</th><th>Code</th><th>Name</th><th>Current Stock</th></tr></thead>
                <tbody>
                  {rawMaterials.map(rm => <tr key={rm.id}><td>{rm.id}</td><td>{rm.code}</td><td>{rm.name}</td><td>{rm.stockQuantity} units</td></tr>)}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default App