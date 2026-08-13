const fs = require('fs');
const path = require('path');

function createToneWav(outputPath, frequency, label) {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const durationSeconds = 120.0;
  
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  const amplitude = 16384;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.round(amplitude * Math.sin(2 * Math.PI * frequency * t));
    const offset = 44 + i * 2;
    buffer.writeInt16LE(sample, offset);
  }
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${label} WAV file at: ${outputPath} (${buffer.length} bytes)`);
}

const dir = path.join(__dirname, 'public/audio');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Generate the 9 distinct demo tracks
createToneWav(path.join(dir, 'demo-a4.wav'), 440, 'Demo Tone A4');
createToneWav(path.join(dir, 'demo-c5.wav'), 523.25, 'Demo Tone C5');
createToneWav(path.join(dir, 'demo-d5.wav'), 587.33, 'Demo Tone D5');
createToneWav(path.join(dir, 'demo-e5.wav'), 659.25, 'Demo Tone E5');
createToneWav(path.join(dir, 'demo-f5.wav'), 698.46, 'Demo Tone F5');
createToneWav(path.join(dir, 'demo-g5.wav'), 783.99, 'Demo Tone G5');
createToneWav(path.join(dir, 'demo-a5.wav'), 880.00, 'Demo Tone A5');
createToneWav(path.join(dir, 'demo-b5.wav'), 987.77, 'Demo Tone B5');
createToneWav(path.join(dir, 'demo-c6.wav'), 1046.50, 'Demo Tone C6');
