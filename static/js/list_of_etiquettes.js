const API_BASE = "http://127.0.0.1:8000";

const grid = document.getElementById("etiquetteGrid");

async function loadEtiquettes() {
    try{
        const response = await fetch(`${API_BASE}/etiquettes`);

        if (!response.ok){
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const etiquettes = await response.json();


        grid.innerHTML = "";

        etiquettes.forEach(etiquette => {
            const card = document.createElement("div");
            card.classList.add("etiquette-card");

        card.innerHTML = `
        <div class= "etiquette-cover-image">
        <img src = "${API_BASE}${etiquette.cover_image}" alt ="${etiquette.etiquette_name}">
        </div>
        <h3>${etiquette.etiquette_name}</h3>    
        `;


        card.addEventListener("click",()=>{
            window.location.href = `/etiquette_page.html?id=${etiquette.etiquette_id}`;
        });
        grid.appendChild(card);
        });
    }
    catch(error){
        console.error("Failed to load etiquettes:", error);
        grid.innerHTML = "<p>Failed to load etiquettes.<p>";
    }
}

loadEtiquettes();