const loading = document.getElementById("loading-screen");
const supabaseUrl = "https://bpqeuadxvtluiebvybgu.supabase.co";
const supabaseKey = "sb_publishable_wwmgUbkJM4YauF-CAyw_rg_98IJJ4K0";
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

let allRooms = []; // Master data semua kamar
let allBookings = []; // Master data jadwal reservasi

// Function Hitung Harga Berdasarkan Hari
function getHargaHariIni(room) {
    const today = new Date().getDay(); // 0 (Minggu) - 6 (Sabtu)

    if (today === 5) {
        return room.price_friday || room.price_weekday;
    } else if (today === 6) {
        return room.price_saturday || room.price_weekday;
    } else {
        return room.price_weekday;
    }
}

// 1. AMBIL DATA KAMAR & RESERVASI DARI SUPABASE
async function getRooms() {
    // Tarik data rooms dan reservasi sekaligus menggunakan Promise.all
    const [roomsRes, bookingsRes] = await Promise.all([
        client.from("rooms").select("*"),
        client.from("reservasi").select("room_id, check_in, check_out"),
    ]);

    if (roomsRes.error) {
        console.error("Gagal mengambil data kamar:", roomsRes.error);
        return;
    }

    allRooms = roomsRes.data || [];
    allBookings = bookingsRes.data || [];

    // Tampilkan semua kamar saat pertama kali halaman dimuat
    tampilkanRooms(allRooms);

    // Inisialisasi Filter Tanggal
    initDateFilter();

    setTimeout(() => {
        loading.classList.add("hide");
        setTimeout(() => {
            loading.remove();
        }, 400);
    }, 500);
}

// 2. RENDER LIST KAMAR KE HTML
function tampilkanRooms(rooms) {
    const listKamar = document.getElementById("list-kamar");
    const footer = document.getElementById("contact");
    let phoneNumberFound = null;

    listKamar.innerHTML = "";
    if (footer) footer.innerHTML = "";

    // Tampilan jika tidak ada kamar yang tersedia pada rentang tanggal terpilih
    if (rooms.length === 0) {
        listKamar.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 50px 20px; color: #a0a0a0; grid-column: 1 / -1;">
                <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Maaf, tidak ada kamar yang tersedia pada tanggal tersebut.</h3>
                <p style="font-size: 0.9rem;">Silakan pilih rentang tanggal lain atau tekan Reset Filter.</p>
            </div>
        `;
        return;
    }

    rooms.forEach((room) => {
        const hargaAktif = getHargaHariIni(room);
        listKamar.innerHTML += `
            <div class="kamar-produk" data-aos="fade-up" data-aos-duration="800" data-aos-easing="linear">
                <div class="kamar-produk-img">
                    <img src="${room.image}" alt="${room.name}" loading="lazy">
                </div>
                <div class="kamar-produk-deskripsi">
                    <h2>${room.name}</h2>
                    <p id="description">${room.description}</p>
                    <div class="kamar-produk-detail">
                        <div class="kapasitas-tamu">
                            <img src="../assets/icons/guest-icon.png" alt="Guest Icon" loading="lazy">
                            <p>${room.guest} Tamu</p>
                        </div>
                        <div class="jumlah-kasur">
                            <img src="../assets/icons/bed-icon.png" alt="Bed Icon" loading="lazy">
                            <p>${room.bed}</p>
                        </div>
                        <span class="status ${room.status.toLowerCase()}">
                            ${room.status}
                        </span>
                        <h3>
                            Rp ${hargaAktif.toLocaleString("id-ID")} / malam
                        </h3>
                        <a href="../detail-kamar/index.html?id=${room.id}">
                            Lihat Detail
                        </a>
                    </div>
                </div>
            </div>
        `;
        if (room.phoneNumber && !phoneNumberFound) {
            phoneNumberFound = room.phoneNumber;
        }
    });

    if (footer) {
        if (phoneNumberFound) {
            footer.style.display = "block";
            footer.innerHTML = `<p>${phoneNumberFound}</p>`;
        } else {
            footer.style.display = "none";
        }
    }
}

// 3. LOGIKA FILTER TANGGAL DENGAN FLATPICKR RANGE
function initDateFilter() {
    const inputDate = document.getElementById("date-range");
    const btnReset = document.getElementById("btn-reset-filter");

    const fp = flatpickr(inputDate, {
        mode: "range",
        locale: "id",
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function (selectedDates) {
            // Evaluasi dilakukan saat user memilih rentang Check-in dan Check-out (2 tanggal)
            if (selectedDates.length === 2) {
                const userCheckIn = selectedDates[0];
                const userCheckOut = selectedDates[1];

                // Filter kamar yang TIDAK bentrok dengan tanggal booking di Supabase
                const availableRooms = allRooms.filter((room) => {
                    // Filter reservasi khusus untuk ID kamar ini
                    const roomBookings = allBookings.filter(
                        (b) => Number(b.room_id) === Number(room.id),
                    );

                    // Rumus Bentrok: (userCheckIn < bOut) DAN (userCheckOut > bIn)
                    const isBentrok = roomBookings.some((b) => {
                        const bIn = new Date(b.check_in);
                        const bOut = new Date(b.check_out);
                        return userCheckIn < bOut && userCheckOut > bIn;
                    });

                    // Hanya loloskan kamar yang TIDAK bentrok
                    return !isBentrok;
                });

                tampilkanRooms(availableRooms);
                btnReset.style.display = "block";
            }
        },
    });

    // Reset Filter Button Click Listener
    btnReset.addEventListener("click", () => {
        fp.clear();
        btnReset.style.display = "none";
        tampilkanRooms(allRooms);
    });
}

// Eksekusi fungsi utama
getRooms();

// AOS Initialization
AOS.init({
    once: true,
});

// Mobile Navbar Functionality
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
