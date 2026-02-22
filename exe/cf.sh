#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 -o <output_file> -p \"<pattern>\" <source_folder>"
  echo ""
  echo "Concatenate files from a source folder into a single output file."
  echo ""
  echo "Options:"
  echo "  -o <output_file>   Path to the output file where combined content is saved"
  echo "  -p \"<pattern>\"       Grep pattern to filter filenames (regex supported)"
  echo "  -h                 Show this help message"
  echo ""
  echo "Arguments:"
  echo "  <source_folder>    Folder containing files to concatenate"
  echo ""
  echo "Examples:"
  echo "  $0 -o combined.txt -p \".txt$\" ./output"
  echo "  $0 -o movies.txt -p \"2024\" ./data"
  echo ""
  exit 1
}

OUTPUT=""
PATTERN=""

# Parse options
while getopts ":o:p:" opt; do
  case "${opt}" in
    o)
      OUTPUT="$OPTARG"
    ;;
    p)
      PATTERN="$OPTARG"
    ;;
    h)
      usage
    ;;
    \?)
      echo "Invalid option: -$OPTARG"
      usage
    ;;
    :)
      echo "Option -$OPTARG requires an argument."
      usage
    ;;
  esac
done

shift $((OPTIND - 1))

# Source folder argument
SOURCE="${1:-}"

# Validate required inputs
if [[ -z "$OUTPUT" || -z "$PATTERN" || -z "$SOURCE" ]]; then
  echo "Error: All options and arguments are required."
  usage
fi

SOURCE=$(realpath "$SOURCE")

if [[ ! -d "$SOURCE" ]]; then
  echo "Error: Source folder does not exist: $SOURCE"
  exit 1
fi

# Create/clear output file
: > "$OUTPUT"

# List files and filter by pattern
FILES=$(ls -1 "$SOURCE" | grep -E "$PATTERN" || true)

if [[ -z "$FILES" ]]; then
  echo "No files matched pattern."
  exit 0
fi

# Concatenate matched files
printf '%s\n' "$FILES" | while IFS= read -r file; do
  FULL_PATH="$SOURCE/$file"
  if [[ -f "$FULL_PATH" ]]; then
    cat "$FULL_PATH" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "Done. Output saved to: $OUTPUT"