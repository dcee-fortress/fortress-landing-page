const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const money = (value) => `$${Number(value || 0).toFixed(2)}`

export const buildProfessionalQuoteHtml = ({
  companyName = '',
  address = '',
  phone = '',
  whatsapp = '',
  email = '',
  client = '',
  projectName = '',
  priceRows = [],
  boq,
}) => {
  const lines = priceRows
    .map(
      (row) =>
        `<tr><td>${esc(row.description || row.material)}</td><td>${esc(row.quantityLabel || row.quantity || '')}</td><td>${money(row.unitPrice)}</td><td>${money(row.totalPrice)}</td></tr>`,
    )
    .join('')
  const title = companyName || 'Quotation'
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)} quotation</title>
    <style>
      body{font-family:Georgia,serif;color:#1c1915;padding:36px;margin:0}
      h1{font-size:1.8rem;margin:0 0 8px;letter-spacing:0.02em}
      .contacts{margin:0;color:#3f3a34;line-height:1.45}
      .to{margin:22px 0;border:1px solid #1c1915;padding:12px 14px;max-width:360px}
      .to span{display:block;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#726a62}
      .job{margin:0 0 14px;font-weight:700}
      table{width:100%;border-collapse:collapse;margin:8px 0 4px}
      th{text-align:left;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #1c1915;padding:8px}
      td{border-bottom:1px solid #e4ddd4;padding:8px;vertical-align:top}
      td:nth-child(n+2),th:nth-child(n+2){text-align:right}
      .sub td{font-weight:700;border-bottom:2px solid #1c1915}
      .addons{margin-top:16px;width:100%}
      .addons td{border:0;padding:4px 8px}
      .grand{margin-top:16px;font-size:1.25rem;font-weight:700;text-align:right}
      @media print{body{padding:16px}}
    </style></head><body>
    <h1>${esc(title)}</h1>
    <p class="contacts">
      ${address ? `${esc(address)}<br/>` : ''}
      ${phone ? `Call ${esc(phone)}<br/>` : ''}
      ${whatsapp ? `WhatsApp ${esc(whatsapp)}<br/>` : ''}
      ${email ? esc(email) : ''}
    </p>
    <div class="to"><span>To</span><strong>${esc(client || 'Client')}</strong></div>
    ${projectName ? `<p class="job">${esc(projectName)}</p>` : ''}
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>
        ${lines || '<tr><td colspan="4">No material lines yet.</td></tr>'}
        <tr class="sub"><td colspan="3">Subtotal</td><td>${money(boq?.materials)}</td></tr>
      </tbody>
    </table>
    <table class="addons">
      <tr><td>Labour ${esc(boq?.labourPercent)}%</td><td>${money(boq?.labour)}</td></tr>
      <tr><td>Consumables ${esc(boq?.consumablesPercent)}%</td><td>${money(boq?.consumables)}</td></tr>
      <tr><td>Transport ${esc(boq?.transportPercent)}%</td><td>${money(boq?.transport)}</td></tr>
    </table>
    <p class="grand">Total ${money(boq?.total)}</p>
    </body></html>`
}

export default function BoqSummary({
  boq,
  priceRows = [],
  onChangePercent,
  onPrintPdf,
  onSave,
  projectName = '',
  companyName = '',
  letterhead = {},
  client = '',
  onChangeLetterhead,
  onChangeClient,
}) {
  if (!boq) return null

  const heading = letterhead.companyName || companyName || 'Quotation'
  const setLetter = (key, value) => onChangeLetterhead?.({ [key]: value })

  const addOnRows = [
    { id: 'labour', label: 'Labour', percentKey: 'labourPercent', percent: boq.labourPercent, value: boq.labour },
    {
      id: 'consumables',
      label: 'Consumables',
      percentKey: 'consumablesPercent',
      percent: boq.consumablesPercent,
      value: boq.consumables,
    },
    {
      id: 'transport',
      label: 'Transport',
      percentKey: 'transportPercent',
      percent: boq.transportPercent,
      value: boq.transport,
    },
  ]

  return (
    <div className="drawing-boq quote-form">
      <header className="quote-letterhead">
        <h2>{heading}</h2>
        <label>
          Company name
          <input
            value={letterhead.companyName || companyName}
            placeholder={companyName || 'Company name'}
            onChange={(event) => setLetter('companyName', event.target.value)}
          />
        </label>
        <label>
          Address
          <input
            value={letterhead.address || ''}
            placeholder="Address"
            onChange={(event) => setLetter('address', event.target.value)}
          />
        </label>
        <div className="quote-contact-row">
          <label>
            Call number
            <input
              type="tel"
              value={letterhead.phone || ''}
              placeholder="Call number"
              onChange={(event) => setLetter('phone', event.target.value)}
            />
          </label>
          <label>
            WhatsApp number
            <input
              type="tel"
              value={letterhead.whatsapp || ''}
              placeholder="WhatsApp number"
              onChange={(event) => setLetter('whatsapp', event.target.value)}
            />
          </label>
        </div>
        <label>
          Email
          <input
            type="email"
            value={letterhead.email || ''}
            placeholder="Email"
            onChange={(event) => setLetter('email', event.target.value)}
          />
        </label>
      </header>

      <label className="quote-to">
        <span>To</span>
        <input
          value={client}
          placeholder="Client name"
          onChange={(event) => onChangeClient?.(event.target.value)}
        />
      </label>
      {projectName ? <p className="quote-job">{projectName}</p> : null}

      <div className="quote-table-wrap">
        <table className="quote-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {priceRows.length ? (
              priceRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.description || row.material}</td>
                  <td>{row.quantityLabel || row.quantity}</td>
                  <td>{money(row.unitPrice)}</td>
                  <td>{money(row.totalPrice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No material lines yet.</td>
              </tr>
            )}
            <tr className="quote-subtotal">
              <td colSpan={3}>Subtotal</td>
              <td>{money(boq.materials)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul className="drawing-boq-list quote-addons">
        {addOnRows.map((row) => (
          <li key={row.id} className="drawing-boq-row">
            <div className="drawing-boq-label">
              <strong>{row.label}</strong>
              <label className="drawing-boq-pct">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={row.percent ?? ''}
                  onChange={(event) => onChangePercent?.(row.percentKey, event.target.value)}
                  aria-label={`${row.label} percent`}
                />
                <span>%</span>
              </label>
            </div>
            <span className="drawing-boq-value">{money(row.value)}</span>
          </li>
        ))}
      </ul>

      <p className="drawing-boq-total">
        <strong>Total</strong>
        <span>{money(boq.total)}</span>
      </p>
      <div className="drawing-boq-actions">
        <button type="button" className="fab-next-btn fab-btn-outline" onClick={() => onPrintPdf?.()}>
          Save as PDF
        </button>
        <button type="button" className="fab-next-btn" onClick={() => onSave?.()}>
          Save quote
        </button>
      </div>
    </div>
  )
}
