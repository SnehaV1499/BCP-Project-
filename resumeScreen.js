function analyzeResume() {
  const fileInput = document.getElementById("resumeFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a resume.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const text = event.target.result.toLowerCase();
    const keywords = ["java", "python", "sql", "html", "firebase"];
    let matchCount = 0;
    let matchedWords = [];

    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matchCount++;
        matchedWords.push(keyword);
      }
    });

    const resultText = (matchCount >= 2)
      ? `✅ Resume Selected<br>Matched Keywords: ${matchedWords.join(", ")}`
      : `❌ Resume Rejected<br>Matched Keywords: ${matchedWords.join(", ")}`;

    document.getElementById("result").innerHTML = resultText;
  };

  reader.readAsText(file);
}
