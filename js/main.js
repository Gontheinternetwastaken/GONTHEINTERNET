/*
    G on the internet's links
    Main JavaScript

    Creates link cards from js/links.js.
*/

document.addEventListener("DOMContentLoaded", () => {
    const linksContainer = document.getElementById("links");

    if (!linksContainer) {
        console.error("Links container not found.");
        return;
    }

    if (typeof links === "undefined" || !Array.isArray(links)) {
        console.error("No links found. Check js/links.js.");
        return;
    }

    links.forEach((link, index) => {
        const card = document.createElement("a");

        card.className = "link-card reveal-item";
        card.href = link.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        card.style.setProperty(
            "--link-glow",
            link.glow || "transparent"
        );

        /*
            A short repeating delay makes groups of cards
            reveal in a gentle stagger without delaying cards
            farther down the page for too long.
        */
        card.style.setProperty(
            "--reveal-delay",
            `${(index % 4) * 55}ms`
        );

        const image = document.createElement("img");

        image.className = "link-image";
        image.src = link.image;
        image.alt = `${link.name} icon`;
        image.loading = "lazy";
        image.decoding = "async";

        image.addEventListener("error", () => {
            image.style.display = "none";
        });

        const name = document.createElement("span");

        name.className = "link-name";
        name.textContent = link.name;

        const copyButton = document.createElement("button");

        copyButton.className = "copy-button";
        copyButton.type = "button";
        copyButton.textContent = "⧉";
        copyButton.title = `Copy ${link.name} link`;
        copyButton.setAttribute(
            "aria-label",
            `Copy ${link.name} link`
        );

        copyButton.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            try {
                await navigator.clipboard.writeText(link.url);

                copyButton.textContent = "✓";
                copyButton.classList.add("copied");

                window.setTimeout(() => {
                    copyButton.textContent = "⧉";
                    copyButton.classList.remove("copied");
                }, 1200);
            } catch (error) {
                console.error(
                    `Failed to copy ${link.name} link:`,
                    error
                );

                copyButton.textContent = "!";

                window.setTimeout(() => {
                    copyButton.textContent = "⧉";
                }, 1200);
            }
        });

        card.append(image, name, copyButton);
        linksContainer.appendChild(card);
    });

    document.dispatchEvent(
        new CustomEvent("links:ready")
    );
});
