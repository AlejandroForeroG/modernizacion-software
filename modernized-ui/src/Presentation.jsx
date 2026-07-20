import { useEffect, useMemo, useState } from 'react'
import './presentation.css'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookOpenText,
  Box,
  Braces,
  Check,
  CircleGauge,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  FlaskConical,
  Fullscreen,
  GitBranch,
  LayoutGrid,
  MonitorSmartphone,
  Network,
  Play,
  RotateCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  Users,
  X,
} from 'lucide-react'

const slides = [
  { id: 'cover', section: 'Apertura', minutes: '0:00–0:35', title: 'Spring PetClinic', kicker: 'Video de avance · Arquitectura To-Be y pre-experimento', notes: 'Presentar al equipo y anticipar la idea central: modernizar las fronteras, no reescribir un sistema sano.' },
  { id: 'problem', section: 'Contexto', minutes: '0:35–1:35', title: 'El problema es arquitectónico', kicker: 'El código está sano; la forma de evolucionarlo es la restricción.', notes: 'Conectar con la entrega inicial: interfaz renderizada en servidor, despliegue único y límites internos implícitos.' },
  { id: 'cartography', section: 'Cartografía', minutes: '1:35–3:05', title: 'CodeScene cambió la prioridad', kicker: 'La evidencia llevó el alcance de “lo más fácil” al flujo de mayor valor.', notes: 'No leer todas las métricas. Explicar salud general, hotspots y acoplamiento como tres decisiones encadenadas.' },
  { id: 'strategy', section: 'Decisión', minutes: '3:05–4:05', title: 'Revamp incremental', kicker: 'Strangler Fig para coexistir, aprender y reducir riesgo.', notes: 'Explicar qué se preserva, qué se transforma y qué se pospone.' },
  { id: 'legacy', section: 'As-Is', minutes: '4:05–5:05', title: 'Componentes del legado', kicker: 'Un monolito en capas con una base relacional compartida.', notes: 'Seguir el flujo usuario → Thymeleaf → controladores → repositorio → base. Marcar owner/pet/visit.' },
  { id: 'tobe', section: 'To-Be', minutes: '5:05–7:00', title: 'Arquitectura objetivo desplegable', kicker: 'React desacoplado, frontera REST y backend Spring modularizado.', notes: 'Nombrar servicios AWS concretos y explicar que la extracción a microservicios se pospone.' },
  { id: 'tactics', section: 'To-Be', minutes: '7:00–8:05', title: 'Patrones y tácticas con propósito', kicker: 'Cada decisión responde a modificabilidad, interoperabilidad o confiabilidad.', notes: 'No presentar patrones como lista decorativa; asociar cada uno con el riesgo que reduce.' },
  { id: 'apigee', section: 'To-Be', minutes: '8:05–8:55', title: 'Prácticas Apigee extrapolables', kicker: 'Adoptamos el enfoque de gestión de APIs sin añadir una plataforma innecesaria.', notes: 'Aclarar que se extrapolan prácticas, no que Apigee forme parte del despliegue AWS.' },
  { id: 'purpose', section: 'Pre-experimento', minutes: '8:55–9:45', title: 'Qué queremos comprobar', kicker: 'Que una frontera REST permite un canal nuevo sin romper el legado.', notes: 'Enunciar propósito, hipótesis y criterio de viabilidad técnica.' },
  { id: 'requirements', section: 'Pre-experimento', minutes: '9:45–10:45', title: 'Dos requisitos, un corte vertical', kicker: '4 integrantes ÷ 2 = 2 requisitos de la tabla de Entrega 2.', notes: 'Explicar por qué se escogieron RQ-01 y RQ-06: lectura y escritura del núcleo funcional.' },
  { id: 'mapping', section: 'Pre-experimento', minutes: '10:45–11:35', title: 'Mapeo legado → modernizado', kicker: 'Las reglas permanecen; cambian los puntos de entrada y las dependencias.', notes: 'Mostrar la trazabilidad entre MVC/entidades y React/API/DTO/servicios.' },
  { id: 'code', section: 'Pre-experimento', minutes: '11:35–12:25', title: 'Reescritura visible y acotada', kicker: 'Los controladores dejan de producir vistas y pasan a ofrecer contratos.', notes: 'Explicar solo las líneas importantes: Response DTO, servicio transaccional y validación declarativa.' },
  { id: 'instrumentation', section: 'Pre-experimento', minutes: '12:25–13:15', title: 'Cómo se instrumenta', kicker: 'Pruebas, métricas de código, observabilidad y evidencia reproducible.', notes: 'Diferenciar lo ejecutado ahora de las métricas que se recolectarían en el experimento final.' },
  { id: 'results', section: 'Resultados', minutes: '13:15–14:20', title: 'Resultado del pre-experimento', kicker: 'El corte es técnicamente viable con evidencia funcional y de regresión.', notes: 'Presentar números concretos y reconocer que no se concluye aún sobre carga o costo productivo.' },
  { id: 'close', section: 'Cierre', minutes: '14:20–14:50', title: 'Modernizar sin perder lo que funciona', kicker: 'La API es la primera frontera; la extracción física será una decisión posterior.', notes: 'Cerrar con próximos pasos y declarar el uso de IAG con validación humana.' },
  { id: 'sequence-search', section: 'Apéndice', minutes: 'No presentar', title: 'Diseño detallado · RQ-01', kicker: 'Secuencia de búsqueda y selección.', notes: 'Material para la entrega 8: primer diagrama de diseño adicional.' },
  { id: 'sequence-visit', section: 'Apéndice', minutes: 'No presentar', title: 'Diseño detallado · RQ-06', kicker: 'Secuencia transaccional para registrar visita.', notes: 'Material para la entrega 8: segundo diagrama de diseño adicional.' },
  { id: 'effort', section: 'Apéndice', minutes: 'No presentar', title: 'Estimación de esfuerzo', kicker: 'Desagregación + juicio del equipo en puntos de historia.', notes: 'Revisar puntos con el equipo antes de la entrega final y registrar horas reales por tarea.' },
  { id: 'postexperiment', section: 'Apéndice', minutes: 'No presentar', title: 'Plantilla del post-experimento', kicker: 'Decisión, desviaciones, esfuerzo real y recomendación.', notes: 'Completar en la entrega 8 con resultados reales y enlace público del repositorio.' },
]

