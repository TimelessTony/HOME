import './BudgetBreakdown.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const COLORS = [
  '#4f46e5',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#be185d',
  '#65a30d',
]

function BudgetBreakdown({ categories, totalBudget }) {
  const activeCategories = categories.filter(c => c.amount > 0)

  if (activeCategories.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Budget Breakdown</h2>
        <p className="empty-state">Add amounts to your categories to see the breakdown.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="card-title">Budget Breakdown</h2>

      <div className="breakdown-chart">
        <div className="bar-chart">
          {activeCategories.map((cat, i) => {
            const percentage = totalBudget > 0 ? (cat.amount / totalBudget) * 100 : 0
            return (
              <div key={cat.id} className="bar-row">
                <div className="bar-label">
                  <span
                    className="bar-color"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="bar-name">{cat.name || 'Unnamed'}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
                <div className="bar-values">
                  <span className="bar-amount">{formatCurrency(cat.amount)}</span>
                  <span className="bar-percent">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="breakdown-total">
        <span>Total</span>
        <strong>{formatCurrency(totalBudget)}</strong>
      </div>
    </div>
  )
}

export default BudgetBreakdown
