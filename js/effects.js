/*
    G on the internet's links
    Effects & small interactions

    Handles small visual polish.
*/


document.addEventListener("DOMContentLoaded", () => {


    /*
        Stagger link card appearance

        Cards gently appear one by one
        after main.js creates them.
    */

    const cards = document.querySelectorAll(".link-card");


    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(12px)";


        setTimeout(() => {

            card.style.transition =
                "opacity 0.45s ease, transform 0.45s ease";


            card.style.opacity = "1";
            card.style.transform = "translateY(0)";


        }, 100 + (index * 80));


    });



    /*
        Profile image interaction

        Adds a slightly playful tilt
        when hovering over the profile.
    */

    const profileImage =
        document.querySelector(".profile-image");


    if (profileImage) {


        profileImage.addEventListener("mousemove", (event) => {


            const rect =
                profileImage.getBoundingClientRect();


            const x =
                event.clientX - rect.left;


            const y =
                event.clientY - rect.top;


            const rotateX =
                ((y / rect.height) - 0.5) * -8;


            const rotateY =
                ((x / rect.width) - 0.5) * 8;



            profileImage.style.transform =
                `
                perspective(500px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.05)
                `;


        });



        profileImage.addEventListener("mouseleave", () => {


            profileImage.style.transform = "";


        });


    }



    /*
        Title hover effect

        Very subtle personality touch.
    */

    const title =
        document.querySelector(".title");


    if (title) {


        title.addEventListener("mouseenter", () => {

            title.style.letterSpacing = "1px";

        });


        title.addEventListener("mouseleave", () => {

            title.style.letterSpacing = "0.5px";

        });


    }


});
