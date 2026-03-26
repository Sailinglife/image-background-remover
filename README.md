# Image Background Remover 🖼️

AI-powered tool to remove image backgrounds using state-of-the-art AI models.

## Features

- **Single Image Processing** - Remove background from one image
- **Batch Processing** - Process entire folders of images
- **Alpha Matting** - High-quality edge handling
- **Multiple Formats** - Supports PNG, JPG, JPEG, BMP, TIFF, WebP

## Installation

```bash
# Clone the repository
git clone https://github.com/Sailinglife/image-background-remover.git
cd image-background-remover

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Single Image

```bash
python remove_bg.py input.jpg
# Output: input_no_bg.png
```

### Specify Output

```bash
python remove_bg.py input.jpg -o output.png
```

### Batch Process Directory

```bash
python remove_bg.py /path/to/images/
# Output: /path/to/images/*_no_bg.png
```

### Disable Alpha Matting (Faster)

```bash
python remove_bg.py input.jpg --no-alpha-matting
```

## Requirements

- Python 3.8+
- pillow>=10.0.0
- rembg>=2.0.50
- onnxruntime>=1.16.0
- numpy>=1.24.0

## License

MIT License
