#!/usr/bin/env python3
"""Lote de keyframes FLUX.1-dev (ComfyUI API) desde un manifiesto JSON.

Manifiesto: {"ancla": "...", "ancla_espaldas": "...", "ancla_rostros": "...", "width", "height",
             "steps", "guidance", "items": [{"id": "B01", "rostros": false, "prompt": "..."}]}
Uso: flux_lote.py <manifiesto.json> <salida/> [--only B01,B02] [--sufijo k01] [--timeout-min 240]

Encola todo de una vez (/prompt), hace polling de /history, copia PNG + JSON espejo.
Reanudable: salta los ids que ya tienen PNG con el sufijo. NO correrlo mientras
Chatterbox usa la GPU (cae a 1/8 de velocidad).
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import random
import shutil
import sys
import time
import urllib.request
from pathlib import Path

HOST = "http://127.0.0.1:8188"
COMFY_OUTPUT = Path.home() / "ComfyUI-Installs/ComfyUI/ComfyUI/output"


def wf(name: str, prompt: str, seed: int, w: int, h: int, steps: int, guidance: float) -> dict:
    return {
        "1": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": "flux1-dev-Q8_0.gguf"}},
        "2": {"class_type": "DualCLIPLoader", "inputs": {"clip_name1": "t5xxl_fp16.safetensors", "clip_name2": "clip_l.safetensors", "type": "flux"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["2", 0]}},
        "5": {"class_type": "FluxGuidance", "inputs": {"conditioning": ["4", 0], "guidance": guidance}},
        "6": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["4", 0]}},
        "7": {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "8": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["5", 0], "negative": ["6", 0], "latent_image": ["7", 0], "seed": seed, "steps": steps, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage", "inputs": {"images": ["9", 0], "filename_prefix": name}},
    }


def post(path: str, payload: dict) -> dict:
    req = urllib.request.Request(HOST + path, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))


def history(pid: str) -> dict:
    with urllib.request.urlopen(f"{HOST}/history/{pid}") as h:
        return json.load(h)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifiesto", type=Path)
    ap.add_argument("salida", type=Path)
    ap.add_argument("--only", default="")
    ap.add_argument("--sufijo", default="k01")
    ap.add_argument("--timeout-min", type=int, default=240)
    args = ap.parse_args()
    m = json.loads(args.manifiesto.read_text())
    args.salida.mkdir(parents=True, exist_ok=True)
    items = m["items"]
    if args.only:
        ids = set(args.only.split(","))
        items = [i for i in items if i["id"] in ids]
    jobs: dict[str, dict] = {}
    for it in items:
        if list(args.salida.glob(f"{it['id']}_{args.sufijo}_*.png")):
            print(f"[{it['id']}] ya existe, salto", flush=True)
            continue
        ancla = m["ancla"] + ", " + (m["ancla_rostros"] if it.get("rostros") else m["ancla_espaldas"])
        prompt = f"{it['prompt']}, {ancla}"
        seed = random.randint(1, 2**31 - 1)
        r = post("/prompt", {"prompt": wf(f"{it['id']}_{args.sufijo}", prompt, seed, m["width"], m["height"], m["steps"], m["guidance"]), "client_id": "plato-lote"})
        jobs[it["id"]] = {"pid": r["prompt_id"], "prompt": prompt, "seed": seed, "t0": time.time()}
        print(f"[{it['id']}] encolado {r['prompt_id']} seed={seed}", flush=True)
    t_start = time.time()
    pendientes = set(jobs)
    while pendientes and time.time() - t_start < args.timeout_min * 60:
        time.sleep(10)
        for id_ in list(pendientes):
            job = jobs[id_]
            h = history(job["pid"])
            if job["pid"] not in h:
                continue
            entry = h[job["pid"]]
            if entry.get("status", {}).get("status_str") == "error":
                print(f"[{id_}] ERROR {json.dumps(entry, default=str)[:400]}", flush=True)
                pendientes.discard(id_)
                continue
            outs = entry.get("outputs", {})
            if not outs:
                continue
            for node in outs.values():
                for img in node.get("images", []):
                    src = COMFY_OUTPUT / img.get("subfolder", "") / img["filename"]
                    fname = f"{id_}_{args.sufijo}_s{job['seed']}"
                    shutil.copy(src, args.salida / f"{fname}.png")
                    (args.salida / f"{fname}.json").write_text(json.dumps({
                        "id": id_, "prompt": job["prompt"], "seed": job["seed"], "steps": m["steps"], "guidance": m["guidance"],
                        "width": m["width"], "height": m["height"], "workflow": "flux-dev-q8",
                        "generado_en": datetime.datetime.now().isoformat(timespec="seconds"), "tiempo_s": round(time.time() - job["t0"], 1),
                        "archivo": f"{fname}.png", "qc": {"estado": "pendiente"},
                    }, ensure_ascii=False, indent=2))
                    print(f"[{id_}] OK {time.time() - job['t0']:.0f}s → {fname}.png", flush=True)
            pendientes.discard(id_)
    if pendientes:
        print(f"TIMEOUT sin terminar: {sorted(pendientes)}", flush=True)
        return 1
    print("LOTE COMPLETO", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
