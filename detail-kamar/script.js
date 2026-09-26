const loading = document.getElementById("loading-screen");
const supabaseUrl = "https://bpqeuadxvtluiebvybgu.supabase.co";
const supabaseKey = "sb_publishable_wwmgUbkJM4YauF-CAyw_rg_98IJJ4K0";
const client = window.supabase.createClient(supabaseUrl, supabaseKey);
const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

function getHargaHariIni(room) {
    const today = new Date().getDay();
    if (today === 5) {
        return room.price_friday || room.price_weekday;
    } else if (today === 6) {
        return room.price_saturday || room.price_weekday;
    } else {
        return room.price_weekday;
    }
}

async function getRooms() {
    const { data, error } = await client
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    tampilkanRoom(data);
    initSwiper();

    // Inisialisasi kalender ketersediaan
    await initCalendar(data.id);

    loading.classList.add("hide");
    setTimeout(() => loading.remove(), 300);
}

function tampilkanRoom(room) {
    document.title = `${room.name} | Uni Reservasi`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute("content", room.description);
    }

    const detailKamar = document.getElementById("detail-kamar");
    const footer = document.getElementById("contact");
    const hargaAktif = getHargaHariIni(room);

    footer.innerHTML = "";
    detailKamar.innerHTML = "";

    detailKamar.innerHTML = `
    <div class="detail-header">
        <h1>${room.name}</h1>
        <div class="detail-halaman">
            <a href="../index.html">Beranda</a>
            <span>></span>
            <a href="../kamar-page/index.html" id="lokasi-halaman">Kamar</a>
            <span>></span>
            <a id="detail-halaman">${room.name}</a>
        </div>
    </div>
    <div class="detail-content">
        <div class="detail-content-img">
            <div class="detail-img-container swiper swiper-main">
                <div class="detail-img-wrapper swiper-wrapper">
                    ${room.images
                        .map(
                            (image) => `
                            <div class="swiper-slide">
                                <img src="${image}" alt="${room.name}" loading="lazy">
                            </div>`,
                        )
                        .join("")}
                </div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-pagination"></div>
            </div>
            <div class="swiper swiper-thumbs">
                <div class="swiper-wrapper">
                    ${room.images
                        .map(
                            (image) => `
                            <div class="swiper-slide">
                                <img src="${image}" alt="${room.name}" loading="lazy">
                            </div>`,
                        )
                        .join("")}
                </div>
            </div>
        </div>
        <div class="about">
            <h1>${room.name}</h1>
            <h2>Rp ${hargaAktif.toLocaleString("id-ID")} <span>/malam</span></h2>
            <span class="status ${room.status.toLowerCase()}">
                ${room.status}
            </span>
            <div class="about-capacity">
                <div class="guest">
                    <img src="../assets/icons/guest-icon.png" alt="guest-icon" loading="lazy"/>
                    <p>${room.guest} Tamu</p>
                </div>
                <div class="bed">
                    <img src="../assets/icons/bed-icon.png" alt="bed-icon" loading="lazy"/>
                    <p>${room.bed}</p>
                </div>
            </div>

            <!-- TOMBOL CEK KETERSEDIAAN -->
            <button id="open-calendar-btn" class="btn-check-availability">
                <img src="../assets/icons/date-icon.svg"> Cek Ketersediaan Kamar
            </button>

            <div class="about-button" style="margin-top: 12px;">
                <img src="../assets/icons/whatsapp-icon-white.png" alt="whatsapp-icon" loading="lazy">
                <a href="https://wa.me/+6287779337763" target="_blank">Reservasi Via Whatsapp</a>
            </div>
        </div>
    </div>

    <!-- MODAL OVERLAY KALENDER -->
    <div id="calendar-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Jadwal Ketersediaan</h3>
                <button id="close-calendar-btn" class="close-modal-btn">&times;</button>
            </div>
            <div id="inline-calendar"></div>
            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 10px; text-align: center;">
                *Tanggal berlatar merah (<span style="color: #ff8888;">dicoret</span>) menandakan kamar sudah terisi.
            </p>
        </div>
    </div>

    <div class="detail-content-second">
        <div class="description">
            <h3>Deskripsi</h3>
            <p>${room.description}</p>
        </div>
        <div class="fasilitas">
            <div class="fasilitas-header">
                <h3>fasilitas</h3>
            </div>
            <div class="fasilitas-content">
                ${room.fasilitas
                    .map(
                        (item) => `
                        <div class="fasilitas-list">
                            <img src="../assets/icons/check-rounded-icon.png" alt="check-icon" loading="lazy"/>
                            <p translate="no">${item}</p>
                        </div>`,
                    )
                    .join("")}
            </div>
        </div>
        <div class="rules">
            <h4>Ketentuan / Aturan</h4>
            ${room.rules
                .map(
                    (rule) => `
                    <div class="rules-content">
                        <img src="../assets/icons/no-icon.png" alt="no icon" loading="lazy">
                        <p>${rule}</p>
                    </div>`,
                )
                .join("")}
            <div class="detail-button-container">
                <div class="detail-button">
                    <img src="../assets/icons/whatsapp-icon-white.png" alt="whatsapp icon" loading="lazy">
                    <a href="https://wa.me/+6287779337763" target="_blank">Reservasi Via Whatsapp</a>
                </div>
            </div>
        </div>
    </div>
    `;

    // Event listener untuk buka & tutup Modal Kalender
    const modal = document.getElementById("calendar-modal");
    const openBtn = document.getElementById("open-calendar-btn");
    const closeBtn = document.getElementById("close-calendar-btn");

    openBtn.addEventListener("click", () => modal.classList.add("active"));
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));

    // Tutup modal jika user klik luar modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });

    if (footer) {
        if (room.phoneNumber) {
            footer.style.display = "block";
            footer.innerHTML = `<p>${room.phoneNumber}</p>`;
        } else {
            footer.style.display = "none";
        }
    }
}

