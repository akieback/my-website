// Set the countdown date (3 months from current date)
const countdownDate = new Date();
countdownDate.setMonth(countdownDate.getMonth() + 3);

// Update the countdown every second
const countdown = setInterval(function() {
  const now = new Date().getTime();
  const distance = countdownDate - now;
  
  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  // Display the results
  document.getElementById("days").textContent = days.toString().padStart(2, '0');
  document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
  document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
  document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
  
  // If the countdown is finished, display a message
  if (distance < 0) {
    clearInterval(countdown);
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
  }
}, 1000);

// Add animation to the floating shapes
const shapes = document.querySelectorAll('.shape');
shapes.forEach(shape => {
  // Randomize starting positions
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  shape.style.transform = `translate(${randomX}px, ${randomY}px)`;
});
