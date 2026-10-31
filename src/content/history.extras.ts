// HISTORY practise-tool data (loaded only with the Practise tab).

// Timeline events (year: negative = BC). `period` events are spans shown on the animated timeline.
export const TIMELINE: { id: string; label: string; year: number; display: string }[] = [
  { id: 'caesar', label: 'Julius Caesar raids Britain', year: -55, display: '55 BC' },
  { id: 'silk', label: 'Silk Road trade with China begins', year: -130, display: 'c. 130 BC' },
  { id: 'claudius', label: 'Romans invade under Claudius', year: 43, display: 'AD 43' },
  { id: 'hadrian', label: 'Hadrian’s Wall begun', year: 122, display: 'AD 122' },
  { id: 'leave', label: 'Romans leave Britain', year: 410, display: 'c. 410' },
  { id: 'saxons', label: 'Anglo-Saxons settle in England', year: 450, display: 'c. 450' },
  { id: 'augustine', label: 'St Augustine brings Christianity to Kent', year: 597, display: '597' },
  { id: 'bede', label: 'Bede finishes his history', year: 731, display: '731' },
  { id: 'baghdad', label: 'Baghdad founded by al-Mansur', year: 762, display: '762' },
  { id: 'wisdom', label: 'House of Wisdom at its peak (al-Ma’mun)', year: 820, display: 'c. 813–833' },
  { id: 'alfred', label: 'Alfred the Great becomes king', year: 871, display: '871' },
  { id: 'edward', label: 'Edward the Confessor dies', year: 1066.01, display: 'Jan 1066' },
  { id: 'stamford', label: 'Battle of Stamford Bridge', year: 1066.73, display: '25 Sep 1066' },
  { id: 'hastings', label: 'Battle of Hastings', year: 1066.79, display: '14 Oct 1066' },
  { id: 'crowned', label: 'William crowned king', year: 1066.98, display: '25 Dec 1066' },
  { id: 'mongols', label: 'Mongols destroy Baghdad', year: 1258, display: '1258' },
  { id: 'plague', label: 'Black Death spreads along trade routes', year: 1347, display: '1340s' },
];

// Showdown: facts to sort into Baghdad or Anglo-Saxon England.
export const SHOWDOWN: { text: string; side: 'Baghdad' | 'Saxon England'; theme: 'Education' | 'Women' | 'Society' | 'Law' }[] = [
  { text: 'Scholars translated Greek books in the House of Wisdom', side: 'Baghdad', theme: 'Education' },
  { text: 'Monks copied books by hand in monasteries', side: 'Saxon England', theme: 'Education' },
  { text: 'Al-Khwarizmi developed algebra', side: 'Baghdad', theme: 'Education' },
  { text: 'Bede wrote a history of the English people', side: 'Saxon England', theme: 'Education' },
  { text: 'Most people could not read or write', side: 'Saxon England', theme: 'Education' },
  { text: 'Zubaidah paid for wells for pilgrims', side: 'Baghdad', theme: 'Women' },
  { text: 'Abbess Hild ran the monastery at Whitby', side: 'Saxon England', theme: 'Women' },
  { text: 'Æthelflæd led armies against the Vikings', side: 'Saxon England', theme: 'Women' },
  { text: 'Women’s rights to inherit came from the Qur’an', side: 'Baghdad', theme: 'Women' },
  { text: 'The caliph ruled from a palace in a round city', side: 'Baghdad', theme: 'Society' },
  { text: 'Thegns held land and fought for the king', side: 'Saxon England', theme: 'Society' },
  { text: 'Most people lived in small villages of wooden houses', side: 'Saxon England', theme: 'Society' },
  { text: 'Huge markets sold goods from China and Africa', side: 'Baghdad', theme: 'Society' },
  { text: 'Judges called qadis ran the courts', side: 'Baghdad', theme: 'Law' },
  { text: 'Wergild was paid to a victim’s family', side: 'Saxon England', theme: 'Law' },
  { text: 'Trial by ordeal with hot iron or cold water', side: 'Saxon England', theme: 'Law' },
  { text: 'Law based on the Qur’an and Hadith (Sharia)', side: 'Baghdad', theme: 'Law' },
  { text: 'Tithings of 10 men kept each other in order', side: 'Saxon England', theme: 'Law' },
];

