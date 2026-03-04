interface Categories {
    [key: string]: string;
}

const categories: Categories = {
    git: ' 🐈‍⬛ Git',
    image: '🖼️ Image',
    moderation: '🛡️ Moderation',
    settings: '⚙️ Settings',
    tickets: '🎫 Tickets',
    util: '🔧 Utility',
};

export const categorizer = {
    categories,
    getCategoryName(folderName: string): string {
        return categories[folderName] || `📁 ${folderName}`;
    }
};
