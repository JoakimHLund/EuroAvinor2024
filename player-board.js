document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#game-board-table tbody');
    const knockOffTableBody = document.querySelector('#knock-off-games-table tbody');
    const playerNameElement = document.getElementById('player-name');
    const totalScoreElement = document.getElementById('total-score');
    const pointsElement = document.getElementById('points');
    const bonusElement = document.getElementById('bonus');
    const playerConfig = window.playerConfig;

    // Set the player name in the header
    playerNameElement.textContent = playerConfig.playerName;

    // Function to read Excel file and display specific range of data
    function loadExcelData(url, sheetName, dataRange) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[sheetName];

                // Extract the specific range of data from the worksheet
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    range: dataRange,
                    raw: false
                });

                return jsonData;
            })
            .catch(error => console.error('Error loading Excel file:', error));
    }

    // Function to populate table with data
    function populateTable(data, tableBody, startRow, endRow) {
        data.forEach((row, index) => {
            if (index >= startRow && index <= endRow) {
                const tableRow = tableBody.insertRow();
                
                const team1 = tableRow.insertCell();
                team1.innerText = row[1] || '';
                
                const goals1 = tableRow.insertCell();
                goals1.innerText = row[2] || '';
                
                const goals2 = tableRow.insertCell();
                goals2.innerText = row[3] || '';
                
                const team2 = tableRow.insertCell();
                team2.innerText = row[4] || '';
                
                const points = tableRow.insertCell();
                points.innerText = row[8] || '';
            }
        });
    }

    // Function to populate overview with data
    function populateOverview(data) {
        const overviewRow = data[1]; // Second row (index 1)

        if (overviewRow) {
            totalScoreElement.innerText = overviewRow[7] || '0';
            pointsElement.innerText = overviewRow[8] || '0';
            bonusElement.innerText = overviewRow[9] || '0';
        } else {
            totalScoreElement.innerText = '0';
            pointsElement.innerText = '0';
            bonusElement.innerText = '0';
        }
    }

    async function loadAndDisplayData() {
        try {
            const excelFilePath = `../${playerConfig.excelFile}`;
            const data = await loadExcelData(excelFilePath, playerConfig.sheetName, playerConfig.dataRange);
            populateOverview(data);
            populateTable(data, tableBody, 4, 39); // Group stage games
            populateTable(data, knockOffTableBody, 55, 69); // Knock off games
        } catch (error) {
            console.error('Error displaying data:', error);
        }
    }

    loadAndDisplayData();
});
