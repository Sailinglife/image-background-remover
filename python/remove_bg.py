#!/usr/bin/env python3
"""
Image Background Remover
AI-powered tool to remove image backgrounds using rembg library.
"""

import argparse
import os
from pathlib import Path
from rembg import remove
from PIL import Image


def remove_background(input_path: str, output_path: str = None, alpha_matting: bool = True) -> str:
    """
    Remove background from an image.
    
    Args:
        input_path: Path to input image
        output_path: Path to output image (optional)
        alpha_matting: Enable alpha matting for better edges
    
    Returns:
        Path to the processed image
    """
    input_file = Path(input_path)
    
    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    # Generate output path if not provided
    if output_path is None:
        output_path = input_file.parent / f"{input_file.stem}_no_bg.png"
    
    # Load and process image
    print(f"Processing: {input_path}")
    input_image = Image.open(input_path)
    output_image = remove(input_image, alpha_matting=alpha_matting)
    
    # Save result
    output_image.save(output_path)
    print(f"Saved: {output_path}")
    
    return str(output_path)


def batch_process(input_dir: str, output_dir: str = None, alpha_matting: bool = True) -> list:
    """
    Batch process all images in a directory.
    
    Args:
        input_dir: Directory containing input images
        output_dir: Directory for output images (optional)
        alpha_matting: Enable alpha matting
    
    Returns:
        List of output file paths
    """
    input_path = Path(input_dir)
    
    if not input_path.is_dir():
        raise ValueError(f"Input path is not a directory: {input_dir}")
    
    # Supported image extensions
    extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'}
    
    # Create output directory if needed
    if output_dir:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
    else:
        output_dir = input_path
    
    # Process each image
    results = []
    for img_file in input_path.iterdir():
        if img_file.suffix.lower() in extensions:
            try:
                output_path = Path(output_dir) / f"{img_file.stem}_no_bg.png"
                remove_background(str(img_file), str(output_path), alpha_matting)
                results.append(str(output_path))
            except Exception as e:
                print(f"Error processing {img_file.name}: {e}")
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description="AI-powered tool to remove image backgrounds"
    )
    parser.add_argument("input", help="Input image file or directory")
    parser.add_argument("-o", "--output", help="Output file or directory")
    parser.add_argument(
        "--no-alpha-matting", 
        action="store_true",
        help="Disable alpha matting for faster processing"
    )
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    
    if input_path.is_dir():
        results = batch_process(
            str(input_path), 
            args.output, 
            alpha_matting=not args.no_alpha_matting
        )
        print(f"\nProcessed {len(results)} images")
    else:
        remove_background(
            str(input_path), 
            args.output, 
            alpha_matting=not args.no_alpha_matting
        )


if __name__ == "__main__":
    main()
