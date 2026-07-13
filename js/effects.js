/*
    G on the internet's links
    Effects & small interactions

    CSS handles the main animations.
    This file only adds subtle pointer-based polish.
*/

document.addEventListener("DOMContentLoaded", () => {
    const profileImage = document.querySelector(".profile-image");
    const title = document.querySelector(".title");

    if (profileImage) {
        profileImage.addEventListener("pointermove", (event) => {
            if (event.pointerType === "touch") {
                return;
            }

            const rect = profileImage.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateX = ((y / rect.height) - 0.5) * -7;
            const rotateY = ((x / rect.width) - 0.5) * 7;

            profileImage.style.transform =
                `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.045)`;
        });

        profileImage.addEventListener("pointerleave", () => {
            profileImage.style.transform = "";
        });
    }

    if (title) {
        title.addEventListener("pointerenter", () => {
            title.classList.add("title-active");
        });

        title.addEventListener("pointerleave", () => {
            title.classList.remove("title-active");
        });
    }
});
