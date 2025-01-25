        async function fetchData() {
            const response = await fetch('C:\\Users\\maxer\\PycharmProjects\\ZacharyCrap\\ebay_results\\United States.json'); // Replace with the path to your JSON file
            return response.json();
        }

        let diskData = [];
        let filteredData = [];
        let sortDirection = {}; // To track sort directions for each column

        function populateTable(data) {
            const tableBody = document.getElementById('diskTableBody');
            tableBody.innerHTML = '';

            data.forEach(disk => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${disk.title}</td>
                    <td>$${parseFloat(disk.price).toFixed(2)}</td>
                    <td>${disk.size}</td>
                    <td>$${parseFloat(disk.price_per_tb).toFixed(2)}</td>
                    <td>${disk.interface || 'N/A'}</td>
                    <td>${disk.physicalSize || 'N/A'}</td>
                    <td>${disk.condition}</td>
                    <td>${disk.shipping === 'Free' ? 'Free' : `$${parseFloat(disk.shipping || 0).toFixed(2)}`}</td>
                    <td><a href="${disk.url}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&customid=${window.location.hostname}&campid=5339096616&toolid=20001&mkevt=1" target="_blank">View</a></td>
                `;

                if (disk.size !== 0.0 && disk.price_per_tb !== 0.0) {
                    tableBody.appendChild(row);
                }
            });
        }

        function sortData(key) {
            // Toggle sort direction for the selected column
            if (!sortDirection[key]) sortDirection[key] = 'asc';
            else sortDirection[key] = sortDirection[key] === 'asc' ? 'desc' : 'asc';

            // Remove sort classes from all other headers
            document.querySelectorAll('th[data-sort]').forEach(th => {
                th.classList.remove('ascending', 'descending');
            });

            // Add the appropriate class to the current header
            const currentHeader = document.querySelector(`th[data-sort="${key}"]`);
            currentHeader.classList.add(sortDirection[key] === 'asc' ? 'ascending' : 'descending');

            // Sort the data
            filteredData.sort((a, b) => {
                let valA = a[key], valB = b[key];

                if (key === 'price' || key === 'price_per_tb' || key === 'shipping') {
                    valA = parseFloat(valA.toString().replace('$', '')) || 0;
                    valB = parseFloat(valB.toString().replace('$', '')) || 0;
                } else if (key === 'size') {
                    valA = parseFloat(valA) || 0;
                    valB = parseFloat(valB) || 0;
                }

                return sortDirection[key] === 'asc' ? valA - valB : valB - valA;
            });

            populateTable(filteredData);
        }

        // Add event listeners to each sortable column
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.getAttribute('data-sort');
                sortData(key);
            });
        });

        function updateSliderValues() {
            const minSize = document.getElementById('minSize').value;
            const maxSize = document.getElementById('maxSize').value;
            const minCost = document.getElementById('minCost').value;
            const maxCost = document.getElementById('maxCost').value;

            document.getElementById('sizeValue').textContent = `${minSize} - ${maxSize}`;
            document.getElementById('priceValue').textContent = `$${minCost} - $${maxCost}`;
        }

        function applyAdvancedFilters() {
            const minSize = parseFloat(document.getElementById('minSize').value) || 0;
            const maxSize = parseFloat(document.getElementById('maxSize').value) || Infinity;
            const minCost = parseFloat(document.getElementById('minCost').value) || 0;
            const maxCost = parseFloat(document.getElementById('maxCost').value) || Infinity;
            const selectedConditions = Array.from(document.querySelectorAll('#conditionFilter input:checked'))
                .map(checkbox => checkbox.value);
            const selectedInterfaces = Array.from(document.querySelectorAll('#interfaceFilter input:checked'))
                .map(checkbox => checkbox.value);
            const selectedPhysicalSizes = Array.from(document.querySelectorAll('#physicalSizeFilter input:checked'))
                .map(checkbox => checkbox.value);
            const freeShipping = document.querySelector('#shippingFilter input:checked') ? true : false;

            filteredData = diskData.filter(disk => {
                const size = parseFloat(disk.size) || 0;
                const price = parseFloat(disk.price) || 0;
                const shippingFree = disk.shipping === 0.0;

                return (
                    size >= minSize &&
                    size <= maxSize &&
                    price >= minCost &&
                    price <= maxCost &&
                    (selectedConditions.length === 0 || selectedConditions.includes(disk.condition)) &&
                    (selectedInterfaces.length === 0 || selectedInterfaces.includes(disk.interface)) &&
                    (selectedPhysicalSizes.length === 0 || selectedPhysicalSizes.includes(disk.physicalSize)) &&
                    (!freeShipping || shippingFree)
                );
            });
            sortDirection = {};
            sortData('price_per_tb');
        }

        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', updateSliderValues);
        });

        document.getElementById('applyFilters').addEventListener('click', applyAdvancedFilters);

        fetchData().then(data => {
            diskData = data;
            filteredData = [...diskData];
            sortData('price_per_tb');
        });