// FUNGSI CEK DATES & RENDER FLATPICKR
async function initCalendar(currentRoomId) {
    if (!currentRoomId) return;

    // Konversi ke Integer agar match dengan tipe data room_id di Supabase
    const targetRoomId = Number(currentRoomId);

    // 1. Ambil data reservasi dari Supabase
    const { data: bookings, error } = await client
        .from("reservasi")
        .select("check_in, check_out")
        .eq("room_id", targetRoomId);

    if (error) {
        console.error("Gagal mengambil data reservasi:", error);
        return;
    }

    console.log("Data booking ditemukan:", bookings); // Untuk cek di Console F12

    // 2. Buat array tanggal terisi
    const disabledRanges = bookings.map((b) => {
        const [year, month, day] = b.check_out.split("-").map(Number);
        const endDate = new Date(year, month - 1, day);
        endDate.setDate(endDate.getDate() - 1);

        const formattedTo = [
            endDate.getFullYear(),
            String(endDate.getMonth() + 1).padStart(2, "0"),
            String(endDate.getDate()).padStart(2, "0"),
        ].join("-");

        return {
            from: b.check_in,
            to: formattedTo,
        };
    });

    // 3. Render Flatpickr dengan menambahkan class khusus 'booked-date'
    flatpickr("#inline-calendar", {
        inline: true,
        locale: "id",
        minDate: "today",
        disable: disabledRanges,
        dateFormat: "Y-m-d",
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            // Jika tanggal tersebut terdaftar sebagai disabled (karena booking)
            if (dayElem.classList.contains("flatpickr-disabled")) {
                const dateStr = dayElem.dateObj.toISOString().split("T")[0];
                const todayStr = new Date().toISOString().split("T")[0];

                // Jika tanggal >= hari ini, tandai sebagai booked
                if (dateStr >= todayStr) {
                    dayElem.classList.add("booked-date");
                }
            }
        },
    });
}

getRooms();

function initSwiper() {
    const swiperThumbs = new Swiper(".swiper-thumbs", {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            768: {
                slidesPerView: 5,
                spaceBetween: 12,
            },
        },
    });

    const swiperMain = new Swiper(".swiper-main", {
        loop: true,
        grabCursor: true,
        spaceBetween: 10,
        preloadImages: false,
        lazy: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true,
        },
        thumbs: {
            swiper: swiperThumbs,
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
    });
}

AOS.init({
    once: true,
});

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
