#!/bin/zsh
# Lote de clips héroe con LTX-2 local (ComfyUI). Solo escenas SIN personas protagonistas.
# Uso: ltx_lote.sh <clips_ltx.json> <keyframes_dir> <clips_dir>
# Reanudable; ~12 min por clip de 5 s a 1024x576 en M5 Pro. No correr junto a FLUX (memoria).
set -euo pipefail
MANIFIESTO="$1"; KF_DIR="$2"; OUT_DIR="$3"
LTX_PY="$(dirname "$0")/../../../../material/produccion/ejemplo/ep01/scripts/ltx2_clip.py"
PY="$HOME/ComfyUI-Installs/ComfyUI/ComfyUI/.venv/bin/python"
mkdir -p "$OUT_DIR"
RES=$(python3 -c "import json,sys;print(json.load(open('$MANIFIESTO'))['res'])")
SEG=$(python3 -c "import json,sys;print(json.load(open('$MANIFIESTO'))['seg'])")
python3 -c "
import json
m=json.load(open('$MANIFIESTO'))
for it in m['items']: print(it['escena']+'|'+it['keyframe']+'|'+it['prompt']+', '+m['sufijo'])
" | while IFS='|' read -r escena kf prompt; do
  out="$OUT_DIR/${escena}_ltx2.mp4"
  if [ -f "$out" ]; then echo "$escena ya existe"; continue; fi
  img="$KF_DIR/$kf.png"
  [ -f "$img" ] || { echo "falta keyframe $kf para $escena"; continue; }
  echo "→ $escena ($kf)"
  "$PY" "$LTX_PY" "$img" "$prompt" "$out" --seg "$SEG" --res "$RES" && echo "ok $escena"
done
echo "lote LTX terminado"
