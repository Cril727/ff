let APILOGOUT = "http://127.0.0.1:8000/api/logout";

let btnLogout = document.getElementById("btn-logout");

btnLogout.addEventListener("click", async() => {
    const token = localStorage.getItem("token");

    try {
        if(token){
        const res = await fetch(APILOGOUT,{
        method:"POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Accept": "application/json"
          }
    });
    }
    } catch (error) {
        alert(error)
    }finally{
        localStorage.removeItem("token");
        window.location = "./index.html"
    }

    if(res.ok){
        alert("sesiom cerrada")
    }else{
        alert("error")
    }
});
