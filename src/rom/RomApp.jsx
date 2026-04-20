import { useState, useCallback } from 'react'
import BudgetForm from '../components/BudgetForm'
import BudgetSummary from '../components/BudgetSummary'
import BudgetBreakdown from '../components/BudgetBreakdown'

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Labor', amount: 0 },
  { id: 2, name: 'Materials', amount: 0 },
  { id: 3, name: 'Equipment', amount: 0 },
  { id: 4, name: 'Software & Licenses', amount: 0 },
  { id: 5, name: 'Contingency', amount: 0 },
]

const ROM_RANGES = {
  low: { label: 'Low Estimate', factor: -0.25, description: '-25%' },
  expected: { label: 'Expected', factor: 0, description: 'Base' },
  high: { label: 'High Estimate', factor: 0.75, description: '+75%' },
}

export default function RomApp() {
  const [projectName, setProjectName] = useState('')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [nextId, setNextId] = useState(6)

  const totalBudget = categories.reduce((sum, cat) => sum + cat.amount, 0)

  const estimates = {
    low: totalBudget * (1 + ROM_RANGES.low.factor),
    expected: totalBudget * (1 + ROM_RANGES.expected.factor),
    high: totalBudget * (1 + ROM_RANGES.high.factor),
  }

  const updateCategory = useCallback((id, field, value) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, [field]: value } : cat))
    )
  }, [])

  const addCategory = useCallback(() => {
    setCategories(prev => [...prev, { id: nextId, name: '', amount: 0 }])
    setNextId(prev => prev + 1)
  }, [nextId])

  const removeCategory = useCallback((id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    setProjectName('')
    setCategories(DEFAULT_CATEGORIES.map(c => ({ ...c, amount: 0 })))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>ROM Budget Calculator</h1>
        <p className="subtitle">Rough Order of Magnitude Estimator</p>
      </header>

      <main className="app-main">
        <div className="app-grid">
          <div className="left-column">
            <BudgetForm
              projectName={projectName}
              setProjectName={setProjectName}
              categories={categories}
              updateCategory={updateCategory}
              addCategory={addCategory}
              removeCategory={removeCategory}
              resetAll={resetAll}
            />
          </div>
          <div className="right-column">
            <BudgetSummary
              projectName={projectName}
              estimates={estimates}
              ranges={ROM_RANGES}
              totalBudget={totalBudget}
            />
            <BudgetBreakdown
              categories={categories}
              totalBudget={totalBudget}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          ROM estimates typically range from <strong>-25%</strong> to <strong>+75%</strong> of the base estimate.
          These are preliminary estimates for early-stage planning purposes.
        </p>
      </footer>
    </div>
  )
}
