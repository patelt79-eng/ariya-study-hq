// ENGLISH practise-tool data (loaded only with the Practise tab).

// ---------------------------------------------------------------------------
// Practice extracts: original texts about fictional people (not from any book).
// Each segment can be tapped in "Spot the technique"; `d` is the device it shows.
// ---------------------------------------------------------------------------
export type Device = 'Metaphor' | 'Short sentence' | 'Listing' | 'Triadic listing' | 'Anecdote' | 'Statistic' | 'Repetition'
  | 'Simile' | 'Direct address' | 'Rhetorical question' | 'Emotive language' | 'Superlative' | 'Imperative';

export interface Segment { t: string; d?: Device[] }
export interface Extract {
  id: string;
  title: string;
  author: string;
  paragraphs: Segment[][];
  ao1: { q: string; options: string[]; answer: number; explain: string }[];
  ao2: { question: string; model: string };
}

export const EXTRACTS: Extract[] = [
  {
    id: 'athlete', title: 'Every Champion Was a Beginner', author: 'Jaden Cole, a young swimmer',
    paragraphs: [
      [{ t: 'I was nine years old when I came last in my first swimming gala.', d: ['Anecdote'] }, { t: 'Last out of eight.', d: ['Short sentence'] },
        { t: 'I remember climbing out of the pool, dripping and embarrassed, sure that everybody was laughing at me.', d: ['Emotive language'] },
        { t: 'My coach crouched down beside me and said one sentence I have never forgotten: “Every champion was once a beginner.”' }],
      [{ t: 'So I went back.' }, { t: 'I went back on cold mornings. I went back after school. I went back when my friends were playing football in the park.', d: ['Repetition', 'Triadic listing'] },
        { t: 'Training became my lighthouse, guiding me through every stormy week.', d: ['Metaphor'] }],
      [{ t: 'This year alone, I have swum over 3,000 lengths. That is more than 75 kilometres!', d: ['Statistic'] },
        { t: 'It sounds like a mountain, but every mountain is climbed one step at a time.' }],
      [{ t: 'You might think champions are born special.', d: ['Direct address'] }, { t: 'They are not.', d: ['Short sentence'] },
        { t: 'They are ordinary people who are patient, determined and brave enough to keep going.', d: ['Triadic listing'] },
        { t: 'Last summer, I won a national medal. The nine-year-old who came last would never have believed it.' }],
      [{ t: 'So, what is your swimming pool? What would you love to be brilliant at?', d: ['Rhetorical question', 'Direct address'] },
        { t: 'Start today.', d: ['Imperative'] }, { t: 'You can be a champion too.', d: ['Direct address'] }],
    ],
    ao1: [
      { q: 'Who is the author?', options: ['A swimming coach', 'Jaden Cole, a young swimmer', 'A footballer', 'A teacher'], answer: 1, explain: 'The writer is Jaden Cole, who swims.' },
      { q: 'What happened at Jaden’s first swimming gala?', options: ['He won', 'He came last', 'He didn’t swim', 'He came second'], answer: 1, explain: '“I came last in my first swimming gala.”' },
      { q: 'What did the coach say?', options: ['“Try harder.”', '“Every champion was once a beginner.”', '“Give up.”', '“You were brilliant.”'], answer: 1, explain: 'It is in quotation marks in paragraph 1.' },
      { q: 'How does Jaden feel about training?', options: ['Bored by it', 'It guides and helps him', 'He hates it', 'It is pointless'], answer: 1, explain: 'He calls it “my lighthouse, guiding me”.' },
      { q: 'What can every person be, according to the author?', options: ['A coach', 'A champion', 'Famous', 'A swimmer'], answer: 1, explain: '“You can be a champion too.”' },
    ],
    ao2: {
      question: 'How does the writer inspire the reader to keep going? Use 3–4 references.',
      model: 'At the start of the extract, the writer inspires the reader through the anecdote “I came last in my first swimming gala.” The anecdote suggests that even successful people start by failing, which would make the reader feel less alone if they have failed too.\n\nIn the middle, the writer uses repetition in “I went back… I went back… I went back”. The repeated verb phrase suggests determination and effort, which would inspire the reader to keep trying even when it is hard.\n\nThe writer also uses the metaphor “Training became my lighthouse”. This suggests training guided him safely through difficult times, making the reader see practice as something positive.\n\nFinally, the imperative “Start today” and the direct address “You can be a champion too” speak straight to the reader, which would make them feel motivated to begin right now.',
    },
  },
  {
    id: 'inventor', title: 'Small Ideas, Big Changes', author: 'Priya Shah, a young inventor',
    paragraphs: [
      [{ t: 'When I was eleven, I watched my grandad struggle to open his medicine bottles because of his painful hands.', d: ['Anecdote'] },
        { t: 'Every morning it was the same: twisting, wincing, giving up.', d: ['Triadic listing'] }, { t: 'So I picked up a pencil and started drawing.' }],
      [{ t: 'My first design was terrible. My second design was terrible. My third design was slightly less terrible!', d: ['Repetition'] },
        { t: 'But each failure was a stepping stone, not a brick wall.', d: ['Metaphor'] }],
      [{ t: 'Eventually, I made a simple lever lid that anyone could open with one finger.' },
        { t: 'I tested it with 40 people at my grandad’s lunch club, and 37 of them said it was easier than their old bottles. That is over 90 percent!', d: ['Statistic'] }],
      [{ t: 'People sometimes say inventors are geniuses with laboratories and huge budgets.' },
        { t: 'I had a kitchen table, a glue gun and a lot of cardboard.', d: ['Triadic listing', 'Listing'] }, { t: 'What I really had was curiosity.' }],
      [{ t: 'You don’t need permission to solve a problem.', d: ['Direct address'] }, { t: 'Look around you.', d: ['Imperative'] },
        { t: 'What annoys you? What could be better?', d: ['Rhetorical question'] },
        { t: 'Your idea might be small, but small ideas can change someone’s whole day.', d: ['Direct address'] }],
      [{ t: 'Be curious. Be stubborn. Be an inventor.', d: ['Imperative', 'Repetition', 'Triadic listing'] }],
    ],
    ao1: [
      { q: 'Who is the author?', options: ['A doctor', 'Priya Shah, a young inventor', 'Her grandad', 'A scientist with a laboratory'], answer: 1, explain: 'Priya Shah wrote it.' },
      { q: 'Why did Priya start inventing?', options: ['For a school prize', 'Her grandad struggled to open medicine bottles', 'She was bored', 'Her teacher told her to'], answer: 1, explain: 'Paragraph 1 explains the problem.' },
      { q: 'What did she invent?', options: ['A robot', 'A lever lid that opens with one finger', 'A new medicine', 'A glue gun'], answer: 1, explain: '“a simple lever lid that anyone could open with one finger.”' },
      { q: 'How does Priya feel about failing?', options: ['It is a stepping stone to success', 'It means you should stop', 'It is embarrassing', 'She never failed'], answer: 0, explain: '“each failure was a stepping stone, not a brick wall.”' },
      { q: 'What does she say she really had?', options: ['Money', 'A laboratory', 'Curiosity', 'Lots of help'], answer: 2, explain: '“What I really had was curiosity.”' },
    ],
    ao2: {
      question: 'How does the writer inspire the reader to solve problems? Use 3–4 references.',
      model: 'At the start of the extract, the writer inspires the reader through the anecdote about her grandad struggling with “his medicine bottles”. The anecdote suggests that inventions can come from caring about real people, which would make the reader feel that they could help someone too.\n\nThe writer uses repetition in “My first design was terrible. My second design was terrible.” This suggests failure is normal, which would reassure the reader not to give up after mistakes.\n\nThe metaphor “each failure was a stepping stone, not a brick wall” suggests failure helps you move forward rather than stopping you, making the reader see mistakes positively.\n\nFinally, the imperatives in the triadic list “Be curious. Be stubborn. Be an inventor.” command the reader directly, which would leave them feeling energised and ready to start.',
    },
  },
  {
    id: 'campaigner', title: 'Young Voices Matter', author: 'Sam Ellis, a young campaigner',
    paragraphs: [
      [{ t: 'People often tell me I am too young to make a difference.' }, { t: 'I disagree.', d: ['Short sentence'] }],
      [{ t: 'Two years ago, my best friend was knocked off his bike on the road outside our school.', d: ['Anecdote'] },
        { t: 'He was fine, thankfully, but I was furious.', d: ['Emotive language'] },
        { t: 'That evening I started my first campaign, Ride Safe, asking the council for a proper cycle lane.' },
        { t: 'I wrote letters. I made posters. I spoke at a meeting full of adults, my knees shaking the whole time.', d: ['Listing', 'Repetition'] }],
      [{ t: 'We collected 1,200 signatures in six weeks.', d: ['Statistic'] }, { t: 'Last spring, the cycle lane opened.' }],
      [{ t: 'Then I started Ditch the Straw, to stop our canteen using plastic straws. Within a term, the whole school had switched to paper.' }],
      [{ t: 'Campaigning is not always easy.' }, { t: 'Some days, my inbox is a battlefield.', d: ['Metaphor'] },
        { t: 'But I love it, because every small win proves that young voices matter.' }],
      [{ t: 'You have a voice. You have ideas. You have the power to change things.', d: ['Direct address', 'Repetition', 'Triadic listing'] },
        { t: 'Find something you care about, and speak up.', d: ['Imperative'] },
        { t: 'Every person can be a changemaker, and that includes you.', d: ['Direct address'] }],
    ],
    ao1: [
      { q: 'Who is the author?', options: ['A council worker', 'Sam Ellis, a young campaigner', 'Sam’s best friend', 'A head teacher'], answer: 1, explain: 'Sam Ellis is the campaigner writing.' },
      { q: 'What campaigns are mentioned?', options: ['Save the Bees and Clean Beaches', 'Ride Safe and Ditch the Straw', 'Ride Safe only', 'Ban Homework'], answer: 1, explain: 'Ride Safe (cycle lane) and Ditch the Straw (plastic straws).' },
      { q: 'How does the narrator feel about their work?', options: ['They love it, even though it isn’t always easy', 'They find it boring', 'They want to stop', 'They think it is pointless'], answer: 0, explain: '“Campaigning is not always easy… But I love it.”' },
      { q: 'How many signatures did Ride Safe collect?', options: ['120', '1,200', '12,000', '600'], answer: 1, explain: '“We collected 1,200 signatures in six weeks.”' },
      { q: 'What can every person be, according to the author?', options: ['A champion', 'A changemaker', 'A councillor', 'Famous'], answer: 1, explain: '“Every person can be a changemaker.”' },
    ],
    ao2: {
      question: 'How does the writer inspire young people to make a difference? Use 3–4 references.',
      model: 'At the start of the extract, the writer inspires the reader through the short sentence “I disagree.” The short sentence suggests confidence and determination, which would make young readers feel they shouldn’t accept being told they are too young.\n\nThe writer uses the statistic “1,200 signatures in six weeks”. This suggests that a young person’s campaign can gain huge support quickly, which would make the reader believe their actions could really work.\n\nThe metaphor “my inbox is a battlefield” suggests campaigning can be a struggle, but because Sam keeps going, the reader is inspired to be resilient too.\n\nFinally, the repetition and triadic listing in “You have a voice. You have ideas. You have the power…” directly address the reader, which would make them feel powerful and ready to speak up.',
    },
  },
];

