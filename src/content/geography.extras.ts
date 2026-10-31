// GEOGRAPHY practise-tool data (loaded only with the Practise tab).

// ---------------------------------------------------------------------------
// AO2 exam-style questions (wording exactly as in the booklet), with model answers.
// ---------------------------------------------------------------------------
export const GEOG_EXAM = [
  { id: 'g1', question: 'List three differences between an urban and rural environment', marks: 3,
    model: '1. Urban areas have a much higher population density than rural areas.\n2. Urban areas have more buildings, roads and services (shops, hospitals, universities), while rural areas have more fields, farms and open countryside.\n3. Urban areas usually have more pollution, noise and traffic than rural areas.',
    markScheme: ['Population: urban areas have more people / are more crowded', 'Land use: buildings, roads and services vs fields, farms, countryside', 'Any other valid difference: pollution, noise, traffic, jobs (industry/services vs farming), transport'] },
  { id: 'g2', question: 'Describe one reason for the distribution of the tropical rainforest biome', marks: 3,
    model: 'Tropical rainforests are found near the Equator because the sun is almost directly overhead all year, so it is hot (about 27 °C). The heat makes moist air rise quickly, and as it rises it cools and condenses, forming clouds. This gives heavy convectional rainfall almost every day, creating the hot, wet climate rainforests need.',
    markScheme: ['States location: near the Equator / between the tropics', 'Reason: sun overhead / high temperatures all year', 'Develops: warm moist air rises, cools, condenses → heavy rainfall every day (hot and wet climate)'] },
  { id: 'g3', question: 'Explain two ways monkeys are adapted to the tropical rainforest', marks: 3,
    model: 'Many monkeys have prehensile (gripping) tails, which act like an extra hand so they can hold on to branches while they reach for fruit high in the canopy. They also have long, strong arms and legs, which allow them to swing and leap between trees, so they can travel and escape predators without going down to the dangerous forest floor.',
    markScheme: ['Adaptation 1 identified (e.g. prehensile tail / strong limbs / forward-facing eyes)', 'Adaptation 2 identified', 'Explains how at least one helps survival (grip branches, move through canopy, judge distances, reach food, avoid predators)'] },
  { id: 'g4', question: 'Suggest two consequences of a drought or famine in a named location', marks: 4,
    model: 'In the Dust Bowl in the Great Plains of the USA in the 1930s, the drought caused crops to fail and dried topsoil was blown away in huge dust storms. This meant many farmers lost their income and could not pay their debts, so they lost their farms.\n\nA second consequence was mass migration: around 2.5 million people left the Plains states, many heading west to California to look for work.',
    markScheme: ['Named location given (e.g. Dust Bowl USA 1930s, East Africa / Somalia 2011)', 'Consequence 1 (e.g. crops fail / animals die / food shortage)', 'Consequence 2 (e.g. migration / disease / malnutrition / loss of income)', 'Develops at least one consequence with a result ("this meant…")'] },
  { id: 'g5', question: 'Explain one way Pangaea separated 200 million years ago', marks: 3,
    model: 'Pangaea separated because of convection currents in the mantle. Heat from the Earth’s core warmed the mantle, so hot rock rose, spread out beneath the crust, cooled and sank again. As the currents moved in loops, they dragged the tectonic plates apart, slowly splitting Pangaea into separate continents.',
    markScheme: ['Names convection currents (in the mantle)', 'Explains: heat from the core → material rises, spreads, cools, sinks', 'Links to plates being dragged/moved apart, splitting the supercontinent'] },
  { id: 'g6', question: 'Describe one push and one pull factor of living in an urban location, e.g. Coventry', marks: 4,
    model: 'A pull factor of living in Coventry is the range of jobs and education: it has two universities and many businesses, so people move there to find work or study.\n\nA push factor is traffic and air pollution: the busy ring road and roads into the city can be congested and noisy, which may make some people want to move out to quieter, rural villages.',
    markScheme: ['Identifies a pull factor (e.g. jobs, universities, services, transport links)', 'Develops the pull factor (why it attracts people)', 'Identifies a push factor (e.g. pollution, traffic, crime, high house prices)', 'Develops the push factor (why it makes people leave)'] },
  { id: 'g7', question: 'List two types of tectonic hazard', marks: 2,
    model: '1. Earthquakes\n2. Volcanic eruptions\n(Tsunamis are also accepted.)',
    markScheme: ['One correct tectonic hazard (earthquake / volcanic eruption / tsunami)', 'A second, different correct tectonic hazard'] },
  { id: 'g8', question: 'Describe the differences between convergent, divergent and conservative plate movement', marks: 3,
    model: 'At convergent (destructive) boundaries, two plates move towards each other and the denser oceanic plate sinks below the other. At divergent (constructive) boundaries, plates move apart and magma rises to fill the gap. At conservative boundaries, plates slide past each other side by side, which causes earthquakes but no volcanoes.',
    markScheme: ['Convergent: plates move towards each other', 'Divergent: plates move apart', 'Conservative: plates slide past each other'] },
  { id: 'g9', question: 'Explain one way earthquakes can trigger tsunamis', marks: 3,
    model: 'When an earthquake happens under the sea at a plate boundary, the seabed can suddenly be pushed up or dropped down. This moves a huge volume of water above it, creating a series of waves that spread out across the ocean. When the waves reach shallow water near the coast they slow down and grow much taller, flooding the land.',
    markScheme: ['Undersea earthquake / at a plate boundary', 'Seabed suddenly moves up or down, displacing a large volume of water', 'Waves travel outwards and grow taller in shallow water near the coast'] },
  { id: 'g10', question: 'Suggest two reasons why some countries are more developed than others', marks: 4,
    model: 'One reason is natural hazards and climate. Countries that suffer frequent droughts, floods or earthquakes have to keep spending money on rebuilding, which slows development.\n\nA second reason is conflict and corruption. War destroys schools, hospitals and roads and scares away businesses, so the country cannot grow its economy, while richer, peaceful countries can invest in education and industry.',
    markScheme: ['Reason 1 identified (physical, e.g. hazards, climate, landlocked, few resources, disease)', 'Reason 1 developed (how it affects development)', 'Reason 2 identified (human, e.g. war, corruption, colonialism, debt, trade)', 'Reason 2 developed'] },
];

