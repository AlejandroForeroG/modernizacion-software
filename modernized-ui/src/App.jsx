import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  Cat,
  CheckCircle2,
  CircleAlert,
  Dog,
  ExternalLink,
  PawPrint,
  Search,
  Squirrel,
  Turtle,
  Worm,
} from 'lucide-react'

const SPECIES = {
  cat: { Icon: Cat, label: 'gato' },
  dog: { Icon: Dog, label: 'perro' },
  bird: { Icon: Bird, label: 'ave' },
  hamster: { Icon: Squirrel, label: 'hámster' },
  lizard: { Icon: Turtle, label: 'lagarto' },
  snake: { Icon: Worm, label: 'serpiente' },
}

const initialSearch = { owners: [], page: 0, size: 5, totalElements: 0, totalPages: 0 }

function tomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

async function api(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new Error(problem?.detail || 'No fue posible completar la operación.')
  }
  return response.json()
}

function App() {
  const [lastName, setLastName] = useState('Davis')
  const [search, setSearch] = useState(initialSearch)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  const range = useMemo(() => {
    if (!search.totalElements) return '0 resultados'
    const start = search.page * search.size + 1
    const end = Math.min(start + search.owners.length - 1, search.totalElements)
    return `${start}–${end} de ${search.totalElements}`
  }, [search])

  async function runSearch(page = 0) {
    setLoading(true)
    setNotice(null)
    try {
      const result = await api(`/api/owners?lastName=${encodeURIComponent(lastName)}&page=${page}&size=5`)
      setSearch(result)
      if (result.totalElements === 1) {
        await selectOwner(result.owners[0].id)
      } else {
        setSelected(null)
      }
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function selectOwner(id) {
    setLoading(true)
    setNotice(null)
    try {
      setSelected(await api(`/api/owners/${id}`))
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function createVisit(petId, visit) {
    setLoading(true)
    setNotice(null)
    try {
      await api(`/api/owners/${selected.id}/pets/${petId}/visits`, {
        method: 'POST',
        body: JSON.stringify(visit),
      })
      setSelected(await api(`/api/owners/${selected.id}`))
      setNotice({ type: 'success', message: 'Visita registrada y agregada al historial.' })
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSearch()
    // The initial query runs once to make the demo immediately useful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href="/" aria-label="PetClinic inicio">
            <span className="brand-mark"><PawMark /></span>
            PetClinic<span>Atención clínica</span>
          </a>
          <nav aria-label="Canales de la aplicación">
            <a className="channel" href="/owners/find" target="_blank" rel="noreferrer">
              Vista legada <ExternalLink size={13} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="workspace-heading">
          <h1>A quién atendemos hoy?</h1>
        </section>

        {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}

        <section className="content-grid" aria-busy={loading}>
          <div className="results-pane">
            <form className="search-band" onSubmit={(event) => { event.preventDefault(); runSearch(0) }}>
              <label htmlFor="lastName">Apellido</label>
              <div className="search-control">
                <Search size={17} aria-hidden="true" />
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Apellido completo o primeras letras"
                  autoComplete="off"
                />
              </div>
              <button className="primary-button" type="submit" disabled={loading}>Buscar</button>
            </form>
            <div className="pane-title">
              <h2>Resultados</h2>
              <span className="result-count">{range}</span>
              <span className="form-code">Formato RQ-01</span>
            </div>

            {loading && !search.owners.length ? <SkeletonList /> : (
              <OwnerResults owners={search.owners} selectedId={selected?.id} onSelect={selectOwner} />
            )}

            <div className="pagination" aria-label="Paginación de resultados">
              <button
                className="icon-button"
                title="Página anterior"
                aria-label="Página anterior"
                disabled={loading || search.page === 0}
                onClick={() => runSearch(search.page - 1)}
              ><ArrowLeft size={16} /></button>
              <span>Página {search.totalPages ? search.page + 1 : 0} de {search.totalPages}</span>
              <button
                className="icon-button"
                title="Página siguiente"
                aria-label="Página siguiente"
                disabled={loading || search.page + 1 >= search.totalPages}
                onClick={() => runSearch(search.page + 1)}
              ><ArrowRight size={16} /></button>
            </div>
          </div>

          <div className="details-pane">
            {loading && selected ? <SkeletonDetails /> : selected ? (
              <OwnerDetails owner={selected} onCreateVisit={createVisit} disabled={loading} />
            ) : (
              <EmptyDetails hasResults={search.totalElements > 0} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function OwnerResults({ owners, selectedId, onSelect }) {
  if (!owners.length) {
    return (
      <div className="empty-note">
        <h3>Sin coincidencias</h3>
        <p>Prueba con menos letras o revisa el apellido.</p>
      </div>
    )
  }

  return (
    <div className="owner-list">
      {owners.map((owner) => (
        <button
          key={owner.id}
          className={`owner-row ${selectedId === owner.id ? 'selected' : ''}`}
          onClick={() => onSelect(owner.id)}
        >
          <span className="owner-primary"><b>{owner.firstName} {owner.lastName}</b><small>{owner.city}</small></span>
          <span className="owner-phone">{owner.telephone}</span>
        </button>
      ))}
    </div>
  )
}

function OwnerDetails({ owner, onCreateVisit, disabled }) {
  return (
    <div className="owner-details">
      <header className="record-head">
        <span className="record-label">Ficha del dueño</span>
        <h2>{owner.firstName} {owner.lastName}</h2>
        <p>{owner.address} · {owner.city} · {owner.telephone}</p>
      </header>

      <div className="section-label"><span>Mascotas e historial</span><b>· {owner.pets.length}</b></div>
      {owner.pets.map((pet) => (
        <PetSection key={pet.id} pet={pet} onCreateVisit={onCreateVisit} disabled={disabled} />
      ))}
    </div>
  )
}

function PetSection({ pet, onCreateVisit, disabled }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(tomorrow())
  const [description, setDescription] = useState('')
  const species = SPECIES[pet.type] ?? { Icon: PawPrint, label: pet.type || 'Sin tipo' }

  function submit(event) {
    event.preventDefault()
    onCreateVisit(pet.id, { date, description }).then(() => {
      setDescription('')
      setOpen(false)
    })
  }

  return (
    <article className="pet-record">
      <div className="pet-heading">
        <div>
          <div className="pet-title">
            <h3>{pet.name}</h3>
            <span className={`pet-chip species-${SPECIES[pet.type] ? pet.type : 'default'}`}>
              <species.Icon size={13} aria-hidden="true" /> {species.label}
            </span>
          </div>
          <p>Nació {pet.birthDate}</p>
        </div>
        <button className="ghost-button" onClick={() => setOpen(!open)}>
          {open ? 'Cancelar' : 'Nueva visita'}
        </button>
      </div>

      {open && (
        <form className="visit-form" onSubmit={submit}>
          <div>
            <label htmlFor={`date-${pet.id}`}>Fecha</label>
            <input id={`date-${pet.id}`} type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="description-field">
            <label htmlFor={`description-${pet.id}`}>Descripción</label>
            <input id={`description-${pet.id}`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={255} required placeholder="Motivo de la visita" />
          </div>
          <button className="primary-button" type="submit" disabled={disabled || !description.trim()}>Registrar</button>
        </form>
      )}

      <div className="visit-history">
        {pet.visits.length ? pet.visits.map((visit) => (
          <div className="visit-row" key={visit.id ?? `${visit.date}-${visit.description}`}>
            <time>{visit.date}</time><span>{visit.description}</span>
          </div>
        )) : <p className="muted">Sin visitas registradas.</p>}
      </div>
    </article>
  )
}

function PawMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="5.3" cy="9.8" rx="1.9" ry="2.4" />
      <ellipse cx="9.7" cy="7.2" rx="2" ry="2.6" />
      <ellipse cx="14.3" cy="7.2" rx="2" ry="2.6" />
      <ellipse cx="18.7" cy="9.8" rx="1.9" ry="2.4" />
      <path d="M12 12c-3.4 0-6.2 2.7-6.2 5.5 0 1.8 1.4 2.7 3 2.7 1.2 0 2.1-.55 3.2-.55s2 .55 3.2.55c1.6 0 3-.9 3-2.7C18.2 14.7 15.4 12 12 12z" />
    </svg>
  )
}

function Notice({ notice, onClose }) {
  const Icon = notice.type === 'success' ? CheckCircle2 : CircleAlert
  return (
    <div className={`notice ${notice.type}`} role="status">
      <Icon size={18} /><span>{notice.message}</span>
      <button onClick={onClose} aria-label="Cerrar notificación">×</button>
    </div>
  )
}

function EmptyDetails({ hasResults }) {
  return (
    <div className="empty-note">
      <h2>{hasResults ? 'Selecciona un dueño' : 'La ficha aparecerá aquí'}</h2>
      <p>{hasResults ? 'Su expediente se abre en este panel: mascotas, historial y registro de nuevas visitas.' : 'Busca por apellido para abrir el primer expediente.'}</p>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="skeleton-list" role="status" aria-label="Consultando información">
      {[0, 1, 2, 3, 4].map((row) => (
        <div className="skeleton-row" key={row}>
          <span className="skeleton-bar long" />
          <span className="skeleton-bar short" />
        </div>
      ))}
    </div>
  )
}

function SkeletonDetails() {
  return (
    <div className="skeleton-details" role="status" aria-label="Consultando información">
      <span className="skeleton-bar" />
      <span className="skeleton-bar long" />
      <span className="skeleton-bar short" />
    </div>
  )
}

export default App
