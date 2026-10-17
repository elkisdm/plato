#!/bin/zsh
# Paralaje 2.5D para todos los keyframes de un episodio (ComfyUI: Depth Anything V2 + Depthflow).
# Uso: parallax_lote.sh <keyframes_dir> <parallax_dir> [orbital_ids="B02,B04,..."] [dur=5]
# Reanudable: salta los ids que ya tienen mp4. Exteriores amplios → orbital; el resto → dolly.
set -euo pipefail
KF_DIR="$1"; OUT_DIR="$2"; ORBITAL="${3:-B02,B04,B21,B31,B37,E43,E94}"; DUR="${4:-5}"
PARALLAX_PY="$(dirname "$0")/../../../../material/produccion/ejemplo/ep01/scripts/parallax.py"
PY="${COMFY_PY:-$HOME/ComfyUI-Installs/ComfyUI/ComfyUI/.venv/bin/python}"
[ -x "$PY" ] || PY="$HOME/ComfyUI-Installs/ComfyUI/ComfyUI/venv/bin/python"
mkdir -p "$OUT_DIR"
n=0
for png in "$KF_DIR"/*.png; do
  id="$(basename "$png" .png)"; id="${id%%_*}"
  preset=dolly; [[ ",$ORBITAL," == *",$id,"* ]] && preset=orbital
  out="$OUT_DIR/${id}_${preset}.mp4"
  # Salta solo si el mp4 nació del mismo PNG (hash en el sidecar .src); si el titular cambió
  # (k02, versión GPT), se regenera. Los mtime no sirven: la sincronización los preserva.
  hash="$(shasum -a 256 "$png" | cut -c1-16)"
  if [ -f "$out" ] && [ "$(cat "$out.src" 2>/dev/null)" = "$hash" ]; then echo "$id ya existe"; continue; fi
  "$PY" "$PARALLAX_PY" "$png" "$out" --preset "$preset" --dur "$DUR" && echo "$hash" > "$out.src" && n=$((n+1)) && echo "ok $id ($preset)"
done
echo "paralajes nuevos: $n"
