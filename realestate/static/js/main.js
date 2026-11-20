// Bootstrap handles navigation, alerts, and inquiry dialogs.
// Card hover and focus styles are kept in CSS to avoid layout shifts.
document.querySelectorAll('.year').forEach(function (element) {
  element.textContent = new Date().getFullYear();
});
