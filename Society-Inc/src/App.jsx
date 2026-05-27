import { useEffect, useMemo, useState } from 'react'
import './App.css'
import heroImage from './assets/hero.png'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const initialLogin = { email: '', senha: '' }
const initialRegister = { nome: '', email: '', senha: '' }
const initialCampo = { nome: '', descricao: '' }
const initialReserva = { campo_id: '', data: '', inicio: '', fim: '' }

function formatHorario(inicio, fim) {
  const dateFormat = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
  const timeFormat = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateFormat.format(new Date(inicio))} - ${timeFormat.format(new Date(inicio))} ate ${timeFormat.format(new Date(fim))}`
}

function buildDateTime(date, time) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('society-token') ?? '')
  const [usuario, setUsuario] = useState(null)
  const [campos, setCampos] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [login, setLogin] = useState(initialLogin)
  const [registro, setRegistro] = useState(initialRegister)
  const [campo, setCampo] = useState(initialCampo)
  const [reserva, setReserva] = useState(initialReserva)
  const [mode, setMode] = useState('login')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  )

  const camposById = useMemo(
    () => Object.fromEntries(campos.map((item) => [item.id, item])),
    [campos],
  )

  const proximosAgendamentos = useMemo(
    () =>
      agendamentos
        .filter((item) => item.status !== 'cancelado')
        .slice(0, 4),
    [agendamentos],
  )

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new Error(data?.detail ?? 'Nao foi possivel concluir a acao.')
    }

    return data
  }

  async function refreshData() {
    const [camposData, agendamentosData] = await Promise.all([
      request('/campos/'),
      request('/agendamentos/'),
    ])
    setCampos(camposData)
    setAgendamentos(agendamentosData)
  }

  useEffect(() => {
    refreshData().catch((error) => setNotice(error.message))
  }, [])

  useEffect(() => {
    if (!token) {
      setUsuario(null)
      localStorage.removeItem('society-token')
      return
    }

    localStorage.setItem('society-token', token)
    request('/usuarios/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(setUsuario)
      .catch(() => {
        setToken('')
        setNotice('Sessao expirada. Entre novamente.')
      })
  }, [token])

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(login),
      })
      setToken(data.access_token)
      setLogin(initialLogin)
      setNotice('Bem-vindo de volta. A quadra ja esta te esperando.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegistro(event) {
    event.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      await request('/usuarios/registro', {
        method: 'POST',
        body: JSON.stringify({ ...registro, tipo: 'jogador' }),
      })
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: registro.email, senha: registro.senha }),
      })
      setToken(data.access_token)
      setRegistro(initialRegister)
      setMode('login')
      setNotice('Conta criada. Voce ja esta conectado.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCampo(event) {
    event.preventDefault()
    setLoading(true)
    setNotice('')
    try {
      await request('/campos/', {
        method: 'POST',
        body: JSON.stringify(campo),
      })
      setCampo(initialCampo)
      await refreshData()
      setNotice('Campo cadastrado com sucesso.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReserva(event) {
    event.preventDefault()
    if (!token) {
      setNotice('Entre na sua conta para reservar um campo.')
      return
    }

    setLoading(true)
    setNotice('')
    try {
      await request('/agendamentos/', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          campo_id: reserva.campo_id,
          data_hora_inicio: buildDateTime(reserva.data, reserva.inicio),
          data_hora_fim: buildDateTime(reserva.data, reserva.fim),
        }),
      })
      setReserva(initialReserva)
      await refreshData()
      setNotice('Reserva solicitada. Status inicial: pendente.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar(id) {
    setLoading(true)
    setNotice('')
    try {
      await request(`/agendamentos/${id}/cancelar`, {
        method: 'PATCH',
        headers: authHeaders,
      })
      await refreshData()
      setNotice('Agendamento cancelado.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="Navegacao principal">
          <div className="brand-mark">
            <span className="brand-icon">SI</span>
            <span>Society Inc</span>
          </div>
          <div className="session-pill">
            {usuario ? `Ola, ${usuario.nome}` : 'Agenda inteligente de campos'}
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Reserva, jogo e gestao em um so lugar</span>
            <h1>Campos society com cara de operacao profissional.</h1>
            <p>
              Controle campos, acompanhe horarios e feche reservas com uma interface
              rapida, elegante e pronta para evoluir.
            </p>
            <div className="hero-actions">
              <a href="#reserva" className="primary-action">Reservar horario</a>
              <a href="#campos" className="secondary-action">Ver campos</a>
            </div>
          </div>

          <div className="scoreboard" aria-label="Resumo do sistema">
            <img src={heroImage} alt="Campo society iluminado" className="hero-photo" />
            <div>
              <span>{campos.length}</span>
              <p>campos ativos</p>
            </div>
            <div>
              <span>{agendamentos.length}</span>
              <p>reservas totais</p>
            </div>
            <div>
              <span>{proximosAgendamentos.length}</span>
              <p>proximos jogos</p>
            </div>
          </div>
        </div>
      </section>

      {notice && <div className="notice">{notice}</div>}

      <section className="content-grid">
        <aside className="auth-panel panel">
          <div className="panel-heading">
            <span>Conta</span>
            {usuario && (
              <button className="ghost-button" onClick={() => setToken('')}>
                Sair
              </button>
            )}
          </div>

          {!usuario ? (
            <>
              <div className="segmented">
                <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
                  Entrar
                </button>
                <button className={mode === 'registro' ? 'active' : ''} onClick={() => setMode('registro')}>
                  Criar conta
                </button>
              </div>

              {mode === 'login' ? (
                <form className="form-stack" onSubmit={handleLogin}>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={login.email}
                      onChange={(event) => setLogin({ ...login, email: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      value={login.senha}
                      onChange={(event) => setLogin({ ...login, senha: event.target.value })}
                      required
                    />
                  </label>
                  <button className="submit-button" disabled={loading}>Entrar</button>
                </form>
              ) : (
                <form className="form-stack" onSubmit={handleRegistro}>
                  <label>
                    Nome
                    <input
                      value={registro.nome}
                      onChange={(event) => setRegistro({ ...registro, nome: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={registro.email}
                      onChange={(event) => setRegistro({ ...registro, email: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      value={registro.senha}
                      onChange={(event) => setRegistro({ ...registro, senha: event.target.value })}
                      minLength="6"
                      required
                    />
                  </label>
                  <button className="submit-button" disabled={loading}>Criar e entrar</button>
                </form>
              )}
            </>
          ) : (
            <div className="user-card">
              <strong>{usuario.nome}</strong>
              <span>{usuario.email}</span>
              <small>{usuario.tipo}</small>
            </div>
          )}
        </aside>

        <section className="panel reservation-panel" id="reserva">
          <div className="panel-heading">
            <span>Nova reserva</span>
            <small>{token ? 'Conectado' : 'Login necessario'}</small>
          </div>
          <form className="reservation-form" onSubmit={handleReserva}>
            <label>
              Campo
              <select
                value={reserva.campo_id}
                onChange={(event) => setReserva({ ...reserva, campo_id: event.target.value })}
                required
              >
                <option value="">Selecione</option>
                {campos.map((item) => (
                  <option key={item.id} value={item.id}>{item.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Data
              <input
                type="date"
                value={reserva.data}
                onChange={(event) => setReserva({ ...reserva, data: event.target.value })}
                required
              />
            </label>
            <label>
              Inicio
              <input
                type="time"
                value={reserva.inicio}
                onChange={(event) => setReserva({ ...reserva, inicio: event.target.value })}
                required
              />
            </label>
            <label>
              Fim
              <input
                type="time"
                value={reserva.fim}
                onChange={(event) => setReserva({ ...reserva, fim: event.target.value })}
                required
              />
            </label>
            <button className="submit-button wide" disabled={loading}>Reservar campo</button>
          </form>
        </section>
      </section>

      <section className="split-section">
        <div className="panel" id="campos">
          <div className="panel-heading">
            <span>Campos</span>
            <small>{campos.length} cadastrados</small>
          </div>
          <div className="field-list">
            {campos.length ? campos.map((item) => (
              <article key={item.id} className="field-card">
                <div className="field-swatch" />
                <div>
                  <strong>{item.nome}</strong>
                  <p>{item.descricao || 'Campo pronto para receber reservas.'}</p>
                </div>
              </article>
            )) : (
              <p className="empty-state">Nenhum campo cadastrado ainda.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <span>Cadastrar campo</span>
            <small>Operacao</small>
          </div>
          <form className="form-stack" onSubmit={handleCampo}>
            <label>
              Nome do campo
              <input
                value={campo.nome}
                onChange={(event) => setCampo({ ...campo, nome: event.target.value })}
                placeholder="Arena Society 1"
                required
              />
            </label>
            <label>
              Descricao
              <textarea
                value={campo.descricao}
                onChange={(event) => setCampo({ ...campo, descricao: event.target.value })}
                placeholder="Grama sintetica, iluminacao LED, area coberta..."
              />
            </label>
            <button className="submit-button" disabled={loading}>Salvar campo</button>
          </form>
        </div>
      </section>

      <section className="panel schedule-panel">
        <div className="panel-heading">
          <span>Agenda</span>
          <small>Visao operacional</small>
        </div>
        <div className="schedule-list">
          {agendamentos.length ? agendamentos.map((item) => (
            <article key={item.id} className={`schedule-row ${item.status}`}>
              <div>
                <strong>{camposById[item.campo_id]?.nome ?? 'Campo removido'}</strong>
                <p>{formatHorario(item.data_hora_inicio, item.data_hora_fim)}</p>
              </div>
              <span className="status-badge">{item.status}</span>
              {token && item.status !== 'cancelado' && (
                <button className="ghost-button" onClick={() => handleCancelar(item.id)} disabled={loading}>
                  Cancelar
                </button>
              )}
            </article>
          )) : (
            <p className="empty-state">A agenda esta livre. Otimo momento para estrear o gramado.</p>
          )}
        </div>
      </section>
    </main>
  )
}
