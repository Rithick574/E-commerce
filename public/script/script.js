   
//UI changing signup

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  console.log("asdfghjkl");
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});



// show password login
   
   let lockicon = document.getElementById("lockicon")
    let password = document.getElementById("typePasswordX")

    lockicon.onclick=function(){
        if(password.type == "password"){
       
            password.type="text";
            lockicon.classList.remove("fa-lock")
            lockicon.classList.add("fa-unlock")
        }
        else{
            password.type="password";
            lockicon.classList.remove("fa-unlock");
            lockicon.classList.add("fa-lock")
        }
    }


//signup showpassword


let icon=document.getElementById("showpass")
let passWord1=document.getElementById("password1")


icon.onclick=function(){

    if(passWord1.type == "password"){
      passWord1.type="text";
            icon.classList.remove("fa-lock")
            icon.classList.add("fa-unlock")
    }
    else{
      passWord1.type="password";
            icon.classList.remove("fa-unlock");
            icon.classList.add("fa-lock")
  
    }
  
  }
  
//confirm passsword

let passWord2=document.getElementById("confirmpass1")
let icon1=document.getElementById("showpassword")

icon1.onclick=function(){
  if(passWord2.type == "password"){
    passWord2.type="text";
          icon1.classList.remove("fa-lock")
          icon1.classList.add("fa-unlock")
  }
  else{
    passWord2.type="password";
          icon1.classList.remove("fa-unlock");
          icon1.classList.add("fa-lock")

  }

}

