#!/usr/bin/env python3
"""
Image concatenation utility using OpenCV.
Arranges images in a grid layout with configurable images per row.
"""

import sys
from pathlib import Path
from datetime import datetime
import traceback
from typing import List, Optional
import click
import cv2
import numpy as np


SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


def get_image_files(source_dir: str) -> List[Path]:
    """
    Get all image files from the source directory, sorted alphabetically.

    Args:
        source_dir: Path to the source directory containing image files.

    Returns:
        List of Path objects for image files found in the directory.

    Raises:
        ClickException: If source directory does not exist or is not a directory.
        ClickException: If no image files are found in the directory.
    """
    source_path = Path(source_dir)

    if not source_path.exists():
        raise click.ClickException(f"Source directory does not exist: {source_dir}")

    if not source_path.is_dir():
        raise click.ClickException(f"Source is not a directory: {source_dir}")

    image_files = [
        f
        for f in sorted(source_path.iterdir())
        if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS
    ]

    if not image_files:
        raise click.ClickException(f"No image files found in: {source_dir}")

    return image_files


def w_resize(
    im_list: List[np.ndarray],
    interpolation: int = cv2.INTER_CUBIC,
    width: Optional[int] = None,
) -> List[np.ndarray]:
    """
    Resize images to a specific width while maintaining aspect ratio.

    Args:
        im_list: List of images (numpy arrays) to resize.
        interpolation: OpenCV interpolation method (default: INTER_CUBIC).
        width: Target width for resizing. If None, uses minimum width from images.

    Returns:
        List of resized images as numpy arrays.
    """
    tw = width if width else min(im.shape[1] for im in im_list)
    im_list_resize = [
        cv2.resize(
            im,
            (tw, int(im.shape[0] * tw / im.shape[1])),
            interpolation=interpolation,
        )
        for im in im_list
    ]
    return im_list_resize


def h_resize(
    im_list: List[np.ndarray],
    interpolation: int = cv2.INTER_CUBIC,
    height: Optional[int] = None,
) -> List[np.ndarray]:
    """
    Resize images to a specific height while maintaining aspect ratio.

    Args:
        im_list: List of images (numpy arrays) to resize.
        interpolation: OpenCV interpolation method (default: INTER_CUBIC).
        height: Target height for resizing. If None, uses minimum height from images.

    Returns:
        List of resized images as numpy arrays.
    """
    th = height if height else min(im.shape[0] for im in im_list)
    im_list_resize = [
        cv2.resize(
            im,
            (int(im.shape[1] * th / im.shape[0]), th),
            interpolation=interpolation,
        )
        for im in im_list
    ]
    return im_list_resize


def read_image_files(image_files: List[Path]) -> List[np.ndarray]:
    """
    Read image files using OpenCV.

    Args:
        image_files: List of Path objects pointing to image files.

    Returns:
        List of images as numpy arrays read from the files.

    Raises:
        ClickException: If no valid images could be read from the files.
    """
    images = []

    # Read all images
    for img_file in image_files:
        img = cv2.imread(str(img_file))
        if img is None:
            click.echo(f"Warning: Could not read image {img_file}", err=True)
            continue
        images.append(img)

    if not images:
        raise click.ClickException("No valid images could be read")

    return images


def square_resize(
    im_list: List[np.ndarray], width: Optional[int] = None
) -> List[np.ndarray]:
    """
    Resize images to square dimensions.

    Args:
        im_list: List of images (numpy arrays) to resize.
        width: Target size for both width and height. If None, uses minimum dimension from images.

    Returns:
        List of square-resized images as numpy arrays.
    """
    th = width if width else min(im.shape[0] for im in im_list)
    im_list_resize = [cv2.resize(im, (th, th)) for im in im_list]
    return im_list_resize


def ensure(truth: bool, error_message: str) -> None:
    """
    Assert a condition and raise ClickException if false.

    Args:
        truth: Boolean condition to check.
        error_message: Error message to display if condition is false.

    Raises:
        ClickException: If truth is False.
    """
    if not truth:
        raise click.ClickException(error_message)


