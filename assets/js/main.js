// ESTADO GLOBAL DE LA APLICACIÓN
let allVehicles = [];
let filteredVehicles = [];
let comparisonList = [];

// IMÁGENES DINÁMICAS POR DEFECTO PARA MEJORAR LA ESTÉTICA
const imageStock = {
    'Toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800&auto=format&fit=crop',
    'Ford': 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=800&auto=format&fit=crop',
    'Mazda': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
    'Tesla': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop',
    'Yamaha': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
    'Kawasaki': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
    'BMW': 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=800&auto=format&fit=crop',
    'default_car': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    'default_moto': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop'
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
});

// OBTENCIÓN DE DATOS DE AMBAS APIS (AUTOMÓVILES Y MOTOCICLETAS)
async function fetchData() {
    try {
        // Peticiones simultáneas a las rutas reescritas por Vercel
        const [resAutos, resMotos] = await Promise.allSettled([
            fetch('/api/automoviles').then(r => r.json()),
            fetch('/api/motocicletas').then(r => r.json())
        ]);

        let autos = resAutos.status === 'fulfilled' && Array.isArray(resAutos.value) ? resAutos.value : [];
        let motos = resMotos.status === 'fulfilled' && Array.isArray(resMotos.value) ? resMotos.value : [];

        // Normalización de datos
        allVehicles = [
            ...autos.map(item => ({ ...item, tipo: 'automovil' })),
            ...motos.map(item => ({ ...item, tipo: 'motocicleta' }))
        ];

        filteredVehicles = [...allVehicles];
        updateStats();
        renderCards(filteredVehicles);

    } catch (error) {
        console.error("Error al conectar con las APIs de AWS:", error);
        document.getElementById('vehicles-grid').innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-triangle-exclamation text-warning fs-1 mb-3"></i>
                <h4 class="text-white">Error de Comunicación con el Clúster</h4>
                <p class="text-muted">Asegúrate de que los puertos 5000 y 8000 estén abiertos en tus instancias EC2.</p>
            </div>
        `;
    }
}

// ACTUALIZAR CONTADORES SUPERIORES
function updateStats() {
    const total = allVehicles.length;
    const autos = allVehicles.filter(v => v.tipo === 'automovil').length;
    const motos = allVehicles.filter(v => v.tipo === 'motocicleta').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-autos').innerText = autos;
    document.getElementById('stat-motos').innerText = motos;
}

// RENDEREAR TARJETAS EN EL GRID
function renderCards(data) {
    const grid = document.getElementById('vehicles-grid');
    
    if (data.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">No se encontraron vehículos que coincidan con los criterios.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map(item => {
        const isCompared = comparisonList.some(v => v.id === item.id && v.tipo === item.tipo);
        const imgSrc = imageStock[item.marca] || (item.tipo === 'automovil' ? imageStock.default_car : imageStock.default_moto);
        const badgeClass = item.estado.toLowerCase() === 'nuevo' ? 'badge-nuevo' : 'badge-seminuevo';
        
        return `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="glass-card h-100 d-flex flex-column position-relative">
                    
                    <!-- Wrapper Imagen -->
                    <div class="card-img-wrapper">
                        <img src="${imgSrc}" alt="${item.marca} ${item.modelo}">
                        <div class="position-absolute top-0 start-0 m-3">
                            <span class="badge-status ${badgeClass}">${item.estado}</span>
                        </div>
                        <div class="position-absolute top-0 end-0 m-3">
                            <span class="badge badge-type">
                                <i class="fa-solid ${item.tipo === 'automovil' ? 'fa-car' : 'fa-motorcycle'} me-1"></i>
                                ${item.tipo}
                            </span>
                        </div>
                    </div>

                    <!-- Contenido -->
                    <div class="p-4 d-flex flex-column flex-grow-1">
                        <small class="text-muted text-uppercase fw-semibold tracking-wider mb-1">${item.marca}</small>
                        <h4 class="fw-bold text-white mb-2">${item.modelo}</h4>
                        <h3 class="text-gradient fw-extrabold mb-3">$${parseFloat(item.precio_usd).toLocaleString()} USD</h3>

                        <!-- Especificaciones Básicas -->
                        <div class="d-flex flex-wrap gap-2 mb-4">
                            <div class="spec-pill"><i class="fa-solid fa-calendar"></i> ${item.anio}</div>
                            <div class="spec-pill"><i class="fa-solid fa-palette"></i> ${item.color}</div>
                            ${item.cilindrada_cc ? `<div class="spec-pill"><i class="fa-solid fa-gauge-high"></i> ${item.cilindrada_cc} cc</div>` : ''}
                            ${item.transmision ? `<div class="spec-pill"><i class="fa-solid fa-gears"></i> ${item.transmision}</div>` : ''}
                        </div>

                        <!-- Botones de Acción -->
                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-gradient flex-grow-1" onclick="showDetails('${item.id}', '${item.tipo}')">
                                Ver Ficha
                            </button>
                            <button class="btn ${isCompared ? 'btn-info' : 'btn-outline-light'}" onclick="toggleCompare('${item.id}', '${item.tipo}')" title="Comparar">
                                <i class="fa-solid fa-code-compare"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// EVENT LISTENERS PARA FILTROS Y BÚSQUEDA
function setupEventListeners() {
    // Filtro de Categoría
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            applyFilters();
        });
    });

    // Buscador
    document.getElementById('search-input').addEventListener('input', applyFilters);

    // Ordenamiento
    document.getElementById('sort-select').addEventListener('change', applyFilters);
}

