import React, { useMemo } from 'react'

const demoCategories = [
  'Roses','Bouquets','Imported Fruits','Gift Baskets','Orchids','Succulents','Tulips','Lilies','Mixed Arrangements','Plants','Sympathy','Wedding', 'Mixed Arrangements','Plants','Sympathy','Wedding','Mixed Arrangements','Plants','Sympathy','Wedding'
]

export default function CategoryList() {
  const categories = useMemo(() => demoCategories.map((name, i) => ({ id: i + 1, name })), [])

  const styles: { [k: string]: React.CSSProperties } = {
    section: { padding: '18px 0' },
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 },
    title: { margin: 0, color: 'var(--text-strong)' },
    grid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
    card: {
      background: 'transparent',
      border: 'none',
      padding: '14px 20px',
      borderRadius: 8,
      color: 'var(--text)',
      textAlign: 'center',
      minWidth: 160,
      maxWidth: 300,
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: '0.2px',
      boxShadow: 'none'
    }
  }

  return (
    <section style={styles.section}>
      <div style={{ padding: '0 16px' }}>
        <div style={styles.grid}>
          {categories.map(c => (
            <div key={c.id} style={styles.card}>{c.name}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
