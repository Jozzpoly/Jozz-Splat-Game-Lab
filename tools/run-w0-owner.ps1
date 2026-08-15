$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

function Show-ErrorBox([string]$text) {
    [System.Windows.Forms.MessageBox]::Show(
        $text,
        'Jozz Splat Game Lab - W0.2',
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
}

try {
    $repoRoot = Split-Path -Parent $PSScriptRoot
    Set-Location -LiteralPath $repoRoot

    $dialog = New-Object System.Windows.Forms.OpenFileDialog
    $dialog.Title = 'Wybierz oryginalny plik Luma ZIP albo PLY'
    $dialog.Filter = 'Luma ZIP lub PLY (*.zip;*.ply)|*.zip;*.ply|ZIP (*.zip)|*.zip|PLY (*.ply)|*.ply'
    $dialog.Multiselect = $false
    $dialog.CheckFileExists = $true

    if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host 'Anulowano. Nic nie zostalo zmienione.'
        exit 0
    }

    $inputPath = [System.IO.Path]::GetFullPath($dialog.FileName)
    $extension = [System.IO.Path]::GetExtension($inputPath).ToLowerInvariant()
    $sourcePath = $null

    if ($extension -eq '.zip') {
        $extractDir = Join-Path ([System.IO.Path]::GetTempPath()) ('JozzSplatGameLab_W0_' + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $extractDir | Out-Null
        Write-Host 'Rozpakowuje ZIP do katalogu tymczasowego...'
        Expand-Archive -LiteralPath $inputPath -DestinationPath $extractDir -Force
        $plyFiles = @(Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter '*.ply')
        if ($plyFiles.Count -ne 1) { throw "W0 oczekuje dokladnie jednego PLY w ZIP-ie; znaleziono: $($plyFiles.Count)." }
        $sourcePath = $plyFiles[0].FullName
    } elseif ($extension -eq '.ply') {
        $sourcePath = $inputPath
    } else {
        throw 'Wybierz plik .zip albo .ply.'
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Nie znaleziono Node.js. Nie instaluj nic samodzielnie; wyslij mi screenshot tego komunikatu.'
    }

    Write-Host ''
    Write-Host 'Uruchamiam W0.2 World Grounding...'
    Write-Host 'To jest test picking/markerow. Nie wymaga npm ani terminala.'
    Write-Host ''
    & node tools/w0-server.mjs $sourcePath
    exit $LASTEXITCODE
}
catch {
    Write-Host ''
    Write-Host 'W0.2: FAIL'
    Write-Host $_.Exception.Message
    Show-ErrorBox ("W0.2: FAIL`n`n" + $_.Exception.Message + "`n`nNie naprawiaj tego sam. Wyslij mi screenshot komunikatu.")
    exit 1
}
