/*
    G on the internet's links
    Main JavaScript

    This file creates the link cards
    from the data inside links.js
*/


// Wait until the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {


    const linksContainer = document.getElementById("links");


    // Safety check
    if (!linksContainer) {
        console.error("Links container not found.");
        return;
    }


    // Make sure links.js exists
    if (typeof links === "undefined") {
        console.error("No links found. Check links.js");
        return;
    }



    /*
        Create each link card
    */

    links.forEach(link => {


        // Main clickable card
        const card = document.createElement("a");

        card.className = "link-card";

        card.href = link.url;

        card.target = "_blank";

        card.rel = "noopener noreferrer";



        /*
            Link image
        */

        const image = document.createElement("img");

        image.className = "link-image";

        image.src = link.image;

        image.alt = `${link.name} icon`;


        // If image breaks, hide it instead of ruining layout
        image.onerror = () => {
            image.style.display = "none";
        };



        /*
            Link name
        */

        const name = document.createElement("span");

        name.className = "link-name";

        name.textContent = link.name;



        /*
            Copy button
        */

        const copyButton = document.createElement("button");

        copyButton.className = "copy-button";

        copyButton.type = "button";

        copyButton.textContent = "⧉";


        copyButton.title = "Copy link";



        copyButton.addEventListener("click", (event) => {


            // Prevent opening the link
            event.preventDefault();

            event.stopPropagation();



            navigator.clipboard.writeText(link.url)
                .then(() => {

                    copyButton.textContent = "✓";


                    setTimeout(() => {
                        copyButton.textContent = "⧉";
                    }, 1200);

                })

                .catch(() => {

                    console.error("Failed to copy link.");

                });

        });



        /*
            Assemble card
        */

        card.appendChild(image);

        card.appendChild(name);

        card.appendChild(copyButton);



        /*
            Add card to page
        */

        linksContainer.appendChild(card);


    });


});
