#!/usr/bin/env bash

# split.sh
# Usage: ./split.sh <source_folder> <number_of_subfolders> <move|copy>

set -e

SRC_DIR="$1"
NUM_FOLDERS="$2"
ACTION="$3"

# Validate arguments
if [[ -z "$SRC_DIR" || -z "$NUM_FOLDERS" || -z "$ACTION" ]]; then
  echo "Usage: $0 <source_folder> <number_of_subfolders> <move|copy>"
  exit 1
fi

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Error: Source folder does not exist."
  exit 1
fi

if ! [[ "$NUM_FOLDERS" =~ ^[0-9]+$ ]] || [[ "$NUM_FOLDERS" -le 0 ]]; then
  echo "Error: Number of subfolders must be a positive integer."
  exit 1
fi

if [[ "$ACTION" != "move" && "$ACTION" != "copy" ]]; then
  echo "Error: Action must be either 'move' or 'copy'."
  exit 1
fi

# Collect files using ls (non-recursive)
FILES=($(ls -p "$SRC_DIR" | grep -v /))
TOTAL_FILES="${#FILES[@]}"

if [[ "$TOTAL_FILES" -eq 0 ]]; then
  echo "No files found in source folder."
  exit 0
fi

# Calculate files per folder (ceil division)
FILES_PER_FOLDER=$(( (TOTAL_FILES + NUM_FOLDERS - 1) / NUM_FOLDERS ))
echo "File per folders: $FILES_PER_FOLDER."

# Create subfolders
for ((i=1; i<=NUM_FOLDERS; i++)); do
  mkdir -p "$SRC_DIR/part_$i"
done

# Choose command
if [[ "$ACTION" == "move" ]]; then
  CMD="mv"
else
  CMD="cp"
fi

# Distribute files
folder_index=1
file_count=0

for file in "${FILES[@]}"; do
  echo "$SRC_DIR/$file -> $SRC_DIR/part_$folder_index/"
  $CMD "$SRC_DIR/$file" "$SRC_DIR/part_$folder_index/"
  ((++file_count))

  if (( file_count >= FILES_PER_FOLDER )); then
    file_count=0
    ((folder_index++))
    [[ "$folder_index" -gt "$NUM_FOLDERS" ]] && folder_index="$NUM_FOLDERS"
  fi
done

echo "Done. $ACTION $TOTAL_FILES files into $NUM_FOLDERS subfolders."
