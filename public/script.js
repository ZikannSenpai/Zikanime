// Konfigurasi API
const API_BASE_URL = "/api";

// State aplikasi
let currentPage = 1;
let currentAnimeSlug = "";
let currentEpisodes = [];

// DOM Elements
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");
const searchContainer = document.getElementById("searchContainer");
const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const videoModal = document.getElementById("videoModal");
const closeVideoBtn = document.getElementById("closeVideoBtn");
const videoTitle = document.getElementById("videoTitle");
const videoDescription = document.getElementById("videoDescription");
const videoPlayer = document.getElementById("videoPlayer");
const episodeSelector = document.getElementById("episodeSelector");

// Sections
const homeSection = document.getElementById("homeSection");
const ongoingSection = document.getElementById("ongoingSection");
const completeSection = document.getElementById("completeSection");
const scheduleSection = document.getElementById("scheduleSection");
const genresSection = document.getElementById("genresSection");
const animeDetailSection = document.getElementById("animeDetailSection");
const searchResultsSection = document.getElementById("searchResultsSection");
const searchResultsTitle = document.getElementById("searchResultsTitle");
const searchResults = document.getElementById("searchResults");

// Navigation buttons
const homeBtn = document.getElementById("homeBtn");
const ongoingBtn = document.getElementById("ongoingBtn");
const completeBtn = document.getElementById("completeBtn");
const scheduleBtn = document.getElementById("scheduleBtn");
const genresBtn = document.getElementById("genresBtn");
const backToHome = document.getElementById("backToHome");

// Inisialisasi aplikasi
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    setupScrollEffects();
    loadHomeData();
});

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuBtn.addEventListener("click", function () {
        mainNav.classList.toggle("active");
        searchContainer.classList.toggle("active");
    });

    // Search functionality
    searchBtn.addEventListener("click", performSearch);
    searchBox.addEventListener("keypress", function (e) {
        if (e.key === "Enter") performSearch();
    });

    // Close video modal
    closeVideoBtn.addEventListener("click", function () {
        videoModal.style.display = "none";
    });

    // Close modal when clicking outside
    videoModal.addEventListener("click", function (e) {
        if (e.target === videoModal) {
            videoModal.style.display = "none";
        }
    });

    // Navigation buttons
    homeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(this);
        showHomePage();
    });

    ongoingBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(this);
        showOngoingPage();
    });

    completeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(this);
        showCompletePage();
    });

    scheduleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(this);
        showSchedulePage();
    });

    genresBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(this);
        showGenresPage();
    });

    backToHome.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav(homeBtn);
        showHomePage();
    });

    // Anime card click events (delegation)
    document.addEventListener("click", function (e) {
        // Watch button click
        if (e.target.closest(".watch-btn")) {
            e.preventDefault();
            const btn = e.target.closest(".watch-btn");
            const animeSlug = btn.dataset.slug;
            console.log(btn.dataset);
            const animeTitle = btn.dataset.title;

            loadAnimeDetail(animeSlug, animeTitle);
        }

        // Anime card click (for details)
        if (e.target.closest(".anime-card")) {
            const card = e.target.closest(".anime-card");
            if (!e.target.closest(".watch-btn")) {
                const animeSlug = card.dataset.slug;
                console.log(card.dataset);
                const animeTitle =
                    card.querySelector(".anime-title").textContent;

                loadAnimeDetail(animeSlug, animeTitle);
            }
        }

        // Genre tag click
        if (e.target.closest(".genre-tag")) {
            e.preventDefault();
            const tag = e.target.closest(".genre-tag");
            const genreSlug = tag.dataset.slug;
            const genreName = tag.textContent;
            loadAnimeByGenre(genreSlug, genreName);
        }

        // Episode card click
        if (e.target.closest(".episode-card")) {
            const card = e.target.closest(".episode-card");
            const episodeSlug = card.dataset.slug;
            const episodeTitle = card.dataset.title;
            loadEpisode(episodeSlug, episodeTitle);
        }

        // Pagination button click
        if (e.target.closest(".page-btn")) {
            const btn = e.target.closest(".page-btn");
            if (!btn.disabled) {
                const page = parseInt(btn.dataset.page);
                if (page) {
                    currentPage = page;
                    loadCompleteAnime(page);
                }
            }
        }
    });
}

