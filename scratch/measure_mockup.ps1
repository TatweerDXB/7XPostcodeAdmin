Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap('d:\7x\Search Result\Results Page-1.png')
Write-Output "Results Page-1: $($bmp.Width) x $($bmp.Height)"

$minX = 99999
$maxX = 0
$minY = 99999
$maxY = 0
$count = 0

for ($y = 800; $y -lt 2400; $y += 5) {
    for ($x = 1500; $x -lt 3200; $x += 5) {
        $c = $bmp.GetPixel($x, $y)
        # Check for vibrant blue #0000FF or similar
        if ($c.B -gt 220 -and $c.R -lt 50 -and $c.G -lt 80) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            $count++
        }
    }
}

Write-Output "Cell 46 found count: $count"
Write-Output "Cell 46 X: $minX to $maxX (width: $($maxX - $minX))"
Write-Output "Cell 46 Y: $minY to $maxY (height: $($maxY - $minY))"

$cellWidth = $maxX - $minX
$cellHeight = $maxY - $minY
Write-Output "Single cell size: $cellWidth x $cellHeight"

# Since cell 46 is row 4, col 6 (0-indexed: row 4, col 6):
# The grid starts at col 0 and row 0:
$gridLeft = $minX - (6 * $cellWidth)
$gridRight = $maxX + (3 * $cellWidth)
$gridTop = $minY - (4 * $cellHeight)
$gridBottom = $maxY + (5 * $cellHeight)

Write-Output "10x10 Grid X: $gridLeft to $gridRight (total width: $($gridRight - $gridLeft))"
Write-Output "10x10 Grid Y: $gridTop to $gridBottom (total height: $($gridBottom - $gridTop))"

$bmp.Dispose()
