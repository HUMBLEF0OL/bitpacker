Here's a complete README file template for your compression algorithm project:

---

# Huffman Compression Algorithm

This project implements a custom Huffman Compression Algorithm, designed to compress text-based files such as `.txt`, `.json`, `.docx`, and `.pdf`. It uses the Huffman coding technique to reduce the size of the text by encoding characters based on their frequency of occurrence in the source data.

## Features

- **Text Compression**: Compresses text-based file formats by analyzing the frequency of characters and encoding them using the Huffman coding algorithm.
- **Binary Output**: Generates compressed files in a binary format.
- **Metadata**: Saves metadata related to the compression process, including the Huffman tree structure, to allow for decompression.
- **Compression Metrics**: Reports on the compression ratio and the original and compressed file sizes.

## Supported Formats

- `.txt`
- `.json`
- `.docx`
- `.pdf` (with consideration that only the text is compressed; embedded images are not compressed)
  
**Note**: The algorithm is designed for text-based formats. When handling PDFs containing images, only the text portion will be compressed.

## Setup Instructions

### Prerequisites

Before running the project, ensure you have the following dependencies installed:

- Node.js (v16 or higher)
- `npm` or `yarn` for managing packages

### Installing

1. Clone this repository:
   ```bash
   git clone https://github.com/HUMBLEF0OL/huffman-compression.git
   ```

2. Navigate to the project directory:
   ```bash
   cd huffman-compression
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

### Usage

1. Place the file(s) you want to compress in the `./test` directory. Supported formats include `.txt`, `.json`, `.docx`, and `.pdf` (for text extraction only).

2. Run the compression process:
   ```bash
   node index.js
   ```

   This will start the compression algorithm, process each file in the `./test` directory, and generate compressed output files in the `./output` directory.

3. Check the `./output` directory for:
   - Compressed files (`encoded.bin`)
   - Metadata files (`metaData.bin`)

4. To decompress the file, simply use the `decode` function provided in the project.

### Report Generation

The project generates a compression report for each file processed. The report includes:

- **Original File Size**: Size of the file before compression.
- **Compressed File Size**: Size of the file after compression.
- **Compression Ratio**: The ratio of the original file size to the compressed file size.
- **Time Taken**: Time spent to process and compress the file.

You can view the results in the console after the compression completes.

## Compression Algorithm Overview

### 1. **Frequency Analysis**
   - The algorithm starts by analyzing the frequency of each character in the input file.
   
### 2. **Priority Queue**
   - A priority queue (min-heap) is built using the frequency data. This queue ensures that the least frequent characters are processed first.

### 3. **Huffman Tree Construction**
   - The Huffman tree is built by combining nodes based on their frequencies. The two nodes with the least frequency are merged into a parent node, and this process is repeated until only one node (the root) remains.

### 4. **Code Generation**
   - Once the tree is built, binary codes are assigned to each character based on its position in the tree. Characters closer to the root get shorter codes, ensuring optimal compression.

### 5. **Serialization**
   - The Huffman tree is serialized and saved in binary format for use in decompression.

### 6. **Compression and Saving**
   - The input text is encoded using the generated Huffman codes. Both the compressed data and metadata (Huffman tree) are saved into files.

### 7. **Decompression**
   - The decompression process reads the serialized Huffman tree and decodes the compressed data back into its original form.

## Example

### Sample Input (Text File)
```txt
hello world
```

### Compressed Output (Encoded File)
- The file will be compressed into a binary file (`encoded.bin`), and metadata will be saved in a separate file (`metaData.bin`).

## Metrics Example

### File 1: `example.txt`
- **Original File Size**: 90 KB
- **Compressed File Size**: 48 KB
- **Compression Ratio**: 1.875 (compressed size / original size)

## Contributing

If you'd like to contribute to this project, feel free to open a pull request. For bug reports or suggestions, please create an issue in the GitHub repository.

## License

This project is licensed under the MIT License.

## Acknowledgments

- The core compression algorithm is based on the Huffman coding technique. You can read more about it here: [Huffman coding - Wikipedia](https://en.wikipedia.org/wiki/Huffman_coding).
- Special thanks to libraries like `pdf-lib` and `pdf-parse` for PDF text extraction and manipulation.
