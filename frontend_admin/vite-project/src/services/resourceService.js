import { MOCK_RESOURCES, CATEGORIES } from '../data/mockData';

const resourceService = {

    getCategories() {
        return new Promise((resolve) =>{
            setTimeout(() => resolve(CATEGORIES), 300);
        });
    },

    getResources(categoryId = 'all') {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (categoryId === 'all') {
          resolve(MOCK_RESOURCES);
        } else {
          const filtered = MOCK_RESOURCES.filter(item => item.category_id === categoryId);
          resolve(filtered);
        }
      }, 1000); 
    });
  }

};

export default resourceService;