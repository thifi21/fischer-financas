export function csvRow(values: Array<string | number | null | undefined>): string {
  return values.map(value => {
    let cell = String(value ?? '')
    // Planilhas interpretam estas células como fórmulas mesmo dentro de aspas.
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(cell) && typeof value !== 'number') cell = "'" + cell
    return `"${cell.replace(/"/g, '""')}"`
  }).join(',') + '\n'
}
