document.addEventListener('DOMContentLoaded', () => {
    const wordCountForm = document.getElementById('wordCountForm');
    const websiteUrlInput = document.getElementById('websiteUrl');
    const wordCountResult = document.getElementById('wordCountResult');
    const searchHistory = document.getElementById('searchHistory');
    

    // Add event listener to the form
    wordCountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let websiteUrl = websiteUrlInput.value;

        // Check if the URL starts with "http://" or "https://"
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            // If not, add "http://" as the default protocol
            websiteUrl = 'http://' + websiteUrl;
        }

        // Make an API request to count words, extract links, and check favorite status
        const response = await fetch('/api/count-words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteUrl }),
        });

        if (response.ok) {
            const data = await response.json();
            //wordCountResult.innerHTML = ``;
            websiteUrlInput.value = '';

            // Add the result to the search history
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.websiteUrl}</td>
                <td>${data.wordCount}</td>
                <td>${data.links.join(', ')}</td>
                <td>${data.mediaLinks.join(', ')}</td>
                <td class="favoriteStatus">${data.isFavorite ? 'True' : 'False'}</td>
                <td>
                    <button class="favoriteButton">${data.isFavorite ? 'Remove from Favorite' : 'Add to Favorite'}</button>
                </td>
            `;
            searchHistory.appendChild(row);

            // Add event listener to the "Toggle Favorite" button
            const favoriteButton = row.querySelector('.favoriteButton');
            favoriteButton.addEventListener('click', async () => {
                const toggleResponse = await fetch('/api/toggle-favorite', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ websiteUrl: data.websiteUrl }),
                });

                if (toggleResponse.ok) {
                    const toggleData = await toggleResponse.json();
                    data.isFavorite = toggleData.isFavorite;
                    const favoriteStatus = row.querySelector('.favoriteStatus');
                    favoriteStatus.textContent = data.isFavorite ? 'True' : 'False';
                    favoriteButton.textContent = data.isFavorite ? 'Remove from Favorite' : 'Add to Favorite';
                }
            });
        }
    });

    // Fetch and display the search history
    async function fetchSearchHistory() {
        const response = await fetch('/api/search-history');
        if (response.ok) {
            const history = await response.json();
            for (const entry of history) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.websiteUrl}</td>
                    <td>${entry.wordCount}</td>
                    <td>${entry.links.join(', ')}</td>
                    <td>${entry.mediaLinks.join(', ')}</td>
                    <td class="favoriteStatus">${entry.isFavorite ? 'True' : 'False'}</td>
                    <td>
                        <button class="favoriteButton" style="background-color: light border:none ">${entry.isFavorite ? 'Remove from Favorite' : 'Add to Favorite'}</button>
                    </td>
                `;
                searchHistory.appendChild(row); 

                // Add event listener to the "Toggle Favorite" button
                const favoriteButton = row.querySelector('.favoriteButton');
                favoriteButton.addEventListener('click', async () => {
                    const toggleResponse = await fetch('/api/toggle-favorite', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ websiteUrl: entry.websiteUrl }),
                    });

                    if (toggleResponse.ok) {
                        const toggleData = await toggleResponse.json();
                        entry.isFavorite = toggleData.isFavorite;
                        const favoriteStatus = row.querySelector('.favoriteStatus');
                        favoriteStatus.textContent = entry.isFavorite ? 'True' : 'False';
                        favoriteButton.textContent = entry.isFavorite ? 'Remove from Favorite' : 'Add to Favorite';
                    }
                });
            }
        }
    }

    fetchSearchHistory();
});
