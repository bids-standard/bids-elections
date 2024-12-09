function queueScripts(queue, cb) {
  processScripts(queue, cb, 0);
}
function processScripts(queue, cb, index) {
  getScript(queue[index], function () {
    index++;
    if (index === queue.length) {
      // Reached the end
      cb();
    } else {
      return processScripts(queue, cb, index);
    }
  });
}

function getScript(script, callback) {
  $.getScript(script, function () {
    callback();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const cookiePopup = document.querySelectorAll(".cookie")[0];
  const acceptCookiesBtn = document.querySelectorAll(".cookie-accept")[0];

  // Check if cookies are accepted
  const cookiesAccepted = localStorage.getItem("cookiesAccepted");

  // If cookies are not accepted, show the popup
  if (!cookiesAccepted) {
    cookiePopup.style.display = "block";
  }

  // Event listener for accepting cookies
  acceptCookiesBtn.addEventListener("click", function () {
    // Set a flag in localStorage indicating that cookies are accepted
    localStorage.setItem("cookiesAccepted", true);
    // Hide the popup
    cookiePopup.style.display = "none";
  });
});
