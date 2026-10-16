export type GalleryCategory =
  | 'Classrooms'
  | 'Music'
  | 'Technology'
  | 'Playtime'
  | 'Mealtimes'
  | 'Faith'
  | 'Our Team';

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  /** Intrinsic size of the optimised file, used to reserve space and avoid layout shift. */
  width: number;
  height: number;
};

export const galleryCategories: GalleryCategory[] = [
  'Classrooms',
  'Music',
  'Technology',
  'Playtime',
  'Mealtimes',
  'Faith',
  'Our Team',
];

export const galleryPhotos: GalleryPhoto[] = [
  {
    src: '/images/gallery/staff-team.jpg',
    alt: 'Regcos Christian Academy staff standing together outside the school entrance',
    caption: 'Our teaching team at the academy entrance',
    category: 'Our Team',
    width: 1920,
    height: 1440,
  },
  {
    src: '/images/gallery/classroom-hands-up.jpg',
    alt: 'Pupils raising their hands to answer a question in class',
    caption: 'Every hand up — curiosity in action',
    category: 'Classrooms',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/teacher-maths-lesson.jpg',
    alt: 'A teacher leading a lesson on telling the time at the whiteboard',
    caption: 'Learning to tell the time',
    category: 'Classrooms',
    width: 1920,
    height: 1371,
  },
  {
    src: '/images/gallery/classroom-writing.jpg',
    alt: 'Learners writing in their exercise books at their desks',
    caption: 'Focused writing practice',
    category: 'Classrooms',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/classroom-smile.jpg',
    alt: 'A smiling pupil looking up from her desk during class',
    caption: 'Happy learners, happy classrooms',
    category: 'Classrooms',
    width: 1920,
    height: 1371,
  },
  {
    src: '/images/gallery/early-years-class.jpg',
    alt: 'Young children gathered around a table in the early years classroom',
    caption: 'Our early years room',
    category: 'Classrooms',
    width: 1920,
    height: 1371,
  },
  {
    src: '/images/gallery/music-class.jpg',
    alt: 'Children playing recorders together in the school music room',
    caption: 'Recorder practice in the music room',
    category: 'Music',
    width: 1920,
    height: 1080,
  },
  {
    src: '/images/gallery/violin-ensemble.jpg',
    alt: 'A pupil playing the violin while a classmate sits at the drum kit',
    caption: 'Strings and drums, side by side',
    category: 'Music',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/violin-practice.jpg',
    alt: 'A young violinist concentrating during a music lesson',
    caption: 'Finding the note',
    category: 'Music',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/violin-portrait.jpg',
    alt: 'A pupil holding a violin and bow during music club',
    caption: 'Talent nurtured from the start',
    category: 'Music',
    width: 1068,
    height: 1600,
  },
  {
    src: '/images/gallery/ict-lab-typing.jpg',
    alt: 'Pupils typing at desktop computers in the ICT lab',
    caption: 'Keyboard skills in the ICT lab',
    category: 'Technology',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/ict-lab-duo.jpg',
    alt: 'Two pupils smiling at their computers in the ICT lab',
    caption: 'Learning is better together',
    category: 'Technology',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/ict-lab-smile.jpg',
    alt: 'A pupil smiling beside a computer monitor in the ICT lab',
    caption: 'Confident with technology',
    category: 'Technology',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/ict-lab-girl.jpg',
    alt: 'A pupil at her workstation during a computer lesson',
    caption: 'Digital skills from an early age',
    category: 'Technology',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/playground-group.jpg',
    alt: 'A large group of pupils on the lawn in front of the school playground',
    caption: 'Our youngest classes on the playground lawn',
    category: 'Playtime',
    width: 1200,
    height: 1600,
  },
  {
    src: '/images/gallery/playground-trampoline.jpg',
    alt: 'Children jumping on the trampoline in the school playground',
    caption: 'Break time on the trampoline',
    category: 'Playtime',
    width: 1200,
    height: 1600,
  },
  {
    src: '/images/gallery/lunch-hall.jpg',
    alt: 'Pupils eating their packed lunches at colourful tables',
    caption: 'Lunchtime together',
    category: 'Mealtimes',
    width: 1920,
    height: 1282,
  },
  {
    src: '/images/gallery/lunch-preschool.jpg',
    alt: 'Two young pupils with their lunch boxes at a preschool table',
    caption: 'Our youngest at the lunch table',
    category: 'Mealtimes',
    width: 1920,
    height: 1371,
  },
  {
    src: '/images/gallery/lunch-box.jpg',
    alt: 'A pupil opening her lunch box at school',
    caption: 'Packed lunch, well earned',
    category: 'Mealtimes',
    width: 1143,
    height: 1600,
  },
  {
    src: '/images/gallery/lunch-snack.jpg',
    alt: 'A pupil enjoying a snack during the lunch break',
    caption: 'A break in the day',
    category: 'Mealtimes',
    width: 1143,
    height: 1600,
  },
  {
    src: '/images/gallery/grace-before-meal.jpg',
    alt: 'Children with hands together saying grace before their meal',
    caption: 'Saying grace before we eat',
    category: 'Faith',
    width: 1920,
    height: 1371,
  },
  {
    src: '/images/gallery/prayer-time.jpg',
    alt: 'Pupils praying quietly at their classroom tables',
    caption: 'Prayer is part of every day',
    category: 'Faith',
    width: 1920,
    height: 1372,
  },
];

/**
 * Photos for the collage on the home page. Five tiles is deliberate: the lead tile
 * spans 2x2, so five fills a four-column grid exactly two rows deep.
 */
export const galleryHighlights: GalleryPhoto[] = [
  '/images/gallery/classroom-hands-up.jpg',
  '/images/gallery/violin-ensemble.jpg',
  '/images/gallery/ict-lab-duo.jpg',
  '/images/gallery/playground-group.jpg',
  '/images/gallery/grace-before-meal.jpg',
]
  .map((src) => galleryPhotos.find((photo) => photo.src === src))
  .filter((photo): photo is GalleryPhoto => Boolean(photo));
