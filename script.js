// Import jsPDF for PDF download
const { jsPDF } = window.jspdf;

// Function to recalculate totals
function recalculateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll('#invoice-items tbody tr');

    // Loop through each row and calculate the total for each item
    rows.forEach((row, index) => {
        const price = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0;
        const qty = parseInt(row.querySelector('td:nth-child(4) input').value) || 0;
        const total = price * qty;

        // Update the total for the row
        row.querySelector('td:nth-child(5)').textContent = `$${total.toFixed(2)}`;
        subtotal += total;

        // Update the serial number
        row.querySelector('td:nth-child(1)').textContent = index + 1;
    });

    // Update subtotal
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);

    // Get the input tax rate and calculate tax
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    document.getElementById('tax').textContent = tax.toFixed(2);

    // Calculate total amount due
    const totalAmount = subtotal + tax;
    document.getElementById('total').textContent = totalAmount.toFixed(2);
}

// Event listener to add new item rows
document.getElementById('add-item').addEventListener('click', function() {
    const table = document.getElementById('invoice-items');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${table.rows.length}</td>
        <td><input type="text" placeholder="Item Description"></td>
        <td><input type="number" placeholder="0.00" step="0.01"></td>
        <td><input type="number" value="1" min="1"></td>
        <td>$0.00</td>
    `;
    table.querySelector('tbody').appendChild(row);

    // Add event listeners to recalculate totals when input changes
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', recalculateTotals);
    });

    recalculateTotals();
});

// Add event listeners to existing inputs to recalculate totals when input changes
document.querySelectorAll('#invoice-items input').forEach(input => {
    input.addEventListener('input', recalculateTotals);
});

// Add event listener for tax rate input
document.getElementById('tax-rate').addEventListener('input', recalculateTotals);

// Initial calculation
recalculateTotals();

// Function to prepare the invoice for downloading
function prepareInvoiceForDownload() {
    // Hide the "Add Item" button
    document.getElementById('add-item').style.display = 'none';

    // Hide the download buttons
    document.querySelector('.download-buttons').style.display = 'none';

    // Remove input fields and display plain text
    document.querySelectorAll('#invoice-items input').forEach(input => {
        const value = input.value;
        const span = document.createElement('span');
        span.textContent = value;
        input.replaceWith(span);
    });

    // Move the tax rate next to the tax label on the right side
    const taxRateInput = document.getElementById('tax-rate');
    const taxRateValue = taxRateInput.value;
    taxRateInput.replaceWith(document.createTextNode(` (${taxRateValue}%)`));

    // Show the tax rate next to the tax amount
    document.getElementById('tax-rate-display').textContent = `(${taxRateValue}%)`;
    document.getElementById('tax-rate-display').style.display = 'inline';
}

// Function to restore the invoice after downloading
function restoreInvoiceAfterDownload() {
    location.reload(); // Reload the page to restore the buttons and inputs
}

// Function to download the invoice as a PDF
document.getElementById('download-pdf').addEventListener('click', function() {
    prepareInvoiceForDownload();

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    html2canvas(document.querySelector('#invoice')).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 size dimensions
        doc.save('invoice.pdf'); // Download the PDF with the name 'invoice.pdf'
        restoreInvoiceAfterDownload(); // Restore after download
    });
});

// Function to download the invoice as a JPG
document.getElementById('download-jpg').addEventListener('click', function() {
    prepareInvoiceForDownload();

    html2canvas(document.querySelector('#invoice')).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'invoice.jpg';
        link.click(); // Trigger the download
        restoreInvoiceAfterDownload(); // Restore after download
    });
});
