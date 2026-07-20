import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookOpenText,
  Box,
  Braces,
  Check,
  ChevronRight,
  CircleGauge,
  Cloud,
  Code2,
  Database,
  FileCheck2,
  FlaskConical,
  Fullscreen,
  GitBranch,
  HeartPulse,
  LayoutGrid,
  MessageSquareText,
  MonitorSmartphone,
  Network,
  Search,
  ServerCog,
  ShieldCheck,
  Stethoscope,
  TestTube2,
  Users,
  X,
} from 'lucide-react'
import './presentation.css'
import './week7.css'

const week7Slides = [
  { id: 'cover', section: 'Semana 7', time: '0:00-0:25', title: 'Arquitectura To-Be y pre-experimento', kicker: 'Spring PetClinic · video de avance del proyecto', notes: 'Presentar al equipo y explicar que este video solicita retroalimentación antes de ejecutar y cerrar el experimento.' },
  { id: 'problem', section: 'Motivación', time: '0:25-1:15', title: 'La restricción es arquitectónica', kicker: 'Un código saludable puede seguir siendo difícil de evolucionar', notes: 'Conectar la problemática de la entrega inicial con el motivador de negocio. No decir que el sistema está deteriorado en general.' },
  { id: 'questions', section: 'Comprensión', time: '1:15-2:05', title: 'Qué necesitábamos entender', kicker: 'Preguntas de arquitectura y mantenibilidad guiaron la cartografía', notes: 'Presentar tres preguntas agrupadas y explicar que las respuestas combinan CodeScene y revisión del repositorio.' },
  { id: 'evidence', section: 'Cartografía', time: '2:05-3:10', title: 'La evidencia cambió el alcance', kicker: 'CodeScene descartó una reescritura y señaló el núcleo de cambio', notes: 'Explicar primero salud, después hotspots y finalmente acoplamiento. La conclusión es incremental y centrada en owner-pet-visit.' },
  { id: 'decision', section: 'Estrategia', time: '3:10-3:55', title: 'De la evidencia a la decisión', kicker: 'Revamp incremental con Strangler Fig', notes: 'Seguir la cadena evidencia, riesgo, estrategia y alcance. Vet queda como piloto opcional, no como alcance principal.' },
  { id: 'legacy', section: 'Arquitectura As-Is', time: '3:55-4:55', title: 'El legado despliega todo junto', kicker: 'Presentación, controladores, dominio y persistencia en un monolito', notes: 'Describir componentes e interacciones. El color coral identifica el corte a modernizar.' },
  { id: 'tobe', section: 'Arquitectura To-Be', time: '4:55-6:30', title: 'Separar canales sin romper el dominio', kicker: 'React + frontera REST + Spring Boot modularizado en AWS', notes: 'Recorrer de izquierda a derecha: usuario, CloudFront, S3, API, App Runner, servicios, RDS y CloudWatch. Thymeleaf coexiste.' },
  { id: 'interactions', section: 'Arquitectura To-Be', time: '6:30-7:25', title: 'Así fluye una solicitud', kicker: 'Las tácticas aparecen donde reducen un riesgo concreto', notes: 'Usar el flujo para explicar API/DTO, Service Layer, Problem Details, observabilidad y Strangler Fig.' },
  { id: 'purpose', section: 'Pre-experimento', time: '7:25-8:20', title: 'Qué queremos validar', kicker: 'Una hipótesis técnica, no una conclusión anticipada', notes: 'Enunciar propósito, hipótesis y criterio de éxito en futuro. No presentar resultados.' },
  { id: 'requirements', section: 'Pre-experimento', time: '8:20-9:25', title: 'Dos requisitos forman el corte', kicker: '4 integrantes ÷ 2 = 2 requisitos de la Entrega 2', notes: 'Explicar que RQ-01 y RQ-06 son independientes: una consulta y un comando que no requieren ejecutarse entre sí.' },
  { id: 'description', section: 'Pre-experimento', time: '9:25-10:20', title: 'Qué se preserva y qué cambia', kicker: 'Tecnologías y mapeo estructural del corte propuesto', notes: 'Diferenciar preservar, transformar y crear. React es un canal; Spring sigue siendo el backend.' },
  { id: 'code-examples', section: 'Pre-experimento', time: '10:20-11:35', title: 'La reescritura está en la frontera', kicker: 'Dos requisitos · dos cambios visibles y acotados', notes: 'Explicar RQ-01 y RQ-06 de arriba abajo. El dominio permanece; cambian la entrada HTTP, el contrato y la respuesta.' },
  { id: 'instrumentation', section: 'Pre-experimento', time: '11:35-12:55', title: 'Cómo planeamos observarlo', kicker: 'Infraestructura, pruebas, métricas e interesados', notes: 'Hablar en futuro: se ejecutarán pruebas funcionales y de contrato; Actuator y CloudWatch recolectarán métricas.' },
  { id: 'close', section: 'Cierre', time: '12:55-13:45', title: 'La decisión que buscamos validar', kicker: 'Avance suficiente para recibir retroalimentación antes del experimento final', notes: 'Solicitar retroalimentación sobre alcance, shared DB temporal y suficiencia de métricas. Cerrar con uso de IAG.' },
]

