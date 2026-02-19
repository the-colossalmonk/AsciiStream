# AsciiStream

<div align="center">
  <img src="public/favicon.svg" width="100" height="100" />
  <h1>AsciiStream</h1>
  <p><strong>Real-time ASCII Art Camera Filter</strong></p>
  <p>Made with ❤️ by the.colossalmonk</p>
</div>

## Overview

AsciiStream is a high-performance, real-time webcam filter that converts video input into dynamic ASCII art. Built with React and optimized for 60FPS rendering, it offers a retro cyber-aesthetic experience directly in your browser.

## Demo

<div align="center">
  <h3>
    <a href="public/ascii_stream_demo.mp4">🔴 Watch Demo Video (MP4)</a>
  </h3>
  <p><em>(GitHub does not support embedded videos from the repository. Click above to view.)</em></p>
</div>

## Features

- **Real-time Conversion**: Smooth 60FPS ASCII rendering.
- **Multiple Charsets**: Choose from Standard, Binary, Matrix, Blocks, and more.
- **Color Modes**: Matrix Green, Cyberpunk Neon, True Color, and various monochromatic themes.
- **Customizable**: Adjust resolution, contrast, brightness, gamma, and noise/grain.
- **Responsive UI**: Sleek, collapsible control panel with a cyber-aesthetic design.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/asciistream.git
   cd asciistream
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL (usually `http://localhost:5173`).
   *Note: Using the camera requires secure context (HTTPS) or localhost.*

## Controls

- **Resolution**: Adjust character density.
- **Contrast/Brightness**: Fine-tune the image visibility.
- **Color Theme**: Switch between retro green/amber or modern neon styles.
- **Flip Camera**: Mirror the video feed.
- **Invert Colors**: Swap foreground and background colors.

---