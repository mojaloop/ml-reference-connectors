#! /bin/sh

defaults_configure_nvm() {
  touch "$HOME/.profile"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  local node_version
  node_version=$(cat .nvmrc)
  echo "Installing Node version: $node_version"
  nvm install "$node_version"
  nvm alias default "$node_version"
  nvm use "$node_version"
}

defaults_configure_git() {
  git config user.email "$GIT_CI_EMAIL"
  git config user.name "$GIT_CI_USER"
}

defaults_export_version_from_package() {
  git diff --no-indent-heuristic main~1 HEAD CHANGELOG.md | sed -n '/^+[^+]/ s/^+//p' > /tmp/changes
  echo 'export RELEASE_CHANGES=$(cat /tmp/changes)' >> "$BASH_ENV"
  echo 'export RELEASE_TAG=$(jq -r .version < package-lock.json)' >> "$BASH_ENV"
}



