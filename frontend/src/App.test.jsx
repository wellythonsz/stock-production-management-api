import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom' // Nos dá comandos como "toBeInTheDocument"
import App from './App'

describe('App Component - Security & Login', () => {
  
  it('should block access and show the Login screen initially', () => {
    // 1. O robô "abre" a página principal do sistema
    render(<App />)
    
    // 2. Ele procura na tela por um campo de senha
    const passwordInput = screen.getByPlaceholderText(/password/i)
    
    // 3. Ele verifica se o botão de Login existe
    const loginButton = screen.getByRole('button', { name: /login/i })
    
    // 4. Afirmações de segurança: O campo e o botão precisam estar na tela
    expect(passwordInput).toBeInTheDocument()
    expect(loginButton).toBeInTheDocument()
  })

})