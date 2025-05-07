window.function = function (html, fileName, format, zoom, orientation, margin, breakBefore, breakAfter, breakAvoid, fidelity, customDimensions) {
  // FIDELITY MAPPING
  const fidelityMap = {
    low: 1,
    standard: 1.5,
    high: 2,
  };

  // DYNAMIC VALUES
  html = html.value ?? "No HTML set.";
  fileName = fileName.value ?? "file";
  format = format.value ?? "a4";
  zoom = zoom.value ?? "1";
  orientation = orientation.value ?? "portrait";
  margin = margin.value ?? "0";
  breakBefore = breakBefore.value ? breakBefore.value.split(",") : [];
  breakAfter = breakAfter.value ? breakAfter.value.split(",") : [];
  breakAvoid = breakAvoid.value ? breakAvoid.value.split(",") : [];
  quality = fidelityMap[fidelity.value] ?? 1.5;
  customDimensions = customDimensions.value ? customDimensions.value.split(",").map(Number) : null;

  // DOCUMENT DIMENSIONS
  const formatDimensions = {
    a0: [4967, 7022],
    a1: [3508, 4967],
    a2: [2480, 3508],
    a3: [1754, 2480],
    a4: [1240, 1754],
    a5: [874, 1240],
    a6: [620, 874],
    a7: [437, 620],
    a8: [307, 437],
    a9: [219, 307],
    a10: [154, 219],
    b0: [5906, 8350],
    b1: [4175, 5906],
    b2: [2953, 4175],
    b3: [2085, 2953],
    b4: [1476, 2085],
    b5: [1039, 1476],
    b6: [738, 1039],
    b7: [520, 738],
    b8: [366, 520],
    b9: [260, 366],
    b10: [183, 260],
    c0: [5415, 7659],
    c1: [3827, 5415],
    c2: [2705, 3827],
    c3: [1913, 2705],
    c4: [1352, 1913],
    c5: [957, 1352],
    c6: [673, 957],
    c7: [478, 673],
    c8: [337, 478],
    c9: [236, 337],
    c10: [165, 236],
    dl: [650, 1299],
    letter: [1276, 1648],
    government_letter: [1199, 1577],
    legal: [1276, 2102],
    junior_legal: [1199, 750],
    ledger: [2551, 1648],
    tabloid: [1648, 2551],
    credit_card: [319, 508],
  };

  // GET FINAL DIMENSIONS FROM SELECTED FORMAT
  const dimensions = customDimensions || formatDimensions[format];
  const finalDimensions = dimensions.map((dimension) => Math.round(dimension / zoom));

  // Log settings to console for debugging
  console.log(
    `Filename: ${fileName}\n` +
      `Format: ${format}\n` +
      `Dimensions: ${dimensions}\n` +
      `Zoom: ${zoom}\n` +
      `Final Dimensions: ${finalDimensions}\n` +
      `Orientation: ${orientation}\n` +
      `Margin: ${margin}\n` +
      `Break before: ${breakBefore}\n` +
      `Break after: ${breakAfter}\n` +
      `Break avoid: ${breakAvoid}\n` +
      `Quality: ${quality}`
  );

  // HTML with embedded script for the PDF viewer and download
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${fileName} - PDF Viewer</title>
      <style>
        /* Reset and base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.5;
          color: #333;
          background: #f9f9f9;
          padding: 0;
          margin: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Header/toolbar styles */
        .pdf-toolbar {
          background: white;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        
        .pdf-title {
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 10px;
        }
        
        .download-btn {
          background: #0066ff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .download-btn:hover {
          background: #0052cc;
        }
        
        .download-btn.generating {
          background: #888;
        }
        
        .download-btn.success {
          background: #00aa55;
        }
        
        .download-btn.error {
          background: #cc3300;
        }
        
        /* Content display area */
        .content-container {
          flex: 1;
          overflow: auto;
          padding: 20px;
          background: #f1f1f1;
        }
        
        .pdf-preview {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 40px;
          margin: 0 auto;
          max-width: 900px;
        }
      </style>
    </head>
    <body>
      <div class="pdf-toolbar">
        <div class="pdf-title">${fileName}</div>
        <button id="download-pdf" class="download-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>
      
      <div class="content-container">
        <div class="pdf-preview" id="pdf-content">
          ${html}
        </div>
      </div>

      <script>
        // Add html2pdf.js library
        (function loadLibrary() {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js';
          script.onload = setupPdfGenerator;
          document.head.appendChild(script);
        })();

        function setupPdfGenerator() {
          const downloadButton = document.getElementById('download-pdf');
          const contentElement = document.getElementById('pdf-content');
          
          downloadButton.addEventListener('click', function() {
            // Update button state
            downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Generating...';
            downloadButton.className = 'download-btn generating';
            
            // Configure PDF options
            const pdfOptions = {
              margin: ${margin},
              filename: '${fileName}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: {
                scale: ${quality},
                useCORS: true,
              },
              jsPDF: {
                unit: 'px',
                format: [${finalDimensions}],
                orientation: '${orientation}',
                hotfixes: ['px_scaling']
              },
              pagebreak: { 
                mode: ['css'], 
                before: ${JSON.stringify(breakBefore)}, 
                after: ${JSON.stringify(breakAfter)}, 
                avoid: ${JSON.stringify(breakAvoid)} 
              }
            };
            
            // Generate PDF
            html2pdf()
              .from(contentElement)
              .set(pdfOptions)
              .save()
              .then(function() {
                // Success state
                downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Downloaded!';
                downloadButton.className = 'download-btn success';
                
                // Reset button after delay
                setTimeout(function() {
                  downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF';
                  downloadButton.className = 'download-btn';
                }, 2000);
              })
              .catch(function(error) {
                console.error('PDF generation failed:', error);
                
                // Error state
                downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Error!';
                downloadButton.className = 'download-btn error';
                
                // Reset button after delay
                setTimeout(function() {
                  downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Try Again';
                  downloadButton.className = 'download-btn';
                }, 2000);
              });
          });
        }
      </script>
    </body>
    </html>
  `;

  // Encode the HTML content
  const encodedHtml = encodeURIComponent(htmlContent);
  return "data:text/html;charset=utf-8," + encodedHtml;
};
};
};