// APLICAR FILTROS Y ORDENAMIENTO
function applyFilters() {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const sortVal = document.getElementById('sort-select').value;

    filteredVehicles = allVehicles.filter(item => {
        const matchesType = activeFilter === 'all' || item.tipo === activeFilter;
        const matchesSearch = item.marca.toLowerCase().includes(searchVal) || 
                              item.modelo.toLowerCase().includes(searchVal) ||
                              (item.descripcion && item.descripcion.toLowerCase().includes(searchVal));
        return matchesType && matchesSearch;
    });

    // Ordenamiento
    if (sortVal === 'price-asc') {
        filteredVehicles.sort((a, b) => parseFloat(a.precio_usd) - parseFloat(b.precio_usd));
    } else if (sortVal === 'price-desc') {
        filteredVehicles.sort((a, b) => parseFloat(b.precio_usd) - parseFloat(a.precio_usd));
    } else if (sortVal === 'year-desc') {
        filteredVehicles.sort((a, b) => b.anio - a.anio);
    }

    renderCards(filteredVehicles);
}

// MODAL DE DETALLES Y SIMULADOR DE CRÉDITO
function showDetails(id, tipo) {
    const item = allVehicles.find(v => v.id == id && v.tipo === tipo);
    if (!item) return;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body-content');

    modalTitle.innerText = `${item.marca} ${item.modelo} (${item.anio})`;

    const cuotaEstimada = Math.round((parseFloat(item.precio_usd) * 0.8) / 48);

    modalBody.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-md-6">
                <p class="text-muted mb-3">${item.descripcion || 'Sin descripción adicional disponible.'}</p>
                
                <h6 class="text-white fw-bold mb-3 border-bottom border-secondary pb-2">Ficha Técnica</h6>
                <ul class="list-unstyled d-flex flex-column gap-2 text-muted small">
                    <li><strong class="text-white">Combustible:</strong> ${item.combustible || 'N/A'}</li>
                    <li><strong class="text-white">Transmisión:</strong> ${item.transmision || 'N/A'}</li>
                    <li><strong class="text-white">Cilindrada:</strong> ${item.cilindrada_cc ? item.cilindrada_cc + ' cc' : 'N/A'}</li>
                    <li><strong class="text-white">Color:</strong> ${item.color}</li>
                    <li><strong class="text-white">Estado:</strong> ${item.estado}</li>
                </ul>
            </div>

            <div class="col-12 col-md-6">
                <div class="glass-card p-4 text-center">
                    <span class="text-muted small">Precio de Lista</span>
                    <h2 class="text-gradient fw-extrabold my-2">$${parseFloat(item.precio_usd).toLocaleString()} USD</h2>
                    
                    <hr class="border-secondary my-3">
                    
                    <span class="text-muted small">Simulador de Crédito (20% enganche - 48 meses)</span>
                    <h4 class="text-info fw-bold my-1">~$${cuotaEstimada} USD / mes</h4>
                    
                    <button class="btn btn-gradient w-100 mt-4" onclick="alert('Solicitud enviada. Un asesor se pondrá en contacto.')">
                        <i class="fa-solid fa-paper-plane me-1"></i> Agendar Prueba de Manejo
                    </button>
                </div>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));
    modal.show();
}

// LÓGICA DEL COMPARADOR
function toggleCompare(id, tipo) {
    const index = comparisonList.findIndex(v => v.id == id && v.tipo === tipo);

    if (index > -1) {
        comparisonList.splice(index, 1);
    } else {
        if (comparisonList.length >= 3) {
            alert('Puedes comparar un máximo de 3 vehículos simultáneamente.');
            return;
        }
        const item = allVehicles.find(v => v.id == id && v.tipo === tipo);
        if (item) comparisonList.push(item);
    }

    updateCompareBar();
    renderCards(filteredVehicles);
}

function updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const count = document.getElementById('compare-count');
    count.innerText = comparisonList.length;

    if (comparisonList.length > 0) {
        bar.classList.add('active');
    } else {
        bar.classList.remove('active');
    }

    renderCompareTable();
}

function clearComparison() {
    comparisonList = [];
    updateCompareBar();
    renderCards(filteredVehicles);
}

function renderCompareTable() {
    const table = document.getElementById('compare-table');
    if (comparisonList.length === 0) return;

    table.innerHTML = `
        <thead>
            <tr>
                <th>Atributo</th>
                ${comparisonList.map(v => `<th>${v.marca}${v.modelo}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr><td><strong>Precio</strong></td> ${comparisonList.map(v => `<td class="text-info fw-bold">$${parseFloat(v.precio_usd).toLocaleString()} USD</td>`).join('')}</tr>
            <tr><td><strong>Año</strong></td> ${comparisonList.map(v => `<td>${v.anio}</td>`).join('')}</tr>
            <tr><td><strong>Tipo</strong></td> ${comparisonList.map(v => `<td>${v.tipo}</td>`).join('')}</tr>
            <tr><td><strong>Color</strong></td> ${comparisonList.map(v => `<td>${v.color}</td>`).join('')}</tr>
            <tr><td><strong>Transmisión</strong></td> ${comparisonList.map(v => `<td>${v.transmision || 'N/A'}</td>`).join('')}</tr>
            <tr><td><strong>Cilindrada</strong></td> ${comparisonList.map(v => `<td>${v.cilindrada_cc ? v.cilindrada_cc + ' cc' : 'N/A'}</td>`).join('')}</tr>
        </tbody>
    `;
}