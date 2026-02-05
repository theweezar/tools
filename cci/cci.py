#!/usr/bin/env python3
"""
Image concatenation utility using OpenCV.
Arranges images in a grid layout with configurable images per row.
"""

import sys
from pathlib import Path
import traceback
import click
import cv2
import numpy as np


SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


def get_image_files(source_dir):
    """Get all image files from the source directory, sorted alphabetically."""
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


def w_resize(im_list, interpolation=cv2.INTER_CUBIC, width=None):
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


def h_resize(im_list, interpolation=cv2.INTER_CUBIC, height=None):
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


def read_image_files(image_files):
    """
    Read image files using cv2.
    Args:
        image_files: List of Path objects for image files
    Returns:
        images array
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


def square_resize(im_list, width=None):
    th = width if width else min(im.shape[0] for im in im_list)
    im_list_resize = [cv2.resize(im, (th, th)) for im in im_list]
    return im_list_resize


def ensure(truth, error_message):
    if not truth:
        raise click.ClickException(error_message)


def concatenate_images(image_files, per_row, max_width, max_height, ratio, output_size):
    """
    Concatenate images in a grid layout using cv2.
    Args:
        image_files: List of Path objects for image files
        per_row: Number of images per row
        max_width: Maximum width for resizing (None to auto-calculate)
        max_height: Maximum height for resizing (None to auto-calculate)
        ratio: "keep" to preserve original dimensions, "consistency" to resize
        output_size: "cover" to fill output size, "contain" to fit within output size
    Returns:
        numpy array representing the concatenated image
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
#   python cci.py ./images --per-row 4 --max-width 200 --max-height 200 --ratio consistency --output merged.jpg --output-size contain
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
    "--output",
    default="merge.jpg",
    type=click.Path(),
    help="Output image filename (default: merge.jpg)",
)
@click.option(
    "--output-size",
    type=click.Choice(["cover", "contain"]),
    default="cover",
    help='Output size mode: "cover" fills the output size, "contain" fits within the output size (default: cover)',
)
def main(source_dir, per_row, max_width, max_height, ratio, output, output_size):
    """
    Concatenate images from SOURCE_DIR into a grid layout.

    Each row will contain PER_ROW images. If the number of images
    doesn't divide evenly, the last row will be padded with blank images.
    """
    try:
        ensure(per_row > 0, "per_row must be a positive integer")

        click.echo(f"Reading images from: {source_dir}")
        image_files = get_image_files(source_dir)
        click.echo(f"Found {len(image_files)} image(s)")

        click.echo(f"Concatenating images ({per_row} per row, ratio={ratio})...")
        result = concatenate_images(
            image_files, per_row, max_width, max_height, ratio, output_size
        )

        click.echo(f"Saving result to: {output}")
        cv2.imwrite(output, result)

        click.echo("✓ Done!")

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
