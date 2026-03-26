import './BudgetSummary.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function BudgetSummary({ projectName, estimates, ranges, totalBudget }) {
  const rangeSpread = estimates.high - estimates.low

  return (
    <div className="card summary-card">
      <h2 className="card-title">ROM Estimate Summary</h2>

      {projectName && (
        <p className="project-label">
          Project: <strong>{projectName}</strong>
        </p>
      )}

      <div className="estimate-cards">
        <div className="estimate-card estimate-low">
          <span className="estimate-label">{ranges.low.label}</span>
          <span className="estimate-badge badge-low">{ranges.low.description}</span>
          <span className="estimate-value">{formatCurrency(estimates.low)}</span>
        </div>

        <div className="estimate-card estimate-expected">
          <span className="estimate-label">{ranges.expected.label}</span>
          <span className="estimate-badge badge-expected">{ranges.expected.description}</span>
          <span className="estimate-value">{formatCurrency(estimates.expected)}</span>
        </div>

        <div className="estimate-card estimate-high">
          <span className="estimate-label">{ranges.high.label}</span>
          <span className="estimate-badge badge-high">{ranges.high.description}</span>
          <span className="estimate-value">{formatCurrency(estimates.high)}</span>
        </div>
      </div>

      <div className="range-bar-container">
        <div className="range-bar-labels">
          <span>{formatCurrency(estimates.low)}</span>
          <span>{formatCurrency(estimates.high)}</span>
        </div>
        <div className="range-bar">
          <div
            className="range-bar-fill"
            style={{
              left: '0%',
              width: totalBudget > 0
                ? `${((estimates.expected - estimates.low) / rangeSpread) * 100}%`
                : '0%',
            }}
          />
          <div
            className="range-bar-marker"
            style={{
              left: totalBudget > 0
                ? `${((estimates.expected - estimates.low) / rangeSpread) * 100}%`
                : '0%',
            }}
          />
        </div>
        <p className="range-bar-caption">
          Estimate range: <strong>{formatCurrency(rangeSpread)}</strong>
        </p>
      </div>
    </div>
  )
}

export default BudgetSummary
