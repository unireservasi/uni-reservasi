const loading = document.getElementById("loading-screen");

const supabaseUrl = "https://bpqeuadxvtluiebvybgu.supabase.co";
const supabaseKey = "sb_publishable_wwmgUbkJM4YauF-CAyw_rg_98IJJ4K0";

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

async function getRooms() {
    const { data, error } = await client.from("rooms").select("*");

    if (error) {
        console.error(error);
        return;
    }

    tampilkanRooms(data);
    initSwiper();
    setTimeout(() => {
        loading.classList.add("hide");

        setTimeout(() => {
            loading.remove();
        }, 400);
    }, 500);
}

// Function Get Date
function getHargaHariIni(room) {
    const today = new Date().getDay(); // Mengembalikan angka 0 (Minggu) sampai 6 (Sabtu)

    if (today === 5) {
        // Hari Jumat
        return room.price_friday || room.price_weekday;
    } else if (today === 6) {
        // Hari Sabtu
        return room.price_saturday || room.price_weekday;
    } else {
        // Senin - Kamis & Minggu
        return room.price_weekday;
    }
}

function tampilkanRooms(rooms) {
    const listKamar = document.getElementById("list-kamar");
    const footer = document.getElementById("contact");
    let phoneNumberFound = null;

    listKamar.innerHTML = "";
    footer.innerHTML = "";

    rooms.forEach((room) => {
        const hargaAktif = getHargaHariIni(room);
        listKamar.innerHTML += `
            <div class="kamar-produk swiper-slide"> 
                <div class="kamar-produk-img">
                    <img src="${room.image}" alt="${room.name}" loading="lazy">
                </div>
                <div class="kamar-produk-detail">
                    <h2>${room.name}</h2>
                    <div class="kamar-produk-detail-icon">
                        <img src="../assets/icons/guest-icon.png" alt="Guest Icon" loading="lazy"> 
                        <p>${room.guest} Tamu</p>
                    </div>
                    <div class="kamar-produk-detail-icon">
                        <img src="../assets/icons/bed-icon.png" alt="Bed Icon" loading="lazy">
                        <p>${room.bed}</p>
                    </div>
                    <span class="status ${room.status.toLowerCase()}">
                        ${room.status}
                    </span>
                    <h3>
                            Rp ${hargaAktif.toLocaleString("id-ID")} / malam
                    </h3>
                    <a href="detail-kamar/index.html?id=${room.id}">Lihat Detail</a>
                </div>
            </div>
        `;
        if (room.phoneNumber && !phoneNumberFound) {
            phoneNumberFound = room.phoneNumber;
        }
    });
    // 2. Render Footer Sekali Saja (Di Luar Loop forEach)
    if (phoneNumberFound) {
        footer.style.display = "block"; // atau 'flex'
        footer.innerHTML = `<p>${phoneNumberFound}</p>`;
    } else {
        footer.style.display = "none";
    }
}

getRooms();

AOS.init({
    once: true,
}); //initialization aos

const navbarMenu = document.querySelector(".navbar-menu");
const hamburgerMenu = document.getElementById("hamburger-menu");

hamburgerMenu.addEventListener("click", () => {
    navbarMenu.classList.toggle("pop-up");
});

document.addEventListener("click", (e) => {
    if (
        navbarMenu.classList.contains("pop-up") &&
        !navbarMenu.contains(e.target) &&
        !hamburgerMenu.contains(e.target)
    ) {
        navbarMenu.classList.remove("pop-up");
    }
});

function initSwiper() {
    new Swiper(".kamar-produk-container", {
        slidesPerView: 1.1,
        spaceBetween: 16,
        grabCursor: true,
        centeredSlides: true,
        initialSlide: 1,
        preloadImages: false,
        lazy: true,

        breakpoints: {
            450: {
                slidesPerView: 1.5,
                spaceBetween: 16,
            },
            575: {
                slidesPerView: 2.2,
            },
            580: {
                slidesPerView: 2.4,
            },
            620: {
                slidesPerView: 2.2,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 24,
            },
            1024: {
                slidesPerView: 3.7,
                spaceBetween: 30,
                centeredSlides: false,
            },
        },
    });
}
