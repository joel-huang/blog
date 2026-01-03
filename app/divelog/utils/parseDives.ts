export interface DiveSample {
  diveNumber: number;
  date: string;
  time: string;
  sampleTime: string; // Format: "MM:SS" (minutes:seconds)
  depth: number;
  temperature?: number;
  pressure?: number;
  heartrate?: number;
}

export interface Dive {
  diveNumber: number;
  date: string;
  time: string;
  maxDepth: number;
  duration: string; // Format: "MM:SS"
  samples: DiveSample[];
  site?: string;
  location?: string;
}

// Parse time string like "12:30" (MM:SS format) to total seconds
function parseTimeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Parse time string like "12:30" (MM:SS format) to total minutes (as decimal)
function parseTimeToMinutes(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes + seconds / 60;
}

// Format total seconds to "MM:SS" string
function formatSecondsToTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

import fs from 'fs';
import path from 'path';

export async function parseDivesCSV(): Promise<Dive[]> {
  // Read CSV file from public directory
  const csvPath = path.join(process.cwd(), 'public', 'dives.csv');
  const text = fs.readFileSync(csvPath, 'utf-8');
  const lines = text.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const diveMap = new Map<number, DiveSample[]>();
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line (handling quoted values)
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '')) || [];
    
    if (values.length < 5) continue;
    
    const diveNumber = parseInt(values[0]);
    const date = values[1];
    const time = values[2];
    const sampleTime = values[3];
    const depth = parseFloat(values[4]) || 0;
    const temperature = values[5] ? parseFloat(values[5]) : undefined;
    const pressure = values[6] ? parseFloat(values[6]) : undefined;
    const heartrate = values[7] ? parseFloat(values[7]) : undefined;
    
    if (!diveMap.has(diveNumber)) {
      diveMap.set(diveNumber, []);
    }
    
    diveMap.get(diveNumber)!.push({
      diveNumber,
      date,
      time,
      sampleTime,
      depth,
      temperature,
      pressure,
      heartrate,
    });
  }
  
  // Convert to Dive objects
  const dives: Dive[] = [];
  
  for (const [diveNumber, samples] of Array.from(diveMap.entries())) {
    if (samples.length === 0) continue;
    
    const maxDepth = Math.max(...samples.map(s => s.depth));
    const maxTimeSeconds = Math.max(...samples.map(s => parseTimeToSeconds(s.sampleTime)));
    const duration = formatSecondsToTime(maxTimeSeconds);
    
    // Get date and time from first sample
    const firstSample = samples[0];
    
    dives.push({
      diveNumber,
      date: firstSample.date,
      time: firstSample.time,
      maxDepth,
      duration,
      samples: samples.sort((a, b) => parseTimeToSeconds(a.sampleTime) - parseTimeToSeconds(b.sampleTime)),
    });
  }
  
  // Sort by dive number descending (most recent first)
  return dives.sort((a, b) => b.diveNumber - a.diveNumber);
}