function Presentation() {
  const [index, setIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [overview, setOverview] = useState(false)
  const slide = slides[index]

  const isAppendix = slide.section === 'Apéndice'
  const progress = useMemo(() => `${((Math.min(index, 14) + 1) / 15) * 100}%`, [index])

  function move(delta) {
    setIndex((current) => Math.max(0, Math.min(slides.length - 1, current + delta)))
  }

  useEffect(() => {
    function onKey(event) {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); move(1) }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); move(-1) }
      if (event.key.toLowerCase() === 'n') setNotesOpen((open) => !open)
      if (event.key.toLowerCase() === 'o') setOverview((open) => !open)
      if (event.key === 'Home') setIndex(0)
      if (event.key === 'End') setIndex(14)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function fullscreen() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }

  if (overview) {
    return <Overview current={index} onSelect={(next) => { setIndex(next); setOverview(false) }} onClose={() => setOverview(false)} />
  }

  return (
    <div className={`deck ${isAppendix ? 'appendix' : ''}`}>
      <header className="deck-header">
        <div className="deck-brand"><Stethoscope size={17} /> PetClinic · Modernización</div>
        <div className="deck-section">{slide.section}</div>
        <div className="deck-time">{slide.minutes}</div>
      </header>

      <main className="slide-frame">
        <div className="slide-number">{isAppendix ? `A${index - 14}` : String(index + 1).padStart(2, '0')}</div>
        <div className="slide-heading">
          <span>{slide.kicker}</span>
          <h1>{slide.title}</h1>
        </div>
        <SlideContent id={slide.id} />
      </main>

      {notesOpen && (
        <aside className="speaker-notes">
          <BookOpenText size={18} />
          <div><b>Notas del presentador</b><p>{slide.notes}</p></div>
          <button aria-label="Cerrar notas" onClick={() => setNotesOpen(false)}><X size={17} /></button>
        </aside>
      )}

      <footer className="deck-footer">
        <div className="deck-progress"><span style={{ width: progress }} /></div>
        <div className="deck-controls">
          <button title="Vista general" aria-label="Vista general" onClick={() => setOverview(true)}><LayoutGrid size={18} /></button>
          <button title="Notas del presentador" aria-label="Notas del presentador" onClick={() => setNotesOpen(!notesOpen)}><BookOpenText size={18} /></button>
          <button title="Pantalla completa" aria-label="Pantalla completa" onClick={fullscreen}><Fullscreen size={18} /></button>
          <span>{index + 1} / {slides.length}</span>
          <button title="Anterior" aria-label="Diapositiva anterior" disabled={index === 0} onClick={() => move(-1)}><ArrowLeft size={18} /></button>
          <button title="Siguiente" aria-label="Diapositiva siguiente" disabled={index === slides.length - 1} onClick={() => move(1)}><ArrowRight size={18} /></button>
        </div>
      </footer>
    </div>
  )
}