export const ALL_DEVICES: Device[] = ['Metaphor', 'Short sentence', 'Listing', 'Triadic listing', 'Anecdote', 'Statistic', 'Repetition',
  'Simile', 'Direct address', 'Rhetorical question', 'Emotive language', 'Superlative', 'Imperative'];

// ---------------------------------------------------------------------------
// SPaG Lab "fix the sentence" drills. `fixes` are the accepted corrections.
// ---------------------------------------------------------------------------
export const SPAG_DRILLS: { wrong: string; fixes: string[]; rule: string }[] = [
  { wrong: 'my friend lives in london', fixes: ['My friend lives in London.'], rule: 'Capital letters for the start of a sentence and place names; end with a full stop.' },
  { wrong: 'Their going to win the match.', fixes: ['They’re going to win the match.', "They're going to win the match."], rule: 'They’re = they are.' },
  { wrong: 'I dont like sprouts.', fixes: ['I don’t like sprouts.', "I don't like sprouts."], rule: 'Apostrophe for omission: do not → don’t.' },
  { wrong: 'The dog chased it’s tail.', fixes: ['The dog chased its tail.'], rule: 'Its = belonging to it (no apostrophe).' },
  { wrong: 'Where are you going.', fixes: ['Where are you going?'], rule: 'A question needs a question mark.' },
  { wrong: 'I bought apples pears bananas and grapes.', fixes: ['I bought apples, pears, bananas and grapes.', 'I bought apples, pears, bananas, and grapes.'], rule: 'Commas separate items in a list.' },
  { wrong: 'I was tired, I went to bed.', fixes: ['I was tired. I went to bed.', 'I was tired; I went to bed.', 'I was tired, so I went to bed.'], rule: 'Don’t join two sentences with a comma (comma splice).' },
  { wrong: 'Sams bike is red.', fixes: ['Sam’s bike is red.', "Sam's bike is red."], rule: 'Apostrophe for possession: the bike belongs to Sam.' },
  { wrong: 'Your the best!', fixes: ['You’re the best!', "You're the best!"], rule: 'You’re = you are.' },
  { wrong: 'i went to the park on saturday.', fixes: ['I went to the park on Saturday.'], rule: '"I" and days of the week always need capitals.' },
  { wrong: 'She said, I love reading.', fixes: ['She said, “I love reading.”', 'She said, "I love reading."'], rule: 'Speech marks go around the spoken words.' },
  { wrong: 'I ate to much cake.', fixes: ['I ate too much cake.'], rule: 'Too = excessively.' },
  { wrong: 'What an amazing goal.', fixes: ['What an amazing goal!'], rule: 'An exclamation mark shows strong feeling.' },
  { wrong: 'You will need three things a pen, a ruler and a rubber.', fixes: ['You will need three things: a pen, a ruler and a rubber.'], rule: 'A colon introduces a list.' },
  { wrong: 'Its raining today.', fixes: ['It’s raining today.', "It's raining today."], rule: 'It’s = it is.' },
  { wrong: 'The girls coats were wet.', fixes: ['The girls’ coats were wet.', "The girls' coats were wet.", 'The girl’s coats were wet.', "The girl's coats were wet."], rule: 'Plural possession: the apostrophe goes after the s (girls’).' },
  { wrong: 'I could of won.', fixes: ['I could have won.', 'I could’ve won.', "I could've won."], rule: '"Could of" is wrong: it’s could have (could’ve).' },
  { wrong: 'we was late for school.', fixes: ['We were late for school.'], rule: 'Capital letter, and "we were" (not "we was").' },
  { wrong: 'There are two many people here.', fixes: ['There are too many people here.'], rule: 'Too = excessively; two = the number 2.' },
  { wrong: 'I love football it keeps me fit.', fixes: ['I love football; it keeps me fit.', 'I love football. It keeps me fit.', 'I love football because it keeps me fit.'], rule: 'Two full sentences need a full stop, semicolon or joining word.' },
];
