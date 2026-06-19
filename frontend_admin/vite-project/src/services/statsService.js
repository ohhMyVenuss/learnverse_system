const MOCK_STATS = {
    students: 20000,
    courses: 1205,
    subjects: 56,
    forumTopics: 968
};

const statsService = {
    getStats() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_STATS);
            }, 500);
        });
    }
};

export default statsService;