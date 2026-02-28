interface Categories {
    [key: string]: string;
}

const categories: Categories = {
    util: '🔧 Utility',
    git: ' 🐈‍⬛ Git',
    moderation: '🛡️ Moderation',
    image: '🖼️ Image',
};

export const categorizer = {
    categories,
    getCategoryName(folderName: string): string {
        return categories[folderName] || `📁 ${folderName}`;
    }
};
