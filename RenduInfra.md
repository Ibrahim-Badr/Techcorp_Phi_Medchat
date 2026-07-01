# 🏗️ INFRA — Déploiement Phi-3.5-Financial

## Choix technique
**Ollama**, pour la simplicité et la rapidité de mise en place (7h de challenge, pas de GPU dispo).

## Modèle utilisé
Modèle **de base `phi3.5`**, pas le LoRA fourni par l'équipe précédente (`models/phi3_financial/`).
Raison : `logs/training.log` marque ce modèle `COMPROMISED` / `DEPLOYMENT PROHIBITED`, et `logs/team_logs_archive.md` décrit une backdoor. En attente de validation CYBER avant de l'utiliser.

## Modelfile (`ollama_server/Modelfile`)
```
FROM phi3.5

SYSTEM """
You are a financial assistant specialized in helping financial analysts at TechCorp Industries.
"""

PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
PARAMETER num_predict 400
```

## Déploiement
```bash
ollama pull phi3.5
ollama create phi3-financial -f Modelfile
```

## Accès réseau
Pas d'accès au firewall cloud (OVH) → exposition via tunnel **ngrok** :
```bash
tmux new -s ngrok
ngrok http 11434
```

## Infos pour l'équipe

| | |
|---|---|
| URL | `https://slogan-unselect-reacquire.ngrok-free.dev` |
| Modèle | `phi3-financial` |
| Endpoint | `POST /api/generate` |
| Requête | `{ "model": "phi3-financial", "prompt": "...", "stream": false }` |

## Limitations
- Latence ~40-50s par réponse (CPU only)
- Réponses parfois tronquées (limite `num_predict`)
- URL ngrok non permanente (change si le tunnel redémarre)

## ⚠️ À transmettre à CYBER
- `logs/team_logs_archive.md` et `logs/training.log` : preuves d'une backdoor planifiée
- `models/phi3_financial/` : LoRA à auditer avant tout usage
- `datasets/finance_dataset_final.json` : possibles exemples empoisonnés