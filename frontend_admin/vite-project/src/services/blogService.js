const MOCK_BLOGS = [
  {
    id: 1,
    title: "Mastering Programming with a Technical Mentor",
    excerpt: "Learning to code can be overwhelming, but a mentor can make the journey smoother and faster by providing guidance.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Reni Sarow",
      avatar: "https://i.pravatar.cc/150?u=20"
    },
    date: "09 Aug 2025"
  },
  {
    id: 2,
    title: "How to Level Up Your Coding Skills with the Help of a Mentor",
    excerpt: "Whether you're a beginner or an advanced coder, this blog will explore how mentorship can accelerate your career.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Christoper Daniel",
      avatar: "https://i.pravatar.cc/150?u=30"
    },
    date: "15 Jul 2025"
  },
  {
    id: 3,
    title: "Navigating the Tech World: The Ultimate Guide",
    excerpt: "The tech industry is vast and ever-changing, but a mentor can help you stay ahead of the curve and find your path.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Andrew Jerm",
      avatar: "https://i.pravatar.cc/150?u=40"
    },
    date: "20 Jun 2025"
  },
  // Thêm bài thứ 4 để test slider
  {
    id: 4,
    title: "The Future of AI in Education",
    excerpt: "Discover how Artificial Intelligence is reshaping the way we learn, teach, and assess knowledge in the modern era.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Sarah Smith",
      avatar: "https://i.pravatar.cc/150?u=50"
    },
    date: "10 Jun 2025"
  }
];

const blogService = {
  getLatestBlogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_BLOGS);
      }, 600);
    });
  }
};

export default blogService;