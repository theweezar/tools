#!/bin/bash

OUTPUT_FILE="output.md"
VERBOSE=false
COUNT=0
TEXT_ONLY=false

usage() {
  echo "Usage: $0 [-o output_file] [-v] <files or directories>"
  echo ""
  echo "Concatenate texts of specified files and directories into a markdown file."
  echo ""
  echo "Options:"
  echo "  -o, --output   Specify output markdown file (default: output.md)"
  echo "  -v, --verbose  Show detailed progress"
  echo "  -t, --text-only  Output plain text without code block formatting"
  echo "  -h, --help     Show this help message"
  echo ""
  echo "Arguments:"
  echo "  <files or directories>  List of files and/or directories to process"
  echo ""
  exit 0
}

vprint() {
  if [ "$VERBOSE" = true ]; then
    echo "$1" >&2
  fi
}

get_language() {
  case "${1##*.}" in
    py) echo "python" ;;
    js) echo "javascript" ;;
    ts) echo "typescript" ;;
    java) echo "java" ;;
    c) echo "c" ;;
    cpp|cxx|cc) echo "cpp" ;;
    h|hpp) echo "c" ;;
    html) echo "html" ;;
    css) echo "css" ;;
    sh|bash) echo "bash" ;;
    md) echo "markdown" ;;
    json) echo "json" ;;
    xml) echo "xml" ;;
    yaml|yml) echo "yaml" ;;
    go) echo "go" ;;
    rs) echo "rust" ;;
    rb) echo "ruby" ;;
    php) echo "php" ;;
    sql) echo "sql" ;;
    swift) echo "swift" ;;
    kt) echo "kotlin" ;;
    scala) echo "scala" ;;
    r) echo "r" ;;
    m) echo "matlab" ;;
    txt) echo "plaintext" ;;
    *) echo "" ;;
  esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--output)
      OUTPUT_FILE="$2"
      shift 2
    ;;
    -v|--verbose)
      VERBOSE=true
      shift
    ;;
    -t|--text-only)
      TEXT_ONLY=true
      shift
    ;;
    -h|--help)
      usage
    ;;
    *)
      break
    ;;
  esac
done

# Check if files are provided
if [ $# -eq 0 ]; then
  usage
fi

vprint "Output file: $OUTPUT_FILE"
vprint "Processing $# source(s)..."

process_file() {
  file_path="$1"
  file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null)
  
  vprint "Processing: $file_path ($file_size bytes)"
  
  if [ "$TEXT_ONLY" = true ]; then
    # Just append the content without markdown formatting
    # echo[^>>]*>>
    if [ "$file_size" -eq 0 ]; then
      echo "(Empty file: $file_path)" >> "$OUTPUT_FILE"
    else
      cat "$file_path" >> "$OUTPUT_FILE"
    fi
  else
    echo "## $file_path" >> "$OUTPUT_FILE"
    
    lang=$(get_language "$file_path")
    
    # Add code block
    if [ -n "$lang" ]; then
      echo "\`\`\`$lang" >> "$OUTPUT_FILE"
    else
      echo "\`\`\`" >> "$OUTPUT_FILE"
    fi
    
    # Add file content, handling empty files
    if [ "$file_size" -eq 0 ]; then
      echo "(Empty file)" >> "$OUTPUT_FILE"
    else
      cat "$file_path" >> "$OUTPUT_FILE"
    fi
    
    # Close code block
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
  
  ((COUNT++))
}

process_dir() {
  vprint "Entering directory: $1"
  files=($(ls -p "$1" | grep -v /))
  
  for file in "${files[@]}"; do
    fpath=$(realpath -eq "$1/$file")
    if [ ! -r "$fpath" ]; then
      vprint "Warning: Cannot read '$fpath', skipping..."
      continue
    fi
    process_file "$fpath"
  done
}

# Create/clear output file
: > "$OUTPUT_FILE"

# Process each file
for src in "$@"; do
  fpath=$(realpath -eq "$src")
  if [ ! -r "$fpath" ]; then
    vprint "Warning: Cannot read '$fpath', skipping..."
    continue
  fi
  if [ -d "$fpath" ]; then
    process_dir "$fpath"
  fi
  if [ -f "$fpath" ]; then
    process_file "$fpath"
  fi
done

if [ $COUNT -eq 0 ]; then
  echo "No files were processed. Output file '$OUTPUT_FILE' is empty."
else
  echo "Successfully combined into '$OUTPUT_FILE'"
fi