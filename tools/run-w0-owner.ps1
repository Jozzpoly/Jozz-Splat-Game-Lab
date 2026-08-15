$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms

$ExpectedArchiveBytes = 238020735
$ExpectedArchiveSha256 = '2390ffd6a324ee015d27e95a878e07710e347a3f31fa418ddfd819bc730547a7'
$extractDir = $null

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
        $archiveInfo = Get-Item -LiteralPath $inputPath
        if ($archiveInfo.Length -ne $ExpectedArchiveBytes) {
            throw "To nie jest zweryfikowany ZIP F0. Rozmiar: $($archiveInfo.Length), oczekiwano: $ExpectedArchiveBytes."
        }

        Write-Host 'Sprawdzam SHA-256 ZIP-a przed rozpakowaniem...'
        $archiveHash = (Get-FileHash -LiteralPath $inputPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($archiveHash -ne $ExpectedArchiveSha256) {
            throw "ZIP nie spelnia F0 SHA-256 contract.`nOtrzymano: $archiveHash`nOczekiwano: $ExpectedArchiveSha256"
        }

        $extractDir = Join-Path ([System.IO.Path]::GetTempPath()) ('JozzSplatGameLab_W0_' + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $extractDir | Out-Null
        Write-Host 'Rozpakowuje zweryfikowany ZIP do katalogu tymczasowego...'
        Expand-Archive -LiteralPath $inputPath -DestinationPath $extractDir -Force
        $plyFiles = @(Get-ChildItem -LiteralPath $extractDir -Recurse -File -Filter '*.ply')
        if ($plyFiles.Count -ne 1) {
            throw "W0 oczekuje dokladnie jednego PLY w zweryfikowanym ZIP-ie; znaleziono: $($plyFiles.Count)."
        }
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
    Write-Host 'To jest test kalibracji kierunku grawitacji i nawigacji Survey. Nie wymaga npm ani terminala.'
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
finally {
    if ($extractDir -and (Test-Path -LiteralPath $extractDir)) {
        try {
            Remove-Item -LiteralPath $extractDir -Recurse -Force -ErrorAction Stop
            Write-Host 'Usunieto tymczasowo rozpakowany PLY.'
        } catch {
            Write-Warning "Nie udalo sie usunac katalogu tymczasowego: $extractDir"
        }
    }
}