function SlideContent({ id }) {
  const content = {
    cover: <Cover />,
    problem: <Problem />,
    cartography: <Cartography />,
    strategy: <Strategy />,
    legacy: <LegacyDiagram />,
    tobe: <ToBeDiagram />,
    tactics: <Tactics />,
    apigee: <Apigee />,
    purpose: <Purpose />,
    requirements: <Requirements />,
    mapping: <Mapping />,
    code: <CodeComparison />,
    instrumentation: <Instrumentation />,
    results: <Results />,
    close: <Close />,
    'sequence-search': <SearchSequence />,
    'sequence-visit': <VisitSequence />,
    effort: <Effort />,
    postexperiment: <PostExperiment />,
  }
  return <div className="slide-content">{content[id]}</div>
}

function Cover() {
  return (
    <div className="cover-layout">
      <div className="cover-statement">
        <span className="label">Equipo 6 · Modernización de Software</span>
        <p>Una frontera API incremental para el flujo <b>owner → pet → visit</b>.</p>
        <div className="cover-team">Alejandro Forero · Yesid Marín · Juan Sánchez · David Varón</div>
      </div>
      <div className="cover-visual" aria-label="Flujo de modernización">
        <div className="orbit legacy-orbit"><span>Thymeleaf</span></div>
        <div className="orbit api-orbit"><span>REST</span></div>
        <div className="orbit react-orbit"><span>React</span></div>
        <div className="orbit-core"><Stethoscope size={34} /><b>PetClinic</b></div>
      </div>
    </div>
  )
}

function Problem() {
  return (
    <div className="problem-layout">
      <div className="big-quote">“No necesitamos reemplazar el dominio; necesitamos liberar su evolución.”</div>
      <div className="constraint-list">
        <Statement icon={MonitorSmartphone} title="Presentación acoplada" text="Los controladores producen HTML y no contratos de datos reutilizables." />
        <Statement icon={Box} title="Unidad de despliegue única" text="UI, reglas y persistencia se versionan y despliegan juntas." />
        <Statement icon={GitBranch} title="Límites implícitos" text="Los módulos son convenciones de paquetes, no fronteras verificables." />
      </div>
      <div className="business-callout"><span>Motivador</span><b>Habilitar nuevos canales digitales reduciendo el costo y riesgo de cambio.</b><small>Prioridad: modificabilidad · interoperabilidad · testabilidad</small></div>
    </div>
  )
}

function Cartography() {
  return (
    <div className="evidence-layout">
      <figure className="evidence-main"><img src="/evidence/codescene-dashboard.png" alt="Dashboard CodeScene con Code Health saludable" /><figcaption>Salud general alta: promedio 9,7 · 95,1 % verde · 0 % rojo.</figcaption></figure>
      <div className="evidence-side">
        <figure><img src="/evidence/codescene-hotspots.png" alt="Hotspots de CodeScene encabezados por pruebas y controladores de mascotas y dueños" /><figcaption><b>Hotspots</b> · PetController y pruebas de owner/pet concentran cambio.</figcaption></figure>
        <figure><img src="/evidence/codescene-coupling.png" alt="Change Coupling de CodeScene entre owner, pet y visit" /><figcaption><b>Change Coupling</b> · Pet/Visit 62 %; pruebas relacionadas hasta 82 %.</figcaption></figure>
      </div>
      <div className="evidence-conclusion"><b>Decisión</b><span>Modernización incremental del flujo owner → pet → visit. Vet queda como piloto opcional.</span></div>
    </div>
  )
}

