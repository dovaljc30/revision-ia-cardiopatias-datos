d3.json("conteo_palabras_ris.json").then(data => {
 
  const words = Object.entries(data).map(([text, value]) => ({
    text: text,
    size: value
  }));

 
  const combinedWords = [];
  const processed = new Set();
  
  
  const combinations = [
    { words: ["heart", "failure"], combined: "heart failure", size: (data.heart || 0) + (data.failure || 0) || 350, color: "#8B008B" },
    { words: ["machine", "learning"], combined: "machine learning", size: (data.machine || 0) + (data.learning || 0) || 320, color: "#DC143C" },
    { words: ["deep", "learning"], combined: "deep learning", size: (data.deep || 0) + (data.learning || 0) || 300, color: "#000000" },
    { words: ["myocardial", "infarction"], combined: "myocardial infarction", size: 180, color: "#228B22" },
    { words: ["classification"], combined: "classification", size: 170, color: "#228B22" },
    { words: ["fluid", "overload"], combined: "fluid overload", size: 160, color: "#228B22" },
    { words: ["cardiovascular", "disease"], combined: "cardiovascular disease", size: (data.cardiovascular || 0) + (data.disease || 0) || 140, color: "#4169E1" },
    { words: ["autonomic", "nervous", "system"], combined: "autonomic nervous system", size: 120, color: "#DC143C" },
    { words: ["atrial", "fibrillation"], combined: "atrial fibrillation", size: (data.arrhythmia || 0) * 2 || 110, color: "#DC143C" },
    { words: ["acute", "kidney", "injury"], combined: "acute kidney injury", size: 100, color: "#228B22" },
    { words: ["mortality"], combined: "mortality", size: 80, color: "#8B008B" },
    { words: ["hypertension"], combined: "hypertension", size: 70, color: "#4B0082" },
    { words: ["cardiopulmonary", "bypass"], combined: "cardiopulmonary bypass", size: 60, color: "#4B0082" },
    { words: ["cardiac", "surgery"], combined: "cardiac surgery", size: (data.cardiac || 0) || 55, color: "#4B0082" },
    { words: ["congenital", "heart", "disease"], combined: "congenital heart disease", size: 50, color: "#4169E1" },
    { words: ["imbalanced", "data"], combined: "imbalanced data", size: 45, color: "#000000" },
    { words: ["stroke"], combined: "stroke", size: 40, color: "#2F4F4F" },
    { words: ["oxidative", "stress"], combined: "oxidative stress", size: 35, color: "#2F4F4F" },
    { words: ["inflammation"], combined: "inflammation", size: 30, color: "#2F4F4F" },
    { words: ["neural", "network"], combined: "neural network", size: (data.neural || 0) + (data.network || 0) || 169, color: "#228B22" }
  ];

  
  combinations.forEach(combo => {
    if (combo.size > 0) {
      combinedWords.push({
        text: combo.combined,
        size: combo.size,
        color: combo.color
      });
      combo.words.forEach(word => processed.add(word.toLowerCase()));
    }
  });

  
  words.forEach(word => {
    const wordLower = word.text.toLowerCase();
    if (!processed.has(wordLower) && word.size > 0) {
      combinedWords.push({
        text: word.text,
        size: word.size,
        color: null 
      });
    }
  });

  
  combinedWords.sort((a, b) => b.size - a.size);

  
  const sizeScale = d3.scaleLinear()
    .domain(d3.extent(combinedWords, d => d.size))
    .range([15, 100]);


  const colors = [
    "#8B008B", 
    "#DC143C", 
    "#000000", 
    "#228B22", 
    "#4169E1", 
    "#8B0000", 
    "#4B0082", 
    "#2F4F4F"  
  ];

  
  const getColor = (d) => {
    
    if (d.color) return d.color;
    
    
    const text = d.text.toLowerCase();
    if (text.includes("heart failure")) return colors[0];
    if (text.includes("machine learning")) return colors[1];
    if (text.includes("deep learning")) return colors[2];
    if (text.includes("myocardial") || text.includes("classification") || text.includes("fluid overload") || text.includes("neural network")) return colors[3];
    if (text.includes("cardiovascular") || text.includes("congenital")) return colors[4];
    if (text.includes("mortality") || text.includes("atrial") || text.includes("autonomic")) return colors[5];
    if (text.includes("hypertension") || text.includes("cardiopulmonary") || text.includes("cardiac surgery")) return colors[6];
    if (text.includes("stroke") || text.includes("oxidative") || text.includes("inflammation")) return colors[7];
    
    
    const index = Math.floor((d.size / d3.max(combinedWords, d => d.size)) * (colors.length - 1));
    return colors[index] || colors[7];
  };

  
  const layout = d3.layout.cloud()
    .size([1000, 600])
    .words(combinedWords.map(d => ({ text: d.text, size: sizeScale(d.size) })))
    .padding(3)
    .rotate(() => ~~(Math.random() * 2) * 90) 
    .font("Arial")
    .fontSize(d => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    const svg = d3.select("#wordcloud")
      .append("svg")
      .attr("width", 1000)
      .attr("height", 600);

    const g = svg.append("g")
      .attr("transform", "translate(500,300)");

    const text = g.selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", d => `${d.size}px`)
      .style("font-family", "Arial, sans-serif")
      .style("font-weight", d => d.size > 60 ? "bold" : "normal")
      .style("fill", d => {
        const originalWord = combinedWords.find(w => w.text === d.text);
        return getColor(originalWord || { text: d.text, size: d.size });
      })
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text(d => d.text)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 30)
      .style("opacity", 1);

    
    text.append("title")
      .text(d => {
        const originalWord = combinedWords.find(w => w.text === d.text);
        return `${d.text}: ${originalWord ? originalWord.size : 'N/A'} ocurrencias`;
      });
  }
});
