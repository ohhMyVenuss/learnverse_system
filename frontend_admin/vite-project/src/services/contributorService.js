
// (Mock Data) chuẩn bị cho API
const MOCK_CONTRIBUTORS = [
  {
    id: 1,
    name: "Joyce Pence",
    role: "Lead Designer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    rating: 5.0,
    reviews: 210,
    is_verified: true,
    socials: { facebook: "#", instagram: "#", twitter: "#", youtube: "#", linkedin: "#" }
  },
  {
    id: 2,
    name: "Edith Dorsey",
    role: "Accountant",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    rating: 4.9,
    reviews: 20,
    is_verified: true,
    socials: { facebook: "#", instagram: "#", twitter: "#", youtube: "#", linkedin: "#" }
  },
  {
    id: 3,
    name: "Ruben Holmes",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    rating: 4.8,
    reviews: 157,
    is_verified: true,
    socials: { facebook: "#", instagram: "#", twitter: "#", youtube: "#", linkedin: "#" }
  },
  {
    id: 4,
    name: "Carol Magner",
    role: "Lead Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    rating: 5.0,
    reviews: 218,
    is_verified: true,
    socials: { facebook: "#", instagram: "#", twitter: "#", youtube: "#", linkedin: "#" }
  },
  // Thêm data để test slider
  {
    id: 5,
    name: "Sarah Jenkins",
    role: "Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    rating: 4.7,
    reviews: 120,
    is_verified: true,
    socials: { facebook: "#", instagram: "#", twitter: "#", youtube: "#", linkedin: "#" }
  }
];

const contributorService = {
  getTopContributors() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CONTRIBUTORS);
      }, 800); // Giả lập độ trễ mạng
    });
  }
};

export default contributorService;