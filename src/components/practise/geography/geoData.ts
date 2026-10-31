// A simplified (schematic) world map in longitude/latitude, projected to a 1000×500 box.
// Shapes are rough on purpose: good enough to learn where things are.

export type LonLat = [number, number];
export const MAP_W = 1000, MAP_H = 500;
export const proj = ([lon, lat]: LonLat): [number, number] => [((lon + 180) / 360) * MAP_W, ((90 - lat) / 180) * MAP_H];
export const toPath = (pts: LonLat[]) => 'M' + pts.map((p) => proj(p).map((n) => n.toFixed(1)).join(' ')).join(' L') + ' Z';

export type ContinentId = 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia' | 'Oceania' | 'Antarctica';

export const CONTINENTS: Record<ContinentId, { shapes: LonLat[][]; label: LonLat; colour: string; countries: string[] }> = {
  'North America': {
    colour: '#f4a261', label: [-102, 47], countries: ['USA', 'Canada', 'Mexico', 'Jamaica', 'Greenland (Denmark)'],
    shapes: [
      [[-165, 65], [-150, 71], [-120, 72], [-95, 72], [-80, 65], [-62, 60], [-55, 50], [-67, 45], [-75, 35], [-80, 25], [-90, 29], [-97, 26], [-97, 18], [-88, 15], [-83, 9], [-80, 8], [-92, 15], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
      [[-55, 82], [-30, 83], [-20, 75], [-40, 65], [-50, 62], [-58, 75]],
    ],
  },
  'South America': {
    colour: '#e76f51', label: [-60, -15], countries: ['Brazil', 'Argentina', 'Peru', 'Chile', 'Colombia'],
    shapes: [[[-80, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -6], [-38, -15], [-48, -25], [-58, -35], [-65, -42], [-68, -52], [-74, -50], [-72, -35], [-71, -18], [-77, -10], [-81, -3]]],
  },
  Europe: {
    colour: '#8ecae6', label: [18, 52], countries: ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Poland'],
    shapes: [
      [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 57], [5, 62], [15, 69], [28, 71], [40, 67], [45, 60], [50, 55], [45, 45], [37, 45], [28, 41], [23, 37], [15, 38], [12, 44], [3, 42], [-5, 36]],
      [[-6, 50], [1, 51], [2, 53], [-2, 56], [-3, 58.5], [-6, 58], [-5, 55], [-3, 54], [-5, 52]],
      [[-10, 52], [-6, 52], [-6, 55], [-8, 55.3], [-10, 54]],
    ],
  },
  Africa: {
    colour: '#e9c46a', label: [18, 5], countries: ['Nigeria', 'Egypt', 'Kenya', 'South Africa', 'Ethiopia', 'Ghana'],
    shapes: [
      [[-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [27, -34], [20, -35], [15, -28], [12, -15], [9, 0], [5, 5], [-8, 4], [-15, 10]],
      [[44, -12], [50, -15], [47, -25], [44, -22]],
    ],
  },
  Asia: {
    colour: '#90be6d', label: [90, 45], countries: ['China', 'India', 'Japan', 'Russia', 'Saudi Arabia', 'Indonesia'],
    shapes: [
      [[26, 41], [36, 36], [35, 30], [43, 12], [52, 16], [58, 22], [60, 25], [67, 25], [73, 20], [77, 8], [80, 15], [88, 22], [92, 22], [98, 16], [100, 3], [104, 1], [106, 10], [108, 20], [118, 24], [122, 30], [121, 40], [128, 35], [130, 42], [140, 48], [143, 55], [160, 60], [170, 65], [180, 68], [180, 71], [140, 73], [110, 77], [70, 73], [60, 70], [45, 68], [40, 67], [45, 60], [50, 55], [45, 45], [37, 45], [28, 41]],
      [[130, 31], [135, 34], [140, 36], [142, 40], [141, 44], [145, 44], [140, 42], [137, 37], [132, 34]],
      [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
      [[95, 5], [98, 4], [106, -6], [104, -5]],
    ],
  },
  Oceania: {
    colour: '#f28482', label: [134, -26], countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
    shapes: [
      [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [141, -38], [135, -35], [129, -32], [115, -34]],
      [[172, -34], [178, -38], [175, -41], [170, -46], [167, -46], [172, -41]],
    ],
  },
  Antarctica: {
    colour: '#e0fbfc', label: [0, -80], countries: ['No countries: only research stations'],
    shapes: [[[-180, -72], [-120, -74], [-60, -64], [0, -70], [60, -67], [120, -66], [180, -72], [180, -90], [-180, -90]]],
  },
};

export type OceanId = 'Pacific' | 'Atlantic' | 'Indian' | 'Southern' | 'Arctic';
export const OCEANS: Record<OceanId, { label: LonLat; extra?: LonLat; borders: string }> = {
  Pacific: { label: [-150, 5], extra: [165, 10], borders: 'Between Asia and Oceania (west) and the Americas (east). The largest ocean.' },
  Atlantic: { label: [-35, 20], borders: 'Between the Americas (west) and Europe and Africa (east). The UK is on its edge.' },
  Indian: { label: [78, -22], borders: 'Between Africa (west), Asia (north) and Australia (east).' },
  Southern: { label: [-30, -60], borders: 'Surrounds Antarctica.' },
  Arctic: { label: [0, 82], borders: 'Around the North Pole, bordered by Russia, Canada, Greenland, Norway and Alaska (USA). The smallest ocean.' },
};

export type BiomeId = 'Tropical rainforest' | 'Hot desert' | 'Tundra' | 'Savanna';
export const BIOMES: Record<BiomeId, { colour: string; areas: { name: string; at: LonLat; r: number }[] }> = {
  'Tropical rainforest': { colour: '#2d6a4f', areas: [{ name: 'Amazon', at: [-62, -4], r: 13 }, { name: 'Congo', at: [20, 0], r: 9 }, { name: 'South-East Asia', at: [112, 0], r: 10 }] },
  'Hot desert': { colour: '#e9c46a', areas: [{ name: 'Sahara', at: [10, 23], r: 13 }, { name: 'Arabian', at: [47, 22], r: 8 }, { name: 'Australian deserts', at: [130, -25], r: 10 }, { name: 'Kalahari', at: [22, -23], r: 6 }] },
  Tundra: { colour: '#a8dadc', areas: [{ name: 'Northern Canada', at: [-100, 67], r: 12 }, { name: 'Siberia', at: [100, 71], r: 13 }, { name: 'Alaska', at: [-155, 67], r: 7 }] },
  Savanna: { colour: '#d4a373', areas: [{ name: 'East Africa (Serengeti)', at: [33, -5], r: 8 }, { name: 'West Africa', at: [0, 11], r: 8 }, { name: 'Northern Australia', at: [133, -16], r: 7 }, { name: 'Brazil', at: [-48, -14], r: 7 }] },
};

// UK (simplified), in its own lon/lat frame.
export const UK: Record<string, { shape: LonLat[]; capital: string; at: LonLat; colour: string }> = {
  England: { capital: 'London', at: [-0.1, 51.5], colour: '#e63946', shape: [[-5.7, 50.0], [-3, 50.6], [1.4, 51.1], [1.7, 52.7], [0.2, 53.5], [-0.5, 54.5], [-1.6, 55.6], [-2.1, 55.8], [-3.0, 55.0], [-3.4, 54.4], [-3.0, 53.3], [-3.0, 52.0], [-3.2, 51.6], [-4.2, 51.2], [-5.7, 50.0]] },
  Wales: { capital: 'Cardiff', at: [-3.2, 51.5], colour: '#2a9d8f', shape: [[-3.2, 51.6], [-3.0, 52.0], [-3.0, 53.3], [-4.6, 53.4], [-4.8, 52.8], [-4.1, 52.4], [-5.3, 51.8], [-4.2, 51.6]] },
  Scotland: { capital: 'Edinburgh', at: [-3.2, 55.95], colour: '#457b9d', shape: [[-2.1, 55.8], [-1.6, 55.6], [-2.6, 56.3], [-1.8, 57.6], [-3.3, 58.6], [-5.0, 58.6], [-5.7, 57.5], [-5.6, 56.3], [-5.8, 55.4], [-4.9, 54.8], [-3.4, 54.9], [-3.0, 55.0]] },
  'Northern Ireland': { capital: 'Belfast', at: [-5.93, 54.6], colour: '#f4a261', shape: [[-8.1, 54.4], [-7.3, 55.2], [-6.2, 55.2], [-5.5, 54.6], [-6.0, 54.0], [-6.8, 54.1], [-7.6, 54.1]] },
};
