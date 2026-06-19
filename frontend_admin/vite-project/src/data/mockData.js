export const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'dev', name: 'Development' },
  { id: 'ui-ux', name: 'UI/UX Design' },
  { id: 'graphic', name: 'Graphic Design' },
  { id: 'framework', name: 'Framework' },
  { id: 'general', name: 'General' }
];

export const MOCK_RESOURCES = [
  {
    id: 1,
    title: "Information About UI/UX Design Degree",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=80",
    author: { name: "Brenda Slaton", avatar: "https://i.pravatar.cc/150?u=1" },
    category_id: 'ui-ux', // ID dùng để lọc
    category_label: "Design", // Label hiển thị (Badge)
    badge_color: "bg-orange-100 text-orange-600",
    tags: ["Design", "Xd"],
    rating: 4.9,
    reviews: 200
  },
  {
    id: 2,
    title: "The Complete Business and Management Course",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80",
    author: { name: "David Benitez", avatar: "https://i.pravatar.cc/150?u=2" },
    category_id: 'general',
    category_label: "Productivity",
    badge_color: "bg-gray-100 text-gray-600",
    tags: ["Interactive", "Influencer"],
    rating: 5.0,
    reviews: 210
  },
  {
    id: 3,
    title: "Learn & Create ReactJS Tech Fundamentals Apps",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=500&q=80",
    author: { name: "Calvin Johnsen", avatar: "https://i.pravatar.cc/150?u=3" },
    category_id: 'dev',
    category_label: "Development",
    badge_color: "bg-blue-100 text-blue-600",
    tags: ["ReactJS", "Master"],
    rating: 5.0,
    reviews: 154
  },
  {
    id: 4,
    title: "Build Creative Arts & Media Course Completed",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
    author: { name: "Edith Dorsey", avatar: "https://i.pravatar.cc/150?u=4" },
    category_id: 'graphic',
    category_label: "Lifestyles",
    badge_color: "bg-yellow-100 text-yellow-600",
    tags: ["Lifestyle", "Mentor"],
    rating: 4.9,
    reviews: 178
  },
  // Thêm một vài item khác để test bộ lọc
  {
    id: 5,
    title: "Advanced Python for Data Science",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80",
    author: { name: "Sarah Smith", avatar: "https://i.pravatar.cc/150?u=5" },
    category_id: 'dev',
    category_label: "Coding",
    badge_color: "bg-green-100 text-green-600",
    tags: ["Python", "Data"],
    rating: 4.8,
    reviews: 120
  }
];