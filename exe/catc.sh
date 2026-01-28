#!/bin/bash

# Script to combine code files into a single markdown document
# Usage: ./combine_code.sh [-o output_file] <file1> <file2> ...

OUTPUT_FILE="code.md"
VERBOSE=false

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
    -h|--help)
      echo "Usage: $0 [-o output_file] [-v] <file1> <file2> ..."
      echo "  -o, --output   Specify output markdown file (default: code.md)"
      echo "  -v, --verbose  Show detailed progress"
      echo "  -h, --help     Show this help message"
      exit 0
    ;;
    *)
      break
    ;;
  esac
done

# Check if files are provided
if [ $# -eq 0 ]; then
  echo "Error: No input files specified"
  echo "Usage: $0 [-o output_file] <file1> <file2> ..."
  exit 1
fi

if [ "$VERBOSE" = true ]; then
  echo "Output file: $OUTPUT_FILE"
  echo "Processing $# file(s)..."
fi

# Create or clear the output file with a header
# cat > "$OUTPUT_FILE" << EOF
# # Code Documentation
# Generated on: $(date)

# ---

# EOF

# Process each file
file_count=0
for file in "$@"; do
  # Check if file exists and is readable
  if [ ! -f "$file" ]; then
    echo "Warning: '$file' is not a valid file, skipping..." >&2
    continue
  fi
  
  if [ ! -r "$file" ]; then
    echo "Warning: Cannot read '$file', skipping..." >&2
    continue
  fi
  
  # Get file info
  rel_path="$file"
  file_name=$(basename "$file")
  file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  
  if [ "$VERBOSE" = true ]; then
    echo "Processing: $rel_path ($file_size bytes)"
  fi
  
  # Add file header
  echo "## $rel_path" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Try to determine language from file extension
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
      *) echo "" ;;
    esac
  }
  
  lang=$(get_language "$file")
  
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
    # Use cat to preserve formatting
    cat "$file" >> "$OUTPUT_FILE"
  fi
  
  # Close code block
  echo "" >> "$OUTPUT_FILE"
  echo "\`\`\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  ((file_count++))
done

# Add summary
# echo "## Summary" >> "$OUTPUT_FILE"
# echo "" >> "$OUTPUT_FILE"
# echo "Total files processed: $file_count" >> "$OUTPUT_FILE"
# echo "Generated on: $(date)" >> "$OUTPUT_FILE"

echo "Successfully combined $file_count file(s) into '$OUTPUT_FILE'"