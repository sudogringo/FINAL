import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

const tabs = [
  {
    id: 'tomate',
    label: 'Tomate',
    emoji: '🍅',
    accent: '#C0392B',
    materias: {
      title: 'Materias Primas',
      items: [
        { pct: '75%', label: 'Producción propia' },
        { pct: '25%', label: 'Productores de San Luis' },
      ],
    },
    proceso: {
      title: 'Elaboración y Envasado',
      intro: 'Nuestras distintas líneas de tomates se realizan en varias etapas de elaboración:',
      steps: ['Blanqueado en línea', 'Triturado', 'Pelado', 'Pulpeado en línea de tomate (x 5 ton)'],
    },
    extras: {
      title: 'Producción de Semimanufacturados y Salsas',
      intro: 'En nuestra planta de elaboración realizamos productos como:',
      items: ['Tomate triturado', 'Puré de tomate', 'Pasta de tomate'],
      note: 'Presentaciones en latas de 250 g, 1 kg y 4 kg. Se realizan más de 4 variantes de salsas.',
    },
  },
  {
    id: 'durazno',
    label: 'Durazno',
    emoji: '🍑',
    accent: '#CABC6B',
    materias: {
      title: 'Materias Primas',
      items: [
        { pct: '75%', label: 'Producción propia' },
        { pct: '25%', label: 'Productores de la región' },
      ],
    },
    proceso: {
      title: 'Elaboración y Envasado',
      intro: 'Las líneas de durazno siguen un proceso controlado para preservar sabor y textura:',
      steps: ['Lavado y selección manual', 'Pelado por inmersión', 'Descarozado y corte', 'Envasado en almíbar (línea x 2 ton)'],
    },
    extras: {
      title: 'Líneas de Producto',
      intro: 'Del mismo proceso se obtienen distintas presentaciones:',
      items: ['Mitades en almíbar', 'Trozos en almíbar', 'Durazno light', 'Durazno al natural'],
      note: 'Presentaciones en latas de 250 g, 1 kg y 4 kg.',
    },
  },
  {
    id: 'etiquetado',
    label: 'Etiquetado',
    emoji: '🏷️',
    accent: '#A89D4F',
    materias: {
      title: 'Control de Calidad',
      items: [
        { pct: '100%', label: 'Trazabilidad por lote' },
        { pct: 'CAA', label: 'Cumplimiento normativo' },
      ],
    },
    proceso: {
      title: 'Proceso de Etiquetado',
      intro: 'Cada unidad producida es codificada y etiquetada conforme a la normativa vigente:',
      steps: [
        'Análisis fisicoquímico y microbiológico por lote',
        'Asignación de número de lote y fecha de elaboración',
        'Código de trazabilidad campo–proceso',
        'Etiquetado conforme al Código Alimentario Argentino',
      ],
    },
    extras: {
      title: 'Información Obligatoria',
      intro: 'La etiqueta incluye conforme al CAA:',
      items: ['Ingredientes y alérgenos', 'Información nutricional', 'Fecha de elaboración y vencimiento', 'RNE del establecimiento'],
      note: 'Habilitación SENASA vigente en todas las líneas.',
    },
  },
]

export default function Production() {
  const [active, setActive] = useState(0)
  const tab = tabs[active]

  return (
    <section id="produccion" className="py-28 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[#CABC6B] text-xs font-semibold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Cómo lo hacemos
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1B1B1B] leading-tight"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Proceso de{' '}
            <span style={{ color: '#CABC6B' }}>Producción</span>
          </h2>
          <p
            className="mt-4 text-[#1B1B1B]/60 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            Cada etapa está diseñada para preservar lo mejor de la naturaleza
            y garantizar un producto final sin compromisos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-14">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300"
              style={{
                fontFamily: 'Quicksand, sans-serif',
                backgroundColor: active === i ? t.accent : 'white',
                color: active === i ? (t.accent === '#CABC6B' ? '#1B1B1B' : 'white') : 'rgba(27,27,27,0.5)',
                border: active === i ? 'none' : '1px solid rgba(27,27,27,0.12)',
                transform: active === i ? 'scale(1.05)' : 'scale(1)',
                boxShadow: active === i ? `0 8px 24px ${t.accent}30` : 'none',
              }}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Materias primas */}
          <div className="rounded-3xl bg-white border border-[#1B1B1B]/8 overflow-hidden shadow-sm">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${tab.accent}60, ${tab.accent})` }} />
            <div className="p-7">
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5 block"
                style={{ color: tab.accent, fontFamily: 'Quicksand, sans-serif' }}
              >
                {tab.materias.title}
              </span>
              <div className="flex flex-col gap-4">
                {tab.materias.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: `${tab.accent}10` }}>
                    <span
                      className="text-[#1B1B1B]/70 text-sm"
                      style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: tab.accent, fontFamily: 'Quicksand, sans-serif' }}
                    >
                      {item.pct}
                    </span>
                  </div>
                ))}
              </div>

              {/* Visual placeholder */}
              <div
                className="mt-6 h-28 rounded-2xl flex items-center justify-center text-5xl"
                style={{ background: `${tab.accent}08`, border: `1px solid ${tab.accent}20` }}
              >
                {tab.emoji}
              </div>
            </div>
          </div>

          {/* Proceso */}
          <div className="rounded-3xl bg-white border border-[#1B1B1B]/8 overflow-hidden shadow-sm">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${tab.accent}60, ${tab.accent})` }} />
            <div className="p-7">
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block"
                style={{ color: tab.accent, fontFamily: 'Quicksand, sans-serif' }}
              >
                {tab.proceso.title}
              </span>
              <p
                className="text-[#1B1B1B]/60 text-sm leading-relaxed mb-6"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                {tab.proceso.intro}
              </p>
              <div className="flex flex-col gap-3">
                {tab.proceso.steps.map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: tab.accent, fontFamily: 'Quicksand, sans-serif' }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="text-[#1B1B1B]/80 text-sm leading-snug pt-1"
                      style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Productos / extras */}
          <div className="rounded-3xl bg-[#1B1B1B] overflow-hidden shadow-sm">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${tab.accent}60, ${tab.accent})` }} />
            <div className="p-7">
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3 block"
                style={{ color: tab.accent, fontFamily: 'Quicksand, sans-serif' }}
              >
                {tab.extras.title}
              </span>
              <p
                className="text-white/50 text-sm leading-relaxed mb-6"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                {tab.extras.intro}
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {tab.extras.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: `${tab.accent}15` }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tab.accent }} />
                    <span
                      className="text-white/80 text-sm"
                      style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="text-white/40 text-xs leading-relaxed italic"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                {tab.extras.note}
              </p>
            </div>
          </div>

        </div>

        {/* Tab navigation arrows */}
        <div className="flex justify-center gap-3 mt-10">
          {tabs.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: active === i ? tab.accent : 'rgba(27,27,27,0.2)',
                transform: active === i ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
