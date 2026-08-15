$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms

function Show-Info([string]$text, [string]$title = 'Jozz Splat Game Lab') {
    [System.Windows.Forms.MessageBox]::Show(
        $text,
        $title,
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
}

function Show-ErrorBox([string]$text) {
    [System.Windows.Forms.MessageBox]::Show(
        $text,
        'Jozz Splat Game Lab - F0',
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
}

function Invoke-NodeStep([string]$label, [string[]]$arguments, [string]$outputPath = '') {
    Write-Host ''
    Write-Host $label

    if ($outputPath) {
        & node @arguments | Set-Content -LiteralPath $outputPath -Encoding UTF8
    } else {
        & node @arguments
    }

    if ($LASTEXITCODE -ne 0) {
        throw "$label zakonczyl sie kodem $LASTEXITCODE."
    }
}

$extractDir = $null
$runDir = $null
$completed = $false

try {
    $repoRoot = Split-Path -Parent $PSScriptRoot
    Set-Location -LiteralPath $repoRoot

    Write-Host '============================================================'
    Write-Host 'Jozz Splat Game Lab - F0'
    Write-Host '============================================================'
    Write-Host ''
    Write-Host 'Wybierz oryginalny ZIP z Luma albo gs_GG_Szko_a.ply.'
    Write-Host 'Oryginalny plik nie zostanie zmodyfikowany.'

    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = 'Wybierz oryginalny plik Luma ZIP albo PLY'
    $dialog.Filter = 'Luma ZIP lub PLY (*.zip;*.ply)|*.zip;*.ply|ZIP (*.zip)|*.zip|PLY (*.ply)|*.ply'
    $dialog.Multiselect = $false
    $dialog.CheckFileExists = $true

    if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host ''
        Write-Host 'Anulowano. Nic nie zostalo zmienione.'
        exit 0
    }

    $inputPath = [System.IO.Path]::GetFullPath($dialog.FileName)
    $extension = [System.IO.Path]::GetExtension($inputPath).ToLowerInvariant()

    if ($extension -ne '.zip' -and $extension -ne '.ply') {
        throw 'Wybrany plik nie jest ZIP-em ani PLY.'
    }

    $sourcePath = $null

    if ($extension -eq '.zip') {
        $extractDir = Join-Path ([System.IO.Path]::GetTempPath()) ('JozzSplatGameLab_F0_extract_' + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $extractDir | Out-Null
        Write-Host ''
        Write-Host 'Rozpakowuje ZIP do katalogu tymczasowego...'
        Expand-Archive -LiteralPath $inputPath -DestinationPath $extractDir -Force

        $plyFiles = @(Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter '*.ply')
        if ($plyFiles.Count -eq 0) {
            throw 'W ZIP-ie nie znaleziono pliku PLY.'
        }
        if ($plyFiles.Count -ne 1) {
            throw "W ZIP-ie znaleziono $($plyFiles.Count) plikow PLY. F0 oczekuje dokladnie jednego i nie bedzie zgadywac."
        }
        $sourcePath = $plyFiles[0].FullName
    } else {
        $sourcePath = $inputPath
    }

    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCommand) {
        Show-Info "Na tym komputerze nie znaleziono Node.js.`n`nTo nie oznacza problemu ze splatem ani projektem F0. Nie instaluj nic specjalnie dla tego testu. Jesli chcesz, wyslij mi screenshot tego komunikatu." 'F0 - lokalny test pominiety'
        exit 3
    }

    $nodeVersionText = (& node --version).Trim().TrimStart('v')
    try {
        $nodeVersion = [version]$nodeVersionText
    } catch {
        throw "Nie umiem odczytac wersji Node.js: $nodeVersionText"
    }

    Write-Host ''
    Write-Host "Node.js: $nodeVersion"

    if ($nodeVersion -lt [version]'22.16.0') {
        Show-Info "Znaleziono Node.js $nodeVersion, a lokalny helper wspiera >= 22.16.0.`n`nTo nie oznacza problemu ze splatem ani F0. Nie aktualizuj nic na sile. Jesli chcesz, wyslij mi screenshot tego komunikatu." 'F0 - lokalny test pominiety'
        exit 3
    }

    Invoke-NodeStep '[1/5] Sprawdzam fundament...' @('tools/check-foundation.mjs')
    Invoke-NodeStep '[2/5] Sprawdzam zapisane dowody F0...' @('tools/check-f0-records.mjs')

    $runDir = Join-Path ([System.IO.Path]::GetTempPath()) ('JozzSplatGameLab_F0_run_' + [Guid]::NewGuid().ToString('N'))
    $splitDir = Join-Path $runDir 'split'
    New-Item -ItemType Directory -Path $runDir | Out-Null

    Invoke-NodeStep '[3/5] Sprawdzam oryginalny splat...' @('tools/f0-luma-source.mjs', 'inspect', $sourcePath) (Join-Path $runDir 'inspect.json')
    Invoke-NodeStep '[4/5] Odtwarzam foreground i environment...' @('tools/f0-luma-source.mjs', 'split', $sourcePath, $splitDir) (Join-Path $runDir 'split.json')
    Invoke-NodeStep '[5/5] Porownuje dane bajt po bajcie...' @('tools/f0-verify-split.mjs', $sourcePath, (Join-Path $splitDir 'scene.foreground.ply'), (Join-Path $splitDir 'scene.environment.ply')) (Join-Path $runDir 'verify.json')

    $completed = $true

    Write-Host ''
    Write-Host '============================================================'
    Write-Host 'F0: PASS'
    Write-Host '============================================================'
    Write-Host 'Wszystko sie zgadza. Oryginalny ZIP/PLY nie zostal zmodyfikowany.'
    Write-Host 'Tymczasowe kopie testowe zostana automatycznie usuniete.'

    Show-Info "F0: PASS`n`nWszystko sie zgadza. Oryginalny ZIP/PLY nie zostal zmodyfikowany.`n`nTymczasowe kopie testowe zostana automatycznie usuniete." 'Jozz Splat Game Lab - F0 PASS'
    exit 0
}
catch {
    Write-Host ''
    Write-Host '============================================================'
    Write-Host 'F0: FAIL'
    Write-Host '============================================================'
    Write-Host $_.Exception.Message
    if ($runDir) {
        Write-Host "Katalog diagnostyczny: $runDir"
    }
    Write-Host ''
    Write-Host 'Nie probuj tego sam naprawiac. Wyslij mi screenshot tego okna.'

    Show-ErrorBox ("F0: FAIL`n`n" + $_.Exception.Message + "`n`nNie naprawiaj tego sam. Wyslij mi screenshot komunikatu.")
    exit 1
}
finally {
    if ($completed) {
        if ($runDir -and (Test-Path -LiteralPath $runDir)) {
            Remove-Item -LiteralPath $runDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        if ($extractDir -and (Test-Path -LiteralPath $extractDir)) {
            Remove-Item -LiteralPath $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}
