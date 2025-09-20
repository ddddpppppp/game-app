#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration variables
SERVER_USER="root"
SERVER_HOST="47.85.92.27"
SERVER_PORT="22"
REMOTE_PATH="/www/wwwroot/app.game-hub.cc"
PROJECT_NAME="app-game-hub-cc"
BUILD_COMMAND="npm run build" # or "yarn build" if using yarn
SSH_KEY_PATH="~/.ssh/id_ed25519"

# Function to clean up and exit
cleanup_and_exit() {
    local exit_code=$1

    # Cleanup local archive if it exists
    if [ -f "$ARCHIVE_NAME" ]; then
        echo -e "${YELLOW}Cleaning up local archive...${NC}"
        rm $ARCHIVE_NAME
    fi

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}All done! The application has been deployed to $SERVER_HOST:$REMOTE_PATH${NC}"
    else
        echo -e "${RED}Deployment failed with errors.${NC}"
    fi

    exit $exit_code
}

# Trap to catch script interruption and ensure cleanup
trap 'cleanup_and_exit 1' INT TERM

echo -e "${YELLOW}Starting deployment process...${NC}"
# Step 1: Build the project
echo -e "${YELLOW}Building project...${NC}"
$BUILD_COMMAND

if [ $? -ne 0 ]; then
    echo -e "\n${RED}Build failed! Aborting deployment.${NC}"
    cleanup_and_exit 1
fi

echo -e "${GREEN}Build completed successfully.${NC}"

# Step 2: Create a compressed archive from inside the dist directory
echo -e "${YELLOW}Creating compressed archive...${NC}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"

# Change to the dist directory and compress all files
if [ ! -d "dist" ]; then
    echo -e "\n${RED}Error: dist directory not found!${NC}"
    cleanup_and_exit 1
fi

# Create archive from the contents of dist directory, not the directory itself
echo -e "${YELLOW}Compressing contents of dist directory...${NC}"
(cd dist && tar -czvf "../$ARCHIVE_NAME" .)

echo -e "${GREEN}Archive created: $ARCHIVE_NAME${NC}"

# Step 3: Upload to server using certificate-based authentication
echo -e "${YELLOW}Uploading to server using certificate authentication...${NC}"
scp -i $SSH_KEY_PATH -P $SERVER_PORT $ARCHIVE_NAME $SERVER_USER@$SERVER_HOST:$REMOTE_PATH

if [ $? -ne 0 ]; then
    echo -e "\n${RED}Upload failed!${NC}"
    cleanup_and_exit 1
fi

echo -e "${GREEN}Upload completed successfully.${NC}"

# Step 4: Extract on the server using certificate-based authentication
echo -e "${YELLOW}Extracting archive on server...${NC}"
ssh -i $SSH_KEY_PATH -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd $REMOTE_PATH && tar -xzvf $ARCHIVE_NAME && rm $ARCHIVE_NAME"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}Remote extraction failed!${NC}"
    cleanup_and_exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Successfully finish deployment
cleanup_and_exit 0