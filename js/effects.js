/*
    G on the internet's links
    Effects & interactions

    Includes:
    - smooth desktop wheel scrolling
    - native mobile touch scrolling
    - scroll-reveal cards
    - layered background parallax
    - profile particles
    - desktop cursor spotlight
    - reduced-motion fallbacks
*/

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const finePointerQuery = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

    const reducedMotion = reducedMotionQuery.matches;
    const hasFinePointer = finePointerQuery.matches;

    let lenis = null;

    /*
        Smooth mouse-wheel scrolling.

        Touch remains native because syncTouch is false.
        That keeps mobile momentum scrolling reliable while
        all reveal and parallax effects still follow the page.
    */
    if (!reducedMotion && typeof window.Lenis === "function") {
        lenis = new window.Lenis({
            autoRaf: true,
            smoothWheel: true,
            lerp: 0.09,
            wheelMultiplier: 0.85,
            syncTouch: false,
            anchors: true,
            overscroll: true
        });

        window.siteLenis = lenis;
    }

    /*
        Reveal elements once as they enter the viewport.
    */
    function initializeScrollReveals() {
        const revealItems = document.querySelectorAll(
            ".reveal-item:not([data-reveal-ready])"
        );

        if (!revealItems.length) {
            return;
        }

        revealItems.forEach((item) => {
            item.dataset.revealReady = "true";
        });

        if (reducedMotion || !("IntersectionObserver" in window)) {
            revealItems.forEach((item) => {
                item.classList.add("is-visible");
            });

            return;
        }

        const observer = new IntersectionObserver(
            (entries, revealObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -8% 0px"
            }
        );

        revealItems.forEach((item) => {
            observer.observe(item);
        });
    }

    initializeScrollReveals();

    document.addEventListener(
        "links:ready",
        initializeScrollReveals
    );

    /*
        Generate contained particles around the profile image.
    */
    const particleContainer =
        document.getElementById("profile-particles");

    if (particleContainer) {
        const particleCount = reducedMotion ? 8 : 15;

        const colors = [
            "rgba(184, 221, 255, 0.72)",
            "rgba(199, 166, 255, 0.62)",
            "rgba(255, 139, 195, 0.55)",
            "rgba(255, 255, 255, 0.42)"
        ];

        for (let index = 0; index < particleCount; index += 1) {
            const particle = document.createElement("span");
            particle.className = "profile-particle";

            const angle =
                (Math.PI * 2 * index) / particleCount +
                (Math.random() * 0.34 - 0.17);

            const radius = 66 + Math.random() * 22;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const driftX = (Math.random() - 0.5) * 18;
            const driftY = (Math.random() - 0.5) * 18;

            const size = 2 + Math.random() * 5;
            const duration = 4.8 + Math.random() * 4.5;
            const delay = Math.random() * -7;

            particle.style.setProperty("--particle-x", `${x}px`);
            particle.style.setProperty("--particle-y", `${y}px`);
            particle.style.setProperty("--particle-drift-x", `${driftX}px`);
            particle.style.setProperty("--particle-drift-y", `${driftY}px`);
            particle.style.setProperty("--particle-size", `${size}px`);
            particle.style.setProperty(
                "--particle-duration",
                `${duration}s`
            );
            particle.style.setProperty(
                "--particle-delay",
                `${delay}s`
            );

            particle.style.background =
                colors[index % colors.length];

            particleContainer.appendChild(particle);
        }
    }

    /*
        Profile tilt and title polish.
    */
    const profileImage =
        document.querySelector(".profile-image");

    const title =
        document.querySelector(".title");

    if (profileImage && hasFinePointer && !reducedMotion) {
        profileImage.addEventListener("pointermove", (event) => {
            const rect =
                profileImage.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const rotateX =
                ((y / rect.height) - 0.5) * -7;

            const rotateY =
                ((x / rect.width) - 0.5) * 7;

            profileImage.style.transform =
                `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.045)`;
        });

        profileImage.addEventListener("pointerleave", () => {
            profileImage.style.transform = "";
        });
    }

    if (title && hasFinePointer && !reducedMotion) {
        title.addEventListener("pointerenter", () => {
            title.classList.add("title-active");
        });

        title.addEventListener("pointerleave", () => {
            title.classList.remove("title-active");
        });
    }

    /*
        Cursor spotlight and pointer contribution to parallax.
    */
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerCurrentX = 0;
    let pointerCurrentY = 0;

    if (hasFinePointer && !reducedMotion) {
        document.body.classList.add("supports-spotlight");

        window.addEventListener(
            "pointermove",
            (event) => {
                root.style.setProperty(
                    "--spotlight-x",
                    `${event.clientX}px`
                );

                root.style.setProperty(
                    "--spotlight-y",
                    `${event.clientY}px`
                );

                pointerTargetX =
                    (event.clientX / window.innerWidth - 0.5) * 18;

                pointerTargetY =
                    (event.clientY / window.innerHeight - 0.5) * 14;

                document.body.classList.add("pointer-active");
            },
            { passive: true }
        );

        document.documentElement.addEventListener(
            "mouseleave",
            () => {
                document.body.classList.remove("pointer-active");
                pointerTargetX = 0;
                pointerTargetY = 0;
            }
        );
    }

    /*
        Smooth layered parallax.

        The loop pauses while the tab is hidden and only updates
        lightweight CSS custom properties.
    */
    let scrollTarget = window.scrollY;
    let scrollCurrent = window.scrollY;
    let animationFrame = 0;
    let pageVisible = !document.hidden;

    function updateScrollTarget() {
        scrollTarget = window.scrollY;
    }

    window.addEventListener(
        "scroll",
        updateScrollTarget,
        { passive: true }
    );

    if (lenis) {
        lenis.on("scroll", (event) => {
            scrollTarget = event.scroll;
        });
    }

    document.addEventListener("visibilitychange", () => {
        pageVisible = !document.hidden;

        if (pageVisible && !animationFrame) {
            animationFrame =
                window.requestAnimationFrame(updateParallax);
        }
    });

    function updateParallax() {
        animationFrame = 0;

        if (!pageVisible) {
            return;
        }

        scrollCurrent +=
            (scrollTarget - scrollCurrent) * 0.095;

        pointerCurrentX +=
            (pointerTargetX - pointerCurrentX) * 0.08;

        pointerCurrentY +=
            (pointerTargetY - pointerCurrentY) * 0.08;

        const mobileMultiplier =
            window.innerWidth <= 700 ? 0.55 : 1;

        if (!reducedMotion) {
            root.style.setProperty(
                "--parallax-back-y",
                `${scrollCurrent * -0.025 * mobileMultiplier}px`
            );

            root.style.setProperty(
                "--parallax-middle-y",
                `${scrollCurrent * -0.05 * mobileMultiplier}px`
            );

            root.style.setProperty(
                "--parallax-front-y",
                `${scrollCurrent * -0.082 * mobileMultiplier}px`
            );

            root.style.setProperty(
                "--parallax-pointer-x",
                `${pointerCurrentX * mobileMultiplier}px`
            );

            root.style.setProperty(
                "--parallax-pointer-y",
                `${pointerCurrentY * mobileMultiplier}px`
            );
        }

        animationFrame =
            window.requestAnimationFrame(updateParallax);
    }

    animationFrame =
        window.requestAnimationFrame(updateParallax);
});
