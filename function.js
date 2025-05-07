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

  // Create a clean HTML structure with inline script
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${fileName}</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
      <style>
	body {
	  margin: 0 !important;
	  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}
	
	.toolbar {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  height: 48px;
	  background-color: #ffffff;
	  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	  display: flex;
	  align-items: center;
	  justify-content: flex-end;
	  padding: 0 16px;
	  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	  z-index: 1000;
	}
	
	#download-btn {
	  background-color: #0066ff;
	  color: white;
	  border: none;
	  border-radius: 6px;
	  padding: 8px 16px;
	  font-size: 14px;
	  font-weight: 500;
	  cursor: pointer;
	  transition: background-color 0.2s ease;
	  display: flex;
	  align-items: center;
	  gap: 6px;
	}
	
	#download-btn:hover {
	  background-color: #0052cc;
	}
	
	#download-btn.downloading {
	  background-color: #999;
	  pointer-events: none;
	}
	
	#download-btn.success {
	  background-color: #00aa55;
	}
	
	.icon {
	  display: inline-block;
	  width: 16px;
	  height: 16px;
	}
	
	.content-wrapper {
	  padding-top: 64px;
	  max-width: 100%;
	  overflow-x: hidden;
	}
	
	#pdf-content {
	  background-color: white;
	}
	
	@media print {
	  .toolbar {
	    display: none;
	  }
	  
	  .content-wrapper {
	    padding-top: 0;
	  }
	}
      </style>
    </head>
    <body>
      <div class="toolbar">
	<button id="download-btn">
	  <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
	    <polyline points="7 10 12 15 17 10"></polyline>
	    <line x1="12" y1="15" x2="12" y2="3"></line>
	  </svg>
	  Download PDF
	</button>
      </div>
      
      <div class="content-wrapper">
	<div id="pdf-content">${html}</div>
      </div>
      
      <script>
	// PDF generation configuration
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
	
	// Download button functionality
	document.getElementById('download-btn').addEventListener('click', function() {
	  const button = this;
	  const contentElement = document.getElementById('pdf-content');
	  
	  // Update button state
	  button.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Generating...';
	  button.classList.add('downloading');
	  
	  // Generate PDF
	  html2pdf()
	    .from(contentElement)
	    .set(pdfOptions)
	    .save()
	    .then(() => {
	      // Success state
	      button.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Downloaded';
	      button.classList.remove('downloading');
	      button.classList.add('success');
	      
	      // Reset button after delay
	      setTimeout(() => {
		button.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
		button.classList.remove('success');
	      }, 3000);
	    })
	    .catch(error => {
	      console.error('PDF generation failed:', error);
	      button.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Error';
	      button.classList.remove('downloading');
	      
	      // Reset button after delay
	      setTimeout(() => {
		button.innerHTML = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Try Again';
	      }, 3000);
	    });
	});
      </script>
    </body>
    </html>
  `;
};
