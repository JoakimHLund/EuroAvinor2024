document.addEventListener('DOMContentLoaded', function () {
    let countryFlags = {};

    // Fetch country flags JSON
    fetch('country-flags.json')
        .then(response => response.json())
        .then(data => {
            countryFlags = data;
            initPlayerBoard();
        })
        .catch(error => console.error('Error loading country flags:', error));

    function initPlayerBoard() {
        if (!window.playerConfig) {
            console.error('Player configuration not loaded.');
            return;
        }

        const playerNameElement = document.getElementById('player-name');
        const totalScoreElement = document.getElementById('total-score');
        const pointsElement = document.getElementById('points');
        const bonusElement = document.getElementById('bonus');
        const tableBody = document.querySelector('#game-board-table tbody');
        const knockOffTableBody = document.querySelector('#knock-off-games-table tbody');
        const groupPredictionsTableBody = document.querySelector('#group-predictions-table tbody');

        const playerConfig = window.playerConfig;

        playerNameElement.textContent = playerConfig.playerName;

        function loadExcelData(url, sheetName, dataRange) {
            return fetch(url)
                .then(response => response.arrayBuffer())
                .then(data => {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[sheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        range: dataRange,
                        raw: false
                    });

                    return jsonData;
                })
                .catch(error => console.error('Error loading Excel file:', error));
        }

        function createFlagImage(countryName) {
            const flagCode = countryFlags[countryName];
            const container = document.createElement('span');
            container.classList.add('country-container');

            const nameSpan = document.createElement('span');
            nameSpan.innerText = countryName;

            if (flagCode) {
                const img = document.createElement('img');
                img.src = `img/flag/${flagCode}.svg`;
                img.alt = countryName;
                img.classList.add('flag-img');
                container.appendChild(img);
            }

            container.appendChild(nameSpan);
            return container;
        }

        function populateTable(data, tableBody, startRow, endRow) {
            data.forEach((row, index) => {
                if (index >= startRow && index <= endRow) {
                    const tableRow = tableBody.insertRow();

                    const team1 = tableRow.insertCell();
                    team1.appendChild(createFlagImage(row[1]));

                    const goals1 = tableRow.insertCell();
                    goals1.innerText = row[2] || '';

                    const goals2 = tableRow.insertCell();
                    goals2.innerText = row[3] || '';

                    const team2 = tableRow.insertCell();
                    team2.appendChild(createFlagImage(row[4]));

                    const points = tableRow.insertCell();
                    points.innerText = row[8] || '';
                    
                    const bonus = tableRow.insertCell(); // Add this line to include the Bonus column
                    bonus.innerText = row[9] || ''; // Assuming the bonus is the next column after points
                }
            });
        }

        function populateOverview(data) {
            const overviewRow = data[1];

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

        function populateGroupPredictions(data, allData) {
            const groupNames = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F"];
            const actualResultsStartRow = 50; // Adjust this if the actual results start at a different row
            data.slice(45, 51).forEach((row, index) => {
                const tableRow = groupPredictionsTableBody.insertRow();

                const groupNameCell = tableRow.insertCell();
                groupNameCell.innerText = groupNames[index];

                const actualRow = allData[actualResultsStartRow + index]; // Actual results row

                const firstPlaceCell = tableRow.insertCell();
                if (row[1] === actualRow[3]) {
                    firstPlaceCell.style.backgroundColor = 'lightgreen';
                } else if (row[1] === actualRow[6] || row[1] === actualRow[9]) {
                    firstPlaceCell.style.backgroundColor = 'lightyellow';
                }
                firstPlaceCell.appendChild(createFlagImage(row[1]));

                const secondPlaceCell = tableRow.insertCell();
                if (row[3] === actualRow[6]) {
                    secondPlaceCell.style.backgroundColor = 'lightgreen';
                } else if (row[3] === actualRow[3] || row[3] === actualRow[9]) {
                    secondPlaceCell.style.backgroundColor = 'lightyellow';
                }
                secondPlaceCell.appendChild(createFlagImage(row[3]));

                const thirdPlaceCell = tableRow.insertCell();
                if (row[5] === actualRow[9]) {
                    thirdPlaceCell.style.backgroundColor = 'lightgreen';
                } else if (row[5] === actualRow[3] || row[5] === actualRow[6]) {
                    thirdPlaceCell.style.backgroundColor = 'lightyellow';
                }
                thirdPlaceCell.appendChild(createFlagImage(row[5]));

                const bonusCell = tableRow.insertCell();
                bonusCell.innerText = row[9] || '';
            });
        }

        async function loadAndDisplayData() {
            try {
                const excelFilePath = playerConfig.excelFile;
                const data = await loadExcelData(excelFilePath, playerConfig.sheetName, playerConfig.dataRange);
                const allData = await loadExcelData(excelFilePath, playerConfig.sheetName, null); // Load entire sheet
                populateOverview(data);
                populateTable(data, tableBody, 4, 39);
                populateTable(data, knockOffTableBody, 55, 69);
                populateGroupPredictions(data, allData);
            } catch (error) {
                console.error('Error displaying data:', error);
            }
        }

        loadAndDisplayData();
    }

    document.addEventListener('playerConfigLoaded', function() {
        initPlayerBoard();
    });

    if (window.playerConfig) {
        initPlayerBoard();
    }
});
