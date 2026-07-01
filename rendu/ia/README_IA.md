# 🤖 Partie IA — TechCorp Phi MedChat

## Mission Production — Validation Phi-3.5-Financial

### Objectif
Valider la fiabilité et la déployabilité du modèle Phi-3.5-Financial pré-entraîné fourni par l'équipe précédente.

### Méthodologie
- Tests sur 10+ questions représentatives du domaine finance/business
- Évaluation qualitative des réponses (pertinence, cohérence, exactitude)
- Analyse des paramètres d'inférence (température, top-p, max tokens)

### Résultats
| Question | Réponse jugée fiable | Commentaire |
|---|---|---|
| À compléter | À compléter | À compléter |

### Conclusion production
À compléter : le modèle est-il déployable en l'état ? Recommandations d'optimisation.

---

## Mission Expérimentale — Fine-tuning LoRA modèle médical

### Objectif
Fine-tuner Phi-3.5-mini-instruct sur le dataset médical nettoyé (`medical_dataset_final.json`, 241 590 exemples) fourni par l'équipe DATA, à des fins de R&D — modèle non destiné à la production.

### Environnement
- **Plateforme** : Google Colab (GPU Tesla T4, 14.5 GB VRAM)
- **Framework** : Unsloth + TRL + PEFT + Transformers
- **Modèle de base** : unsloth/Phi-3.5-mini-instruct-bnb-4bit (4-bit quantization)

### Configuration LoRA
- Rank (r) : 16
- Alpha : 16
- Dropout : 0
- Modules ciblés : q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj
- Gradient checkpointing : Unsloth (optimisé mémoire)

### Paramètres d'entraînement
- Échantillon d'entraînement : 5 000 exemples (sous-ensemble aléatoire, seed=42)
- Epochs : 2
- Batch size : 2 (gradient accumulation : 4, batch effectif : 8)
- Learning rate : 2e-4
- Optimizer : adamw_8bit
- Scheduler : linear avec 10 warmup steps

### Lien du notebook Colab
[À compléter avec le lien de partage Colab]

### Métriques d'entraînement
| Epoch | Loss |
|---|---|
| À compléter après exécution | À compléter |

Fichier détaillé : `training_metrics.json` (généré automatiquement en fin d'entraînement)

### Test qualitatif du modèle fine-tuné
Exemple de test :
- **Question** : "I have a persistent headache and feel dizzy, what could it be?"
- **Réponse générée** : À compléter après exécution

### Limites et avertissements
- Modèle **expérimental**, non validé pour un usage médical réel ou production
- Entraîné sur un sous-échantillon (5 000/241 590 exemples) pour respecter les contraintes de temps du hackathon
- Pas de validation clinique — usage strictement démonstratif

---

## Structure des livrables

```
rendu/ia/
├── README.md                          # Ce fichier
├── training_metrics.json              # Métriques loss/epochs
├── phi3.5_medical_lora.zip            # Modèle LoRA fine-tuné (adaptateurs)
└── financial_model_validation.md      # Résultats des tests Phi-3.5-Financial

notebooks/
└── phi3.5_medical_finetuning_lora.ipynb   # Notebook Colab complet
```

## Reproduire l'entraînement

1. Ouvrir `notebooks/phi3.5_medical_finetuning_lora.ipynb` sur Google Colab
2. Activer le runtime GPU (Runtime > Modifier le type d'exécution > GPU)
3. Exécuter les cellules dans l'ordre
4. Uploader `medical_dataset_final.json` quand demandé (section 5)
5. Récupérer `training_metrics.json` et le modèle `.zip` en fin d'exécution