function PresentationWeek7() {
  const [index, setIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [overview, setOverview] = useState(false)
  const slide = week7Slides[index]
  const progress = useMemo(() => `${((index + 1) / week7Slides.length) * 100}%`, [index])

  function move(delta) {
    setIndex((current) => Math.max(0, Math.min(week7Slides.length - 1, current + delta)))
  }

  useEffect(() => {
    function onKey(event) {
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); move(1) }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); move(-1) }
      if (event.key.toLowerCase() === 'n') setNotesOpen((open) => !open)
      if (event.key.toLowerCase() === 'o') setOverview((open) => !open)
      if (event.key === 'Home') setIndex(0)
      if (event.key === 'End') setIndex(week7Slides.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function fullscreen() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }

  if (overview) {
    return <Week7Overview current={index} onClose={() => setOverview(false)} onSelect={(next) => { setIndex(next); setOverview(false) }} />
  }

  return (
    <div className="deck week7-deck">
      <header className="deck-header">
        <div className="deck-brand"><Stethoscope size={17} /> PetClinic · Semana 7</div>
        <div className="deck-section">{slide.section}</div>
        <div className="deck-time">{slide.time}</div>
      </header>

      <main className="slide-frame">
        <div className="slide-number">{String(index + 1).padStart(2, '0')}</div>
        <div className="slide-heading">
          <span>{slide.kicker}</span>
          <h1>{slide.title}</h1>
        </div>
        <div className="slide-content"><Week7Content id={slide.id} /></div>
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
          <button title="Notas" aria-label="Notas del presentador" onClick={() => setNotesOpen(!notesOpen)}><BookOpenText size={18} /></button>
          <button title="Pantalla completa" aria-label="Pantalla completa" onClick={fullscreen}><Fullscreen size={18} /></button>
          <span>{index + 1} / {week7Slides.length}</span>
          <button title="Anterior" aria-label="Diapositiva anterior" disabled={index === 0} onClick={() => move(-1)}><ArrowLeft size={18} /></button>
          <button title="Siguiente" aria-label="Diapositiva siguiente" disabled={index === week7Slides.length - 1} onClick={() => move(1)}><ArrowRight size={18} /></button>
        </div>
      </footer>
    </div>
  )
}

function Week7Content({ id }) {
  const content = {
    cover: <W7Cover />,
    problem: <W7Problem />,
    questions: <W7Questions />,
    evidence: <W7Evidence />,
    decision: <W7Decision />,
    legacy: <W7Legacy />,
    tobe: <W7ToBe />,
    interactions: <W7Interactions />,
    purpose: <W7Purpose />,
    requirements: <W7Requirements />,
    description: <W7Description />,
    'code-examples': <W7CodeExamples />,
    instrumentation: <W7Instrumentation />,
    close: <W7Close />,
  }
  return content[id]
}

function W7Cover() {
  return (
    <div className="w7-cover">
      <div className="w7-cover-copy">
        <span>Equipo 6 · Modernización de Software</span>
        <p>Del monolito MVC a una frontera API incremental.</p>
        <small>Alejandro Forero · Yesid Marín · Juan Sánchez · David Varón</small>
      </div>
      <div className="w7-cover-map" aria-label="Transición de arquitectura legado a arquitectura objetivo">
        <div className="w7-map-state legacy"><b>AS-IS</b><span>Thymeleaf</span><span>Spring MVC</span><span>Shared DB</span></div>
        <div className="w7-map-transition"><GitBranch size={28} /><span>Strangler Fig</span><ArrowRight /></div>
        <div className="w7-map-state target"><b>TO-BE</b><span>React</span><span>REST + Services</span><span>AWS</span></div>
      </div>
    </div>
  )
}

