#!/bin/zsh
# Render por trozos: cada bloque arranca un compositor nuevo (OffthreadVideo se agota en renders
# largos: "Could not extract frame from compositor: Request closed") y es reanudable.
# Uso: tools/render-trozos.sh <composicion> <total_frames> <salida.mp4> [frames_por_trozo=6600] [args extra de remotion...]
set -euo pipefail
COMP="$1"; TOTAL="$2"; OUT="$3"; PASO="${4:-6600}"; shift 4 2>/dev/null || shift $#
DIR="out/trozos_$(basename "$OUT" .mp4)"; mkdir -p "$DIR"
LISTA="$DIR/concat.txt"; : > "$LISTA"
i=0; a=0
while [ "$a" -lt "$TOTAL" ]; do
  b=$(( a + PASO - 1 )); [ "$b" -ge "$TOTAL" ] && b=$(( TOTAL - 1 ))
  f="$DIR/$(printf '%02d' $i).mp4"
  if [ -s "$f" ]; then echo "trozo $i ya existe"; else
    echo "trozo $i: frames $a-$b"
    ./node_modules/.bin/remotion render src/remotion/index.ts "$COMP" "$f" --frames "$a-$b" --log=error "$@"
  fi
  echo "file '$(pwd)/$f'" >> "$LISTA"
  i=$(( i + 1 )); a=$(( b + 1 ))
done
/opt/homebrew/opt/ffmpeg@7/bin/ffmpeg -v error -y -f concat -safe 0 -i "$LISTA" -c copy "$OUT"
echo "listo $OUT ($i trozos)"
