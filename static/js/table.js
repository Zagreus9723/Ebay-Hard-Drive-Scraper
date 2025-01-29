
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

    const tableHeight = window.innerHeight*0.9;
    function initTable() {
        $('#table').bootstrapTable({
            height: tableHeight,
            columns: [
                {
                    field: 'photo',
                    title: photo,
                    formatter: (value) => `<img src="${value}" alt="${itemPhoto}" style="width: 50px; height: auto;">`
                },
                {
                    field: 'title',
                    title: title,
                    formatter: (value, row) => `<a href="${row.url}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&customid=${window.location.hostname}&campid=5339096616&toolid=20001&mkevt=1" target="_blank">${value}</a>`,
                    escape: true // Allow HTML content for links
                },
                {
                    field: 'price',
                    title: price,
                    formatter: (value, row) => `${row.currency}${value}`,
                    sortable: true
                },
                {
                    field: 'shipping',
                    title: shipping,
                    formatter: (value, row) => `${row.currency}${value}`
                },
                {
                    field: 'size',
                    title: size + ' (TB)',
                    sortable: true
                },
                {
                    field: 'price_per_tb',
                    title: pricePer + 'TB',
                    formatter: (value, row) => `${row.currency}${value}`,
                    sortable: true
                },
                {
                    field: 'physicalSize',
                    title: physicalSize
                },
                {
                    field: 'interface',
                    title: driveInterface
                },
                {
                    field: 'condition',
                    title: condition
                },
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
  const selectedConditions = Array.from(document.querySelectorAll('#condition-filter input:checked'))
      .map(checkbox => checkbox.value);
  const selectedInterfaces = Array.from(document.querySelectorAll('#interface-filter input:checked'))
      .map(checkbox => checkbox.value);
  const selectedPhysicalSizes = Array.from(document.querySelectorAll('#physical-size-filter input:checked'))
      .map(checkbox => checkbox.value);
  const freeShipping = document.querySelector('#shipping-filter input:checked') ? true : false;

  filteredData = originalData.filter(disk => {
      const size = parseFloat(disk.size) || 0;
      const price = parseFloat(disk.price) || 0;
      const shippingFree = disk.shipping === 0.0;

      return (
          size >= minSize &&
          size <= maxSize &&
          price >= minPrice &&
          price <= maxPrice &&
          (selectedConditions.length === 0 || selectedConditions.includes(disk.condition)) &&
          (selectedInterfaces.length === 0 || selectedInterfaces.includes(disk.interface)) &&
          (selectedPhysicalSizes.length === 0 || selectedPhysicalSizes.includes(disk.physicalSize)) &&
          (!freeShipping || shippingFree)
      );
  });

  // Reload the table with filtered data
  $('#table').bootstrapTable('load', filteredData);
}
window.preventScroll = false;
document.getElementById('apply-filters').addEventListener('click', applyFilters);

let originalData = []; // Store original unfiltered data

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