// Set active navigation
function setActiveNav(activeElement) {
    document.querySelectorAll("nav a").forEach(link => {
        link.classList.remove("active");
    });
    activeElement.classList.add("active");
}

// Setup scroll effects for fade in/out
function setupScrollEffects() {
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in");
                entry.target.classList.remove("fade-out");
            } else {
                if (entry.boundingClientRect.top < 0) {
                    entry.target.classList.add("fade-out");
                    entry.target.classList.remove("fade-in");
                }
            }
        });
    }, observerOptions);

    // Observe all anime cards
    document.querySelectorAll(".anime-card").forEach(card => {
        observer.observe(card);
    });

    // Re-observe when new cards are added
    const mutationObserver = new MutationObserver(() => {
        document.querySelectorAll(".anime-card").forEach(card => {
            if (!card.hasAttribute("data-observed")) {
                observer.observe(card);
                card.setAttribute("data-observed", "true");
            }
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Show/hide sections
function showHomePage() {
    hideAllSections();
    homeSection.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showOngoingPage() {
    hideAllSections();
    ongoingSection.style.display = "block";
    loadOngoingAnime();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCompletePage() {
    hideAllSections();
    completeSection.style.display = "block";
    loadCompleteAnime(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSchedulePage() {
    hideAllSections();
    scheduleSection.style.display = "block";
    loadSchedule();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showGenresPage() {
    hideAllSections();
    genresSection.style.display = "block";
    loadGenres();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAnimeDetailPage() {
    hideAllSections();
    animeDetailSection.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSearchResultsPage() {
    hideAllSections();
    searchResultsSection.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideAllSections() {
    homeSection.style.display = "none";
    ongoingSection.style.display = "none";
    completeSection.style.display = "none";
    scheduleSection.style.display = "none";
    genresSection.style.display = "none";
    animeDetailSection.style.display = "none";
    searchResultsSection.style.display = "none";
}

// API Functions
async function fetchServer(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/server/${slug}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching server data:", error);
        throw error;
    }
}
async function fetchHomeData() {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/home`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching home data:", error);
        throw error;
    }
}

async function fetchSchedule() {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/schedule`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching schedule:", error);
        throw error;
    }
}

async function fetchAllAnime() {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/unlimited`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching all anime:", error);
        throw error;
    }
}

async function fetchAnimeDetail(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/anime/${slug}`);
        console.log(response.data);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching anime detail:", error);
        throw error;
    }
}

async function fetchCompleteAnime(page) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/anime/complete-anime/${page}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching complete anime:", error);
        throw error;
    }
}

async function fetchOngoingAnime() {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/ongoing-anime`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching ongoing anime:", error);
        throw error;
    }
}

async function fetchGenres() {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/genre`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching genres:", error);
        throw error;
    }
}

async function fetchAnimeByGenre(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/genre/${slug}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching anime by genre:", error);
        throw error;
    }
}

async function fetchEpisode(slug) {
    try {
        const response = await fetch(`${API_BASE_URL}/anime/episode/${slug}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching episode:", error);
        throw error;
    }
}

// Load data untuk halaman beranda
async function loadHomeData() {
    const homeLoading = document.getElementById("homeLoading");
    const homeContent = document.getElementById("homeContent");

    homeLoading.style.display = "flex";
    homeContent.style.display = "none";

    try {
        const data = await fetchHomeData();
        // Clear previous content

        homeContent.innerHTML = "";

        // Process and display home data
        // Assuming data structure has sections like trending, latest, etc.
        if (data && data.data) {
            // Display trending anime
            const ongoing = data.data.ongoing?.animeList || [];
            const completed = data.data.completed?.animeList || [];
            console.log("ongoing:", ongoing);
            homeContent.innerHTML = "";

            if (ongoing.length > 0) {
                const section1 = createAnimeSection("Ongoing Anime", ongoing);
                homeContent.appendChild(section1);
            }

            if (completed.length > 0) {
                const section2 = createAnimeSection(
                    "Completed Anime",
                    completed
                );
                homeContent.appendChild(section2);
            }
        } else {
            // Fallback if data structure is different
            homeContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Data tidak tersedia dalam format yang diharapkan</h3>
                            <p>Silakan coba section lain</p>
                        </div>
                    `;
        }

        homeLoading.style.display = "none";
        homeContent.style.display = "block";

        // Setup scroll effects
        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error loading home data:", error);
        homeContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat data beranda</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        homeLoading.style.display = "none";
        homeContent.style.display = "block";
    }
}

// Load ongoing anime
async function loadOngoingAnime() {
    const ongoingLoading = document.getElementById("ongoingLoading");
    const ongoingContent = document.getElementById("ongoingContent");

    ongoingLoading.style.display = "flex";
    ongoingContent.style.display = "none";

    try {
        const data = await fetchOngoingAnime();

        ongoingContent.innerHTML = "";

        if (data.data && data.data.length > 0) {
            const animeGrid = document.createElement("div");
            animeGrid.className = "anime-grid";

            data.data.forEach(anime => {
                animeGrid.appendChild(createAnimeCardElement(anime));
            });

            ongoingContent.appendChild(animeGrid);
        } else {
            ongoingContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Tidak ada anime yang sedang tayang</h3>
                        </div>
                    `;
        }

        ongoingLoading.style.display = "none";
        ongoingContent.style.display = "block";

        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error loading ongoing anime:", error);
        ongoingContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat anime ongoing</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        ongoingLoading.style.display = "none";
        ongoingContent.style.display = "block";
    }
}

// Load complete anime
async function loadCompleteAnime(page) {
    const completeLoading = document.getElementById("completeLoading");
    const completeContent = document.getElementById("completeContent");
    const completePagination = document.getElementById("completePagination");

    completeLoading.style.display = "flex";
    completeContent.style.display = "none";
    completePagination.style.display = "none";

    try {
        const data = await fetchCompleteAnime(page);

        completeContent.innerHTML = "";

        if (data.data && data.data.length > 0) {
            const animeGrid = document.createElement("div");
            animeGrid.className = "anime-grid";

            data.data.forEach(anime => {
                animeGrid.appendChild(createAnimeCardElement(anime));
            });

            completeContent.appendChild(animeGrid);

            // Create pagination
            if (data.pagination) {
                createPagination(completePagination, data.pagination, page);
                completePagination.style.display = "flex";
            }
        } else {
            completeContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Tidak ada anime complete</h3>
                        </div>
                    `;
        }

        completeLoading.style.display = "none";
        completeContent.style.display = "block";

        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error loading complete anime:", error);
        completeContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat anime complete</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        completeLoading.style.display = "none";
        completeContent.style.display = "block";
    }
}

// Load schedule
async function loadSchedule() {
    const scheduleLoading = document.getElementById("scheduleLoading");
    const scheduleContent = document.getElementById("scheduleContent");

    scheduleLoading.style.display = "flex";
    scheduleContent.style.display = "none";

    try {
        const data = await fetchSchedule();

        scheduleContent.innerHTML = "";

        if (data.data) {
            // Assuming data is organized by days
            const days = [
                "Senin",
                "Selasa",
                "Rabu",
                "Kamis",
                "Jumat",
                "Sabtu",
                "Minggu"
            ];

            days.forEach(day => {
                if (data.data[day] && data.data[day].length > 0) {
                    const daySection = document.createElement("div");
                    daySection.className = "schedule-day";
                    daySection.innerHTML = `
                                <h3 style="margin: 1.5rem 0 1rem 0; color: var(--accent-color);">${day}</h3>
                                <div class="anime-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                                    ${data.data[day].map(anime => createAnimeCardHTML(anime)).join("")}
                                </div>
                            `;
                    scheduleContent.appendChild(daySection);
                }
            });
        } else {
            scheduleContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Tidak ada jadwal rilis</h3>
                        </div>
                    `;
        }

        scheduleLoading.style.display = "none";
        scheduleContent.style.display = "block";

        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error loading schedule:", error);
        scheduleContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat jadwal</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        scheduleLoading.style.display = "none";
        scheduleContent.style.display = "block";
    }
}

// Load genres
async function loadGenres() {
    const genresLoading = document.getElementById("genresLoading");
    const genresContent = document.getElementById("genresContent");

    genresLoading.style.display = "flex";
    genresContent.style.display = "none";

    try {
        const data = await fetchGenres();

        genresContent.innerHTML = "";

        if (data.data && data.data.length > 0) {
            const genresList = document.createElement("div");
            genresList.className = "genre-list";
            genresList.style.marginBottom = "2rem";

            data.data.forEach(genre => {
                const genreTag = document.createElement("span");
                genreTag.className = "genre-tag";
                genreTag.textContent = genre.name || genre;
                genreTag.dataset.slug =
                    genre.slug || genre.toLowerCase().replace(/ /g, "-");
                genreTag.style.cursor = "pointer";
                genresList.appendChild(genreTag);
            });

            genresContent.appendChild(genresList);
            genresContent.innerHTML +=
                "<h3>Pilih genre untuk melihat anime</h3>";
        } else {
            genresContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Tidak ada genre tersedia</h3>
                        </div>
                    `;
        }

        genresLoading.style.display = "none";
        genresContent.style.display = "block";
    } catch (error) {
        console.error("Error loading genres:", error);
        genresContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat genre</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        genresLoading.style.display = "none";
        genresContent.style.display = "block";
    }
}

// Load anime by genre
async function loadAnimeByGenre(slug, genreName) {
    const genresContent = document.getElementById("genresContent");

    genresContent.innerHTML =
        '<div class="loading"><div class="spinner"></div></div>';

    try {
        const data = await fetchAnimeByGenre(slug);

        genresContent.innerHTML = "";

        if (data.data && data.data.length > 0) {
            const backButton = document.createElement("button");
            backButton.className = "watch-btn";
            backButton.style.marginBottom = "1.5rem";
            backButton.style.width = "auto";
            backButton.innerHTML =
                '<i class="fas fa-arrow-left"></i> Kembali ke Daftar Genre';
            backButton.onclick = () => loadGenres();
            genresContent.appendChild(backButton);

            const title = document.createElement("h3");
            title.textContent = `Anime Genre: ${genreName}`;
            title.style.marginBottom = "1.5rem";
            genresContent.appendChild(title);

            const animeGrid = document.createElement("div");
            animeGrid.className = "anime-grid";

            data.data.forEach(anime => {
                animeGrid.appendChild(createAnimeCardElement(anime));
            });

            genresContent.appendChild(animeGrid);

            // Pagination if available
            if (data.pagination) {
                const pagination = document.createElement("div");
                pagination.className = "pagination";
                createPagination(pagination, data.pagination, 1);
                genresContent.appendChild(pagination);
            }
        } else {
            genresContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Tidak ada anime untuk genre ini</h3>
                            <button class="watch-btn" onclick="loadGenres()" style="margin-top: 1rem; width: auto;">Kembali ke Genre</button>
                        </div>
                    `;
        }

        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error loading anime by genre:", error);
        genresContent.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat anime untuk genre ini</h3>
                        <p>Silakan coba lagi nanti</p>
                        <button class="watch-btn" onclick="loadGenres()" style="margin-top: 1rem; width: auto;">Kembali ke Genre</button>
                    </div>
                `;
    }
}

// Load anime detail
async function loadAnimeDetail(slug, title) {
    showAnimeDetailPage();

    animeDetailSection.innerHTML =
        '<div class="loading"><div class="spinner"></div></div>';
    console.log("slug:", slug);
    try {
        const data = await fetchAnimeDetail(slug);

        if (data.data) {
            const anime = data.data;
            console.log(anime);
            currentAnimeSlug = slug;

            // Create anime detail HTML
            animeDetailSection.innerHTML = `
                        <div class="anime-detail-container">
                            <img src="${anime.poster || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}" 
                                 alt="${anime.title}" 
                                 class="anime-detail-poster"
                                 onerror="this.src='https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                            <div class="anime-detail-info">
                                <h1 class="anime-detail-title">${anime.title || title}</h1>
                                <div class="anime-detail-meta">
                                    ${anime.type ? `<span class="meta-item accent">${anime.type}</span>` : ""}
                                    ${anime.status ? `<span class="meta-item">${anime.status}</span>` : ""}
                                    ${anime.score ? `<span class="meta-item"><i class="fas fa-star" style="color: #ffc107;"></i> ${anime.score}</span>` : ""}
                                    ${anime.episodes ? `<span class="meta-item">${anime.episodes} Episode</span>` : ""}
                                    ${anime.duration ? `<span class="meta-item">${anime.duration}</span>` : ""}
                                </div>
                                ${
                                    anime.genres
                                        ? `
                                    <div class="genre-list">
                                        ${anime.genreList
                                            .map(
                                                genre => `
                                            <span class="genre-tag">${genre}</span>
                                        `
                                            )
                                            .join("")}
                                    </div>
                                `
                                        : ""
                                }
                                ${
                                    anime.synopsis
                                        ? `
                                    <div class="anime-detail-synopsis">
                                        <h3>Sinopsis</h3>
                                        <p>${anime.synopsis.paragraphs[0]}</p>
                                    </div>
                                `
                                        : ""
                                }
                                <button class="watch-btn" data-slug="${slug}" data-title="${anime.title || title}" style="width: auto; display: inline-block; margin-right: 1rem;">
                                    <i class="fas fa-play"></i> Tonton Episode 1
                                </button>
                                <button class="watch-btn" onclick="showHomePage()" style="width: auto; display: inline-block; background-color: var(--secondary-color);">
                                    <i class="fas fa-arrow-left"></i> Kembali
                                </button>
                            </div>
                        </div>
                    `;

            // Load episodes if available
            if (anime.episodeList && anime.episodeList.length > 0) {
                const episodesSection = document.createElement("div");
                episodesSection.className = "episodes-section";
                episodesSection.innerHTML = `
                            <h3>Daftar Episode</h3>
                            <div class="episodes-grid">
                                ${anime.episodeList
                                    .map(
                                        ep => `
                                    <div class="episode-card" data-slug="${ep.episodeId}" data-title="${ep.title || `Episode ${ep.number}`}">
                                        <div>Episode ${ep.eps || ep.number}</div>
                                        <small>${ep.title || ""}</small>
                                    </div>
                                `
                                    )
                                    .join("")}
                            </div>
                        `;
                animeDetailSection.appendChild(episodesSection);

                // Store episodes for later use
                currentEpisodes = anime.episodeList;
            }
        } else {
            animeDetailSection.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Gagal memuat detail anime</h3>
                            <button class="watch-btn" id ="homeBtn" onclick="showHomePage()" style="margin-top: 1rem; width: auto;">Kembali ke Beranda</button>
                        </div>
                    `;
        }
    } catch (error) {
        console.error("Error loading anime detail:", error);
        animeDetailSection.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal memuat detail anime</h3>
                        <p>Silakan coba lagi nanti</p>
                        <button class="watch-btn" id="homeBtn" onclick="showHomePage()" style="margin-top: 1rem; width: auto;">Kembali ke Beranda</button>
                    </div>
                `;
    }
}

// Load episode
async function loadEpisode(slug, title) {
    videoModal.style.display = "flex";
    videoTitle.textContent = title || "Memuat...";
    videoDescription.textContent = "Memuat video...";
    episodeSelector.innerHTML = "";

    try {
        const data = await fetchEpisode(slug);

        if (data.data) {
            const episode = data.data;
            console.log("episode:", episode);
            const server = await fetchServer(
                episode.server.qualities[2].serverList[0].serverId ||
                    episode.server.qualities[1].serverList[0].serverId
            );

            const stream = server.data.url;
            // Update video player
            if (server.data) {
                videoPlayer.innerHTML = `
                            <iframe 
                                src="${stream}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        `;
            } else {
                videoPlayer.innerHTML = `
                            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: white;">
                                <div>
                                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                    <h3>Video tidak tersedia</h3>
                                    <p>Link streaming tidak ditemukan</p>
                                </div>
                            </div>
                        `;
            }

            videoTitle.textContent = title || episode.title || "Episode";
            videoDescription.textContent =
                episode.description || "Tidak ada deskripsi tersedia";

            // Create episode selector if we have multiple episodes
            if (currentEpisodes && currentEpisodes.length > 0) {
                episodeSelector.innerHTML = "";
                currentEpisodes.forEach(ep => {
                    const episodeBtn = document.createElement("button");
                    episodeBtn.className = "episode-btn";
                    if (ep.episodeId === slug)
                        episodeBtn.classList.add("active");
                    episodeBtn.textContent = `Ep ${ep.eps}`;
                    episodeBtn.dataset.slug = ep.episodeId;
                    episodeBtn.dataset.title = ep.title || `Episode ${ep.eps}`;
                    episodeBtn.addEventListener("click", () => {
                        loadEpisode(
                            ep.episodeId,
                            ep.title || `Episode ${ep.number}`
                        );
                    });
                    episodeSelector.appendChild(episodeBtn);
                });
            }
        } else {
            videoPlayer.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: white;">
                            <div>
                                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <h3>Gagal memuat episode</h3>
                                <p>Data episode tidak ditemukan</p>
                            </div>
                        </div>
                    `;
        }
    } catch (error) {
        console.error("Error loading episode:", error);
        videoPlayer.innerHTML = `
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: white;">
                        <div>
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <h3>Gagal memuat episode</h3>
                            <p>Silakan coba lagi nanti</p>
                        </div>
                    </div>
                `;
    }
}

// Perform search
async function performSearch() {
    const query = searchBox.value.trim();

    if (query === "") {
        return;
    }

    showSearchResultsPage();

    const searchLoading = document.getElementById("searchLoading");
    searchLoading.style.display = "flex";
    searchResults.style.display = "none";

    searchResultsTitle.textContent = `Hasil Pencarian: "${query}"`;

    try {
        // Fetch all anime first, then filter
        const data = await fetchAllAnime();

        searchResults.innerHTML = "";

        if (data.data && data.data.length > 0) {
            // Filter anime based on search query

            const allList = data.data.data.list.flatMap(
                group => group.animeList || []
            );
            const filteredAnime = allList.filter(anime => {
                return (
                    anime.title &&
                    anime.title.toLowerCase().includes(query.toLowerCase())
                );
            });

            if (filteredAnime.length > 0) {
                const animeGrid = document.createElement("div");
                animeGrid.className = "anime-grid";

                filteredAnime.forEach(anime => {
                    animeGrid.appendChild(createAnimeCardElement(anime));
                });

                searchResults.appendChild(animeGrid);
            } else {
                console.error("eror");
                searchResults.innerHTML = `
                            <div class="error-message">
                                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: var(--text-secondary);"></i>
                                <h3>Tidak ditemukan anime dengan kata kunci "${query}"</h3>
                                <p>Coba dengan kata kunci lain</p>
                            </div>
                        `;
            }
        } else {
            searchResults.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Gagal melakukan pencarian</h3>
                            <p>Silakan coba lagi nanti</p>
                        </div>
                    `;
        }

        searchLoading.style.display = "none";
        searchResults.style.display = "block";

        setTimeout(setupScrollEffects, 100);
    } catch (error) {
        console.error("Error performing search:", error);
        searchResults.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Gagal melakukan pencarian</h3>
                        <p>Silakan coba lagi nanti</p>
                    </div>
                `;
        searchLoading.style.display = "none";
        searchResults.style.display = "block";
    }
}

// Helper Functions
function createAnimeSection(title, animeList) {
    const section = document.createElement("section");
    section.innerHTML = `
                <div class="section-title">
                    <h2>${title}</h2>
                </div>
                <div class="anime-grid">
                    ${animeList
                        .slice(0, 12)
                        .map(anime => createAnimeCardHTML(anime))
                        .join("")}
                </div>
            `;
    return section;
}

function createAnimeCardElement(anime) {
    const card = document.createElement("div");
    card.className = "anime-card";
    card.dataset.slug = anime.animeId || anime.synopsis.connections[0].animeId;

    card.innerHTML = createAnimeCardHTML(anime);
    return card;
}

function createAnimeCardHTML(anime) {
    const title = anime.title || "Judul Tidak Tersedia";
    const poster =
        anime.poster ||
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    const type = anime.type || "TV";
    const score = anime.score || "N/A";
    const episodes = anime.episodes || "?";
    const id = anime.animeId || "?";
    return `
                <img src="${poster}" alt="${title}" class="anime-poster" 
                     onerror="this.src='https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                <div class="anime-info">
                    <h3 class="anime-title">${title}</h3>
                    <div class="anime-meta">
                        <span>${anime.year || ""}</span>
                        <span class="anime-rating"><i class="fas fa-star"></i> ${score}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span class="anime-type">${type}</span>
                        <span>${episodes} eps</span>
                    </div>
                    <button class="watch-btn" data-slug="${id}" data-title="${title}">
                        <i class="fas fa-play"></i> Tonton
                    </button>
                </div>
            `;
}

function createPagination(container, pagination, currentPage) {
    container.innerHTML = "";

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.dataset.page = currentPage - 1;
    container.appendChild(prevBtn);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(pagination.totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "page-btn";
        if (i === currentPage) pageBtn.classList.add("active");
        pageBtn.textContent = i;
        pageBtn.dataset.page = i;
        container.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === pagination.totalPages;
    nextBtn.dataset.page = currentPage + 1;
    container.appendChild(nextBtn);
}