// ---------------------------------------------------------------------------
// Extension case studies (fact files). Figures vary by source: see CONTENT_CHECK.md.
// ---------------------------------------------------------------------------
export interface CaseStudy {
  id: string; title: string; icon: string; type: string; when: string;
  location: string; impacts: string[]; preparation: string[]; response: string[];
  quiz: { q: string; options: string[]; answer: number }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'katrina', title: 'Hurricane Katrina', icon: '🌀', type: 'Climatic hazard: tropical storm', when: 'August 2005',
    location: 'The Gulf Coast of the USA, especially New Orleans (Louisiana) and Mississippi. It made landfall on 29 August 2005.',
    impacts: [
      'Over 1,800 people died.',
      'The levees (flood walls) protecting New Orleans failed, and about 80% of the city flooded.',
      'Hundreds of thousands of people lost their homes; around a million were displaced.',
      'Damage cost over $100 billion, one of the costliest disasters in US history.',
    ],
    preparation: [
      'Forecasters tracked the storm, and a mandatory evacuation of New Orleans was ordered the day before landfall.',
      'Many poorer residents had no car and could not leave; thousands sheltered in the Superdome stadium.',
      'The levees had not been built strongly enough for such a powerful storm.',
    ],
    response: [
      'The government response was criticised as slow and badly organised.',
      'The Coast Guard and National Guard rescued thousands of people from rooftops.',
      'Afterwards, the flood defences around New Orleans were rebuilt and strengthened.',
    ],
    quiz: [
      { q: 'Which city was worst affected?', options: ['Miami', 'New Orleans', 'New York', 'Houston'], answer: 1 },
      { q: 'What failed and caused most of the flooding?', options: ['Dams', 'Levees', 'Bridges', 'Power stations'], answer: 1 },
      { q: 'In which year did Katrina hit?', options: ['1995', '2005', '2015', '2001'], answer: 1 },
      { q: 'Why couldn’t many poorer people evacuate?', options: ['They had no car', 'Roads were closed early', 'They weren’t told', 'They lived on hills'], answer: 0 },
    ],
  },
  {
    id: 'vesuvius', title: 'Vesuvius and Pompeii', icon: '🌋', type: 'Tectonic hazard: volcanic eruption', when: 'AD 79',
    location: 'Mount Vesuvius, on the Bay of Naples in southern Italy. The Roman towns of Pompeii and Herculaneum were at its foot.',
    impacts: [
      'Pompeii was buried under several metres of ash and pumice; Herculaneum was buried by pyroclastic flows.',
      'Thousands of people died, many killed by pyroclastic flows of hot gas and ash.',
      'The towns were abandoned and lost for over 1,600 years, until excavations began in the 1700s.',
      'Because they were buried so quickly, the towns are now a unique record of Roman life.',
    ],
    preparation: [
      'There was almost none: the Romans did not know Vesuvius was a volcano.',
      'Warning signs, like a big earthquake in AD 62 and small tremors before the eruption, were not understood.',
    ],
    response: [
      'Some people escaped by road or by sea. Pliny the Elder sailed with a fleet to try to rescue people, but died.',
      'His nephew, Pliny the Younger, wrote an eyewitness account: the first detailed description of an eruption.',
      'Today, Vesuvius is closely monitored, and there are evacuation plans for the hundreds of thousands of people living nearby.',
    ],
    quiz: [
      { q: 'In which country is Vesuvius?', options: ['Greece', 'Italy', 'Iceland', 'Spain'], answer: 1 },
      { q: 'When did it destroy Pompeii?', options: ['AD 79', '1066', '79 BC', '1906'], answer: 0 },
      { q: 'What killed many people?', options: ['Lava flows', 'Pyroclastic flows', 'Tsunamis', 'Floods'], answer: 1 },
      { q: 'Who wrote an eyewitness account?', options: ['Julius Caesar', 'Pliny the Younger', 'Emperor Nero', 'Homer'], answer: 1 },
    ],
  },
  {
    id: 'yellow-river', title: 'The Yellow River floods', icon: '🌊', type: 'Climatic hazard: flood', when: '1887 (and 1931)',
    location: 'The Yellow River (Huang He) in northern China, flowing across the flat North China Plain. In 1887 it burst its banks in Henan province.',
    impacts: [
      'In 1887, the river broke through its levees and flooded a huge area of farmland and villages.',
      'Estimates of deaths range from about 900,000 to 2 million, from drowning, then famine and disease.',
      'In 1931, floods on the Yellow, Yangtze and Huai rivers killed even more people, one of the deadliest disasters ever recorded.',
      'The river is nicknamed "China’s Sorrow" because of its deadly floods.',
    ],
    preparation: [
      'For centuries people built levees (raised banks) to hold the river in.',
      'The river carries huge amounts of yellow silt, which settles and raises the riverbed, so the levees had to be built higher and higher, until the river flowed above the surrounding land.',
    ],
    response: [
      'Relief was limited at the time; many survivors faced famine and disease.',
      'Later, China built dams (e.g. the Sanmenxia and Xiaolangdi dams), planted trees to reduce soil erosion and strengthened the levees.',
    ],
    quiz: [
      { q: 'What is the Yellow River’s nickname?', options: ['China’s Sorrow', 'The Great Wall', 'The Red River', 'China’s Pride'], answer: 0 },
      { q: 'Why is the river "yellow"?', options: ['Pollution', 'It carries lots of yellow silt', 'Yellow fish', 'Sunlight'], answer: 1 },
      { q: 'Why did the riverbed rise over time?', options: ['Silt settled on it', 'Earthquakes', 'More rain', 'Melting glaciers'], answer: 0 },
      { q: 'What have modern governments built to control it?', options: ['Dams and levees', 'Volcanoes', 'Windmills', 'Bridges only'], answer: 0 },
    ],
  },
  {
    id: 'dust-bowl', title: 'The Dust Bowl', icon: '🌪️', type: 'Climatic hazard: drought', when: 'The 1930s',
    location: 'The southern Great Plains of the USA: parts of Oklahoma, Texas, Kansas, Colorado and New Mexico.',
    impacts: [
      'Years of drought dried out the soil, and strong winds blew the topsoil away in huge dust storms ("black blizzards").',
      'The worst, on "Black Sunday" (14 April 1935), turned day into night.',
      'Crops failed and animals died; many farmers went bankrupt and lost their land.',
      'People suffered "dust pneumonia", and around 2.5 million people left the Plains, many heading to California.',
    ],
    preparation: [
      'Very little: in the 1910s–20s farmers had ploughed up the deep-rooted prairie grasses that held the soil together, to grow wheat.',
      'Nobody had planned for a long drought on the bare soil.',
    ],
    response: [
      'The US government set up the Soil Conservation Service in 1935.',
      'Millions of trees were planted as windbreaks ("shelterbelts").',
      'Farmers were taught new methods, like contour ploughing and crop rotation, and were paid to protect the soil.',
    ],
    quiz: [
      { q: 'In which country was the Dust Bowl?', options: ['Australia', 'USA', 'Canada', 'Brazil'], answer: 1 },
      { q: 'In which decade?', options: ['1890s', '1930s', '1960s', '2000s'], answer: 1 },
      { q: 'What made the soil easy to blow away?', options: ['Prairie grass had been ploughed up', 'Too much rain', 'Earthquakes', 'Glaciers'], answer: 0 },
      { q: 'Which was a response?', options: ['Planting trees as windbreaks', 'Building volcanoes', 'Banning farming forever', 'Moving the Plains'], answer: 0 },
    ],
  },
];
