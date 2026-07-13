/*
    G on the internet's links
    Live Steam now-playing cards

    Supports the main account and a future alt account automatically.
*/

(() => {
    "use strict";

    const ENDPOINT =
        "https://gontheinternet-spotify.greysondude.workers.dev/steam-status";

    const REFRESH_INTERVAL_MS = 30_000;
    const REQUEST_TIMEOUT_MS = 8_000;

    let refreshTimer = null;

    function createCard(account) {
        const card = document.createElement("a");

        card.className = "steam-playing-card";
        card.href =
            account.profileUrl
            || `https://steamcommunity.com/profiles/${account.steamId}/`;

        card.target = "_blank";
        card.rel = "noopener noreferrer";

        card.setAttribute(
            "aria-label",
            `${account.personName || account.label} is playing ${account.gameName || "a game"} on Steam`
        );

        const artworkWrap =
            document.createElement("div");

        artworkWrap.className =
            "steam-game-art-wrap";

        const gameArt =
            document.createElement("img");

        gameArt.className =
            "steam-game-art";

        gameArt.src =
            account.gameImage || "";

        gameArt.alt =
            account.gameName
                ? `${account.gameName} artwork`
                : "Steam game artwork";

        gameArt.loading = "lazy";
        gameArt.decoding = "async";

        gameArt.addEventListener("error", () => {
            gameArt.style.opacity = "0";
        });

        artworkWrap.appendChild(gameArt);

        if (account.avatar) {
            const avatar =
                document.createElement("img");

            avatar.className =
                "steam-account-avatar";

            avatar.src = account.avatar;
            avatar.alt = "";
            avatar.loading = "lazy";
            avatar.decoding = "async";

            artworkWrap.appendChild(avatar);
        }

        const details =
            document.createElement("div");

        details.className =
            "steam-playing-details";

        const label =
            document.createElement("span");

        label.className =
            "steam-playing-label";

        label.textContent =
            account.label === "Alt"
                ? "Playing on Steam · Alt"
                : "Playing on Steam";

        const gameName =
            document.createElement("strong");

        gameName.className =
            "steam-game-name";

        gameName.textContent =
            account.gameName || "Unknown game";

        const accountName =
            document.createElement("span");

        accountName.className =
            "steam-account-name";

        accountName.textContent =
            account.personName
            || account.label
            || "Steam";

        details.append(
            label,
            gameName,
            accountName
        );

        const openIcon =
            document.createElement("span");

        openIcon.className =
            "steam-playing-open";

        openIcon.setAttribute(
            "aria-hidden",
            "true"
        );

        openIcon.textContent = "↗";

        card.append(
            artworkWrap,
            details,
            openIcon
        );

        return card;
    }

    function renderAccounts(container, accounts) {
        container.replaceChildren();

        if (!accounts.length) {
            container.hidden = true;
            return;
        }

        const fragment =
            document.createDocumentFragment();

        accounts.forEach((account) => {
            fragment.appendChild(
                createCard(account)
            );
        });

        container.appendChild(fragment);
        container.hidden = false;

        window.requestAnimationFrame(() => {
            container
                .querySelectorAll(
                    ".steam-playing-card"
                )
                .forEach((card, index) => {
                    window.setTimeout(() => {
                        card.classList.add(
                            "is-active"
                        );
                    }, index * 75);
                });
        });
    }

    async function fetchSteamStatus(container) {
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
                    `Steam Worker returned HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            const playingAccounts =
                Array.isArray(data.currentlyPlaying)
                    ? data.currentlyPlaying
                    : [];

            renderAccounts(
                container,
                playingAccounts
            );
        } catch (error) {
            /*
                Hide the widget instead of showing a broken status card.
            */
            renderAccounts(container, []);

            if (error.name !== "AbortError") {
                console.error(
                    "Could not load Steam status:",
                    error
                );
            }
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function scheduleRefresh(container) {
        if (refreshTimer !== null) {
            window.clearInterval(refreshTimer);
        }

        refreshTimer =
            window.setInterval(
                () => {
                    if (!document.hidden) {
                        fetchSteamStatus(container);
                    }
                },
                REFRESH_INTERVAL_MS
            );
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            const container =
                document.getElementById(
                    "steam-playing-list"
                );

            if (!container) {
                console.error(
                    "Steam status container was not found."
                );
                return;
            }

            fetchSteamStatus(container);
            scheduleRefresh(container);

            document.addEventListener(
                "visibilitychange",
                () => {
                    if (!document.hidden) {
                        fetchSteamStatus(container);
                    }
                }
            );
        }
    );
})();
