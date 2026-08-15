$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

$ExpectedZipBytes = 238020735
$ExpectedZipSha = '2390ffd6a324ee015d27e95a878e07710e347a3f31fa418ddfd819bc730547a7'
$Root = Split-Path -Parent $PSScriptRoot

$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = 'Wybierz oryginalny Luma ZIP albo gs_GG_Szko_a.ply'
$dialog.Filter = 'Luma ZIP lub PLY (*.zip;*.ply)|*.zip;*.ply|Wszystkie pliki (*.*)|*.*'
if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { exit 0 }

$selected = $dialog.FileName
$temporary = $null
try {
    if ([IO.Path]::GetExtension($selected).ToLowerInvariant() -eq '.zip') {
        $item = Get-Item -LiteralPath $selected
        if ($item.Length -ne $ExpectedZipBytes) { throw "To nie jest znany F0 ZIP (zly rozmiar)." }
        $zipSha = (Get-FileHash -LiteralPath $selected -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($zipSha -ne $ExpectedZipSha) { throw "To nie jest znany F0 ZIP (SHA-256 nie pasuje)." }
        $temporary = Join-Path ([IO.Path]::GetTempPath()) ("jozz-r1-" + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $temporary | Out-Null
        Write-Host 'Rozpakowuje zweryfikowany ZIP do katalogu tymczasowego...'
        Expand-Archive -LiteralPath $selected -DestinationPath $temporary -Force
        $ply = Get-ChildItem -LiteralPath $temporary -Filter *.ply -File -Recurse
        if ($ply.Count -ne 1) { throw "ZIP powinien zawierac dokladnie jeden PLY." }
        $selected = $ply[0].FullName
    }

    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) {
        [System.Windows.Forms.MessageBox]::Show('Nie znaleziono Node.js. Niczego nie instaluj na slepo — wyslij mi screenshot tego komunikatu.', 'Jozz Splat Game Lab - R1') | Out-Null
        exit 2
    }

    Write-Host ''
    Write-Host 'Uruchamiam R1 Performance Lab...'
    & node (Join-Path $Root 'tools\r1-server.mjs') $selected
    exit $LASTEXITCODE
}
catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'R1: FAIL', 'OK', 'Error') | Out-Null
    Write-Host $_.Exception.ToString()
    exit 1
}
finally {
    if ($temporary -and (Test-Path -LiteralPath $temporary)) {
        try { Remove-Item -LiteralPath $temporary -Recurse -Force -ErrorAction Stop } catch {}
    }
}
