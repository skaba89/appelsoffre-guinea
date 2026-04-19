#!/bin/bash
# ─── TenderFlow Guinea — Git Push Script ──────────────────────────────────────
# 
# Ce script pousse tous les commits locaux vers GitHub.
# Vous devez configurer vos identifiants GitHub avant de l'exécuter.
#
# Méthode 1 : Personal Access Token (recommandé)
#   1. Créer un token sur https://github.com/settings/tokens
#   2. Cocher les scopes : repo, workflow
#   3. Exécuter : export GITHUB_TOKEN=votre_token_ici
#   4. Exécuter : bash scripts/git-push.sh
#
# Méthode 2 : SSH
#   1. Configurer votre clé SSH sur GitHub
#   2. Changer l'URL remote : git remote set-url origin git@github.com:skaba89/appelsoffre-guinea.git
#   3. Exécuter : bash scripts/git-push.sh
#
# ──────────────────────────────────────────────────────────────────────────────

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "═══════════════════════════════════════════════════════"
echo "  TenderFlow Guinea — Git Push"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check current branch
BRANCH=$(git branch --show-current)
echo "Branche actuelle : $BRANCH"

# Check uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Il y a des changements non commites. Commit automatique..."
  git add -A
  git commit -m "chore: auto-commit before push $(date +%Y-%m-%d_%H%M%S)"
fi

# Show commits to push
AHEAD=$(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo "unknown")
echo "Commits a pousser : $AHEAD"
echo ""

if [ "$AHEAD" = "0" ]; then
  echo "Deja a jour avec origin/$BRANCH"
  exit 0
fi

# Show commit log
echo "Derniers commits :"
git log --oneline -5
echo ""

# Try push with token if available
if [ -n "$GITHUB_TOKEN" ]; then
  echo "Utilisation du GITHUB_TOKEN..."
  REMOTE_URL="https://skaba89:${GITHUB_TOKEN}@github.com/skaba89/appelsoffre-guinea.git"
  git push "$REMOTE_URL" "$BRANCH"
elif git remote get-url origin | grep -q "git@github.com"; then
  echo "Utilisation de SSH..."
  git push origin "$BRANCH"
else
  echo "Push HTTPS standard (identifiants requis)..."
  git push origin "$BRANCH"
fi

echo ""
echo "Push termine avec succes !"
echo "https://github.com/skaba89/appelsoffre-guinea"
