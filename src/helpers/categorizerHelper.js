module.exports = {
    categories: {
        'util': '🔧 Utility',
        'git': ' 🐈‍⬛ Git',
    },

    getCategoryName(folderName) {
        return this.categories[folderName] || `📁 ${folderName}`;
    }
};
