    var $table = $('#table')
    var $remove = $('#remove')
    var selections = []

    function getIdSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
            return row.id
        })
    }

    function responseHandler(res) {
        $.each(res.rows, function (i, row) {
            row.state = $.inArray(row.id, selections) !== -1
        })
        return res
    }

    function detailFormatter(index, row) {
        var html = []
        $.each(row, function (key, value) {
            html.push('<p><b>' + key + ':</b> ' + value + '</p>')
        })
        return html.join('')
    }

    function operateFormatter(value, row, index) {
        return [
            '<a class="like" href="javascript:void(0)" title="Like">',
            '<i class="fa fa-heart"></i>',
            '</a>  ',
            '<a class="remove" href="javascript:void(0)" title="Remove">',
            '<i class="fa fa-trash"></i>',
            '</a>'
        ].join('')
    }

    window.operateEvents = {
        'click .like': function (e, value, row, index) {
            alert('You click like action, row: ' + JSON.stringify(row))
        },
        'click .remove': function (e, value, row, index) {
            $table.bootstrapTable('remove', {
                field: 'id',
                values: [row.id]
            })
        }
    }

    function totalTextFormatter(data) {
        return 'Total'
    }

    function totalNameFormatter(data) {
        return data.length
    }

    function totalPriceFormatter(data) {
        var field = this.field
        return '$' + data.map(function (row) {
            return +row[field].substring(1)
        }).reduce(function (sum, i) {
            return sum + i
        }, 0)
    }

    async function fetchData() {
        const response = await fetch('ebay_results/United States.json'); // Replace with the path to your JSON file
        return response.json();
    }

    const sampleData = fetchData();
    const tableHeight = window.innerHeight*0.9;
    function initTable() {
        $('#table').bootstrapTable({
            height: tableHeight,
            columns: [
                {
                    field: 'photo',
                    title: 'Photo',
                    formatter: (value) => `<img src="${value}" alt="Item Photo" style="width: 50px; height: auto;">`
                },
                {
                    field: 'title',
                    title: 'Title',
                    formatter: (value, row) => `<a href="${row.url}" target="_blank">${value}</a>`,
                    escape: true // Allow HTML content for links
                },
                {
                    field: 'price',
                    title: 'Price',
                    sortable: true
                },
                {
                    field: 'shipping',
                    title: 'Shipping'
                },
                {
                    field: 'condition',
                    title: 'Condition'
                },
                {
                    field: 'size',
                    title: 'Size (TB)',
                    sortable: true
                },
                {
                    field: 'physicalSize',
                    title: 'Physical Size'
                },
                {
                    field: 'interface',
                    title: 'Interface'
                },
                {
                    field: 'price_per_tb',
                    title: 'Price Per TB',
                    sortable: true
                }
            ]
        });
    }

    $(document).ready(() => {
        initTable();
    });

    $(function () {
        initTable()

        $('#locale').change(initTable)
    })

    function setTableHeight() {
        const viewportHeight = $(window).height(); // Get the window height
        const toolbarHeight = $('#toolbar').outerHeight(true); // Get toolbar height
        const offset = 20; // Add some padding or offset if needed

        // Set table height dynamically
        $('#table').bootstrapTable('resetView', {
            height: viewportHeight - toolbarHeight - offset
        });
    }

    $(window).on('resize', setTableHeight); // Recalculate height on window resize
    $(document).ready(() => {
        initTable(); // Initialize the table
        setTableHeight(); // Set initial height
    });

function applyFilters() {
  const minPrice = parseFloat(document.getElementById('min-price').value);
  const maxPrice = parseFloat(document.getElementById('max-price').value);
  const minSize = parseFloat(document.getElementById('min-size').value);
  const maxSize = parseFloat(document.getElementById('max-size').value);

  // Filter the data
  const filteredData = originalData.filter(item => {
    const sizeTB = item.size; // Convert TB to GB
    return (item.price >= minPrice &&
           item.price <= maxPrice &&
           sizeTB >= minSize &&
           sizeTB <= maxSize);
  });

  // Reload the table with filtered data
  $('#table').bootstrapTable('load', filteredData);
}
window.preventScroll = false;
document.getElementById('apply-filters').addEventListener('click', applyFilters);

let originalData = []; // Store original unfiltered data

$(document).ready(() => {
  // Initialize the table
  initTable();

  // Fetch data and store it
  $.getJSON('ebay_results/United States.json', (data) => {
    originalData = responseHandler(data);
    $('#table').bootstrapTable('load', originalData);
  });

  // Attach event listener to filter button
  $('#apply-filters').click(applyFilters);
});
function updateRangeDisplays() {
  const minPrice = document.getElementById('min-price').value;
  const maxPrice = document.getElementById('max-price').value;
  document.getElementById('price-range').innerText = `$${minPrice} - $${maxPrice}`;

  const minSize = document.getElementById('min-size').value;
  const maxSize = document.getElementById('max-size').value;
  document.getElementById('size-range').innerText = `${minSize} TB - ${maxSize} TB`;
}

// Attach event listeners to update range displays
document.getElementById('min-price').addEventListener('input', updateRangeDisplays);
document.getElementById('max-price').addEventListener('input', updateRangeDisplays);
document.getElementById('min-size').addEventListener('input', updateRangeDisplays);
document.getElementById('max-size').addEventListener('input', updateRangeDisplays);
