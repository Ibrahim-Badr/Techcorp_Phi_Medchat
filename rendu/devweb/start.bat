@echo off
title TechCorp Medchat Server
echo =========================================
echo Lancement de l'interface Medchat...
echo =========================================
echo.
echo Le navigateur va s'ouvrir automatiquement.
echo (Ne fermez pas cette fenetre noire tant que vous utilisez l'application)
echo.

start http://localhost:8000
python -m http.server 8000
