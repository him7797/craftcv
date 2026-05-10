'use client'

import { useState } from 'react'
import type { BlockContent, BlockType } from '@/lib/types'

type Props = {
  blockType: BlockType
  initialContent: BlockContent
  onSave: (edited: BlockContent) => void
  onCancel: () => void
}

export default function EditInPlaceForm({ blockType, initialContent, onSave, onCancel }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {blockType === 'experience-description' && initialContent.blockType === 'experience-description' && (
        <ExperienceDescriptionForm initialContent={initialContent} onSave={onSave} onCancel={onCancel} />
      )}
      {blockType === 'experience-bullets' && initialContent.blockType === 'experience-bullets' && (
        <BulletsForm initialContent={initialContent} onSave={onSave} onCancel={onCancel} />
      )}
      {blockType === 'project-block' && initialContent.blockType === 'project-block' && (
        <ProjectBlockForm initialContent={initialContent} onSave={onSave} onCancel={onCancel} />
      )}
      {blockType === 'skills-section' && initialContent.blockType === 'skills-section' && (
        <SkillsSectionForm initialContent={initialContent} onSave={onSave} onCancel={onCancel} />
      )}
    </div>
  )
}

function ExperienceDescriptionForm({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: Extract<BlockContent, { blockType: 'experience-description' }>
  onSave: (c: BlockContent) => void
  onCancel: () => void
}) {
  const [text, setText] = useState(initialContent.text)
  return (
    <>
      <label style={labelStyle}>Role description (1–2 lines)</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={textareaStyle}
        autoFocus
      />
      <FormActions onSave={() => onSave({ blockType: 'experience-description', text })} onCancel={onCancel} />
    </>
  )
}

function BulletsForm({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: Extract<BlockContent, { blockType: 'experience-bullets' }>
  onSave: (c: BlockContent) => void
  onCancel: () => void
}) {
  const [bulletsText, setBulletsText] = useState(initialContent.bullets.join('\n'))
  return (
    <>
      <label style={labelStyle}>Bullets (one per line)</label>
      <textarea
        value={bulletsText}
        onChange={(e) => setBulletsText(e.target.value)}
        rows={8}
        style={textareaStyle}
        autoFocus
      />
      <FormActions
        onSave={() =>
          onSave({
            blockType: 'experience-bullets',
            bullets: bulletsText.split('\n').map((b) => b.replace(/^[-•]\s*/, '').trim()).filter(Boolean),
          })
        }
        onCancel={onCancel}
      />
    </>
  )
}

function ProjectBlockForm({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: Extract<BlockContent, { blockType: 'project-block' }>
  onSave: (c: BlockContent) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initialContent.name)
  const [description, setDescription] = useState(initialContent.description)
  const [techText, setTechText] = useState(initialContent.tech.join(', '))
  const [bulletsText, setBulletsText] = useState(initialContent.bullets.join('\n'))
  const [link, setLink] = useState(initialContent.link ?? '')

  return (
    <>
      <Field label="Project name" value={name} onChange={setName} />
      <Field label="Description (1 line, user value)" value={description} onChange={setDescription} rows={2} />
      <Field label="Tech (comma-separated, 5–8 items)" value={techText} onChange={setTechText} />
      <Field label="Bullets (one per line, 2–3 max)" value={bulletsText} onChange={setBulletsText} rows={5} />
      <Field label="Link (optional)" value={link} onChange={setLink} />
      <FormActions
        onSave={() =>
          onSave({
            blockType: 'project-block',
            name,
            description,
            tech: techText.split(',').map((t) => t.trim()).filter(Boolean),
            bullets: bulletsText.split('\n').map((b) => b.replace(/^[-•]\s*/, '').trim()).filter(Boolean),
            link: link.trim() || undefined,
          })
        }
        onCancel={onCancel}
      />
    </>
  )
}

function SkillsSectionForm({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: Extract<BlockContent, { blockType: 'skills-section' }>
  onSave: (c: BlockContent) => void
  onCancel: () => void
}) {
  const [categories, setCategories] = useState(
    initialContent.categories.map((c) => ({ category: c.category, itemsText: c.items.join(', ') })),
  )

  function updateCat(i: number, field: 'category' | 'itemsText', value: string) {
    setCategories((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))
  }

  function addCat() {
    setCategories((prev) => [...prev, { category: '', itemsText: '' }])
  }

  function removeCat(i: number) {
    setCategories((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <label style={labelStyle}>Categories (4–6 recommended)</label>
      {categories.map((cat, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <input
            value={cat.category}
            onChange={(e) => updateCat(i, 'category', e.target.value)}
            placeholder="CATEGORY NAME"
            style={{ ...inputStyle, width: 160, fontFamily: 'monospace', textTransform: 'uppercase' }}
          />
          <input
            value={cat.itemsText}
            onChange={(e) => updateCat(i, 'itemsText', e.target.value)}
            placeholder="Item1, Item2, Item3..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" onClick={() => removeCat(i)} style={{ padding: '6px 10px', cursor: 'pointer', border: '1px solid #ccc' }}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={addCat} style={{ alignSelf: 'flex-start', padding: '6px 12px', cursor: 'pointer', border: '1px solid #000', fontFamily: 'monospace', fontSize: 11 }}>
        + ADD CATEGORY
      </button>
      <FormActions
        onSave={() =>
          onSave({
            blockType: 'skills-section',
            categories: categories.map((c) => ({
              category: c.category.trim(),
              items: c.itemsText.split(',').map((t) => t.trim()).filter(Boolean),
            })).filter((c) => c.category),
          })
        }
        onCancel={onCancel}
      />
    </>
  )
}

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={textareaStyle} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

function FormActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button
        type="button"
        onClick={onSave}
        style={{
          fontFamily: 'monospace', fontSize: 11, fontWeight: 700, padding: '8px 18px',
          background: '#FFD600', border: '2px solid #000', boxShadow: '2px 2px 0 #000', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}
      >
        SAVE
      </button>
      <button type="button" onClick={onCancel} style={{ fontFamily: 'monospace', fontSize: 11, padding: '8px 14px', background: '#fff', border: '2px solid #000', cursor: 'pointer' }}>
        CANCEL
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '1px',
  textTransform: 'uppercase', color: '#555',
}

const textareaStyle: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
  border: '1px solid #ccc', resize: 'vertical', lineHeight: 1.5,
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, padding: '7px 10px', border: '1px solid #ccc',
}
