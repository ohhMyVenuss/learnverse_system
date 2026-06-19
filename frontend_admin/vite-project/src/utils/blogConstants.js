// Constants cho BlogPage và các component liên quan

export const roleStyles = {
  admin: {
    label: 'Admin',
    badgeClass: 'bg-red-100 text-red-600',
  },
  instructor: {
    label: 'Instructor',
    badgeClass: 'bg-sky-100 text-sky-600',
  },
  student: {
    label: 'Student',
    badgeClass: 'bg-amber-100 text-amber-600',
  },
};

export const filters = [
  { id: 'all', label: 'All posts' },
  { id: 'trending', label: 'Trending' },
  { id: 'answered', label: 'Best answer picked' },
  { id: 'unanswered', label: 'Needs answers' },
];

export const highlightTopics = [
  { id: 't1', title: 'Meta prompt kit', description: '12 prompt ideas to boost AI tutors' },
  { id: 't2', title: 'Classroom rituals', description: 'Week-one onboarding checklist' },
  { id: 't3', title: 'Design critique', description: 'Four-step feedback framework' },
];

export const topContributors = [
  { id: 1, name: 'Nhan Vo', role: 'admin', contributions: 128 },
  { id: 2, name: 'Thuy Lam', role: 'instructor', contributions: 94 },
  { id: 3, name: 'Quang Pham', role: 'student', contributions: 73 },
];

// Mock user - sẽ được thay thế bằng user thật từ AuthContext sau này
export const mockCurrentUser = {
  id: 'user-001',
  name: 'Evelyn Tran',
  role: 'instructor',
  avatar: 'https://i.pravatar.cc/150?u=evelyn',
};

