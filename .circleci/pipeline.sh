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