function Strategy() {
  return (
    <div className="strategy-layout">
      <div className="strategy-track">
        <Phase n="01" title="Preservar" items="Dominio · validaciones · esquema · pruebas" />
        <Phase n="02" title="Crear frontera" items="REST · DTOs · servicios · contratos" active />
        <Phase n="03" title="Conectar" items="React · coexistencia Thymeleaf" />
        <Phase n="04" title="Decidir extracción" items="Solo con evidencia del primer corte" muted />
      </div>
      <div className="strategy-note"><GitBranch size={25} /><div><b>Strangler Fig</b><p>El canal nuevo crece junto al legado. El reemplazo ocurre por funcionalidad, no por “big bang”.</p></div></div>
    </div>
  )
}

function LegacyDiagram() {
  return (
    <div className="architecture-board legacy-board">
      <DiagramNode icon={Users} label="Usuario web" kind="external" />
      <FlowArrow />
      <div className="system-boundary">
        <span className="boundary-label">Spring Boot monolítico</span>
        <DiagramNode icon={MonitorSmartphone} label="Vistas Thymeleaf" />
        <FlowArrow vertical />
        <div className="node-row">
          <DiagramNode label="OwnerController" kind="modernize" />
          <DiagramNode label="PetController" kind="modernize" />
          <DiagramNode label="VisitController" kind="modernize" />
          <DiagramNode label="VetController" kind="pilot" />
        </div>
        <FlowArrow vertical />
        <div className="node-row">
          <DiagramNode label="OwnerRepository" />
          <DiagramNode label="Pet / Validator" />
          <DiagramNode label="Visit" />
          <DiagramNode label="VetRepository" />
        </div>
      </div>
      <FlowArrow />
      <DiagramNode icon={Database} label="Base relacional compartida" kind="data" />
      <div className="diagram-legend"><span className="modernize-dot" /> Modernizar <span className="pilot-dot" /> Piloto opcional</div>
    </div>
  )
}

function ToBeDiagram() {
  return (
    <div className="deployment-layout">
      <div className="deployment-diagram">
        <div className="cloud-zone edge-zone"><span>AWS Edge</span><DiagramNode icon={Cloud} label="CloudFront" /><div className="split-arrow">↙ &nbsp; ↘</div><div className="node-row"><DiagramNode icon={MonitorSmartphone} label="S3 · React" kind="frontend" /><DiagramNode icon={ShieldCheck} label="/api route" kind="api" /></div></div>
        <div className="deployment-arrow">↓ HTTPS / JSON</div>
        <div className="cloud-zone app-zone"><span>AWS Application</span><DiagramNode icon={ServerCog} label="App Runner · Spring Boot container" kind="backend" /><div className="node-row"><DiagramNode label="OwnerService" /><DiagramNode label="VisitService" /><DiagramNode label="DTO contracts" kind="api" /></div></div>
        <div className="deployment-arrow">↓ private VPC connection</div>
        <div className="cloud-zone data-zone"><span>AWS Data & Ops</span><div className="node-row"><DiagramNode icon={Database} label="RDS PostgreSQL" kind="data" /><DiagramNode icon={Activity} label="CloudWatch" kind="ops" /></div></div>
      </div>
      <div className="deployment-notes">
        <Decision label="Coexistencia" text="Thymeleaf continúa sobre el mismo backend durante el corte." />
        <Decision label="Despliegue" text="React y API evolucionan de forma independiente." />
        <Decision label="Infraestructura" text="Terraform versiona CloudFront, S3, App Runner y RDS." />
        <Decision label="Pospuesto" text="Microservicios y database-per-service hasta validar cohesión." />
      </div>
    </div>
  )
}

function Tactics() {
  return (
    <div className="tactics-grid">
      <Tactic icon={GitBranch} name="Strangler Fig" quality="Riesgo" detail="Coexistencia y migración por requisito." />
      <Tactic icon={Braces} name="API + DTO" quality="Interoperabilidad" detail="Contrato estable, sin exponer entidades JPA." />
      <Tactic icon={Blocks} name="Service Layer" quality="Modificabilidad" detail="Reglas de aplicación fuera del adaptador web." />
      <Tactic icon={ShieldCheck} name="Problem Details" quality="Confiabilidad" detail="Errores JSON uniformes y accionables." />
      <Tactic icon={Activity} name="Health & metrics" quality="Observabilidad" detail="Actuator y CloudWatch para operar el corte." />
      <Tactic icon={Database} name="Shared DB temporal" quality="Continuidad" detail="Menor riesgo inicial; deuda explícita y reversible." />
    </div>
  )
}

