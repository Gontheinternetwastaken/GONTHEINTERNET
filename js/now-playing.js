/*
    G on the internet's links
    Live Spotify now-playing widget

    The Cloudflare Worker keeps Spotify credentials private.
*/

(() => {
    "use strict";

    const ENDPOINT =
        "https://gontheinternet-spotify.greysondude.workers.dev/now-playing";

    const REFRESH_INTERVAL_MS = 15_000;
    const REQUEST_TIMEOUT_MS = 8_000;
    const HIDE_TRANSITION_MS = 360;

    let refreshTimer = null;
    let progressTimer = null;
    let hideTimer = null;

    let currentProgressMs = 0;
    let currentDurationMs = 0;
    let progressMeasuredAt = 0;

    function getElements() {
        return {
            card:
                document.getElementById("now-playing"),

            art:
                document.getElementById("now-playing-art"),

            title:
                document.getElementById("now-playing-title"),

            artist:
                document.getElementById("now-playing-artist"),

            progress:
                document.getElementById(
                    "now-playing-progress-fill"
                )
        };
    }

    function showCard(elements, data) {
        window.clearTimeout(hideTimer);

        elements.title.textContent =
            data.title || "Unknown track";

        elements.artist.textContent =
            Array.isArray(data.artists)
                ? data.artists.join(", ")
                : "";

        if (data.image) {
            elements.art.src = data.image;
            elements.art.alt =
                `${data.title || "Spotify"} album artwork`;
            elements.art.style.opacity = "1";
        } else {
            elements.art.removeAttribute("src");
            elements.art.alt = "";
            elements.art.style.opacity = "0";
        }

        if (data.url) {
            elements.card.href = data.url;
        } else {
            elements.card.removeAttribute("href");
        }

        elements.card.setAttribute(
            "aria-label",
            `Currently playing ${data.title || "a track"} by ${
                Array.isArray(data.artists)
                    ? data.artists.join(", ")
                    : "Spotify"
            }`
        );

        currentProgressMs =
            Number(data.progressMs) || 0;

        currentDurationMs =
            Number(data.durationMs) || 0;

        progressMeasuredAt =
            Date.now();

        updateProgress(elements.progress);

        elements.card.hidden = false;
        elements.card.setAttribute(
            "aria-hidden",
            "false"
        );

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                elements.card.classList.add(
                    "is-active"
                );
            });
        });

        startProgressTimer(elements.progress);
    }

    function hideCard(elements) {
        stopProgressTimer();

        elements.card.classList.remove("is-active");
        elements.card.setAttribute(
            "aria-hidden",
            "true"
        );

        window.clearTimeout(hideTimer);

        hideTimer = window.setTimeout(() => {
            if (
                !elements.card.classList.contains(
                    "is-active"
                )
            ) {
                elements.card.hidden = true;
            }
        }, HIDE_TRANSITION_MS);
    }

    function updateProgress(progressElement) {
        if (
            !currentDurationMs ||
            currentDurationMs <= 0
        ) {
            progressElement.style.width = "0%";
            return;
        }

        const elapsed =
            Date.now() - progressMeasuredAt;

        const estimatedProgress =
            Math.min(
                currentProgressMs + elapsed,
                currentDurationMs
            );

        const percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    (
                        estimatedProgress /
                        currentDurationMs
                    ) * 100
                )
            );

        progressElement.style.width =
            `${percentage}%`;
    }

    function startProgressTimer(progressElement) {
        stopProgressTimer();

        progressTimer =
            window.setInterval(
                () => {
                    updateProgress(progressElement);
                },
                1_000
            );
    }

    function stopProgressTimer() {
        if (progressTimer !== null) {
            window.clearInterval(progressTimer);
            progressTimer = null;
        }
    }

    async function fetchNowPlaying(elements) {
        const controller =
            new AbortController();

        const timeout =
            window.setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT_MS
            );

        try {
            const response =
                await fetch(
                    ENDPOINT,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Spotify Worker returned HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            if (
                data &&
                data.isPlaying &&
                data.title
            ) {
                showCard(elements, data);
            } else {
                hideCard(elements);
            }
        } catch (error) {
            /*
                A Spotify or network outage should not leave
                a broken card on the page.
            */
            hideCard(elements);

            if (error.name !== "AbortError") {
                console.error(
                    "Could not load Spotify now-playing data:",
                    error
                );
            }
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function scheduleRefresh(elements) {
        if (refreshTimer !== null) {
            window.clearInterval(refreshTimer);
        }

        refreshTimer =
            window.setInterval(
                () => {
                    if (!document.hidden) {
                        fetchNowPlaying(elements);
                    }
                },
                REFRESH_INTERVAL_MS
            );
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            const elements =
                getElements();

            if (
                !elements.card ||
                !elements.art ||
                !elements.title ||
                !elements.artist ||
                !elements.progress
            ) {
                console.error(
                    "Spotify now-playing elements were not found."
                );
                return;
            }

            fetchNowPlaying(elements);
            scheduleRefresh(elements);

            document.addEventListener(
                "visibilitychange",
                () => {
                    if (!document.hidden) {
                        fetchNowPlaying(elements);
                    }
                }
            );
        }
    );
})();
