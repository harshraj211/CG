$reportPath = (Resolve-Path 'artifacts/design-review/Exceller-design-report.docx').Path
$qaPath = (Resolve-Path 'artifacts/design-review/qa').Path
$wordApp = New-Object -ComObject Word.Application
try {
  $wordApp.Visible = $false
  $wordApp.DisplayAlerts = 0
  $reportDoc = $wordApp.Documents.Open($reportPath,$false,$true)
  $reportDoc.TablesOfContents.Item(1).Update()
  $reportDoc.Fields.Update() | Out-Null
  $reportDoc.Repaginate()
  @{toc=$reportDoc.TablesOfContents.Item(1).Range.Text;pageCount=$reportDoc.ComputeStatistics(2)} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $qaPath 'word-fields.json') -Encoding utf8
  $reportDoc.ExportAsFixedFormat((Join-Path $qaPath 'round-two.pdf'),17)
  $reportDoc.Close(0)
} finally {$wordApp.Quit()}
Get-Content artifacts/design-review/qa/word-fields.json