function Apigee() {
  return (
    <div className="apigee-layout">
      <div className="apigee-practices">
        <Practice n="01" title="Diseño contract-first" text="Describir la API con OpenAPI antes de ampliar consumidores." />
        <Practice n="02" title="Fachada / proxy" text="Separar el contrato público de la implementación Spring." />
        <Practice n="03" title="Fault handling uniforme" text="ProblemDetail y un manejador catch-all con mensajes útiles." />
        <Practice n="04" title="Políticas y analítica" text="Autenticación, cuotas, trazas y métricas en el borde cuando escale." />
      </div>
      <div className="apigee-answer">
        <Network size={30} />
        <p><b>¿Por qué?</b> Estas prácticas reducen acoplamiento y hacen observable el API sin obligarnos a desplegar Apigee en un experimento pequeño.</p>
        <div className="source-links">
          <a href="https://docs.cloud.google.com/apigee/docs/api-platform/publish/api-design-overview" target="_blank" rel="noreferrer">API design <ExternalLink size={12} /></a>
          <a href="https://docs.cloud.google.com/apigee/docs/api-platform/fundamentals/best-practices-api-proxy-design-and-development" target="_blank" rel="noreferrer">Proxy practices <ExternalLink size={12} /></a>
        </div>
      </div>
    </div>
  )
}

function Purpose() {
  return (
    <div className="purpose-layout">
      <div className="experiment-question"><FlaskConical size={38} /><span>Pregunta experimental</span><h2>¿Podemos habilitar React sobre una API REST preservando comportamiento y coexistencia?</h2></div>
      <div className="hypothesis-row">
        <Hypothesis label="Hipótesis" text="Sí: DTOs + servicios permiten separar canales sin modificar entidades ni esquema." />
        <Hypothesis label="Unidad" text="Un corte vertical de búsqueda de dueños y registro de visitas." />
        <Hypothesis label="Éxito" text="Aceptación funcional, regresión verde, contrato JSON y build React reproducible." />
      </div>
    </div>
  )
}

function Requirements() {
  return (
    <div className="requirements-layout">
      <Requirement id="RQ-01" icon={Search} title="Buscar dueños por apellido" reason="Consulta representativa" checks={['Prefijo parcial', 'Sin resultados', 'Único → detalle', 'Múltiples → paginación']} />
      <div className="requirement-connector"><span>lectura</span><b>owner → pet → visit</b><span>escritura</span></div>
      <Requirement id="RQ-06" icon={TestTube2} title="Registrar visita" reason="Comando transaccional" checks={['Dueño y mascota válidos', 'Fecha futura', 'Descripción obligatoria', 'Persistencia en historial']} />
    </div>
  )
}

function Mapping() {
  const rows = [
    ['Formulario Thymeleaf', 'React search / visit form', 'Canal desacoplado'],
    ['OwnerController', 'OwnerRestController', 'Adaptador REST'],
    ['VisitController', 'VisitRestController', 'Adaptador REST'],
    ['Binding MVC', 'CreateVisitRequest', 'Contrato + validación'],
    ['Acceso al repositorio', 'Query / Command services', 'Límite transaccional'],
    ['Owner · Pet · Visit', 'Se preservan', 'Reglas y esquema'],
  ]
  return (
    <div className="mapping-table">
      <div className="mapping-head"><span>Legado</span><span>Modernizado</span><span>Decisión</span></div>
      {rows.map((row) => <div className="mapping-row" key={row[0]}>{row.map((cell, i) => <span key={cell} className={i === 1 ? 'mapped' : ''}>{cell}{i === 0 && <ArrowRight size={14} />}</span>)}</div>)}
    </div>
  )
}

