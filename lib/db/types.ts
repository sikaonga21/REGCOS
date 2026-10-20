export type PostStatus = 'draft' | 'published' | 'archived';
export type EventType = 'school' | 'holiday' | 'event' | 'meeting' | 'deadline';
export type EventStatus = 'scheduled' | 'cancelled' | 'completed';
export type EnrollmentStatus = 'new' | 'reviewing' | 'accepted' | 'waitlist' | 'declined';
export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_minutes: number;
  featured_image: string | null;
  featured_image_alt: string;
  featured_images: string[];
  tags: string[];
  seo_title: string;
  seo_description: string;
  status: PostStatus;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  event_type: EventType;
  status: EventStatus;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  child_name: string;
  child_dob: string;
  gender: string;
  guardian_name: string;
  email: string;
  phone: string;
  start_date: string;
  status: EnrollmentStatus;
  notes: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  alt: string;
  folder: string;
  created_at: string;
};

export type GalleryPhotoRow = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  width: number;
  height: number;
  sort_order: number;
  published: boolean;
  highlight: boolean;
  created_at: string;
  updated_at: string;
};

export type AuditEntry = {
  id: number;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: string;
  created_at: string;
};

export const POST_CATEGORIES = [
  'School News',
  'Faith & Values',
  'Academic Life',
  'Sports & Wellbeing',
  'Arts & Creativity',
  'Community',
  'Admissions',
] as const;

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  school: '#063B82',
  holiday: '#D71920',
  event: '#FFD400',
  meeting: '#0d4fa8',
  deadline: '#b81118',
};