function W7Problem() {
  return (
    <div className="w7-problem">
      <div className="w7-problem-statement">
        <span>Problema</span>
        <h2>La interfaz y el backend evolucionan como una sola pieza.</h2>
        <p>Los controladores producen HTML, no existe una frontera API explícita y cualquier nuevo canal depende del monolito completo.</p>
      </div>
      <div className="w7-constraint-stack">
        <W7Constraint icon={MonitorSmartphone} title="Canales limitados" text="Thymeleaf está unido al ciclo del servidor." />
        <W7Constraint icon={Box} title="Despliegue conjunto" text="UI, lógica y persistencia viajan en un artefacto." />
        <W7Constraint icon={Blocks} title="Límites implícitos" text="Los paquetes no actúan como contratos verificables." />
      </div>
      <div className="w7-driver"><HeartPulse size={22} /><span>Motivador de negocio</span><b>Habilitar nuevos canales reduciendo costo y riesgo de cambio.</b><small>Modificabilidad · Interoperabilidad · Testabilidad</small></div>
    </div>
  )
}

function W7Questions() {
  return (
    <div className="w7-question-flow">
      <W7Question n="01" icon={Network} question="¿Cómo se organizan y relacionan los componentes?" evidence="Código + vista As-Is" answer="Owner, pet y visit forman el flujo central; vet es más autónomo." />
      <W7Question n="02" icon={Activity} question="¿Dónde se concentra el cambio y el riesgo?" evidence="Hotspots + Change Coupling" answer="Controladores y pruebas de owner/pet/visit concentran actividad y cambios conjuntos." />
      <W7Question n="03" icon={FileCheck2} question="¿La salud del código exige reescribir?" evidence="Code Health" answer="No. El riesgo es localizado y la estrategia debe ser incremental." />
    </div>
  )
}

function W7Evidence() {
  return (
    <div className="w7-evidence">
      <figure>
        <img src="/evidence/codescene-hotspots.png" alt="Visualización Hotspot Code Health de CodeScene" />
        <figcaption>Hotspot Code Health · los primeros lugares corresponden a pruebas y controladores del flujo seleccionado.</figcaption>
      </figure>
      <div className="w7-metrics">
        <W7Metric value="9,7" label="Code Health promedio" tone="good" />
        <W7Metric value="95,1 %" label="Código verde" tone="good" />
        <W7Metric value="72 %" label="Esfuerzo en hotspots" tone="attention" />
        <W7Metric value="82 %" label="Acoplamiento máximo observado" tone="attention" />
      </div>
      <div className="w7-evidence-reading">
        <span>Lectura objetiva</span>
        <p><b>No hay degradación generalizada.</b> Sí hay concentración de cambio y acoplamiento en owner → pet → visit.</p>
      </div>
    </div>
  )
}

function W7Decision() {
  return (
    <div className="w7-decision-chain">
      <W7DecisionStep label="Evidencia" value="Código sano + hotspots localizados" icon={Activity} />
      <ChevronRight />
      <W7DecisionStep label="Riesgo" value="Separar demasiado pronto" icon={Network} />
      <ChevronRight />
      <W7DecisionStep label="Estrategia" value="Revamp incremental + Strangler Fig" icon={GitBranch} active />
      <ChevronRight />
      <W7DecisionStep label="Alcance" value="Owner + Pet + Visit" icon={Stethoscope} />
      <div className="w7-pilot-note"><span>Vet</span><p>Piloto técnico opcional por su menor acoplamiento; no reemplaza el alcance principal.</p></div>
    </div>
  )
}

function W7Legacy() {
  return (
    <div className="w7-legacy-graphic">
      <div className="w7-actor"><Users size={22} /><span>Usuario web</span></div>
      <ArrowRight className="w7-arrow" />
      <div className="w7-monolith">
        <span className="w7-boundary-title">Spring Boot · unidad de despliegue única</span>
        <div className="w7-layer"><b>Presentación</b><div><MonitorSmartphone size={18} /> Vistas Thymeleaf</div></div>
        <ArrowDown />
        <div className="w7-layer scope"><b>Controladores MVC</b><div>OwnerController</div><div>PetController</div><div>VisitController</div><div className="optional">VetController</div></div>
        <ArrowDown />
        <div className="w7-layer"><b>Dominio y acceso</b><div>Owner / Pet / Visit</div><div>Repositories JPA</div><div>Validadores</div></div>
      </div>
      <ArrowRight className="w7-arrow" />
      <div className="w7-db"><Database size={24} /><b>Base relacional</b><span>Esquema compartido</span></div>
      <div className="w7-legend"><i /> Corte principal <i className="optional" /> Piloto opcional</div>
    </div>
  )
}