function CodeComparison() {
  return (
    <div className="code-layout">
      <CodePanel label="Legado · RQ-06" tone="legacy" code={`@PostMapping("/.../visits/new")\nString processNewVisitForm(\n  @ModelAttribute Owner owner,\n  @Valid Visit visit, BindingResult result) {\n  owner.addVisit(petId, visit);\n  owners.save(owner);\n  return "redirect:/owners/{ownerId}";\n}`} />
      <div className="code-arrow"><ArrowRight size={25} /></div>
      <CodePanel label="Modernizado · RQ-06" tone="modern" code={`@PostMapping\nResponseEntity<VisitResponse> create(\n  @Valid @RequestBody CreateVisitRequest request) {\n  VisitResponse visit = visits.create(\n    ownerId, petId, request);\n  return ResponseEntity.created(location).body(visit);\n}`} />
      <div className="code-explanation"><Code2 size={19} /><span><b>Cambio esencial:</b> HTTP/JSON y DTO en el borde; la transacción y el agregado quedan en <code>VisitCommandService</code>.</span></div>
    </div>
  )
}

function Instrumentation() {
  return (
    <div className="instrument-layout">
      <div className="instrument-pipeline">
        <Instrument icon={TestTube2} title="Funcional" metrics="Criterios de aceptación · regresión" status="Ejecutado" />
        <Instrument icon={FileCode2} title="Mantenibilidad" metrics="JaCoCo · CodeScene/Sonar · complejidad" status="Parcial" />
        <Instrument icon={CircleGauge} title="Operación" metrics="p50/p95 · errores · throughput" status="Smoke" />
        <Instrument icon={Activity} title="Producción" metrics="Actuator → CloudWatch · alarmas" status="Planeado" />
      </div>
      <div className="stakeholders"><Users size={22} /><div><b>Interesados</b><p>Desarrolladores · QA · responsable de clínica · operaciones/cloud · propietario del producto.</p></div></div>
    </div>
  )
}

function Results() {
  return (
    <div className="results-layout">
      <div className="metric-grid">
        <Metric value="51/51" label="Suite Java completa" detail="47 base + 4 API" />
        <Metric value="4/4" label="Pruebas API nuevas" detail="0 fallos" />
        <Metric value="5/5" label="Pruebas de navegador" detail="Desktop + móvil" />
        <Metric value="21,4 ms" label="p95 búsqueda local" detail="50 solicitudes" />
      </div>
      <div className="verdict"><Check size={28} /><div><span>Resultado preliminar</span><b>SÍ es viable técnicamente.</b><p>Se preservó el legado, se creó un contrato REST y React consume los dos flujos. Falta evaluar carga, seguridad y costo en AWS antes de producción.</p></div></div>
    </div>
  )
}

function Close() {
  return (
    <div className="close-layout">
      <div className="close-path"><span>Legado sano</span><ArrowRight /><span>Frontera API</span><ArrowRight /><span>Canal React</span><ArrowRight /><b>Evolución medible</b></div>
      <div className="next-steps">
        <h2>Siguiente iteración</h2>
        <p><Check size={16} /> Formalizar OpenAPI y contratos</p>
        <p><Check size={16} /> Desplegar infraestructura mínima con Terraform</p>
        <p><Check size={16} /> Ejecutar métricas y registrar esfuerzo real</p>
      </div>
      <div className="ai-disclosure"><Braces size={19} /><p><b>Uso de IAG:</b> apoyo en análisis, implementación, pruebas, diagramación y guion. Todas las decisiones y evidencias fueron verificadas contra el repositorio y resultados ejecutados.</p></div>
    </div>
  )
}

function SearchSequence() {
  return <Sequence actors={['React', 'Owner REST', 'Query Service', 'Repository']} steps={['GET /api/owners?lastName=Davis', 'search(prefix, page, size)', 'findByLastNameStartingWith()', 'Page<Owner>', 'OwnerSearchResponse', 'JSON + metadata', 'si 1 → GET /api/owners/{id}']} />
}

function VisitSequence() {
  return <Sequence actors={['React', 'Visit REST', 'Command Service', 'Repository']} steps={['POST visita + JSON', '@Valid CreateVisitRequest', 'find owner + pet', 'crear Visit y agregar al agregado', 'save(owner) · cascade', '201 Created + DTO', 'recargar detalle']} />
}

function Effort() {
  const tasks = [['RQ-01 · búsqueda REST + React', '5'], ['RQ-06 · visita REST + React', '8'], ['Pruebas y contratos', '5'], ['Infraestructura AWS + Terraform', '8'], ['Observabilidad y documentación', '3']]
  return <div className="effort-layout"><div className="effort-table">{tasks.map(([task, points]) => <div key={task}><span>{task}</span><b>{points} pts</b></div>)}</div><div className="effort-rationale"><CircleGauge size={27} /><h2>29 puntos</h2><p>Desagregación por entregable y juicio del equipo. Los puntos comparan complejidad, incertidumbre y riesgo; las horas reales se registrarán aparte.</p><small>Puntos de función se descartaron para este corte: clasifican datos/transacciones de forma trazable, pero requieren mayor calibración y no capturan bien el riesgo de infraestructura.</small></div></div>
}

