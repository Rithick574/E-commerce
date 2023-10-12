const inputs = document.querySelectorAll("otpsec","input"),
  button = document.querySelector("button");


inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
   
    const currentInput = input,
      nextInput = input.nextElementSibling,
      prevInput = input.previousElementSibling;

   
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
   
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }

    
    if (e.key === "Backspace") {
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
       
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }
   
    if (!inputs[5].disabled && inputs[5].value !== "") {
      button.classList.add("active");
      return;
    }
    button.classList.remove("active");
  });
});


window.addEventListener("load", () => inputs[0].focus());
