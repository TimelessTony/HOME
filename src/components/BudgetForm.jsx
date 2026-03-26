import './BudgetForm.css'

function formatNumber(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString()
}

function parseNumber(str) {
  const cleaned = str.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function BudgetForm({
  projectName,
  setProjectName,
  categories,
  updateCategory,
  addCategory,
  removeCategory,
  resetAll,
}) {
  return (
    <div className="card">
      <h2 className="card-title">Project Details</h2>

      <div className="form-group">
        <label htmlFor="project-name" className="form-label">Project Name</label>
        <input
          id="project-name"
          type="text"
          className="form-input"
          placeholder="Enter project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      <div className="categories-header">
        <h3 className="categories-title">Budget Categories</h3>
        <button className="btn btn-sm btn-outline" onClick={addCategory}>
          + Add Category
        </button>
      </div>

      <div className="categories-list">
        {categories.map((cat) => (
          <div key={cat.id} className="category-row">
            <input
              type="text"
              className="form-input category-name"
              placeholder="Category name"
              value={cat.name}
              onChange={(e) => updateCategory(cat.id, 'name', e.target.value)}
            />
            <div className="amount-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                className="form-input amount-input"
                placeholder="0"
                value={cat.amount ? formatNumber(cat.amount) : ''}
                onChange={(e) => updateCategory(cat.id, 'amount', parseNumber(e.target.value))}
              />
            </div>
            <button
              className="btn-icon btn-remove"
              onClick={() => removeCategory(cat.id)}
              title="Remove category"
              aria-label="Remove category"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={resetAll}>
          Reset All
        </button>
      </div>
    </div>
  )
}

export default BudgetForm