function PostExperiment() {
  return <div className="post-grid"><PostCard n="01" title="Viabilidad" text="SÍ/NO y evidencia por requisito y atributo." /><PostCard n="02" title="Desviaciones" text="Esperado vs. observado, causa y recomendación." /><PostCard n="03" title="Esfuerzo real" text="Horas por requisito, infraestructura, pruebas y documentación." /><PostCard n="04" title="Repositorio" text="URL pública o acceso para modernizacionsoft." /><PostCard n="05" title="Demostración" text="Legado y modernizado ejecutados, narrados y comparados." /><PostCard n="06" title="Decisión siguiente" text="Mantener monolito modular o extraer con evidencia." /></div>
}

function Overview({ current, onSelect, onClose }) {
  return <div className="overview"><header><div><span>PetClinic · vista general</span><h1>Guion completo</h1></div><button onClick={onClose}><X /></button></header><div className="overview-grid">{slides.map((slide, i) => <button key={slide.id} className={i === current ? 'current' : ''} onClick={() => onSelect(i)}><small>{slide.section} · {slide.minutes}</small><b>{slide.title}</b><span>{slide.kicker}</span></button>)}</div></div>
}

function Statement({ icon: Icon, title, text }) { return <div className="statement"><Icon size={21} /><div><b>{title}</b><p>{text}</p></div></div> }
function Phase({ n, title, items, active, muted }) { return <div className={`phase ${active ? 'active' : ''} ${muted ? 'muted' : ''}`}><span>{n}</span><b>{title}</b><small>{items}</small></div> }
function DiagramNode({ icon: Icon, label, kind = '' }) { return <div className={`diagram-node ${kind}`}>{Icon && <Icon size={18} />}<span>{label}</span></div> }
function FlowArrow({ vertical }) { return <div className={`flow-arrow ${vertical ? 'vertical' : ''}`}>{vertical ? '↓' : '→'}</div> }
function Decision({ label, text }) { return <div className="decision"><span>{label}</span><p>{text}</p></div> }
function Tactic({ icon: Icon, name, quality, detail }) { return <div className="tactic"><Icon size={24} /><span>{quality}</span><h2>{name}</h2><p>{detail}</p></div> }
function Practice({ n, title, text }) { return <div className="practice"><span>{n}</span><div><b>{title}</b><p>{text}</p></div></div> }
function Hypothesis({ label, text }) { return <div className="hypothesis"><span>{label}</span><p>{text}</p></div> }
function Requirement({ id, icon: Icon, title, reason, checks }) { return <div className="requirement"><div className="requirement-head"><span>{id}</span><Icon size={25} /></div><h2>{title}</h2><p>{reason}</p><div>{checks.map((check) => <small key={check}><Check size={14} />{check}</small>)}</div></div> }
function CodePanel({ label, code, tone }) { return <div className={`code-panel ${tone}`}><span><Braces size={14} />{label}</span><pre><code>{code}</code></pre></div> }
function Instrument({ icon: Icon, title, metrics, status }) { return <div className="instrument"><Icon size={22} /><div><b>{title}</b><p>{metrics}</p></div><span>{status}</span></div> }
function Metric({ value, label, detail }) { return <div className="metric"><strong>{value}</strong><b>{label}</b><small>{detail}</small></div> }
function Sequence({ actors, steps }) { return <div className="sequence"><div className="sequence-actors">{actors.map((actor) => <div key={actor}><b>{actor}</b><span /></div>)}</div><div className="sequence-steps">{steps.map((step, i) => <div key={step} style={{ marginLeft: `${(i % (actors.length - 1)) * 18}%`, width: '28%' }}><span>{i + 1}</span>{step}<ArrowRight size={14} /></div>)}</div></div> }
function PostCard({ n, title, text }) { return <div className="post-card"><span>{n}</span><h2>{title}</h2><p>{text}</p></div> }

export default Presentation