function W7ToBe() {
  return (
    <div className="w7-tobe-graphic">
      <div className="w7-user-column">
        <div className="w7-person"><Users size={21} /><b>Usuario</b></div>
        <div className="w7-legacy-channel"><MonitorSmartphone size={18} /><span>Thymeleaf legado</span><small>coexistencia temporal</small></div>
      </div>
      <div className="w7-route-arrow"><ArrowRight /><span>HTTPS</span></div>
      <div className="w7-cloud-boundary">
        <span>AWS · primera iteración</span>
        <div className="w7-cloud-row edge">
          <W7CloudNode icon={Cloud} title="CloudFront" subtitle="entrada y rutas" />
          <ArrowRight />
          <W7CloudNode icon={MonitorSmartphone} title="S3 · React" subtitle="frontend estático" tone="frontend" />
        </div>
        <div className="w7-api-route"><span>/api/* · JSON</span><ArrowDown /></div>
        <div className="w7-cloud-row application">
          <W7CloudNode icon={ServerCog} title="App Runner" subtitle="Spring Boot container" tone="backend" />
          <ArrowRight />
          <W7CloudNode icon={Braces} title="REST + DTOs" subtitle="contrato externo" tone="api" />
          <ArrowRight />
          <W7CloudNode icon={Blocks} title="Services" subtitle="owner · visit" tone="service" />
        </div>
        <div className="w7-cloud-row data">
          <W7CloudNode icon={Database} title="RDS PostgreSQL" subtitle="shared DB temporal" tone="data" />
          <W7CloudNode icon={Activity} title="CloudWatch" subtitle="logs y métricas" tone="ops" />
          <div className="w7-terraform"><Code2 size={16} /> Terraform · infraestructura versionada</div>
        </div>
      </div>
      <div className="w7-tobe-callouts">
        <span><Check /> UI y API desplegables por separado</span>
        <span><Check /> dominio y reglas preservados</span>
        <span><Check /> microservicios pospuestos</span>
      </div>
    </div>
  )
}

function W7Interactions() {
  return (
    <div className="w7-interaction">
      <div className="w7-request-line">
        <W7RuntimeNode icon={MonitorSmartphone} title="React" label="solicita datos" />
        <W7RuntimeArrow label="HTTPS / JSON" />
        <W7RuntimeNode icon={Braces} title="REST Controller" label="valida DTO" />
        <W7RuntimeArrow label="método" />
        <W7RuntimeNode icon={Blocks} title="Service Layer" label="orquesta caso" />
        <W7RuntimeArrow label="JPA" />
        <W7RuntimeNode icon={Database} title="Repository" label="persiste" />
      </div>
      <div className="w7-tactic-band">
        <W7Tactic name="API + DTO" quality="Interoperabilidad" position="12%" />
        <W7Tactic name="Problem Details" quality="Confiabilidad" position="36%" />
        <W7Tactic name="Service Layer" quality="Modificabilidad" position="60%" />
        <W7Tactic name="Actuator" quality="Observabilidad" position="84%" />
      </div>
      <div className="w7-strangler"><GitBranch size={20} /><p><b>Strangler Fig:</b> el mismo caso de uso puede ser alcanzado por Thymeleaf o React durante la transición.</p></div>
    </div>
  )
}

function W7Purpose() {
  return (
    <div className="w7-purpose">
      <div className="w7-purpose-question"><FlaskConical size={34} /><span>Propósito</span><h2>Evaluar si una frontera REST permite un canal React sin romper el comportamiento legado.</h2></div>
      <div className="w7-hypothesis">
        <div><span>Hipótesis</span><p>DTOs y servicios desacoplarán la presentación mientras se conservan entidades, reglas y esquema.</p></div>
        <div><span>Se aceptaría si...</span><p>Los requisitos cumplen sus criterios, la regresión permanece verde y ambos canales coexisten.</p></div>
        <div><span>Se cuestionaría si...</span><p>La frontera duplica reglas, rompe validaciones o exige separar datos antes de estabilizar el contrato.</p></div>
      </div>
    </div>
  )
}

function W7Requirements() {
  return (
    <div className="w7-requirements">
      <div className="w7-formula"><span>n = ⌊ integrantes / 2 ⌋</span><b>⌊ 4 / 2 ⌋ = 2</b></div>
      <W7Requirement id="RQ-01" icon={Search} title="Buscar dueños por apellido" type="Lectura" reason="Ejercita consulta, paginación y selección de detalle." criteria={['Prefijo parcial', '0 / 1 / múltiples resultados', 'Metadatos de paginación']} />
      <div className="w7-core-link"><span>owner</span><ArrowRight /><span>pet</span><ArrowRight /><span>visit</span></div>
      <W7Requirement id="RQ-06" icon={TestTube2} title="Registrar una visita" type="Escritura" reason="Ejercita validación y persistencia del agregado." criteria={['Dueño y mascota válidos', 'Fecha futura', 'Historial actualizado']} />
    </div>
  )
}

function W7Description() {
  return (
    <div className="w7-description">
      <div className="w7-change-column preserve"><span>Preservar</span><W7Change icon={Database} title="Dominio y datos" text="Owner, Pet, Visit, validaciones y esquema inicial." /><W7Change icon={FileCheck2} title="Pruebas" text="Regresión y criterios de aceptación existentes." /></div>
      <div className="w7-change-arrow"><ArrowRight /></div>
      <div className="w7-change-column transform"><span>Transformar</span><W7Change icon={MonitorSmartphone} title="Presentación" text="Formularios Thymeleaf seleccionados → componentes React." /><W7Change icon={Network} title="Dependencias" text="Controller → repository pasa a controller → service → repository." /></div>
      <div className="w7-change-arrow"><ArrowRight /></div>
      <div className="w7-change-column create"><span>Crear</span><W7Change icon={Braces} title="Contratos REST" text="DTOs, JSON y respuestas HTTP explícitas." /><W7Change icon={Blocks} title="Servicios" text="OwnerQueryService y VisitCommandService." /></div>
      <div className="w7-tech-strip"><b>Tecnología destino</b><span>React + Vite</span><span>Spring Boot REST</span><span>PostgreSQL</span><span>AWS</span></div>
    </div>
  )
}

function W7CodeExamples() {
  return (
    <div className="w7-code-comparison">
      <W7CodeCase
        id="RQ-01"
        title="Buscar dueños"
        legacy={`@GetMapping("/owners")\nString processFindForm(..., Model model) {\n  Page<Owner> result = findPaginated(...);\n  return addPaginationModel(page, model, result);\n}`}
        modern={`@GetMapping\nOwnerSearchResponse search(..., int page, int size) {\n  return owners.search(lastName, page, size);\n}`}
        decision="Modelo + vista HTML → DTO paginado en JSON mediante Query Service"
      />
      <W7CodeCase
        id="RQ-06"
        title="Registrar visita"
        legacy={`@PostMapping(".../visits/new")\nString processNewVisitForm(..., Visit visit) {\n  owner.addVisit(petId, visit);\n  owners.save(owner);\n  return "redirect:/owners/{ownerId}";\n}`}
        modern={`@PostMapping\nResponseEntity<VisitResponse> create(\n    @Valid @RequestBody CreateVisitRequest request) {\n  var created = visits.create(ownerId, petId, request);\n  return ResponseEntity.created(location).body(created);\n}`}
        decision="Entidad enlazada + redirect → request validado, Command Service y 201 Created"
      />
      <div className="w7-code-conclusion"><Code2 size={19} /><p><b>Qué se reescribe:</b> adaptadores y dependencias. <b>Qué se conserva:</b> entidades, reglas, repositorios y esquema inicial.</p></div>
    </div>
  )
}

function W7Instrumentation() {
  return (
    <div className="w7-instrumentation">
      <div className="w7-infra-mini">
        <span>Infraestructura planeada</span>
        <div><Cloud /> CloudFront / S3</div><ArrowRight />
        <div><ServerCog /> App Runner</div><ArrowRight />
        <div><Database /> RDS</div>
        <small>Terraform + CloudWatch como soporte transversal</small>
      </div>
      <div className="w7-test-matrix">
        <W7Test icon={FileCheck2} test="Funcional y regresión" metric="criterios aprobados · fallos" quality="Confiabilidad" />
        <W7Test icon={Braces} test="Contrato API" metric="status · esquema JSON · errores" quality="Interoperabilidad" />
        <W7Test icon={CircleGauge} test="Smoke / carga posterior" metric="p50 · p95 · throughput" quality="Desempeño" />
        <W7Test icon={Activity} test="Análisis estático" metric="Code Health · cobertura · complejidad" quality="Mantenibilidad" />
      </div>
      <div className="w7-stakeholders"><Users size={21} /><b>Interesados:</b><span>desarrollo</span><span>QA</span><span>responsable de clínica</span><span>operaciones cloud</span><span>product owner</span></div>
    </div>
  )
}

function W7Close() {
  return (
    <div className="w7-close">
      <div className="w7-close-statement"><span>Decisión propuesta</span><h2>Crear primero una frontera API; decidir la extracción física después de observar el corte.</h2></div>
      <div className="w7-feedback">
        <MessageSquareText size={24} />
        <div><b>Retroalimentación que buscamos</b><p>¿El alcance RQ-01/RQ-06 es suficiente? ¿Es razonable conservar la base compartida? ¿Las métricas planeadas permiten evaluar los atributos priorizados?</p></div>
      </div>
      <div className="w7-ai"><Braces size={18} /><p><b>Uso de IAG:</b> apoyo en análisis, diseño, contraste de evidencia y preparación del material. Las decisiones se verificaron contra el repositorio, CodeScene y documentación oficial.</p></div>
      <a href="/slides/semana-8">Material adelantado para semana 8 <ArrowRight size={14} /></a>
    </div>
  )
}

function Week7Overview({ current, onClose, onSelect }) {
  return (
    <div className="overview w7-overview">
      <header><div><span>PetClinic · Semana 7</span><h1>Video de avance</h1></div><button onClick={onClose}><X /></button></header>
      <div className="overview-grid">{week7Slides.map((slide, index) => <button key={slide.id} className={current === index ? 'current' : ''} onClick={() => onSelect(index)}><small>{slide.section} · {slide.time}</small><b>{slide.title}</b><span>{slide.kicker}</span></button>)}</div>
    </div>
  )
}

function W7Constraint({ icon: Icon, title, text }) { return <div className="w7-constraint"><Icon size={20} /><div><b>{title}</b><p>{text}</p></div></div> }
function W7Question({ n, icon: Icon, question, evidence, answer }) { return <div className="w7-question"><div className="w7-question-index"><span>{n}</span><Icon size={23} /></div><h2>{question}</h2><div className="w7-question-evidence"><span>Evidencia</span>{evidence}</div><ArrowDown /><p>{answer}</p></div> }
function W7Metric({ value, label, tone }) { return <div className={`w7-metric ${tone}`}><strong>{value}</strong><span>{label}</span></div> }
function W7DecisionStep({ label, value, icon: Icon, active }) { return <div className={`w7-decision-step ${active ? 'active' : ''}`}><Icon size={24} /><span>{label}</span><b>{value}</b></div> }
function W7CloudNode({ icon: Icon, title, subtitle, tone = '' }) { return <div className={`w7-cloud-node ${tone}`}><Icon size={19} /><div><b>{title}</b><span>{subtitle}</span></div></div> }
function W7RuntimeNode({ icon: Icon, title, label }) { return <div className="w7-runtime-node"><Icon size={22} /><b>{title}</b><span>{label}</span></div> }
function W7RuntimeArrow({ label }) { return <div className="w7-runtime-arrow"><span>{label}</span><ArrowRight /></div> }
function W7Tactic({ name, quality, position }) { return <div className="w7-tactic" style={{ left: position }}><i /><b>{name}</b><span>{quality}</span></div> }
function W7Requirement({ id, icon: Icon, title, type, reason, criteria }) { return <div className="w7-requirement"><div className="w7-requirement-top"><span>{id}</span><Icon size={24} /></div><small>{type}</small><h2>{title}</h2><p>{reason}</p><div>{criteria.map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></div> }
function W7Change({ icon: Icon, title, text }) { return <div className="w7-change"><Icon size={19} /><div><b>{title}</b><p>{text}</p></div></div> }
function W7Test({ icon: Icon, test, metric, quality }) { return <div className="w7-test"><Icon size={20} /><div><b>{test}</b><span>{metric}</span></div><small>{quality}</small></div> }
function W7CodeCase({ id, title, legacy, modern, decision }) { return <section className="w7-code-case"><header><span>{id}</span><b>{title}</b></header><div className="w7-code-panel legacy"><span>Legado · Spring MVC</span><pre><code>{legacy}</code></pre></div><div className="w7-code-shift"><ArrowRight /><span>{decision}</span></div><div className="w7-code-panel modern"><span>Modernizado · REST</span><pre><code>{modern}</code></pre></div></section> }

export default PresentationWeek7
