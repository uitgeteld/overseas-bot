module.exports = {
    categories: {
        'util': '🔧 Utility',
        'level': '📊 Leveling',
    },

    getCategoryName(folderName) {
        return this.categories[folderName] || `📁 ${folderName}`;
    }
};