// 1066 claimant "top trumps". Ratings are our own judgement, out of 10, to spark discussion.
export const CLAIMANTS = [
  { name: 'Harold Godwinson', from: 'England (Earl of Wessex)', emoji: '🛡️', colour: '#e63946',
    claim: 'Most powerful noble in England; said Edward named him on his deathbed; chosen by the Witan (council).',
    weakness: 'Not royal by blood; had sworn an oath to support William (he said he was forced).',
    fate: 'Won at Stamford Bridge (25 Sept), killed at Hastings (14 Oct).',
    stats: { 'Blood claim': 3, 'Army strength': 8, 'Support in England': 9, 'Military experience': 8 } },
  { name: 'Harald Hardrada', from: 'Norway (King)', emoji: '⚔️', colour: '#457b9d',
    claim: 'Claimed a deal between Magnus of Norway and Harthacnut (an earlier king of England); backed by Tostig.',
    weakness: 'Little support in England; his claim was weak.',
    fate: 'Won at Gate Fulford (20 Sept), killed at Stamford Bridge (25 Sept).',
    stats: { 'Blood claim': 2, 'Army strength': 8, 'Support in England': 2, 'Military experience': 10 } },
  { name: 'William of Normandy', from: 'Normandy (Duke)', emoji: '🐎', colour: '#2a9d8f',
    claim: 'Edward’s cousin; said Edward promised him the throne in 1051, and Harold swore an oath to support him in 1064; backed by the Pope.',
    weakness: 'Foreign; had to cross the Channel with his army.',
    fate: 'Won the Battle of Hastings; crowned on Christmas Day 1066.',
    stats: { 'Blood claim': 5, 'Army strength': 9, 'Support in England': 3, 'Military experience': 9 } },
  { name: 'Edgar Ætheling', from: 'England (royal family)', emoji: '👑', colour: '#f4a261',
    claim: 'Edward’s great-nephew: the closest blood relative.',
    weakness: 'Only a teenager with no army or experience.',
    fate: 'Briefly chosen after Hastings, but submitted to William.',
    stats: { 'Blood claim': 9, 'Army strength': 1, 'Support in England': 4, 'Military experience': 1 } },
];

// Silk Road journey stops (lon/lat) with goods and ideas.
export const SILK_STOPS = [
  { name: 'Chang’an (Xi’an)', at: [109, 34], text: 'The eastern start, capital of Han and Tang China. Silk, paper, porcelain and tea set off west from here.' },
  { name: 'Dunhuang', at: [94.7, 40.1], text: 'An oasis town at the edge of the desert. Buddhist cave temples full of paintings show how Buddhism travelled into China.' },
  { name: 'Kashgar', at: [76, 39.5], text: 'A busy market where routes met before crossing the high Pamir mountains. Traders swapped camels and goods here.' },
  { name: 'Samarkand', at: [67, 39.7], text: 'A rich city famous for paper-making, which it learned from Chinese craftsmen in the 700s, and for its markets.' },
  { name: 'Merv', at: [62, 37.6], text: 'One of the largest cities in the world at times; a crossroads for Persian, Indian and Chinese goods.' },
  { name: 'Baghdad', at: [44.4, 33.3], text: 'The Abbasid capital. Scholars in the House of Wisdom studied ideas from China, India and Greece; markets sold goods from everywhere.' },
  { name: 'Constantinople', at: [29, 41], text: 'The great city between Asia and Europe (now Istanbul). Silk, spices and ideas passed into Europe here.' },
  { name: 'Venice', at: [12.3, 45.4], text: 'Italian merchants sold eastern goods across Europe. Marco Polo set out from here in 1271.' },
];
