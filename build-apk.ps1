$APPROOT = "$PSScriptRoot"
$SDK = "$APPROOT\android-sdk"
$BT = "$SDK\build-tools\34.0.0"
$PLAT = "$SDK\platforms\android-34"
$JHOME = "C:\jdk-17"
$BUILD = "$APPROOT\android\build"
$SRC = "$APPROOT\android\app\src\main"
$env:PATH = "$BT;$JHOME\bin;$env:PATH"

if (Test-Path $BUILD) { Remove-Item $BUILD -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BUILD | Out-Null
New-Item -ItemType Directory -Force -Path "$BUILD\obj" | Out-Null

Write-Host "[1/6] Compile resources..."
& "$BT\aapt2.exe" compile --dir "$SRC\res" -o "$BUILD\res.zip" 2>&1 | Out-Null; Write-Host "  ok"

Write-Host "[2/6] Link APK..."
& "$BT\aapt2.exe" link "$BUILD\res.zip" --manifest "$SRC\AndroidManifest.xml" --java "$BUILD\obj" -I "$PLAT\android.jar" --min-sdk-version 21 --target-sdk-version 34 -o "$BUILD\base.apk" 2>&1 | Out-Null; Write-Host "  ok"

Write-Host "[3/6] Compile Java..."
$srcFiles = (Get-ChildItem "$SRC\java" -Recurse -Filter "*.java").FullName
& "$JHOME\bin\javac.exe" -cp "$PLAT\android.jar" -d "$BUILD\obj" $srcFiles 2>&1 | Out-Null; Write-Host "  ok"

Write-Host "[4/6] Convert to DEX..."
Push-Location "$BUILD\obj"
& "$JHOME\bin\jar.exe" cf "$BUILD\input.jar" com 2>&1 | Out-Null
Pop-Location
New-Item -ItemType Directory -Force -Path "$BUILD\dex" | Out-Null
& "$BT\d8.bat" --lib "$PLAT\android.jar" --output "$BUILD\dex" "$BUILD\input.jar" 2>&1 | Out-Null; Write-Host "  ok"

Write-Host "[5/6] Package & align..."
Push-Location "$BUILD\dex"
Copy-Item "$BUILD\base.apk" "$BUILD\unsigned.apk"
$dexGen = Get-ChildItem . -Filter "classes*.dex" -Name
& "$JHOME\bin\jar.exe" uf "$BUILD\unsigned.apk" $dexGen 2>&1 | Out-Null
Pop-Location
& "$BT\zipalign.exe" -f -p 4 "$BUILD\unsigned.apk" "$BUILD\aligned.apk" 2>&1 | Out-Null; Write-Host "  ok"

Write-Host "[6/6] Sign..."
$KS = "$APPROOT\android\debug.keystore"
if (-not (Test-Path $KS)) {
  $null = & "$JHOME\bin\keytool.exe" -genkey -v -keystore $KS -alias debug -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Debug, OU=Tamsui, O=Seedling, L=Taipei, ST=Taiwan, C=TW" 2>&1
}
$null = & "$BT\apksigner.bat" sign --ks $KS --ks-pass pass:android --ks-key-alias debug --key-pass pass:android "$BUILD\aligned.apk" 2>&1
Write-Host "  ok"

$out = "$APPROOT\tamsui-seedling.apk"
Copy-Item "$BUILD\aligned.apk" $out -Force
Remove-Item "$BUILD" -Recurse -Force -ErrorAction SilentlyContinue
$size = [math]::Round((Get-Item $out).Length / 1024, 1)
Write-Host "========================================"
Write-Host "  APK done: tamsui-seedling.apk (${size}KB)"
Write-Host "========================================"
