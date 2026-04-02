interface Categories {
    [key: string]: string;
}

const categories: Categories = {
    git: ' 🐈‍⬛ Git',
    image: '🖼️ Image',
    moderation: '🛡️ Moderation',
    settings: '⚙️ Settings',
    util: '🔧 Utility',
};

export const categorizer = {
    categories,
    getCategoryName(folderName: string): string {
        return categories[folderName] || `📁 ${folderName}`;
    }
};
