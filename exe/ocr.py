#!python

from pathlib import Path
import click
import easyocr


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff"}


def is_image_file(file_path: Path) -> bool:
    return file_path.suffix.lower() in SUPPORTED_EXTENSIONS


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


@click.command()
@click.argument("source", type=click.Path(exists=True, file_okay=False, readable=True))
@click.option(
    "--output",
    default="./output",
    show_default=True,
    type=click.Path(file_okay=False),
    help="Output folder path",
)
def extract_text(source, output):
    """
    Scan images in SOURCE folder using EasyOCR and export text files to OUTPUT folder.
    """

    source_path = Path(source)
    output_path = Path(output)

    ensure_dir(output_path)

    click.echo("Initializing EasyOCR (this may take a moment)...")
    reader = easyocr.Reader(["en"], gpu=True)

    image_files = [p for p in source_path.iterdir() if p.is_file() and is_image_file(p)]

    if not image_files:
        click.echo("No image files found.")
        return

    img_len = len(image_files)
    click.echo(f"Found {img_len} image(s).")

    for idx, img_path in enumerate(image_files, start=1):
        output_file = output_path / f"{img_path.stem}.txt"

        # Skip if already processed
        if output_file.exists():
            click.echo(f"Skipping (exists): {output_file.name}")
            continue

        click.echo(f"({idx}/{img_len}) Processing: {img_path.name}")

        try:
            results = reader.readtext(str(img_path), detail=0)
            text_content = "\n".join(results)

            with open(output_file, "w", encoding="utf-8") as f:
                f.write(text_content)

            click.echo(f"({idx}/{img_len}) Saved: {output_file.name}")

        except Exception as e:
            click.echo(f"Error processing {img_path.name}: {e}", err=True)


if __name__ == "__main__":
    extract_text()
