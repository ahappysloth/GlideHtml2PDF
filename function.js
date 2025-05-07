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

	const customCSS = `
	body {
	  margin: 0 !important;
	  padding: 0 !important;
	  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	}
  
	.pdf-container {
	  position: relative;
	  padding-top: 50px;
	}
  
	.header-bar {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  height: 50px;
	  background: white;
	  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	  display: flex;
	  align-items: center;
	  justify-content: flex-end;
	  padding: 0 16px;
	  z-index: 1000;
	}
  
	.download-button {
	  display: inline-flex;
	  align-items: center;
	  background: #2563eb;
	  color: white;
	  font-weight: 500;
	  font-size: 14px;
	  padding: 8px 16px;
	  border-radius: 6px;
	  border: none;
	  cursor: pointer;
	  transition: background 0.2s ease;
	  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
	}
  
	.download-button:hover {
	  background: #1d4ed8;
	}
  
	.download-button svg {
	  width: 16px;
	  height: 16px;
	  margin-right: 6px;
	}
  
	.download-button.generating {
	  background: #9ca3af;
	  pointer-events: none;
	}
  
	.download-button.success {
	  background: #10b981;
	}
  
	.download-button.error {
	  background: #ef4444;
	}
  
	#content {
	  padding: 24px;
	  max-width: 100%;
	}
  
	/* Improved scrollbar */
	::-webkit-scrollbar {
	  width: 8px;
	  height: 8px;
	}
  
	::-webkit-scrollbar-track {
	  background: rgba(0,0,0,0.05);
	}
  
	::-webkit-scrollbar-thumb {
	  background: rgba(0,0,0,0.2);
	  border-radius: 4px;
	}
  
	::-webkit-scrollbar-thumb:hover {
	  background: rgba(0,0,0,0.3);
	}
	`;

	// HTML THAT IS RETURNED AS A RENDERABLE URL
	const originalHTML = `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
	    <meta charset="UTF-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	    <title>${fileName}</title>
	    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
	    <style>${customCSS}</style>
	  </head>
	  <body>
	    <div class="pdf-container">
	      <div class="header-bar">
	        <button id="download-btn" class="download-button">
	          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
	            <polyline points="7 10 12 15 17 10"></polyline>
	            <line x1="12" y1="15" x2="12" y2="3"></line>
	          </svg>
	          Download PDF
	        </button>
	      </div>
	      <div id="content">${html}</div>
	    </div>
	    
	    <script>
	    // Wait for HTML2PDF to be fully loaded
	    document.addEventListener('DOMContentLoaded', function() {
	      const downloadBtn = document.getElementById('download-btn');
	      const contentEl = document.getElementById('content');
	      
	      function fallbackSaveAction(blob) {
	        const a = document.createElement('a');
	        a.href = URL.createObjectURL(blob);
	        a.download = '${fileName}.pdf';
	        document.body.appendChild(a);
	        a.click();
	        setTimeout(function() {
	          document.body.removeChild(a);
	          URL.revokeObjectURL(a.href);
	        }, 100);
	      }
	      
	      // Handle download
	      downloadBtn.addEventListener('click', function() {
	        // Update UI
	        downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Creating PDF...';
	        downloadBtn.classList.add('generating');
	        
	        // Configure PDF options
	        const pdfOptions = {
	          margin: ${margin},
	          filename: '${fileName}.pdf',
	          image: { type: 'jpeg', quality: 0.98 },
	          html2canvas: {
	            useCORS: true,
	            scale: ${quality},
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: document.documentElement.offsetWidth,
                    windowHeight: document.documentElement.offsetHeight
	          },
	          jsPDF: {
	            unit: 'px',
	            format: [${finalDimensions}],
	            orientation: '${orientation}',
	            hotfixes: ['px_scaling']
	          },
	          pagebreak: { 
	            mode: ['css', 'avoid-all'], 
	            before: ${JSON.stringify(breakBefore)}, 
	            after: ${JSON.stringify(breakAfter)}, 
	            avoid: ${JSON.stringify(breakAvoid)} 
	          }
	        };
	        
	        // Generate and download PDF with fallback mechanism
	        html2pdf()
	          .from(contentEl)
	          .set(pdfOptions)
	          .toPdf()
	          .get('pdf')
	          .then(function(pdf) {
	            try {
	              const blob = pdf.output('blob');
	              
	              // Try normal save first
	              try {
	                pdf.save('${fileName}.pdf');
	                
	                // Update UI to success state
	                downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Downloaded!';
	                downloadBtn.classList.remove('generating');
	                downloadBtn.classList.add('success');
	              } catch (saveError) {
	                console.warn('Normal save failed, trying fallback:', saveError);
	                fallbackSaveAction(blob);
	                
	                // Update UI to success state
	                downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Downloaded!';
	                downloadBtn.classList.remove('generating');
	                downloadBtn.classList.add('success');
	              }
	            } catch (pdfError) {
	              console.error('PDF generation or save error:', pdfError);
	              
	              // Update UI to error state
	              downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Error - Try Again';
	              downloadBtn.classList.remove('generating');
	              downloadBtn.classList.add('error');
	            }
	            
	            // Reset button after delay
	            setTimeout(function() {
	              downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
	              downloadBtn.classList.remove('generating', 'success', 'error');
	            }, 3000);
	          })
	          .catch(function(error) {
	            console.error('PDF generation error:', error);
	            
	            // Update UI to error state
	            downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Error - Try Again';
	            downloadBtn.classList.remove('generating');
	            downloadBtn.classList.add('error');
	            
	            // Reset button after delay
	            setTimeout(function() {
	              downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
	              downloadBtn.classList.remove('generating', 'success', 'error');
	            }, 3000);
	          });
	      });
	    });
	    </script>
	  </body>
	  </html>
	`;

	var encodedHtml = encodeURIComponent(originalHTML);
	return "data:text/html;charset=utf-8," + encodedHtml;
};
};
};
