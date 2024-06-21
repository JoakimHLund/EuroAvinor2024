document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('leaderboard');

    // Define the column headers
    const headers = [
        'Rank',
        'Player Name',
        'Total Points',
        'Total Match Point',
        'Total Bonus Point',
        'Total Correct Prediction (Group Stages)',
        'Total Match Point (Group Stages)',
        'Total Correct Prediction (Group Stages)',
        'Bonus Points From Qualified Countries',
        'Total Match Point (Knock Out Stages)',
        'Correct Pairing & Champion\'s Pick',
        'Total Correct Prediction (Knock Out Stages)'
    ];

    // Add header row to the table
    const headerRow = table.insertRow();
    headers.forEach(header => {
        const cell = document.createElement('th');
        cell.innerText = header;
        headerRow.appendChild(cell);
    });

    // Function to read Excel file and return data
    function loadExcelData(url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = 'Player Leaderboard';
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

                // Skip the first few rows to reach the actual data
                const dataStartIndex = 8;
                const cleanedData = jsonData.slice(dataStartIndex).filter(row => row.length);

                // Filter out rows where the player name starts with "Player"
                return cleanedData.filter(row => row[1] && !row[1].startsWith('Player'));
            })
            .catch(error => console.error('Error loading Excel file:', error));
    }

    // Function to merge data from multiple files, sort, rank, and populate the table
    async function loadAndCombineData() {
        try {
            const data1 = await loadExcelData('Euro 2024 Spill PMK 1.xlsx');
            const data2 = await loadExcelData('Euro 2024 Spill PMK 2.xlsx');
            const data3 = await loadExcelData('Euro 2024 Spill Others 1.xlsx');

            const combinedData = [...data1, ...data2, ...data3];

            // Sort combined data by Total Points (3rd column in the data)
            combinedData.sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));

            // Assign ranks considering ties
            let rank = 1;
            let previousScore = null;
            combinedData.forEach((row, index) => {
                if (previousScore !== null && parseFloat(row[2]) !== previousScore) {
                    rank = index + 1;
                }
                previousScore = parseFloat(row[2]);

                const tableRow = table.insertRow();

                // Apply background color based on rank
                if (rank === 1) {
                    tableRow.style.backgroundColor = '#FFD700'; // light gold
                } else if (rank === 2) {
                    tableRow.style.backgroundColor = '#C0C0C0'; // silver
                } else if (rank === 3) {
                    tableRow.style.backgroundColor = '#CD7F32'; // bronze
                }

                headers.forEach((header, headerIndex) => {
                    const cell = tableRow.insertCell();
                    if (headerIndex === 0) {
                        cell.innerText = rank; // Insert rank number
                    } else if (headerIndex === 1) {
                        // Create a link for the player's name
                        const link = document.createElement('a');
                        link.href = `player.html?player=${encodeURIComponent(row[headerIndex])}`;
                        link.innerText = row[headerIndex];
                        cell.appendChild(link);
                    } else {
                        cell.innerText = row[headerIndex] || '';
                    }
                });
            });
        } catch (error) {
            console.error('Error combining data:', error);
        }
    }

    loadAndCombineData();
});
