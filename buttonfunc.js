let namesWithInfo = [];
let searchTerm;
let locationxyz, nameDept, imagelink;

// Load and process CSV data
async function loadData() {
    try {
        const response = await fetch('./public/dept-off.csv');
        const data = await response.text();
        namesWithInfo = data.split('\n').map(line => {
            const [name, info, imgsrclnk, PinXYZ] = line.split('|').map(item => item.trim());
            return { name, info, imgsrclnk, PinXYZ };
        });
        createButtons(namesWithInfo);
    } catch (error) {
        console.error('Error fetching names:', error);
    }
}

// Filter data based on search input
function filterData() {
    const searchInput = document.getElementById('searchBar');
    searchTerm = searchInput.value.toLowerCase();

    const filteredData = namesWithInfo.filter(item => item.name.toLowerCase().includes(searchTerm));
    createButtons(filteredData);
}

// Create buttons dynamically from data
function createButtons(data) {
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.innerHTML = ''; // Clear existing buttons

    data.forEach(item => {
        const button = document.createElement('button');
        button.textContent = item.name;
        button.className = 'p-2 border-0 rounded-3 my-1 btnoffCanvas';
        button.style.color = 'white';
        button.id = 'btnoffCNS';
        button.style.background = 'rgb(24, 118, 214)';
        button.ariaLabel = 'Close';
        button.setAttribute("data-bs-dismiss", "offcanvas");
        const imgOFC = document.getElementById('OFCimg');
        button.onclick = function () {
            locationxyz = item.PinXYZ;
            nameDept = item.name;
            imagelink = item.imgsrclnk;

            if (!imagelink || imagelink === "") {
                imgOFC.src = "./public/Photo/Default_Photo.png"
            }else{imgOFC.src = imagelink;}
            //alert(`Name: ${item.name}\nInfo: ${item.info}\nPinXYZ: ${locationxyz}`);
        };
        buttonContainer.appendChild(button);
    });
}

export {locationxyz, nameDept, imagelink};
// Attach event listener to search bar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchBar').addEventListener('input', filterData);
    loadData();
});