def concatenate_images(
    image_files: List[Path],
    per_row: int,
    max_width: Optional[int],
    max_height: Optional[int],
    ratio: str,
    output_size: str,
) -> np.ndarray:
    """
    Concatenate images in a grid layout.

    Arranges images in rows and concatenates them both horizontally and vertically
    to create a grid-based composite image.

    Args:
        image_files: List of Path objects pointing to image files.
        per_row: Number of images to display per row.
        max_width: Maximum width for resizing (None to auto-calculate from images).
        max_height: Maximum height for resizing (None to auto-calculate from images).
        ratio: Resize mode - "keep" preserves original dimensions, "consistency" resizes all to square.
        output_size: Output mode - "cover" fills to output size, "contain" fits within output size.

    Returns:
        Numpy array representing the concatenated composite image.

    Raises:
        ClickException: If dimensions are invalid or no valid images could be read.
    """
    images = read_image_files(image_files)
    images = images if ratio == "keep" else square_resize(images)

    # Determine target dimensions
    default_max_width = max(img.shape[1] for img in images)
    default_max_height = max(img.shape[0] for img in images)

    target_width = default_max_width if max_width is None else max_width
    target_height = default_max_height if max_height is None else max_height

    # Auto-calculate missing dimension to maintain aspect ratio
    target_width = int(
        default_max_width * max_height / default_max_height
        if max_height and not max_width
        else target_width
    )
    target_height = int(
        default_max_height * max_width / default_max_width
        if max_width and not max_height
        else target_height
    )
    click.echo(f"Target dimensions (width x height): {target_width} x {target_height}")

    ensure(
        target_width or target_height,
        "At least one of max_width or max_height must be provided",
    )
    ensure(
        target_width > 0 and target_height > 0,
        "max_width and max_height must be positive integers",
    )

    # Arrange images in grid layout
    rows = []
    for i in range(0, len(images), per_row):
        row_images = images[i : i + per_row]
        row_images = w_resize(row_images, width=target_width)
        row_images = h_resize(row_images, height=target_height)

        # Concatenate images horizontally
        row = cv2.hconcat(row_images)
        rows.append(row)

    if output_size == "cover":
        # Resize each row to target width
        rows = w_resize(rows)

    if output_size == "contain":
        # Pad row to ensure consistent width
        max_width = max(row.shape[1] for row in rows)
        for i, row in enumerate(rows):
            blank_width = max_width - row.shape[1]
            blank_img = np.zeros((row.shape[0], blank_width, 3), dtype=row.dtype)
            rows[i] = cv2.hconcat([row, blank_img])

    # Concatenate rows vertically
    result = cv2.vconcat(rows)
    return result


# CLI using Click
# Example usage:
#   python cci.py ./images --per-row 4 --max-width 200 --max-height 200 --ratio consistency --out-dir ./output --out-name custom.jpg --output-size contain
@click.command()
@click.argument("source-dir", type=click.Path(exists=True))
@click.option(
    "--per-row", default=3, type=int, help="Number of images per row (default: 3)"
)
@click.option(
    "--max-width",
    default=None,
    type=int,
    help="Maximum width for resizing (auto-calculate if only this is provided)",
)
@click.option(
    "--max-height",
    default=None,
    type=int,
    help="Maximum height for resizing (auto-calculate if only this is provided)",
)
@click.option(
    "--ratio",
    type=click.Choice(["keep", "consistency"]),
    default="keep",
    help='Ratio mode: "keep" preserves original dimensions, "consistency" resizes all images (default: keep)',
)
@click.option(
    "--out-dir",
    default=None,
    type=click.Path(),
    help="Output directory (default: {source_dir}/../)",
)
@click.option(
    "--out-name",
    default=None,
    type=str,
    help="Output filename (default: YYYYMMDD_{image_count}_merged.jpg)",
)
@click.option(
    "--output-size",
    type=click.Choice(["cover", "contain"]),
    default="cover",
    help='Output size mode: "cover" fills the output size, "contain" fits within the output size (default: cover)',
)
def main(
    source_dir: str,
    per_row: int,
    max_width: Optional[int],
    max_height: Optional[int],
    ratio: str,
    out_dir: Optional[str],
    out_name: Optional[str],
    output_size: str,
) -> None:
    """
    Main entry point for the image concatenation CLI application.

    Orchestrates the entire workflow: reading images, concatenating them in a grid,
    and saving the result to the specified output location.
    \f
    Args:
        source_dir: Path to directory containing images to concatenate.
        per_row: Number of images to display per row in the grid.
        max_width: Maximum width for image resizing (None for auto-calculation).
        max_height: Maximum height for image resizing (None for auto-calculation).
        ratio: Resize mode - "keep" or "consistency".
        out_dir: Output directory path (defaults to parent of source_dir).
        out_name: Output filename (defaults to YYYYMMDD_{count}_merged.jpg).
        output_size: Output mode - "cover" or "contain".

    Returns:
        None. Exits with status code 1 on error.
    """
    try:
        ensure(per_row > 0, "per_row must be a positive integer")

        click.echo(f"Reading images from: {source_dir}")
        image_files = get_image_files(source_dir)
        click.echo(f"Found {len(image_files)} image(s)")
        image_count = len(image_files)

        click.echo(f"Concatenating images ({per_row} per row, ratio={ratio})...")
        result = concatenate_images(
            image_files, per_row, max_width, max_height, ratio, output_size
        )

        # Determine output directory
        output_dir = out_dir if out_dir else str(Path(source_dir).parent)
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Determine output filename
        if out_name is None:
            current_date = datetime.now().strftime("%Y%m%d")
            current_time = datetime.now().strftime("%H%M%S")
            out_name = f"{current_date}_{current_time}_{image_count}_merged.jpg"

        output_path = str(Path(output_dir) / out_name)
        click.echo(f"Saving result to: {output_path}")
        cv2.imwrite(output_path, result)

        click.echo("✓ Done!")

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
