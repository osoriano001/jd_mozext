// popup/popup.js

document.addEventListener('DOMContentLoaded', () => {
  let jsonUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL('popup/job_postings.json')
    : 'job_postings.json';

  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const scrollBox = document.getElementById('scrollBox');
      if (!scrollBox) return;
      scrollBox.innerHTML = ''; 

      if (data && Array.isArray(data.job_postings)) {
        data.job_postings.forEach((item, index) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item clickable-item';
          itemDiv.textContent = item.title || `Job Posting #${index + 1}`;

          const stableDescription = Array.isArray(item.description) ? [...item.description] : [];
          const stableRequirements = Array.isArray(item.requirements) ? [...item.requirements] : [];
          const stableUrl = item.url || '';

          itemDiv.addEventListener('click', () => {
            if (!stableUrl) return;

            let targetUrl = stableUrl;
            let fragments = [];

            // Helper to break sentences down and generate browser-optimized text targets
            const processTextArray = (arr) => {
              arr.forEach(phrase => {
                if (!phrase) return;
                
                // 1. Clean up characters that crash STTF rules
                let cleanPhrase = phrase.toString().trim()
                  .replace(/[:~&]/g, '') // Strip matching syntax delimiters
                  .replace(/\s+/g, ' '); // Normalize spaces
                
                if (!cleanPhrase) return;

                // 2. Optimization: Convert long text blocks into short ranges (First 3 words -> Last 3 words)
                let words = cleanPhrase.split(' ');
                if (words.length > 6) {
                  let startRange = words.slice(0, 3).join(' ');
                  let endRange = words.slice(-3).join(' ');
                  fragments.push(`text=${encodeURIComponent(startRange)},${encodeURIComponent(endRange)}`);
                } else {
                  fragments.push(`text=${encodeURIComponent(cleanPhrase)}`);
                }
              });
            };

            processTextArray(stableDescription);
            processTextArray(stableRequirements);

            if (fragments.length > 0) {
              targetUrl += `#:~:${fragments.join('&')}`;
            }

            console.log("Navigating to Optimized URL:", targetUrl);

            if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
              chrome.tabs.create({ url: targetUrl });
            } else {
              window.open(targetUrl, '_blank');
            }
          });

          scrollBox.appendChild(itemDiv);
        });
      }
    })
    .catch(error => console.error('Extension Framework Failure:', error));
});
