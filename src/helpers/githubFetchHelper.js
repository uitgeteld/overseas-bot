function githubFetch(url) {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return fetch(url, { headers });
}

module.exports = githubFetch;
