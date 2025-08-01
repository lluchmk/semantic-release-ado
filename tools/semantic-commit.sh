#!/bin/bash
# semantic-commit.sh - Helper script for creating semantic commit messages

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Show usage information
function show_usage {
    echo -e "${BLUE}Semantic Commit Message Helper${NC}"
    echo -e "Creates git commits following the Conventional Commits specification."
    echo
    echo -e "Usage: $0 [options]"
    echo
    echo -e "Options:"
    echo -e "  ${GREEN}-t, --type TYPE${NC}     Commit type (required): fix, feat, perf, docs, style,"
    echo -e "                      refactor, test, chore"
    echo -e "  ${GREEN}-s, --scope SCOPE${NC}   Optional scope for the commit"
    echo -e "  ${GREEN}-m, --message MSG${NC}   Commit message (required)"
    echo -e "  ${GREEN}-b, --breaking${NC}      Add breaking change flag (!)"
    echo -e "  ${GREEN}-d, --description DESC${NC} Longer description for the commit body"
    echo -e "  ${GREEN}-h, --help${NC}          Show this help message"
    echo
    echo -e "Examples:"
    echo -e "  $0 --type fix --message \"resolve null pointer exception\""
    echo -e "  $0 -t feat -s auth -m \"add OAuth2 support\" -d \"Added OAuth2 authentication flow\""
    echo -e "  $0 -t feat -m \"change API response format\" -b"
    echo
    echo -e "${YELLOW}Version Impact:${NC}"
    echo -e "  fix:       PATCH version increase (e.g., 1.0.0 -> 1.0.1)"
    echo -e "  feat:      MINOR version increase (e.g., 1.0.0 -> 1.1.0)"
    echo -e "  Breaking:  MAJOR version increase (e.g., 1.0.0 -> 2.0.0)"
    echo -e "  Others:    No version change (docs, style, refactor, test, chore)"
}

# Default values
TYPE=""
SCOPE=""
MESSAGE=""
BREAKING=false
DESCRIPTION=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -t|--type)
            TYPE="$2"
            shift
            shift
            ;;
        -s|--scope)
            SCOPE="$2"
            shift
            shift
            ;;
        -m|--message)
            MESSAGE="$2"
            shift
            shift
            ;;
        -b|--breaking)
            BREAKING=true
            shift
            ;;
        -d|--description)
            DESCRIPTION="$2"
            shift
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required fields
if [[ -z $TYPE ]]; then
    echo -e "${RED}Error: Commit type is required${NC}"
    show_usage
    exit 1
fi

if [[ -z $MESSAGE ]]; then
    echo -e "${RED}Error: Commit message is required${NC}"
    show_usage
    exit 1
fi

# Validate commit type
VALID_TYPES=("fix" "feat" "perf" "docs" "style" "refactor" "test" "chore" "build" "ci" "revert")
VALID_TYPE=false

for valid in "${VALID_TYPES[@]}"; do
    if [[ $TYPE == $valid ]]; then
        VALID_TYPE=true
        break
    fi
done

if [[ $VALID_TYPE == false ]]; then
    echo -e "${RED}Error: Invalid commit type '$TYPE'${NC}"
    echo -e "Valid types: fix, feat, perf, docs, style, refactor, test, chore, build, ci, revert"
    exit 1
fi

# Build commit message
COMMIT_MSG="$TYPE"

if [[ -n $SCOPE ]]; then
    COMMIT_MSG="$COMMIT_MSG($SCOPE)"
fi

if [[ $BREAKING == true ]]; then
    COMMIT_MSG="$COMMIT_MSG!"
fi

COMMIT_MSG="$COMMIT_MSG: $MESSAGE"

# Add description if provided
if [[ -n $DESCRIPTION ]]; then
    COMMIT_MSG="$COMMIT_MSG

$DESCRIPTION"

    # Add BREAKING CHANGE text if breaking flag is set
    if [[ $BREAKING == true ]]; then
        COMMIT_MSG="$COMMIT_MSG

BREAKING CHANGE: $MESSAGE"
    fi
fi

# Show preview and confirm
echo -e "${YELLOW}Preview commit message:${NC}"
echo -e "${GREEN}$COMMIT_MSG${NC}"
echo

read -p "Create commit with this message? [y/N] " CONFIRM
if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}Commit created successfully!${NC}"
    
    if [[ $TYPE == "fix" ]]; then
        echo -e "${BLUE}This commit will trigger a ${YELLOW}PATCH${BLUE} version update.${NC}"
    elif [[ $TYPE == "feat" && $BREAKING == false ]]; then
        echo -e "${BLUE}This commit will trigger a ${YELLOW}MINOR${BLUE} version update.${NC}"
    elif [[ $BREAKING == true ]]; then
        echo -e "${BLUE}This commit will trigger a ${YELLOW}MAJOR${BLUE} version update.${NC}"
    else
        echo -e "${BLUE}This commit type won't trigger a version update.${NC}"
    fi
else
    echo -e "${YELLOW}Commit cancelled.${NC}"
    exit 0
fi
