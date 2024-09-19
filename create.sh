#!/bin/bash

# Usage: ./create.sh -c country_code -n connector_name

# Function to parse command line arguments
parse_arguments() {
    while getopts c:n: flag
    do
        case "${flag}" in
            c) country_code=${OPTARG};;
            n) connector_name=${OPTARG};;
        esac
    done

    # Validate inputs
    if [ -z "$country_code" ] || [ -z "$connector_name" ]; then
        echo "Usage: ./create.sh -c country_code -n connector_name"
        exit 1
    fi
}

# Function to create the new core connector directory
create_core_connector() {
    new_dir="${connector_name}-${country_code}-core-connector"
    cp -r core-connector-template "$new_dir"
    echo "Core connector created: $new_dir"
}

# Function to update .env.example and create .env file
update_env_files() {
    local env_example_file="$new_dir/.env.example"
    local env_file="$new_dir/.env"
    local cbs_name="CBS_NAME=${connector_name}-${country_code}"

    if [ -f "$env_example_file" ]; then
        # Ensure CBS_NAME is appended on a new line
        if ! grep -q "CBS_NAME" "$env_example_file"; then
            echo -e "\n$cbs_name" >> "$env_example_file"
            echo "Updated .env.example with: $cbs_name"
        else
            echo "CBS_NAME already exists in .env.example"
        fi
    else
        # Create .env.example and add CBS_NAME
        echo "$cbs_name" > "$env_example_file"
        echo ".env.example not found in $new_dir, created one with: $cbs_name"
    fi

    # Copy .env.example to .env
    cp "$env_example_file" "$env_file"
    echo "Created .env from .env.example"
}



# Function to rename all occurrences of core-connector-template in specified files
rename_in_files() {
    escaped_new_dir=$(echo "$new_dir" | sed 's/[\/&]/\\&/g')

    # Array of files to modify
    files_to_modify=(
        "$new_dir/package.json"
        "$new_dir/package-lock.json"
        "$new_dir/docker-compose.yml"
    )

    # Loop through each file and perform the replacement
    for file in "${files_to_modify[@]}"; do
        if [ -f "$file" ]; then
            sed -i '' "s/core-connector-template/$escaped_new_dir/g" "$file"
            echo "Renamed core-connector-template to $new_dir in $file"
        else
            echo "$file not found"
        fi
    done
}


# Function to create a new git branch
create_git_branch() {
    git checkout -b "ft/$new_dir"
    echo "Created git branch: ft/$new_dir"
}


# Function to run initialization commands in the newly created directory
run_initialization_commands() {
    cd "$new_dir" || exit

    # Example initialization commands
    echo "Running initialization commands in $new_dir..."
    
    # Install npm dependencies (if using Node.js)
    if [ -f "package.json" ]; then
        npm run clean
        npm i
        npm run start:build
        echo "npm dependencies installed."
    fi
}
# Main function to coordinate the steps
main() {
    parse_arguments "$@"
    create_core_connector
    update_env_files
    rename_in_files
    create_git_branch
    run_initialization_commands
}

# Call the main function
main "$@"
