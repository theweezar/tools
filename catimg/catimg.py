#!/usr/bin/env python3
"""
Image concatenation utility using OpenCV.
Arranges images in a grid layout with configurable images per row.
"""

import sys
from pathlib import Path
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


def concatenate_images(image_files, per_row, max_width, max_height, ratio):
    """
    Concatenate images in a grid layout using cv2.

    Args:
        image_files: List of Path objects for image files
        per_row: Number of images per row
        max_width: Maximum width for resizing (None to auto-calculate)
        max_height: Maximum height for resizing (None to auto-calculate)
        ratio: "keep" to preserve original dimensions, "consistency" to resize

    Returns:
        numpy array representing the concatenated image
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

    # Calculate target dimensions based on ratio option
    if ratio == "keep":
        # No resizing - use original dimensions
        resized_images = images
    else:  # ratio == "consistency"
        calc_aspect_ratio = False
        # Determine target dimensions
        if max_width is None and max_height is None:
            # Use max of all images
            target_width = max(img.shape[1] for img in images)
            target_height = max(img.shape[0] for img in images)
        elif max_width is not None and max_height is not None:
            # Both provided
            target_width = max_width
            target_height = max_height
        else:
            calc_aspect_ratio = True

        # Resize all images to target dimensions
        resized_images = []
        for img in images:
            img_height = img.shape[0]
            img_width = img.shape[1]

            # TODO: Fix it. This is a bug, if provide 1 of max_width and max_height
            if calc_aspect_ratio:
                aspect_ratio = img_width / img_height

                if max_width is not None:
                    # max_width is provided
                    target_width = max_width
                    target_height = int(target_width / aspect_ratio)
                else:
                    # max_height is provided
                    target_height = max_height
                    target_width = int(target_height * aspect_ratio)

            if img_height != target_height or img_width != target_width:
                resized_img = cv2.resize(img, (target_width, target_height))
                resized_images.append(resized_img)
            else:
                resized_images.append(img)

    # Arrange images in grid layout
    rows = []
    for i in range(0, len(resized_images), per_row):
        row_images = resized_images[i : i + per_row]

        # Pad last row if necessary
        if len(row_images) < per_row:
            padding_count = per_row - len(row_images)
            # Create black blank images with same dimensions
            blank_img = np.zeros_like(row_images[0])
            row_images.extend([blank_img] * padding_count)

        # Concatenate images horizontally
        row = cv2.hconcat(row_images)
        rows.append(row)

    # Concatenate rows vertically
    result = cv2.vconcat(rows)

    return result


@click.command()
@click.argument("source-dir", type=click.Path(exists=True))
@click.option(
    "--per-row", default=3, type=int, help="Number of images per row (default: 3)"
)
@click.option(
    "--output",
    default="merge.jpg",
    type=click.Path(),
    help="Output image filename (default: merge.jpg)",
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
    default="consistency",
    help='Ratio mode: "keep" preserves original dimensions, "consistency" resizes all images (default: consistency)',
)
def main(source_dir, per_row, output, max_width, max_height, ratio):
    """
    Concatenate images from SOURCE_DIR into a grid layout.

    Each row will contain PER_ROW images. If the number of images
    doesn't divide evenly, the last row will be padded with blank images.
    """
    try:
        if per_row < 1:
            raise click.ClickException("per-row must be at least 1")

        click.echo(f"Reading images from: {source_dir}")
        image_files = get_image_files(source_dir)
        click.echo(f"Found {len(image_files)} image(s)")

        click.echo(f"Concatenating images ({per_row} per row, ratio={ratio})...")
        result = concatenate_images(image_files, per_row, max_width, max_height, ratio)

        click.echo(f"Saving result to: {output}")
        cv2.imwrite(output, result)

        click.echo("✓ Done!")

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
