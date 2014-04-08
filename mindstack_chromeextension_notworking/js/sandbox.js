
window.onload = function() {
  var grammarElement = document.querySelector("grammar");
  parser = PEG.buildParser(grammarElement.textContent);
  grammarElement.parentNode.removeChild(grammarElement);
}